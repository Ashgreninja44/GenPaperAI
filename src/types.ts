
export interface QuestionCounts {
  mcq: number;
  ar: number; // Assertion-Reason
  vsaq: number; // Very Short Answer
  saq: number; // Short Answer
  laq: number; // Long Answer
  caseStudy: number;
}

export interface CustomSection {
  id: string;
  title: string; // e.g., "Section A"
  type: string; // e.g., "MCQ", "Case Study"
  count: number;
  marksPerQuestion: number;
  instructions?: string;
}

export interface PaperConfig {
  board: string;
  schoolName: string;
  schoolLogo?: string;
  logoPlacement?: 'left' | 'center' | 'right';
  headingFont?: string;
  bodyFont?: string;
  generalInstructions?: string;
  subject: string;
  grade: string;
  timeAllowed: string;
  totalMarks: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  includeFigures: boolean;
  
  testType: string; // e.g., "Periodic Test 1", "Custom"
  customSections?: CustomSection[]; // Only used if testType is "Custom"
  
  // Legacy/Standard counts (used if testType is NOT Custom)
  counts: QuestionCounts; 
  
  // New: Manually selected or extracted questions to include
  manualQuestions?: Question[];
}

export interface Question {
  question_id: string;
  section: string; // e.g., "Section A"
  question_text: string;
  options?: string[]; // Only for MCQs
  answer_type: string; // MCQ, Short, Long, Case
  marks: number;
  difficulty: number; // 1 to 5
  topic: string;
  can_regenerate: boolean;
  diagram_prompt?: string; // Description of the diagram needed
  image_url?: string; // The generated base64 image
  is_manually_edited?: boolean; // Track if user edited it
}

export interface GeneratedPaper {
  id: string;
  timestamp: number;
  config: PaperConfig;
  title: string;
  questions: Question[]; // Structured data
  answerKey: string; // Kept as text for simplicity, or could be structured later
  uid?: string; // Owner UID
}

export interface QuestionBank {
  id: string;
  board?: string;
  subject: string;
  grade: string;
  lastUpdated: number;
  content: string;
  uid?: string; // Owner UID
}

export interface HistoryStats {
  totalGenerated: number;
  topics: string[];
}

export interface UserPreferences {
  themeColor: string;
  background: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  profilePhoto: string | null;
  selectedTheme: string;
  preferences: UserPreferences;
  provider: 'google' | 'microsoft' | 'email';
  createdAt: number;
  role: 'user' | 'admin';
  defaultPaperSettings?: {
    board?: string;
    grade?: string;
    subject?: string;
    schoolName?: string;
  };
}
