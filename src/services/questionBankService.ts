import { 
  QuestionBank, 
  StructuredQuestion, 
  Question, 
  BloomTaxonomyLevel, 
  QuestionOrigin,
  SourceCitationInfo 
} from '../types';
import { parseQuestionsFromText } from './geminiService';

/**
 * Normalizes question text for similarity/deduplication checks.
 */
export function normalizeQuestionText(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if two questions are duplicates or near-duplicates (> 85% overlap).
 */
export function areQuestionsDuplicate(textA: string, textB: string): boolean {
  const normA = normalizeQuestionText(textA);
  const normB = normalizeQuestionText(textB);

  if (normA === normB) return true;
  if (normA.length === 0 || normB.length === 0) return false;

  // Word set Jaccard similarity
  const wordsA = new Set(normA.split(' '));
  const wordsB = new Set(normB.split(' '));
  
  let intersectionCount = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) intersectionCount++;
  }

  const unionCount = new Set([...wordsA, ...wordsB]).size;
  const similarity = unionCount > 0 ? intersectionCount / unionCount : 0;

  return similarity >= 0.85;
}

/**
 * Converts a runtime Question object to a StructuredQuestion record.
 */
export function convertToStructuredQuestion(
  q: Question,
  context: { subject: string; grade: string; board?: string; chapter?: string }
): StructuredQuestion {
  const bloom: BloomTaxonomyLevel = (
    q.bloom_level && ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'].includes(q.bloom_level)
  ) ? q.bloom_level : (
    q.marks >= 5 ? 'Create' : q.marks === 4 ? 'Evaluate' : q.marks === 3 ? 'Analyze' : q.marks === 2 ? 'Understand' : 'Remember'
  );

  return {
    id: q.question_id || `q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    text: q.question_text,
    subject: context.subject,
    grade: context.grade,
    board: context.board || 'CBSE',
    chapter: q.chapter || context.chapter || q.topic || 'General',
    topic: q.topic || 'General',
    subtopic: q.subtopic,
    type: q.answer_type || (q.options && q.options.length > 0 ? 'MCQ' : 'Short Answer'),
    options: q.options,
    answer: q.options && q.options[0] ? q.options[0] : undefined,
    solution: q.solution,
    marks: Number(q.marks) || 1,
    difficulty: q.difficulty || 3,
    bloomLevel: bloom,
    origin: q.origin || 'question_bank',
    sourceInfo: q.source_info,
    tags: q.tags || [context.subject, context.grade],
    createdAt: Date.now(),
    diagramPrompt: q.diagram_prompt,
    imageUrl: q.image_url,
    isVerified: true
  };
}

/**
 * Converts a StructuredQuestion back to a runtime Question object for Paper Generation.
 */
export function convertToRuntimeQuestion(sq: StructuredQuestion): Question {
  return {
    question_id: sq.id,
    section: sq.marks === 1 ? 'Section A' : sq.marks <= 3 ? 'Section B' : 'Section C',
    question_text: sq.text,
    options: sq.options,
    answer_type: sq.type,
    marks: sq.marks,
    difficulty: typeof sq.difficulty === 'number' ? sq.difficulty : sq.difficulty === 'Easy' ? 2 : sq.difficulty === 'Hard' ? 4 : 3,
    topic: sq.topic || sq.chapter || 'General',
    can_regenerate: true,
    diagram_prompt: sq.diagramPrompt,
    image_url: sq.imageUrl,
    bloom_level: sq.bloomLevel,
    origin: sq.origin,
    source_info: sq.sourceInfo,
    chapter: sq.chapter,
    subtopic: sq.subtopic,
    solution: sq.solution,
    tags: sq.tags
  };
}

/**
 * Migrates a legacy Markdown QuestionBank into structured questions while preserving the raw content string.
 */
export async function migrateBankToStructured(bank: QuestionBank): Promise<QuestionBank> {
  // If already structured and has questions, return as is
  if (bank.questions && Array.isArray(bank.questions) && bank.questions.length > 0) {
    return bank;
  }

  // If no content, initialize empty questions array
  if (!bank.content || bank.content.trim().length === 0) {
    return {
      ...bank,
      questions: [],
      version: 2
    };
  }

  try {
    const parsed = await parseQuestionsFromText(bank.content, bank.subject);
    const structuredQuestions: StructuredQuestion[] = (parsed.questions || []).map(q => 
      convertToStructuredQuestion(q, {
        subject: bank.subject,
        grade: bank.grade,
        board: bank.board || 'CBSE',
        chapter: parsed.metadata.topic || bank.subject
      })
    );

    return {
      ...bank,
      questions: structuredQuestions,
      version: 2,
      lastUpdated: Date.now()
    };
  } catch (err) {
    console.warn(`[Bank Migration] Failed to parse questions from bank ${bank.id}, keeping raw markdown:`, err);
    return {
      ...bank,
      questions: [],
      version: 1 // Keep version 1 for retry
    };
  }
}

/**
 * Filter criteria for structured question retrieval.
 */
export interface QuestionFilterCriteria {
  searchQuery?: string;
  subject?: string;
  grade?: string;
  board?: string;
  chapter?: string;
  type?: string;
  marks?: number;
  difficulty?: string | number;
  bloomLevel?: BloomTaxonomyLevel;
  origin?: QuestionOrigin;
  hasDiagram?: boolean;
}

/**
 * Filters structured questions locally with multi-field matching and relevance ranking.
 */
export function filterStructuredQuestions(
  questions: StructuredQuestion[],
  criteria: QuestionFilterCriteria
): StructuredQuestion[] {
  if (!questions || questions.length === 0) return [];

  return questions.filter(q => {
    // Subject filter
    if (criteria.subject && criteria.subject !== 'All' && q.subject.toLowerCase() !== criteria.subject.toLowerCase()) {
      return false;
    }

    // Grade / Class filter
    if (criteria.grade && criteria.grade !== 'All' && q.grade.toLowerCase() !== criteria.grade.toLowerCase()) {
      return false;
    }

    // Board filter
    if (criteria.board && criteria.board !== 'All' && q.board && q.board.toLowerCase() !== criteria.board.toLowerCase()) {
      return false;
    }

    // Chapter filter
    if (criteria.chapter && criteria.chapter !== 'All' && q.chapter && q.chapter.toLowerCase() !== criteria.chapter.toLowerCase()) {
      return false;
    }

    // Question Type filter
    if (criteria.type && criteria.type !== 'All') {
      const typeMatches = q.type.toLowerCase().includes(criteria.type.toLowerCase()) ||
                          (criteria.type === 'MCQ' && q.options && q.options.length > 0);
      if (!typeMatches) return false;
    }

    // Marks filter
    if (criteria.marks !== undefined && criteria.marks > 0 && q.marks !== criteria.marks) {
      return false;
    }

    // Bloom's Taxonomy Level filter
    if (criteria.bloomLevel && criteria.bloomLevel !== ('All' as any) && q.bloomLevel !== criteria.bloomLevel) {
      return false;
    }

    // Origin / Source filter
    if (criteria.origin && criteria.origin !== ('All' as any) && q.origin !== criteria.origin) {
      return false;
    }

    // Diagram filter
    if (criteria.hasDiagram !== undefined) {
      const hasDiag = !!(q.diagramPrompt || q.imageUrl);
      if (hasDiag !== criteria.hasDiagram) return false;
    }

    // Search query multi-term matching
    if (criteria.searchQuery && criteria.searchQuery.trim().length > 0) {
      const terms = criteria.searchQuery.toLowerCase().trim().split(/\s+/);
      const textToSearch = `${q.text} ${q.chapter || ''} ${q.topic || ''} ${q.subtopic || ''} ${(q.tags || []).join(' ')} ${q.type} ${q.bloomLevel || ''}`.toLowerCase();
      
      const allTermsFound = terms.every(t => textToSearch.includes(t));
      if (!allTermsFound) return false;
    }

    return true;
  });
}

/**
 * Performs fast smart semantic retrieval across banks.
 * Handles queries like "Class 10 CBSE Mathematics Trigonometry heights and distances".
 */
export function smartSemanticRetrieve(
  banks: QuestionBank[],
  query: string
): StructuredQuestion[] {
  if (!query || query.trim().length === 0) return [];

  const cleanQuery = query.toLowerCase().trim();
  const queryTokens = cleanQuery.split(/\s+/).filter(t => t.length > 1);

  const allStructuredQuestions: StructuredQuestion[] = [];
  for (const b of banks) {
    if (b.questions && Array.isArray(b.questions)) {
      allStructuredQuestions.push(...b.questions);
    }
  }

  if (allStructuredQuestions.length === 0) return [];

  // Score each question based on semantic relevance
  const scored = allStructuredQuestions.map(q => {
    let score = 0;
    const qText = q.text.toLowerCase();
    const qChapter = (q.chapter || '').toLowerCase();
    const qTopic = (q.topic || '').toLowerCase();
    const qSubject = (q.subject || '').toLowerCase();
    const qGrade = (q.grade || '').toLowerCase();
    const qBloom = (q.bloomLevel || '').toLowerCase();
    const qTags = (q.tags || []).map(t => t.toLowerCase());

    for (const token of queryTokens) {
      if (qChapter.includes(token)) score += 10;
      if (qTopic.includes(token)) score += 8;
      if (qTags.some(t => t.includes(token))) score += 7;
      if (qSubject.includes(token)) score += 6;
      if (qGrade.includes(token)) score += 5;
      if (qText.includes(token)) score += 4;
      if (qBloom.includes(token)) score += 3;
    }

    // Exact phrase match bonus
    if (qText.includes(cleanQuery) || qChapter.includes(cleanQuery)) {
      score += 25;
    }

    return { question: q, score };
  });

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.question);
}
