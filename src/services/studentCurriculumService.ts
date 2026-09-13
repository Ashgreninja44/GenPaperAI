import { SYLLABUS_DATA } from '../constants';

export interface BoardOption {
  id: string;
  name: string;
  badge: string;
  description: string;
  isPopular?: boolean;
}

export const SUPPORTED_STUDENT_BOARDS: BoardOption[] = [
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
    description: "In-depth application and analytical syllabus designed for CISCE students."
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

export const SUPPORTED_STUDENT_GRADES = [
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12"
];

export const LEARNING_GOAL_OPTIONS = [
  { id: 'weak-chapters', label: 'Improve weak chapters', icon: '🎯' },
  { id: 'school-exams', label: 'Prepare for school exams', icon: '🏫' },
  { id: 'board-exams', label: 'Prepare for board exams', icon: '🏆' },
  { id: 'problem-solving', label: 'Improve problem-solving', icon: '🧠' },
  { id: 'conceptual', label: 'Improve conceptual understanding', icon: '💡' },
  { id: 'regular-practice', label: 'Practice regularly', icon: '⚡' },
  { id: 'accuracy', label: 'Improve accuracy', icon: '🎯' },
  { id: 'time-management', label: 'Improve time management', icon: '⏱️' }
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

export function getSubjectChapterCount(board: string, grade: string, subjectName: string): number {
  const boardData = SYLLABUS_DATA[board] || SYLLABUS_DATA["CBSE / NCERT (New)"];
  if (!boardData) return 12;

  const gradeData = boardData[grade];
  if (!gradeData) return 12;

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

  if (!subjectData) return 12;

  if (Array.isArray(subjectData.chapters)) {
    return Math.max(1, subjectData.chapters.length);
  }

  if (Array.isArray(subjectData.books)) {
    const count = subjectData.books.reduce((acc: number, b: any) => {
      return acc + (Array.isArray(b.chapters) ? b.chapters.length : 0);
    }, 0);
    return Math.max(1, count);
  }

  return 12;
}

/**
 * Returns available subjects based on selected Board and Grade.
 * Grounded in existing SYLLABUS_DATA.
 */
export function getAvailableSubjectsForGrade(board: string, grade: string): SubjectOption[] {
  const boardKey = SYLLABUS_DATA[board] ? board : "CBSE / NCERT (New)";
  const gradeData = SYLLABUS_DATA[boardKey]?.[grade];

  const subjects: SubjectOption[] = [];
  const addedNames = new Set<string>();

  if (gradeData && typeof gradeData === 'object') {
    const rawKeys = Object.keys(gradeData);

    // Prefer canonical names: if "Mathematics" exists, avoid listing Basic & Standard redundantly
    const hasGeneralMath = rawKeys.includes("Mathematics");

    for (const key of rawKeys) {
      if (hasGeneralMath && (key === "Mathematics (Basic)" || key === "Mathematics (Standard)")) {
        continue;
      }
      if (key === "Telugu" && rawKeys.includes("Telugu (Andhra Pradesh)")) {
        continue;
      }

      const visual = getSubjectVisualMeta(key);
      const totalChapters = getSubjectChapterCount(boardKey, grade, key);

      subjects.push({
        id: `subj-${key.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: key,
        icon: visual.icon,
        color: visual.color,
        totalChapters
      });
      addedNames.add(key.toLowerCase());
    }
  }

  // Fallback if grade is not in syllabus data (e.g. Class 11, Class 12 or custom boards)
  if (subjects.length === 0) {
    const defaultList = grade.includes('11') || grade.includes('12')
      ? [
          { name: 'Physics', chapters: 14 },
          { name: 'Chemistry', chapters: 14 },
          { name: 'Mathematics', chapters: 13 },
          { name: 'Biology', chapters: 16 },
          { name: 'English Core', chapters: 12 },
          { name: 'Computer Science', chapters: 10 },
          { name: 'Accountancy', chapters: 12 },
          { name: 'Economics', chapters: 12 }
        ]
      : [
          { name: 'Mathematics', chapters: 14 },
          { name: 'Science', chapters: 13 },
          { name: 'Social Science', chapters: 20 },
          { name: 'English', chapters: 16 },
          { name: 'Hindi', chapters: 14 },
          { name: 'Computer Applications', chapters: 10 }
        ];

    for (const item of defaultList) {
      const visual = getSubjectVisualMeta(item.name);
      subjects.push({
        id: `subj-${item.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: item.name,
        icon: visual.icon,
        color: visual.color,
        totalChapters: item.chapters
      });
    }
  }

  return subjects;
}
