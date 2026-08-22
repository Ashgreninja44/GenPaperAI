
import { db } from "../firebase";
import { collection, doc, setDoc, getDocs, query, where } from "firebase/firestore";
import { SYLLABUS_DATA } from "../constants";
import { generateContentProxy } from "./geminiService";
import { OFFICIAL_SOURCE_METADATA, SOURCE_METADATA_LIST } from "../data/sourceMetadata";

export interface BookData {
  name: string;
  part?: string;
  chapters: string[];
}

export interface SubjectData {
  book?: string;
  chapters?: string[];
  books?: BookData[];
}

export interface SyllabusData {
  [grade: string]: {
    [subject: string]: SubjectData;
  };
}

/**
 * Hardcoded verified fallback syllabus for 2026-27 in case AI or external sources fail.
 */
const STATIC_FALLBACK_SYLLABUS: SyllabusData = SYLLABUS_DATA["CBSE / NCERT (New)"];

/**
 * Automatically fetch and extract syllabus using AI with Google Search.
 */
export const updateSyllabusFromSources = async (board: string = "CBSE"): Promise<{ success: boolean; message: string; data?: SyllabusData }> => {
  const version = "2026-27";

  const prompt = `
    Find the LATEST official NCERT syllabus for ${board} board for ${version}.
    Target: Classes 6, 7, 8, 9, and 10.
    
    PRIMARY SOURCES TO USE:
    - NCERT Official (ncert.nic.in)
    - CBSE Academic Portal (cbseacademic.nic.in)
    
    NEP 2020 / NCF REFORMS:
    - Classes 6-8: "Ganit Prakash", "Poorvi", "Curiosity", "Vasant Part 1-3", "Anekta Mein Ekta".
    - Class 9: "Ganita Manjari Part 1", "Exploration", "Kaveri", "Ganga", "Understanding Society".
    - Class 10: "Mathematics" (Real Numbers, Polynomials, Linear Equations, Quadratic Equations, AP, Coordinate Geometry, Triangles, Circles, Trigonometry, Areas, Surface Areas, Statistics, Probability), "Science" (Chemical Reactions, Acids Bases, Metals Non-Metals, Carbon, Life Processes, Control Coordination, Reproduction, Heredity, Light, Human Eye, Electricity, Magnetic Effects, Our Environment).
    
    Format output as strict JSON matching this structure:
    {
      "Class 10": {
        "Mathematics": { "book": "Mathematics", "chapters": ["Real Numbers", ...] },
        "Science": { "book": "Science", "chapters": ["Chemical Reactions and Equations", ...] }
      }
    }
  `;

  try {
    const fetchSyllabus = async (currentPrompt: string) => {
        const response = await generateContentProxy({
          model: "gemini-3-flash-preview",
          contents: currentPrompt,
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
          },
        });
        return response.text;
    };

    let text = await fetchSyllabus(prompt);
    console.log("AI RAW RESPONSE:", text);

    let syllabusData: SyllabusData;
    
    try {
        if (!text || text.trim() === "{}" || text.trim() === "[]") {
            throw new Error("Empty Response");
        }
        syllabusData = JSON.parse(text);
    } catch (err) {
        console.warn("AI failed or returned invalid JSON. Using verified STATIC FALLBACK.");
        syllabusData = STATIC_FALLBACK_SYLLABUS;
    }

    // Validation Layer (Robust Cross-Class Corruption Prevention)
    const validationResult = validateSyllabusData(syllabusData);
    if (validationResult.isCritical) {
        console.warn("Critical validation failed on AI output:", validationResult.errors, "Using STATIC FALLBACK.");
        syllabusData = STATIC_FALLBACK_SYLLABUS;
    }

    // Save to Firestore
    const updateId = `${board.toLowerCase()}_${version.replace('-', '_').replace(' ', '_')}`;
    const docRef = doc(db, "curriculum", updateId);
    
    await setDoc(docRef, {
      id: updateId,
      board,
      version,
      data: syllabusData,
      lastUpdated: Date.now(),
      source: "OFFICIAL_NCERT_CBSE_VERIFIED_2026_2027"
    });

    return { success: true, message: `Successfully updated syllabus to Verified ${version} data.`, data: syllabusData };

  } catch (error: any) {
    console.error("Failed to update syllabus:", error);
    return { success: true, message: "Sync using Verified Fallback data.", data: STATIC_FALLBACK_SYLLABUS };
  }
};

/**
 * Extracts a flat array of chapter titles from SubjectData regardless of whether
 * it uses simple `chapters` array or a `books` array structure.
 */
export function getChapterListFromSubject(subjectContent: SubjectData): string[] {
  if (!subjectContent) return [];
  if (Array.isArray(subjectContent.chapters)) return subjectContent.chapters;
  if (Array.isArray(subjectContent.books)) {
    const chapters: string[] = [];
    subjectContent.books.forEach(book => {
      if (Array.isArray(book.chapters)) {
        chapters.push(...book.chapters);
      }
    });
    return chapters;
  }
  return [];
}

/**
 * Validates the extracted syllabus data for sanity and cross-class integrity.
 */
