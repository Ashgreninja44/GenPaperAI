import { SYLLABUS_DATA } from '../constants';

export interface BoardOption {
  id: string;
  name: string;
  badge: string;
  description: string;
  isPopular?: boolean;
}

export const SUPPORTED_CURRICULUM_BOARDS: BoardOption[] = [
  {
    id: "CBSE / NCERT (New)",
    name: "CBSE (New NCERT)",
    badge: "Central Board",
    description: "New rationalized NCERT curriculum for academic excellence and board exams.",
    isPopular: true
  },
  {
    id: "CBSE / NCERT (Old)",
    name: "CBSE (Comprehensive NCERT)",
    badge: "Central Board",
    description: "Complete NCERT curriculum with all traditional chapters and topics."
  },
  {
    id: "ICSE / ISC",
    name: "ICSE / ISC",
    badge: "CISCE Board",
    description: "In-depth application and analytical syllabus designed for CISCE curriculum."
  },
  {
    id: "AP SCERT",
    name: "Andhra Pradesh SCERT",
    badge: "State Board",
    description: "State Council curriculum for Andhra Pradesh English and bilingual medium."
  },
  {
    id: "Telangana SCERT",
    name: "Telangana SCERT",
    badge: "State Board",
    description: "Telangana State Council textbooks, learning outcomes, and assessment pattern."
  },
  {
    id: "State Board (General)",
    name: "Other State Board",
    badge: "State Board",
    description: "Standard state education board syllabus aligned with national standards."
  }
];

export const SUPPORTED_CURRICULUM_GRADES = [
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12"
];

export interface SubjectOption {
  id: string;
  name: string;
  icon: string;
  color: string;
  totalChapters: number;
}

export function getSubjectVisualMeta(subjectName: string): { icon: string; color: string } {
  const lower = subjectName.toLowerCase();
  if (lower.includes('math')) {
    return { icon: '📐', color: 'from-purple-600 to-pink-600' };
  }
  if (lower.includes('science') || lower.includes('physics') || lower.includes('chem') || lower.includes('bio')) {
    return { icon: '🔬', color: 'from-blue-600 to-indigo-600' };
  }
  if (lower.includes('social') || lower.includes('history') || lower.includes('geo') || lower.includes('civics') || lower.includes('eco')) {
    return { icon: '🌍', color: 'from-amber-600 to-orange-600' };
  }
  if (lower.includes('english')) {
    return { icon: '📖', color: 'from-emerald-600 to-teal-600' };
  }
  if (lower.includes('hindi') || lower.includes('sanskrit') || lower.includes('telugu') || lower.includes('urdu') || lower.includes('tamil')) {
    return { icon: '✍️', color: 'from-rose-600 to-red-600' };
  }
  if (lower.includes('comp') || lower.includes('it') || lower.includes('information') || lower.includes('ai')) {
    return { icon: '💻', color: 'from-cyan-600 to-blue-600' };
  }
  if (lower.includes('account') || lower.includes('business') || lower.includes('commerce')) {
    return { icon: '📊', color: 'from-violet-600 to-purple-600' };
  }
  return { icon: '📚', color: 'from-indigo-600 to-purple-600' };
}

export function getSubjectChapters(board: string, grade: string, subjectName: string): string[] {
  const boardData = SYLLABUS_DATA[board] || SYLLABUS_DATA["CBSE / NCERT (New)"];
  if (!boardData) return [];

  const gradeData = boardData[grade];
  if (!gradeData) return [];

  // Try exact match first
  let subjectData = gradeData[subjectName];

  // Try fuzzy match if exact match not found
  if (!subjectData) {
    const keys = Object.keys(gradeData);
    const matchedKey = keys.find(k => 
      k.toLowerCase().includes(subjectName.toLowerCase()) || 
      subjectName.toLowerCase().includes(k.toLowerCase())
    );
    if (matchedKey) {
      subjectData = gradeData[matchedKey];
    }
  }

  if (!subjectData) return [];

  if (Array.isArray(subjectData)) {
    return subjectData.map((ch: any) => typeof ch === 'string' ? ch : ch.chapter || ch.name || String(ch));
  }

  if (typeof subjectData === 'object' && subjectData !== null) {
    if (Array.isArray((subjectData as any).chapters)) {
      return (subjectData as any).chapters.map((ch: any) => typeof ch === 'string' ? ch : ch.chapter || ch.name || String(ch));
    }
    return Object.keys(subjectData);
  }

  return [];
}
