import { doc, updateDoc } from 'firebase/firestore';
import { db, sanitizeForFirestore } from '../firebase';
import { StudentProfileSettings, StudentMistakeRecord } from '../types';

const GUEST_SETTINGS_KEY = 'genpaper_guest_student_settings';

/**
 * Returns a calendar date string 'YYYY-MM-DD' for the provided date in local time.
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns yesterday's calendar date string 'YYYY-MM-DD' in local time.
 */
export function getYesterdayLocalDateString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getLocalDateString(yesterday);
}

export interface EffectiveStudentMetrics {
  studyStreak: number;
  bestStreak: number;
  lastActivityDate: string;
  isStreakActiveToday: boolean;
  questionsSolved: number;
  correctAnswers: number;
  overallAccuracy: number;
  mockTestsCompleted: number;
  mistakes: StudentMistakeRecord[];
}

/**
 * Computes live, accurate student metrics.
 * Ensures a brand-new student account strictly starts with 0 streak and 0 fake activity.
 * If consecutive activity was broken (missed day), active streak lapses to 0.
 */
export function getEffectiveStudentMetrics(settings?: StudentProfileSettings | null): EffectiveStudentMetrics {
  const rawStreak = Number(settings?.studyStreak || 0);
  const lastDate = settings?.lastActivityDate || '';
  const today = getLocalDateString();
  const yesterday = getYesterdayLocalDateString();

  let activeStreak = 0;
  let isStreakActiveToday = false;

  if (rawStreak > 0 && lastDate) {
    if (lastDate === today) {
      activeStreak = rawStreak;
      isStreakActiveToday = true;
    } else if (lastDate === yesterday) {
      activeStreak = rawStreak;
      isStreakActiveToday = false; // Alive, can be continued today
    } else {
      // Missed at least one full day -> Streak lapses to 0
      activeStreak = 0;
      isStreakActiveToday = false;
    }
  }

  const questionsSolved = Number(settings?.questionsSolved || 0);
  const correctAnswers = Number(settings?.correctAnswers || 0);
  const overallAccuracy = questionsSolved > 0 ? Math.round((correctAnswers / questionsSolved) * 100) : 0;
  const mockTestsCompleted = Number(settings?.mockTestsCompleted || 0);
  const bestStreak = Math.max(Number(settings?.bestStreak || 0), activeStreak);
  const mistakes = settings?.mistakes || [];

  return {
    studyStreak: activeStreak,
    bestStreak,
    lastActivityDate: lastDate,
    isStreakActiveToday,
    questionsSolved,
    correctAnswers,
    overallAccuracy,
    mockTestsCompleted,
    mistakes
  };
}

/**
 * Loads guest student settings from session storage if available.
 */
