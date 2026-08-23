
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PaperConfig, GeneratedPaper, Question } from "../types";
import { CBSE_EXAM_PATTERNS } from "../constants";
import { getSubjectPattern, buildPatternGenerationPrompt } from "../data/subjectPatterns";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
console.log("API KEY EXISTS:", !!apiKey);

const ai = new GoogleGenAI({ apiKey: apiKey || 'API_KEY_NOT_SET' });

/**
 * Proxies the generateContent request to the backend server to secure the API key.
 * Falls back to client-side SDK if running locally without a proxy.
 */
export const generateContentProxy = async (params: {
  model: string;
  contents: any;
  config?: any;
}): Promise<{ text: string | null; candidates?: any[] }> => {
  const reqStart = performance.now();
  try {
    const response = await fetch('/api/ai/generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`[Gemini Proxy API] Completed in ${(performance.now() - reqStart).toFixed(0)}ms via backend server.`);
      return data;
    }
    
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${response.status}`);
  } catch (err) {
    console.warn(`[Gemini Proxy] Server route unreachable (${(performance.now() - reqStart).toFixed(0)}ms), utilizing direct client SDK:`, err);
    if (apiKey) {
      const sdkStart = performance.now();
      const sdkResponse = await ai.models.generateContent(params);
      console.log(`[Gemini Direct SDK] Completed in ${(performance.now() - sdkStart).toFixed(0)}ms.`);
      return {
        text: sdkResponse.text,
        candidates: sdkResponse.candidates
      };
    }
    throw err;
  }
};

/**
 * Helper to retry a function if it fails with a 503 error.
 * Retries up to 3 times with a 2-3 second delay.
 */
const withRetry = async <T>(fn: () => Promise<T>, retries = 3): Promise<T> => {
  for (let i = 0; i <= retries; i++) {
    try {
      const result = await fn();
      
      // Handle fetch Response objects (sometimes SDK returns them)
      if (result instanceof Response && (result.status === 503 || result.status === 429) && i < retries) {
        const is429 = result.status === 429;
        const delay = is429 ? (5000 * Math.pow(2, i)) : (2000 + Math.random() * 1000);
        console.warn(`Service returned ${result.status}. Retrying in ${Math.round(delay)}ms... (${retries - i} left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      return result;
    } catch (error: any) {
      const is503 = error?.status === 503 || 
                    error?.message?.includes('503') || 
                    error?.code === 503 ||
                    error?.message?.includes('Service Unavailable');
      
      const is429 = error?.status === 429 ||
                    error?.message?.includes('429') ||
                    error?.message?.includes('RESOURCE_EXHAUSTED') ||
                    error?.message?.includes('quota');

      if ((is503 || is429) && i < retries) {
        // Longer base delay for 429 with exponential backoff
        const delay = is429 ? (5000 * Math.pow(2, i) + Math.random() * 2000) : (2000 + Math.random() * 1000);
        console.warn(`AI Service returned ${is429 ? '429 (Quota)' : '503 (Overloaded)'}. Retrying in ${Math.round(delay)}ms... (${retries - i} left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      if (is503) {
        throw new Error("The AI service is currently overloaded (503). We tried to reconnect but it's still busy. Please try again in a few moments.");
      }
      
      if (is429) {
        throw new Error("API Quota exceeded (429). We are retrying with backoff, but if this persists, please check your Gemini API plan or try again later.");
      }

      throw error;
    }
  }
  throw new Error("Maximum retry attempts reached.");
};

// Schema for individual questions
const questionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    question_id: { type: Type.STRING },
    section: { type: Type.STRING, description: "The section this question belongs to (e.g., 'Section A')." },
    question_text: { type: Type.STRING, description: "The question content in UNICODE ONLY. No LaTeX. If a figure is used, append 'Refer to the figure below' to the text." },
    options: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Array of 4 options for MCQs. Null/Empty for others. UNICODE ONLY." 
    },
    answer_type: { type: Type.STRING, description: "MCQ | Assertion-Reason | Very Short Answer | Short Answer | Long Answer | Case Study" },
    marks: { type: Type.NUMBER },
    difficulty: { type: Type.NUMBER, description: "1 (Very Easy) to 5 (HOTS)" },
    topic: { type: Type.STRING, description: "Chapter or topic name" },
    can_regenerate: { type: Type.BOOLEAN },
    diagram_prompt: { type: Type.STRING, description: "Visual description for a Nano-Banana diagram. Required for Math. Optional for others based on settings." }
  },
  required: ["question_id", "section", "question_text", "answer_type", "marks", "difficulty", "topic"]
};

// Main schema
const paperResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "The formal title of the examination paper.",
    },
    questions: {
      type: Type.ARRAY,
      items: questionSchema,
      description: "The ordered list of questions."
    },
    answerKey: {
      type: Type.STRING,
      description: "The answer key as a structured plain text string.",
    },
  },
  required: ["title", "questions", "answerKey"],
};

export const generateQuestionPaper = async (config: PaperConfig): Promise<GeneratedPaper> => {
  // Calculate Remaining Marks if manual questions exist
  const manualQuestions = config.manualQuestions || [];
  const manualMarks = manualQuestions.reduce((sum, q) => sum + q.marks, 0);
  const remainingMarks = Math.max(0, config.totalMarks - manualMarks);

  // Resolve the subject pattern dynamically
  const activePattern = config.subjectPattern || getSubjectPattern(
    config.board,
    config.grade,
    config.subject,
    config.academicSession || "2026-27"
  );

  let structurePrompt = '';

  // PART 7: HYBRID GENERATION LOGIC
  // Compare extracted data with user-selected distribution.
  const isCustomTest = config.testType === 'Custom' && config.customSections && config.customSections.length > 0;
  
  let hybridPrompt = '';
  if (manualQuestions.length > 0) {
      hybridPrompt = `
        HYBRID GENERATION STRATEGY:
        1. RECOGNITION: The user has manually selected/extracted ${manualQuestions.length} questions.
        2. FILL GAP: Your primary task is to FILL THE GAP to match the requested distribution.
        
        REQUIRED FINAL DISTRIBUTION:
        ${isCustomTest ? JSON.stringify(config.customSections) : JSON.stringify(config.patternCounts || config.counts)}
        
        ACTION PLAN:
        - For each question type:
          - IF count(manual) >= required: Use only the manual questions for that type.
          - IF count(manual) < required: USE THE MANUAL ONES AND GENERATE ${'required - count(manual)'} NEW ONES of the same type.
        
        - Maintain EXACT counts per type/section.
        - NEVER duplicate a manual question with an AI generated one.
        - Total Marks must be EXACTLY ${config.totalMarks}.
      `;
  }

  if (remainingMarks === 0 && manualQuestions.length > 0) {
     // If user selected full marks worth of questions manually
     structurePrompt = `GENERATE TITLE AND ANSWER KEY ONLY. The user has already provided all questions. Do not generate new questions. Just structure the provided ones.`;
  } else if (isCustomTest) {
    structurePrompt = `Follow these custom user-defined sections: ${JSON.stringify(config.customSections)}. 
    The user has already selected ${manualQuestions.length} questions. Fill the remaining slots in these sections.
    ${hybridPrompt}`;
  } else {
    // Priority: Use the subject-specific blueprint
    const patternPrompt = buildPatternGenerationPrompt(activePattern, config.patternCounts);
    structurePrompt = `${patternPrompt}
    User Manual Questions Provided: ${manualQuestions.length} (totaling ${manualMarks} marks).
    Generate remaining questions to strictly satisfy all sections and reach Total Marks: ${config.totalMarks}.
    ${hybridPrompt}`;
  }

  // FORCE FIGURES FOR MATH
  const isMath = config.subject.toLowerCase().includes('math');
  const isTelugu = config.subject.toLowerCase().includes('telugu');
  const isHindi = config.subject.toLowerCase().includes('hindi');
  const isSanskrit = config.subject.toLowerCase().includes('sanskrit');
  const shouldIncludeFigures = config.includeFigures || isMath;

  // SYLLABUS CONTEXT
  const syllabusContext = `ACADEMIC SESSION: ${config.academicSession || '2026-27'} (NCERT / SCERT / NEP 2020 curriculum). 
       Subject: ${config.subject}
       Grade/Class: ${config.grade}
       Board: ${config.board}
       Focus on COMPETENCY-BASED and analytical questions according to the official blueprint.
       Include real-life applications where appropriate.
       REDUCE rote learning; emphasize conceptual depth.
       ${isTelugu ? `
       TELUGU LANGUAGE INSTRUCTIONS (ఆంధ్రప్రదేశ్ & తెలంగాణ తెలుగు పాఠ్యప్రణాళిక):
       - All question text, options, section names, and answer keys MUST be written in authentic, fluent Telugu script (తెలుగు లిపి).
       - Maintain official question formats: విభాగం-1 (అవగాహన-ప్రతిస్పందన: అపరిచిత/పరిచిత గద్య, పద్య అంశాలు), విభాగం-2 (వ్యక్తీకరణ-సృజనాత్మకత: లఘు, వ్యాసరూప, రామాయణ ఉపవాచక ప్రశ్నలు, లేఖ/కరపత్రం), విభాగం-3 (భాషాంశాలు-వ్యాకరణం: సంధులు, సమాసాలు, ఛందస్సు, అలంకారాలు, పదజాలం, జాతీయాలు).
       - DO NOT include Science assertion-reason or math case studies in Telugu.` : ''}
       ${isHindi ? `
       HINDI LANGUAGE INSTRUCTIONS (सीबीएसई हिंदी पाठ्यक्रम):
       - All questions, sections, and answers MUST be written in correct Devanagari script (देवनागरी लिपि).
       - Strictly follow खंड 'क' (अपठित बोध), खंड 'ख' (व्यावहारिक व्याकरण), खंड 'ग' (पाठ्यपुस्तक व पूरक पुस्तक), खंड 'घ' (रचनात्मक लेखन).` : ''}
       ${isSanskrit ? `
       SANSKRIT LANGUAGE INSTRUCTIONS (सीबीएसई संस्कृत पाठ्यक्रम):
       - All questions and answers MUST be in fluent Sanskrit in Devanagari script.
       - Strictly follow खण्डः 'क' (अपठित-अवबोधनम्), खण्डः 'ख' (रचनात्मक-कार्यम्), खण्डः 'ग' (अनुप्रयुक्त-व्याकरणम्), खण्डः 'घ' (पठित-अवबोधनम्).` : ''}`;

  const prompt = `
    Act as a CBSE Question Paper Generator.
    
    Details: Subject: ${config.subject}, Grade: ${config.grade}, Total Marks: ${config.totalMarks}.
    ${syllabusContext}
    ${structurePrompt}

    EXISTING MANUAL QUESTIONS (Do NOT duplicate these, but include them in the final JSON output exactly as provided, preserving their IDs):
    ${JSON.stringify(manualQuestions)}

    🚫 ABSOLUTE BAN ON LATEX / MATHML / KATEX:
    - NEVER use backslashes like \\sqrt, \\frac, \\Delta.
    - NEVER use tags like [[MATH]] or [[]].
    - NEVER use ^ for powers (e.g. x^2 is FORBIDDEN).
    - NEVER use / for fractions (e.g. 1/2 is FORBIDDEN).

    ✅ STRICT UNICODE MATH FORMATTING RULES:
    1. **Square Roots**: Use '√'. Example: √(x² + y²)
    2. **Powers**: Use superscript characters ONLY. Example: x², y³, r⁴, 10⁻¹
    3. **Pi**: Use 'π'.
    4. **Triangles**: Use '△'. Example: △ABC.
    5. **Fractions**: MUST be vertical using dashes.
       Example:
       x + 1
       ─────
       y - 1
    6. **Ratios**: Use vertical format.
       AB
       ──
       DE

    🖼️ DIAGRAM / FIGURE RULES:
    1. **MATHEMATICS**: You MUST provide a 'diagram_prompt' for Geometry, Mensuration, Trigonometry, Coordinate Geometry, etc.
       - The 'question_text' must end with "Refer to the figure below".
    2. **OTHER SUBJECTS**: 
       - If ${shouldIncludeFigures} is TRUE: Provide 'diagram_prompt' for questions needing diagrams.
       - If ${shouldIncludeFigures} is FALSE: Do NOT provide 'diagram_prompt'.
    3. **Diagram Style**: The 'diagram_prompt' should describe a clean, black-and-white, labeled vector diagram (Nano-Banana style).

    📝 ANSWER KEY RULES:
    1. Format as vertical list blocks.
    2. MCQs: "Q1 – B" (Letter only).
    3. Include answers for BOTH the manual questions and the new AI questions.

    Ensure questions are grouped logically by Section. Numbering must be sequential (1, 2, 3...) combining both manual and AI questions.
  `;

  try {
    const response = await withRetry(() => generateContentProxy({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: paperResponseSchema,
        temperature: 0.4,
      },
    }));

    const text = response.text;
    if (!text) throw new Error("No response received from AI.");
    const data = JSON.parse(text);

    return {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      config,
      title: data.title,
      questions: data.questions,
      answerKey: data.answerKey,
    };
  } catch (error) {
    console.error("Error generating paper:", error);
    throw error;
  }
};

export const regenerateSingleQuestion = async (
  currentQuestion: Question,
  newDifficulty: number,
  userInstruction: string,
  subjectContext: string
): Promise<Partial<Question>> => {
  const prompt = `
    REGENERATE this specific question.
    
    Original Question: "${currentQuestion.question_text}"
    Topic: ${currentQuestion.topic}
    Type: ${currentQuestion.answer_type}
    Marks: ${currentQuestion.marks}
    
    NEW REQUIREMENTS:
    1. New Difficulty Level: ${newDifficulty} (Scale 1-5).
    2. User Instruction: "${userInstruction || 'Make it strictly compliant with the new difficulty.'}"
    3. Subject Context: ${subjectContext}
    
    🚫 ABSOLUTE BAN ON LATEX:
    - NO \\sqrt, \\frac, ^, /.
    - NO [[MATH]] tags.

    ✅ STRICT UNICODE MATH ONLY:
    - Use √, ², ³, π, △.
    - Fractions MUST be vertical using dashes.
      a
      ─
      b
    
    CONSTRAINTS:
    - Output ONLY the new "question_text" and "options" (if MCQ).
    - If MCQ, provide 4 options.
  `;

  try {
    const response = await withRetry(() => generateContentProxy({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                question_text: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        },
        temperature: 0.7,
      },
    }));
    
    const text = response.text;
    if(!text) throw new Error("Failed to regenerate");
    return JSON.parse(text);

  } catch (error) {
    console.error("Regeneration failed", error);
    throw error;
  }
};

export const generateQuestionBankUpdate = async (subject: string, grade: string, board: string = 'CBSE / NCERT'): Promise<string> => {
    const prompt = `Generate a comprehensive Question Bank for ${subject} (${grade}, ${board}). 
    Include:
    - 5 MCQs
    - 3 Assertion-Reason
    - 3 Very Short Answer
    - 3 Short Answer
    - 2 Long Answer
    - 1 Case Study
    
    Use strictly UNICODE Math. No LaTeX.
    Format as clear Markdown with headers.`;

    const response = await withRetry(() => generateContentProxy({
      model: 'gemini-3-flash-preview',
      contents: prompt
    }));
    return response.text || "Failed to generate content.";
};

export const generateDiagramImage = async (diagramPrompt: string): Promise<string> => {
  const imagePrompt = `
    Generate a Nano-Banana style academic diagram.
    Subject: School Exam (Math/Science).
    Style: Nano-Banana Diagram Engine. Black and white, clean vector lines, white background. NO SHADING. High contrast.
    Content: ${diagramPrompt}
    Labels: Include clear text labels (A, B, C, P, Q, x, y) as described.
    Use thick, clear lines suitable for printing.
  `;

  try {
    const response = await withRetry(() => generateContentProxy({
        model: 'gemini-2.5-flash-image', // Nano Banana model
        contents: {
            parts: [{ text: imagePrompt }]
        },
        config: {
           // No responseMimeType for image generation
        }
    }));

    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    }
    
    throw new Error("No image data returned.");

  } catch (error) {
    console.error("Image generation failed:", error);
    throw error;
  }
};

// --- ROBUST EXTRACTION & PARSING LOGIC ---

// PART 2: QUESTION DETECTION & PART 3: CLEANING & FILTERING
const isQuestionHeuristic = (line: string): boolean => {
  const trimmed = line.trim();
  if (trimmed.length < 15) return false;
  return (
    trimmed.endsWith("?") ||
    /^(What|Why|How|Define|Explain|Calculate|Find|Prove|Compare|Discuss|Describe|State|Show|List|Distinguish|Evaluate|Justify)/i.test(trimmed)
  );
};

export const parseQuestionsFromText = async (text: string, subjectContext: string = "General"): Promise<{ questions: Question[], metadata: { subject?: string, topic?: string, grade?: string } }> => {
    // PART 4: AI RELEVANCE FILTER & PART 5: QUALITY IMPROVEMENT
    const prompt = `
        Act as an expert CBSE curriculum analyst and Question Paper Designer. 
        Analyze the following educational content and generate/extract high-quality educational questions.
        
        Content:
        """
        ${text.substring(0, 15000)} 
        """
        
        TASKS:
        1. UNDERSTAND CONTENT: Identify Subject, Chapter/Topic, and intended Class Level (Grade 3-12).
        2. EXTRACT & ENHANCE: 
           - Identify meaningful academic questions present in the text.
           - Convert important factual statements into exam-style questions if they aren't already questions.
           - Rephrase unclear or poorly worded questions for professional quality.
        3. QUALITY FILTER: Ignore ads, navigation links, login buttons, and irrelevant promotional text. Keep only high-quality exam-style questions.
        4. CLASSIFICATION (PART 6): Classify extracted questions into:
           - MCQ (1 Mark)
           - Assertion-Reason (1 Mark)
           - Very Short Answer (VSAQ) (2 Marks)
           - Short Answer (SAQ) (3 Marks)
           - Case Study / Source Based (4 Marks)
           - Long Answer (LAQ) (5 Marks)
        
        🚫 ABSOLUTE BAN ON LATEX:
        - Use √, ², ³, π, △, θ etc. No backslashes.
        
        Output JSON:
        {
          "metadata": {
            "subject": "Detected Subject",
            "topic": "Detected Chapter/Topic",
            "grade": "Detected Grade"
          },
          "questions": [
            {
              "question_id": "gen_unique_id",
              "section": "Academic Section",
              "question_text": "...",
              "answer_type": "MCQ | Assertion-Reason | Very Short Answer | Short Answer | Case Study | Long Answer", 
              "marks": number, 
              "difficulty": 1-5,
              "topic": "Detected Topic",
              "options": ["Option A", "Option B", "Option C", "Option D"] // Only for MCQs
            }
          ]
        }
    `;

    try {
        const response = await withRetry(() => generateContentProxy({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        metadata: {
                            type: Type.OBJECT,
                            properties: {
                                subject: { type: Type.STRING },
                                topic: { type: Type.STRING },
                                grade: { type: Type.STRING }
                            }
                        },
                        questions: {
                            type: Type.ARRAY,
                            items: questionSchema
                        }
                    }
                }
            }
        }));
        
        const data = JSON.parse(response.text || "{}");
        const questions = data.questions || [];
        const metadata = data.metadata || {};

        // Ensure IDs are unique
        const processedQuestions = questions.map((q: Question, idx: number) => ({
            ...q,
            question_id: `gen_${Date.now()}_${idx}`
        }));

        return { questions: processedQuestions, metadata };

    } catch (error) {
        console.error("Generation from content failed", error);
        return { questions: [], metadata: {} };
    }
};

export const extractQuestionsFromUrl = async (url: string, subjectContext: string): Promise<{ questions: Question[], metadata: { subject?: string, topic?: string, grade?: string } }> => {
    try {
        console.log("Fetching URL for Web Extract:", url);
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        
        const response = await withRetry(() => fetch(proxyUrl));
        if (!response.ok) throw new Error(`Proxy returned ${response.status}`);
        
        const data = await response.json();
        const rawHtml = data.contents;
        
        if (!rawHtml || typeof rawHtml !== 'string') {
            throw new Error("Invalid content received");
        }

        // PART 1: HTML EXTRACTION (CLEANING)
        const parser = new DOMParser();
        const doc = parser.parseFromString(rawHtml, 'text/html');

        // Aggressive Removal of junk
        const junkSelectors = [
            'script', 'style', 'noscript', 'iframe', 'header', 'footer', 'nav', 'aside', 
            'form', 'button', 'svg', 'link', 'meta', '.ad', '.ads', '.sidebar', 
            '#sidebar', '#footer', '.footer', '.navbar', '.nav', '.menu', '.social-share',
            '.comments', '.related-posts', '.advertisement', 'ins.adsbygoogle', 
            '[aria-hidden="true"]', '.breadcrumb', '.promo', '.banner'
        ];
        junkSelectors.forEach(selector => {
            doc.querySelectorAll(selector).forEach(el => el.remove());
        });

        // Content Extraction: p, li, h1, h2, h3
        const semanticSelectors = ['p', 'li', 'h1', 'h2', 'h3', 'table', 'div[class*="content"]', '.entry-content'];
        let extractedParts: string[] = [];
        
        doc.querySelectorAll(semanticSelectors.join(',')).forEach(el => {
            const text = el.textContent?.trim();
            if (text && text.length > 10) {
               extractedParts.push(text);
            }
        });

        // Normalizing and filtering lines
        const allText = extractedParts.join('\n');
        const lines = allText.split(/\n+/);
        
        // Intelligent Filtering (PART 3)
        const filteredLines = lines
            .map(l => l.trim())
            .filter(l => l.length > 15) // PART 3: length > 15
            .filter((l, idx, arr) => arr.indexOf(l) === idx); // UNIQUE

        // Heuristic Pre-Filter: Only keep lines that look educational or like questions
        const heuristicFilteredContent = filteredLines.filter(line => {
             // Keep questions identified by manual heuristic or generally dense sentences
             return isQuestionHeuristic(line) || line.split(' ').length > 8;
        });

        const finalCleanText = heuristicFilteredContent.join('\n');

        if (finalCleanText.length < 150) {
            console.warn("Extraction yielded too little quality content.");
            throw new Error("EXTRACTION_BLOCKED");
        }

        console.log("Extracted high-quality text length:", finalCleanText.length);
        
        // Limit size to avoid huge payloads (15k characters)
        return await parseQuestionsFromText(finalCleanText.substring(0, 15000), subjectContext);

    } catch (error) {
        console.error("URL Extraction failed:", error);
        // Normalize error for UI
        if (error.message === "EXTRACTION_BLOCKED" || error.message.includes("403") || error.message.includes("401")) {
             throw new Error("EXTRACTION_BLOCKED");
        }
        throw error;
    }
};

export const fetchSchoolLogoUrl = async (schoolName: string, branchName: string): Promise<string | null> => {
    const query = `Find the official logo image URL for ${schoolName} ${branchName}. 
    Search for the official school website or trusted educational directories. 
    Return ONLY the direct image URL (ending in .png, .jpg, or .jpeg) if found. 
    If you cannot find a direct official logo URL, return "NOT_FOUND".`;

    try {
        const response = await withRetry(() => generateContentProxy({
            model: "gemini-3-flash-preview",
            contents: query,
            config: {
                tools: [{ googleSearch: {} }],
            },
        }));

        const text = response.text?.trim();
        if (text && text.startsWith('http') && (text.toLowerCase().endsWith('.png') || text.toLowerCase().endsWith('.jpg') || text.toLowerCase().endsWith('.jpeg') || text.includes('logo'))) {
            // Basic validation that it looks like a URL
            return text;
        }
        
        // If it returns a markdown link or something else, try to extract the URL
        const urlMatch = text?.match(/https?:\/\/[^\s)]+/);
        if (urlMatch) {
            return urlMatch[0];
        }

        return null;
    } catch (error) {
        console.error("Failed to fetch school logo:", error);
        return null;
    }
};

export const improveSelectedText = async (selectedText: string, context: string): Promise<string> => {
    const prompt = `
        IMPROVE the following text from an educational question paper.
        
        TEXT TO IMPROVE: "${selectedText}"
        CONTEXT: ${context}
        
        GOAL: Make it clearer, more professional, and academically accurate. 
        Maintain the original meaning but enhance the phrasing.
        
        🚫 ABSOLUTE BAN ON LATEX:
        - NO \\sqrt, \\frac, ^, /.
        - NO [[MATH]] tags.

        ✅ STRICT UNICODE MATH ONLY:
        - Use √, ², ³, π, △.
        
        Output ONLY the improved text. No explanations.
    `;

    try {
        const response = await withRetry(() => generateContentProxy({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                temperature: 0.7,
            },
        }));
        
        return response.text?.trim() || selectedText;
    } catch (error) {
        console.error("Improvement failed", error);
        return selectedText;
    }
};