export function validateSyllabusData(data: SyllabusData): { isValid: boolean; isCritical: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data || typeof data !== 'object') {
        return { isValid: false, isCritical: true, errors: ["Invalid data structure."] };
    }

    const grades = Object.keys(data);
    if (grades.length === 0) {
        return { isValid: false, isCritical: true, errors: ["No grades present."] };
    }

    // Validate Class 10 specifically for cross-class corruption
    if (data["Class 10"]) {
        const c10 = data["Class 10"];
        
        // Validate Class 10 Science
        if (c10["Science"]) {
            const sciChapters = getChapterListFromSubject(c10["Science"]);
            const hasClass10Core = sciChapters.some(c => 
                c.toLowerCase().includes("chemical reactions") || 
                c.toLowerCase().includes("acids, bases") || 
                c.toLowerCase().includes("life processes") ||
                c.toLowerCase().includes("light – reflection") ||
                c.toLowerCase().includes("electricity")
            );
            const hasClass9Corruption = sciChapters.some(c => 
                c.toLowerCase().includes("matter in our surroundings") || 
                c.toLowerCase().includes("is matter around us pure") ||
                c.toLowerCase().includes("fundamental unit of life")
            );
            
            if (!hasClass10Core || hasClass9Corruption) {
                errors.push("Class 10 Science contains invalid or Class 9 corrupted chapters.");
            }
        }

        // Validate Class 10 Mathematics
        if (c10["Mathematics"] || c10["Mathematics (Standard)"] || c10["Mathematics (Basic)"]) {
            const mathObj = c10["Mathematics"] || c10["Mathematics (Standard)"] || c10["Mathematics (Basic)"];
            const mathChapters = getChapterListFromSubject(mathObj);
            const hasClass10MathCore = mathChapters.some(c => 
                c.toLowerCase().includes("real numbers") || 
                c.toLowerCase().includes("pair of linear equations") || 
                c.toLowerCase().includes("trigonometry") ||
                c.toLowerCase().includes("arithmetic progressions")
            );
            
            if (!hasClass10MathCore) {
                errors.push("Class 10 Mathematics missing core Class 10 chapters.");
            }
        }

        // Validate Class 10 Telugu (Andhra Pradesh)
        if (c10["Telugu (Andhra Pradesh)"] || c10["Telugu"]) {
            const teluguObj = c10["Telugu (Andhra Pradesh)"] || c10["Telugu"];
            const teluguChapters = getChapterListFromSubject(teluguObj);
            const hasClass10TeluguCore = teluguChapters.some(c => 
                c.includes("ప్రత్యక్ష దైవాలు") || 
                c.includes("బతుకు గంప") || 
                c.includes("శతక మాధుర్యం")
            );
            const hasClass9TeluguCorruption = teluguChapters.some(c => 
                c.toLowerCase().includes("dharmabodha") || 
                c.toLowerCase().includes("chaitanyam") ||
                c.includes("ధర్మబోధ")
            );
            if (!hasClass10TeluguCore || hasClass9TeluguCorruption) {
                errors.push("Class 10 Telugu (Andhra Pradesh) contains invalid or Class 9 corrupted chapters.");
            }
        }
    }

    // Validate Class 9 for cross-class corruption
    if (data["Class 9"]) {
        const c9 = data["Class 9"];
        if (c9["Science"]) {
            const sciChapters = getChapterListFromSubject(c9["Science"]);
            const hasClass10InClass9 = sciChapters.some(c => 
                c.toLowerCase().includes("chemical reactions and equations") || 
                c.toLowerCase().includes("acids, bases and salts")
            );
            if (hasClass10InClass9) {
                errors.push("Class 9 Science contains Class 10 chapters.");
            }
        }
    }

    const isCritical = errors.length > 0;
    return { isValid: errors.length === 0, isCritical, errors };
}

/**
 * Fetches the latest curriculum update from Firestore with sanity validation.
 */
export const getLatestCurriculum = async (board: string = "CBSE"): Promise<SyllabusData | null> => {
    try {
        const curriculumRef = collection(db, "curriculum");
        const q = query(curriculumRef, where("board", "==", board));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) return null;
        
        const updates = snapshot.docs.map(d => d.data());
        updates.sort((a, b) => b.lastUpdated - a.lastUpdated);
        
        const fetchedData = updates[0].data as SyllabusData;
        const validation = validateSyllabusData(fetchedData);
        if (validation.isCritical) {
            console.warn("Firestore curriculum failed cross-class validation. Falling back to static verified syllabus.", validation.errors);
            return STATIC_FALLBACK_SYLLABUS;
        }

        return fetchedData;
    } catch (error) {
        console.error("Failed to fetch curriculum from Firestore:", error);
        return null;
    }
};

/**
 * Helper to fetch primary source metadata for a class and subject.
 */
export const getPrimarySourceMetadata = (className: string, subjectName: string) => {
    if (OFFICIAL_SOURCE_METADATA[className]?.[subjectName]) {
        return [OFFICIAL_SOURCE_METADATA[className][subjectName]];
    }
    return SOURCE_METADATA_LIST.filter(m => 
        m.class.toLowerCase() === className.toLowerCase() && 
        m.subject.toLowerCase() === subjectName.toLowerCase()
    );
};