export function loadGuestStudentSettings(): StudentProfileSettings | null {
  try {
    const raw = sessionStorage.getItem(GUEST_SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load guest student settings:', e);
  }
  return null;
}

/**
 * Saves guest student settings to session storage.
 */
export function saveGuestStudentSettings(settings: StudentProfileSettings): void {
  try {
    sessionStorage.setItem(GUEST_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save guest student settings:', e);
  }
}

export interface ActivityPayload {
  type: 'practice' | 'mock_test';
  isCorrect?: boolean;
  questionsCount?: number;
  score?: number;
  maxScore?: number;
  testId?: string;
}

/**
 * Records a qualifying student learning activity.
 * Rules:
 * - Increases streak to 1 if user had 0 streak.
 * - Same-day activities do NOT increase streak multiple times.
 * - Consecutive day activity increases streak by 1.
 * - Missed days restart streak at 1.
 * - Persists strictly to the authenticated student's profile.
 */
export async function recordStudentActivity(
  userId: string | undefined | null,
  currentSettings: StudentProfileSettings | undefined | null,
  activity: ActivityPayload
): Promise<StudentProfileSettings> {
  const today = getLocalDateString();
  const yesterday = getYesterdayLocalDateString();
  const lastDate = currentSettings?.lastActivityDate || '';
  const currentStreak = Number(currentSettings?.studyStreak || 0);

  let newStreak = 1;
  if (lastDate === today) {
    // Already did activity today - maintain current streak (or initialize to 1 if it was 0)
    newStreak = currentStreak > 0 ? currentStreak : 1;
  } else if (lastDate === yesterday && currentStreak > 0) {
    // Consecutive day activity! Increment streak
    newStreak = currentStreak + 1;
  } else {
    // Brand new or streak reset after gap
    newStreak = 1;
  }

  const newBestStreak = Math.max(Number(currentSettings?.bestStreak || 0), newStreak);
  const prevDates = currentSettings?.activityDates || [];
  const newActivityDates = prevDates.includes(today) ? prevDates : [...prevDates, today];

  const addedQuestions = activity.questionsCount !== undefined 
    ? activity.questionsCount 
    : (activity.type === 'practice' ? 1 : 0);

  const newQuestionsSolved = Number(currentSettings?.questionsSolved || 0) + addedQuestions;
  const newCorrectAnswers = Number(currentSettings?.correctAnswers || 0) + (activity.isCorrect ? 1 : 0);
  const newMockTestsCompleted = Number(currentSettings?.mockTestsCompleted || 0) + (activity.type === 'mock_test' ? 1 : 0);

  let updatedMockScores = currentSettings?.mockTestScores || [];
  if (activity.type === 'mock_test' && activity.testId && activity.score !== undefined && activity.maxScore !== undefined) {
    updatedMockScores = [
      ...updatedMockScores.filter(s => s.testId !== activity.testId),
      {
        testId: activity.testId,
        score: activity.score,
        maxScore: activity.maxScore,
        completedAt: Date.now()
      }
    ];
  }

  const updatedSettings: StudentProfileSettings = {
    ...(currentSettings || {}),
    studyStreak: newStreak,
    lastActivityDate: today,
    bestStreak: newBestStreak,
    activityDates: newActivityDates,
    questionsSolved: newQuestionsSolved,
    correctAnswers: newCorrectAnswers,
    mockTestsCompleted: newMockTestsCompleted,
    mockTestScores: updatedMockScores
  };

  // Persist to Firestore if authenticated user
  if (userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const cleanSettings = sanitizeForFirestore(updatedSettings);
      await updateDoc(userRef, {
        studentSettings: cleanSettings
      });
    } catch (error) {
      console.error('Failed to persist student learning activity to Firestore:', error);
    }
  } else {
    // Guest persistence
    saveGuestStudentSettings(updatedSettings);
  }

  return updatedSettings;
}

/**
 * Persists a new mistake record to the student's notebook.
 */
export async function saveMistakeToNotebook(
  userId: string | undefined | null,
  currentSettings: StudentProfileSettings | undefined | null,
  mistake: StudentMistakeRecord
): Promise<StudentProfileSettings> {
  const existing = currentSettings?.mistakes || [];
  const updatedMistakes = [mistake, ...existing.filter(m => m.id !== mistake.id && m.questionText !== mistake.questionText)];

  const updatedSettings: StudentProfileSettings = {
    ...(currentSettings || {}),
    mistakes: updatedMistakes
  };

  if (userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const cleanSettings = sanitizeForFirestore(updatedSettings);
      await updateDoc(userRef, {
        studentSettings: cleanSettings
      });
    } catch (err) {
      console.error('Failed to save student mistake to Firestore:', err);
    }
  } else {
    saveGuestStudentSettings(updatedSettings);
  }

  return updatedSettings;
}

/**
 * Toggles a mistake resolution status.
 */
export async function toggleMistakeResolution(
  userId: string | undefined | null,
  currentSettings: StudentProfileSettings | undefined | null,
  mistakeId: string
): Promise<StudentProfileSettings> {
  const existing = currentSettings?.mistakes || [];
  const updatedMistakes = existing.map(m => 
    m.id === mistakeId ? { ...m, resolved: !m.resolved } : m
  );

  const updatedSettings: StudentProfileSettings = {
    ...(currentSettings || {}),
    mistakes: updatedMistakes
  };

  if (userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const cleanSettings = sanitizeForFirestore(updatedSettings);
      await updateDoc(userRef, {
        studentSettings: cleanSettings
      });
    } catch (err) {
      console.error('Failed to update mistake resolution in Firestore:', err);
    }
  } else {
    saveGuestStudentSettings(updatedSettings);
  }

  return updatedSettings;
}
