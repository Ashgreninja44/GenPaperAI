import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Target, 
  Clock, 
  Brain, 
  Bookmark, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Flame, 
  Award, 
  BarChart3, 
  HelpCircle, 
  RotateCcw, 
  Search, 
  Filter, 
  Compass, 
  Zap, 
  FileText, 
  Layers, 
  Check, 
  ArrowRight,
  ExternalLink,
  Lightbulb,
  GraduationCap,
  Play,
  X,
  Settings,
  Plus
} from 'lucide-react';
import { 
  UserProfile, 
  StudentSubjectProgress, 
  StudentPracticeQuestion, 
  StudentMockTest, 
  StudentMistakeRecord, 
  StudentRevisionDeck,
  StudentProfileSettings
} from '../types';
import {
  getEffectiveStudentMetrics,
  recordStudentActivity,
  saveMistakeToNotebook,
  toggleMistakeResolution,
  loadGuestStudentSettings,
  saveGuestStudentSettings
} from '../services/studentProgressService';
import {
  getSubjectVisualMeta,
  getSubjectChapterCount
} from '../services/studentCurriculumService';

interface StudentDashboardProps {
  userProfile: UserProfile | null;
  isGuest?: boolean;
  onRequireAuth?: (feature: string, message?: string) => void;
  onUpdateStudentSettings?: (newSettings: StudentProfileSettings) => void;
  onOpenProfileSettings?: () => void;
}

type ActiveStudentTab = 
  | 'subjects' 
  | 'practice' 
  | 'mock-tests' 
  | 'ai-tutor' 
  | 'mistakes' 
  | 'revision' 
  | 'progress';

// Interactive curriculum practice questions bank
const SAMPLE_PRACTICE_QUESTIONS: StudentPracticeQuestion[] = [
  {
    id: 'pq-1',
    subject: 'Science',
    grade: 'Class 10',
    topic: 'Chemical Reactions and Equations',
    subtopic: 'Redox Reactions',
    questionText: 'When lead nitrate crystal powder is heated in a dry boiling tube, what brown gas is evolved?',
    type: 'MCQ',
    difficulty: 'Easy',
    bloomLevel: 'Remember',
    options: [
      'Nitrogen dioxide (NO₂)',
      'Nitrous oxide (N₂O)',
      'Lead oxide (PbO)',
      'Oxygen gas (O₂)'
    ],
    correctAnswer: 'Nitrogen dioxide (NO₂)',
    hint: 'This thermal decomposition reaction produces a yellow residue of PbO along with a distinct reddish-brown pungent gas.',
    explanation: '2Pb(NO₃)₂(s) → 2PbO(s) + 4NO₂(g) + O₂(g). The brown fumes observed are Nitrogen dioxide (NO₂).'
  },
  {
    id: 'pq-2',
    subject: 'Mathematics',
    grade: 'Class 10',
    topic: 'Quadratic Equations',
    subtopic: 'Nature of Roots',
    questionText: 'If the quadratic equation 2x² - kx + 8 = 0 has two real and equal roots, what is the value of k?',
    type: 'MCQ',
    difficulty: 'Medium',
    bloomLevel: 'Apply',
    options: [
      'k = ±8',
      'k = ±4',
      'k = 8 only',
      'k = 16'
    ],
    correctAnswer: 'k = ±8',
    hint: 'For equal and real roots, the discriminant D = b² - 4ac must equal 0.',
    explanation: 'D = (-k)² - 4(2)(8) = k² - 64 = 0  =>  k² = 64  =>  k = ±8.'
  },
  {
    id: 'pq-3',
    subject: 'Science',
    grade: 'Class 10',
    topic: 'Light - Reflection and Refraction',
    subtopic: 'Mirror Formula & Magnification',
    questionText: 'A concave mirror produces a real and inverted image 3 times magnified when an object is placed 10 cm in front of it. What is the radius of curvature of the mirror?',
    type: 'MCQ',
    difficulty: 'Hard',
    bloomLevel: 'Analyze',
    options: [
      '15 cm',
      '30 cm',
      '7.5 cm',
      '-15 cm'
    ],
    correctAnswer: '15 cm',
    hint: 'For a real image in a concave mirror, magnification m = -v/u = -3. Then apply 1/f = 1/v + 1/u and R = 2f.',
    explanation: 'm = -v/u = -3 => v = 3u = 3(-10) = -30 cm. 1/f = 1/v + 1/u = 1/(-30) + 1/(-10) = -4/30 => f = -7.5 cm. Radius of curvature R = 2|f| = 15 cm.'
  }
];

// Available Mock Assessments (All start clean and uncompleted for new students)
const INITIAL_MOCK_TESTS: StudentMockTest[] = [
  {
    id: 'mock-1',
    title: 'CBSE Class 10 Science Full Mock (Sample Paper 2026-27)',
    subject: 'Science',
    grade: 'Class 10',
    board: 'CBSE',
    totalMarks: 80,
    durationMinutes: 180,
    questionCount: 39,
    status: 'available'
  },
  {
    id: 'mock-2',
    title: 'Class 10 Maths Standard Chapter-wise Speed Test: Trigonometry',
    subject: 'Mathematics',
    grade: 'Class 10',
    board: 'CBSE',
    totalMarks: 25,
    durationMinutes: 45,
    questionCount: 12,
    status: 'available'
  },
  {
    id: 'mock-3',
    title: 'Periodic Test 1 Revision Assessment',
    subject: 'Social Science',
    grade: 'Class 10',
    board: 'CBSE',
    totalMarks: 40,
    durationMinutes: 90,
    questionCount: 20,
    status: 'available',
    assignedBy: {
      teacherName: 'Prof. Sharma (Mathematics Dept)',
      classroomCode: 'SEC-10A-SCI',
      dueDate: 'Sep 25, 2026'
    }
  }
];

// Mock test questions for interactive simulation
const MOCK_TEST_SAMPLE_QUESTIONS: Record<string, StudentPracticeQuestion[]> = {
  'mock-1': [
    {
      id: 'mq-1-1',
      subject: 'Science',
      grade: 'Class 10',
      topic: 'Chemical Reactions',
      questionText: 'Which of the following processes involves a chemical reaction?',
      type: 'MCQ',
      difficulty: 'Easy',
      bloomLevel: 'Remember',
      options: [
        'Storing oxygen gas under pressure in a gas cylinder',
        'Liquefaction of air',
        'Keeping petrol in a China dish in the open',
        'Heating copper wire in presence of air at high temperature'
      ],
      correctAnswer: 'Heating copper wire in presence of air at high temperature',
      explanation: 'Heating copper wire in air causes oxidation to form black copper(II) oxide (2Cu + O₂ → 2CuO).'
    },
    {
      id: 'mq-1-2',
      subject: 'Science',
      grade: 'Class 10',
      topic: 'Life Processes',
      questionText: 'During cellular respiration in human muscle cells, glucose is converted into lactic acid when there is a lack of:',
      type: 'MCQ',
      difficulty: 'Medium',
      bloomLevel: 'Understand',
      options: ['Carbon dioxide', 'Oxygen', 'Water', 'Nitrogen'],
      correctAnswer: 'Oxygen',
      explanation: 'In the absence or lack of oxygen in muscle cells, pyruvate is converted into lactic acid.'
    },
    {
      id: 'mq-1-3',
      subject: 'Science',
      grade: 'Class 10',
      topic: 'Electricity',
      questionText: 'The electrical resistivity of a given metallic wire depends upon:',
      type: 'MCQ',
      difficulty: 'Medium',
      bloomLevel: 'Remember',
      options: ['Its length', 'Its thickness', 'Its shape', 'Nature of the material'],
      correctAnswer: 'Nature of the material',
      explanation: 'Resistivity is an intrinsic property of the material and temperature, independent of dimensions.'
    }
  ],
  'mock-2': [
    {
      id: 'mq-2-1',
      subject: 'Mathematics',
      grade: 'Class 10',
      topic: 'Trigonometry',
      questionText: 'If tan θ = 4/3, what is the value of (sin θ + cos θ)?',
      type: 'MCQ',
      difficulty: 'Easy',
      bloomLevel: 'Apply',
      options: ['7/5', '1/5', '5/7', '7/3'],
      correctAnswer: '7/5',
      explanation: 'Opposite = 4, Adjacent = 3 => Hypotenuse = 5. sin θ = 4/5, cos θ = 3/5 => sum = 7/5.'
    },
    {
      id: 'mq-2-2',
      subject: 'Mathematics',
      grade: 'Class 10',
      topic: 'Trigonometry',
      questionText: 'Evaluate: (1 + tan² A) / (1 + cot² A)',
      type: 'MCQ',
      difficulty: 'Medium',
      bloomLevel: 'Apply',
      options: ['sec² A', '-1', 'cot² A', 'tan² A'],
      correctAnswer: 'tan² A',
      explanation: '(1 + tan² A) = sec² A, (1 + cot² A) = cosec² A. sec² A / cosec² A = (1/cos² A) / (1/sin² A) = tan² A.'
    },
    {
      id: 'mq-2-3',
      subject: 'Mathematics',
      grade: 'Class 10',
      topic: 'Trigonometry',
      questionText: 'The value of sin 60° cos 30° + sin 30° cos 60° is equal to:',
      type: 'MCQ',
      difficulty: 'Easy',
      bloomLevel: 'Remember',
      options: ['0', '1', '1/2', '√3/2'],
      correctAnswer: '1',
      explanation: '(√3/2)(√3/2) + (1/2)(1/2) = 3/4 + 1/4 = 1.'
    }
  ],
  'mock-3': [
    {
      id: 'mq-3-1',
      subject: 'Social Science',
      grade: 'Class 10',
      topic: 'Nationalism in Europe',
      questionText: 'Who was proclaimed the German Emperor in a ceremony held at Versailles in January 1871?',
      type: 'MCQ',
      difficulty: 'Easy',
      bloomLevel: 'Remember',
      options: ['Kaiser William I', 'Otto von Bismarck', 'Giuseppe Mazzini', 'Victor Emmanuel II'],
      correctAnswer: 'Kaiser William I',
      explanation: 'In January 1871, the Prussian King, Kaiser William I, was proclaimed German Emperor at Versailles.'
    },
    {
      id: 'mq-3-2',
      subject: 'Social Science',
      grade: 'Class 10',
      topic: 'Resources and Development',
      questionText: 'Which soil is widely known for its moisture-retentive capacity and is ideal for growing cotton?',
      type: 'MCQ',
      difficulty: 'Easy',
      bloomLevel: 'Remember',
      options: ['Black Soil (Regur)', 'Alluvial Soil', 'Laterite Soil', 'Arid Soil'],
      correctAnswer: 'Black Soil (Regur)',
      explanation: 'Black soil is rich in clayey materials, retains moisture well, and is ideal for cotton cultivation.'
    }
  ]
};

// Curriculum Reference Revision Decks
const INITIAL_REVISION_DECKS: StudentRevisionDeck[] = [
  {
    id: 'rev-1',
    subject: 'Mathematics',
    title: 'Algebra & Quadratic Cheat Sheet',
    chapter: 'Quadratic Equations & Polynomials',
    summary: 'Essential formulas, discriminant conditions, and sum/product of roots relationships.',
    keyPoints: [
      'Standard form: ax² + bx + c = 0 (a ≠ 0)',
      'Quadratic formula: x = (-b ± √(b² - 4ac)) / (2a)',
      'Discriminant D = b² - 4ac:',
      '• D > 0: Two distinct real roots',
      '• D = 0: Two equal real roots',
      '• D < 0: No real roots'
    ],
    formulas: [
      'x = (-b ± √D) / 2a',
      'Sum of roots (α + β) = -b/a',
      'Product of roots (αβ) = c/a'
    ]
  },
  {
    id: 'rev-2',
    subject: 'Science',
    title: 'Light: Mirror & Lens Sign Conventions',
    chapter: 'Light - Reflection & Refraction',
    summary: 'New Cartesian Sign Convention rules for spherical mirrors and thin lenses.',
    keyPoints: [
      'All distances measured from pole (mirror) or optical center (lens)',
      'Distances in direction of incident light are positive (+)',
      'Distances opposite to direction of incident light are negative (-)',
      'Object distance (u) is always negative for real objects',
      'Focal length (f): Concave is negative (-), Convex is positive (+)'
    ],
    formulas: [
      'Mirror Formula: 1/f = 1/v + 1/u',
      'Lens Formula: 1/f = 1/v - 1/u',
      'Mirror Magnification: m = -v/u = h\'/h',
      'Lens Magnification: m = v/u = h\'/h'
    ]
  }
];

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  userProfile,
  isGuest = false,
  onRequireAuth,
  onUpdateStudentSettings,
  onOpenProfileSettings
}) => {
  const [activeTab, setActiveTab] = useState<ActiveStudentTab>('subjects');
  
  // Real Persistent Student State
  const [studentSettings, setStudentSettings] = useState<StudentProfileSettings | null>(() => {
    if (userProfile?.studentSettings) return userProfile.studentSettings;
    if (isGuest) return loadGuestStudentSettings();
    return null;
  });

  const [selectedGrade, setSelectedGrade] = useState<string>(() => studentSettings?.targetGrade || 'Class 10');
  const [selectedBoard, setSelectedBoard] = useState<string>(() => studentSettings?.targetBoard || 'CBSE / NCERT (New)');

  // Keep local settings in sync with profile updates
  useEffect(() => {
    if (userProfile?.studentSettings) {
      setStudentSettings(userProfile.studentSettings);
      if (userProfile.studentSettings.targetGrade) {
        setSelectedGrade(userProfile.studentSettings.targetGrade);
      }
      if (userProfile.studentSettings.targetBoard) {
        setSelectedBoard(userProfile.studentSettings.targetBoard);
      }
    }
  }, [userProfile?.studentSettings]);

  // Derived Effective Live Metrics
  const metrics = getEffectiveStudentMetrics(studentSettings);

  // Mistake notebook state (stored in student profile settings)
  const [savedMistakes, setSavedMistakes] = useState<StudentMistakeRecord[]>(() => {
    return studentSettings?.mistakes || [];
  });

  useEffect(() => {
    if (studentSettings?.mistakes) {
      setSavedMistakes(studentSettings.mistakes);
    }
  }, [studentSettings?.mistakes]);

  // Mock Tests State
  const [mockTests, setMockTests] = useState<StudentMockTest[]>(INITIAL_MOCK_TESTS);

  // Sync test completion status from real persistent settings
  useEffect(() => {
    const scores = studentSettings?.mockTestScores || [];
    setMockTests(prev => prev.map(test => {
      const match = scores.find(s => s.testId === test.id);
      if (match) {
        return {
          ...test,
          status: 'completed',
          score: match.score,
          maxScore: match.maxScore,
          completedAt: match.completedAt
        };
      }
      return {
        ...test,
        status: 'available'
      };
    }));
  }, [studentSettings?.mockTestScores]);

  // Interactive Practice State
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [practiceSessionScore, setPracticeSessionScore] = useState({ correct: 0, total: 0 });
  const [isSubmittingActivity, setIsSubmittingActivity] = useState(false);

  // Interactive Mock Test Runner Modal State
  const [activeTestRunner, setActiveTestRunner] = useState<StudentMockTest | null>(null);
  const [testRunnerQuestionIndex, setTestRunnerQuestionIndex] = useState(0);
  const [testRunnerAnswers, setTestRunnerAnswers] = useState<Record<string, string>>({});
  const [testRunnerSecondsLeft, setTestRunnerSecondsLeft] = useState(900); // 15 mins default
  const [testRunnerResult, setTestRunnerResult] = useState<{ score: number; maxScore: number; testTitle: string } | null>(null);

  // AI Tutor Interactive Chat State
  const [tutorInput, setTutorInput] = useState('');
  const [tutorConversation, setTutorConversation] = useState<Array<{ sender: 'user' | 'tutor'; text: string; time: string }>>([
    {
      sender: 'tutor',
      text: "👋 Hi! I'm your GenPaper AI Study Companion. Ask me anything about your CBSE syllabus, request a step-by-step problem breakdown, or test your understanding of any topic!",
      time: 'Just now'
    }
  ]);
  const [isTutorThinking, setIsTutorThinking] = useState(false);

  // Timer effect for active mock test
  useEffect(() => {
    if (!activeTestRunner || testRunnerResult) return;
    const interval = setInterval(() => {
      setTestRunnerSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTestRunner, testRunnerResult]);

  // Active practice question
  const currentQuestion = SAMPLE_PRACTICE_QUESTIONS[practiceIndex % SAMPLE_PRACTICE_QUESTIONS.length];

  const handleOptionSelect = (option: string) => {
    if (isAnswerChecked) return;
    setSelectedOption(option);
  };

  /**
   * Completing a practice question is a real qualifying learning activity.
   * Updates streak (sets to 1 if 0, preserves on same-day, increments on consecutive days).
   */
  const handleCheckAnswer = async () => {
    if (!selectedOption || isAnswerChecked || isSubmittingActivity) return;
    setIsAnswerChecked(true);
    setIsSubmittingActivity(true);

    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    setPracticeSessionScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    try {
      const updated = await recordStudentActivity(
        userProfile?.uid,
        studentSettings,
        {
          type: 'practice',
          isCorrect,
          questionsCount: 1
        }
      );
      setStudentSettings(updated);
      if (onUpdateStudentSettings) {
        onUpdateStudentSettings(updated);
      }
    } catch (err) {
      console.error('Failed to record practice activity:', err);
    } finally {
      setIsSubmittingActivity(false);
    }
  };

  const handleNextPracticeQuestion = () => {
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setShowHint(false);
    setPracticeIndex(prev => prev + 1);
  };

  const handleSaveToMistakes = async (question: StudentPracticeQuestion) => {
    const alreadySaved = savedMistakes.some(m => m.questionText === question.questionText);
    if (!alreadySaved) {
      const newMistake: StudentMistakeRecord = {
        id: `mst-${Date.now()}`,
        subject: question.subject,
        topic: question.topic,
        questionText: question.questionText,
        yourAnswer: selectedOption || 'Incorrect attempt',
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        dateAdded: Date.now(),
        resolved: false,
        notes: 'Added from interactive practice session.'
      };
      
      const updatedList = [newMistake, ...savedMistakes];
      setSavedMistakes(updatedList);

      const updated = await saveMistakeToNotebook(userProfile?.uid, studentSettings, newMistake);
      setStudentSettings(updated);
      if (onUpdateStudentSettings) {
        onUpdateStudentSettings(updated);
      }
    }
  };

  const handleToggleResolveMistake = async (mistakeId: string) => {
    const updated = await toggleMistakeResolution(userProfile?.uid, studentSettings, mistakeId);
    setStudentSettings(updated);
    if (updated.mistakes) {
      setSavedMistakes(updated.mistakes);
    }
    if (onUpdateStudentSettings) {
      onUpdateStudentSettings(updated);
    }
  };

  // Launch mock test
  const handleStartMockTest = (test: StudentMockTest) => {
    setActiveTestRunner(test);
    setTestRunnerQuestionIndex(0);
    setTestRunnerAnswers({});
    setTestRunnerSecondsLeft(test.durationMinutes ? test.durationMinutes * 60 : 900);
    setTestRunnerResult(null);
  };

  // Submit mock test
  const handleSubmitMockTest = async () => {
    if (!activeTestRunner) return;
    const questions = MOCK_TEST_SAMPLE_QUESTIONS[activeTestRunner.id] || SAMPLE_PRACTICE_QUESTIONS;
    let correct = 0;
    questions.forEach(q => {
      if (testRunnerAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });

    const scaledScore = Math.round((correct / questions.length) * activeTestRunner.totalMarks);
    setTestRunnerResult({
      score: scaledScore,
      maxScore: activeTestRunner.totalMarks,
      testTitle: activeTestRunner.title
    });

    // Record qualifying mock test activity
    try {
      const updated = await recordStudentActivity(
        userProfile?.uid,
        studentSettings,
        {
          type: 'mock_test',
          score: scaledScore,
          maxScore: activeTestRunner.totalMarks,
          testId: activeTestRunner.id,
          questionsCount: questions.length,
          isCorrect: correct > 0
        }
      );
      setStudentSettings(updated);
      if (onUpdateStudentSettings) {
        onUpdateStudentSettings(updated);
      }
    } catch (err) {
      console.error('Failed to submit mock test activity:', err);
    }
  };

  const handleSendTutorMessage = (customPrompt?: string) => {
    const prompt = customPrompt || tutorInput.trim();
    if (!prompt) return;

    const userMessage = {
      sender: 'user' as const,
      text: prompt,
      time: 'Just now'
    };

    setTutorConversation(prev => [...prev, userMessage]);
    if (!customPrompt) setTutorInput('');
    setIsTutorThinking(true);

    setTimeout(() => {
      let responseText = `Here is a clear breakdown for **"${prompt}"**:\n\n1. **Core Concept:** In ${selectedBoard} ${selectedGrade}, this foundational topic tests your conceptual clarity and step-by-step application.\n2. **Key Rule / Formula:** Always write down the given variables, state the governing formula, and verify units.\n3. **Quick Check:** Would you like to practice a sample 3-mark question on this topic?`;
      
      if (prompt.toLowerCase().includes('quadratic')) {
        responseText = `### Solving Quadratic Equations by Factorization:\n1. Standard form: $ax^2 + bx + c = 0$.\n2. Find two numbers $p$ and $q$ such that $p + q = b$ and $p \\times q = a \\times c$.\n3. Split the middle term and factor by grouping.\n\n*Example:* $x^2 - 5x + 6 = 0 \\implies (x-2)(x-3) = 0 \\implies x = 2 \\text{ or } x = 3$.`;
      } else if (prompt.toLowerCase().includes('photoelectric')) {
        responseText = `### The Photoelectric Effect (Simplified):\n• When light of sufficient frequency (above threshold $\\nu_0$) shines on a metal surface, electrons are ejected immediately.\n• **Einstein's Equation:** $E_k = h\\nu - \\Phi$ (where $\\Phi$ is the work function of the metal).\n• Increasing intensity increases the *number* of ejected electrons, while increasing frequency increases their *kinetic energy*.`;
      }

      setTutorConversation(prev => [
        ...prev,
        {
          sender: 'tutor',
          text: responseText,
          time: 'Just now'
        }
      ]);
      setIsTutorThinking(false);
    }, 1000);
  };

  // Derive genuine subject progress from student's real enrolled subjects and activity
  const enrolledSubjectNames = studentSettings?.enrolledSubjects || [];
  const subjectList: StudentSubjectProgress[] = enrolledSubjectNames.map(name => {
    const visual = getSubjectVisualMeta(name);
    const totalChapters = getSubjectChapterCount(selectedBoard, selectedGrade, name);
    const totalQ = metrics.questionsSolved;
    let completedChapters = 0;
    let masteryPercentage = 0;
    
    if (totalQ > 0) {
      masteryPercentage = Math.min(100, Math.round((metrics.correctAnswers / totalQ) * 100));
      completedChapters = Math.min(totalChapters, Math.floor(totalQ / 2));
    }

    return {
      id: `subj-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name,
      grade: selectedGrade,
      board: selectedBoard,
      color: visual.color,
      iconName: visual.icon,
      totalChapters,
      completedChapters,
      masteryPercentage,
      weakTopics: totalQ > 0 && masteryPercentage < 70 ? ['Formula application under timed practice'] : [],
      strongTopics: totalQ > 0 && masteryPercentage >= 70 ? ['Core conceptual recall and fundamentals'] : []
    };
  });

  return (
    <div id="student-dashboard" className="max-w-7xl mx-auto animate-fade-in pb-12">
      {/* Student Top Welcome Banner */}
      <div className="relative mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#3C128D]/90 via-[#8A2CB0]/85 to-[#EEA727]/90 text-white shadow-2xl overflow-hidden border border-white/20 backdrop-blur-xl">
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-black uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" />
              <span>Student Workspace</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight drop-shadow-md">
              Welcome back, {userProfile?.name?.split(' ')[0] || 'Learner'}! 🚀
            </h1>
            <p className="text-sm text-white/90 max-w-2xl font-medium">
              Targeting <span className="font-bold underline decoration-amber-300">{selectedBoard} {selectedGrade}</span>
              {studentSettings?.targetExam ? ` • ${studentSettings.targetExam}` : ''}
              {studentSettings?.targetScore ? ` • Target: ${studentSettings.targetScore}` : ''}
            </p>
            <div className="text-xs text-white/85 max-w-2xl font-medium flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="font-bold uppercase tracking-wider text-[10px] text-amber-200">Focus Subjects:</span>
              {enrolledSubjectNames.length > 0 ? (
                enrolledSubjectNames.map(s => (
                  <span key={s} className="px-2 py-0.5 rounded-md bg-white/20 text-white font-semibold text-[11px]">
                    {s}
                  </span>
                ))
              ) : (
                <span className="italic text-white/70">No subjects selected yet</span>
              )}
            </div>
          </div>

          {/* Quick Info Badges & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Real Study Streak Badge */}
            <div 
              id="student-streak-badge"
              className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-black/25 border border-white/20 backdrop-blur-md"
              title={metrics.studyStreak === 0 ? "Complete a practice question or mock test to begin your streak" : `Active study streak: ${metrics.studyStreak} day(s)`}
            >
              <Flame className={`w-5 h-5 ${metrics.studyStreak > 0 ? 'text-amber-400 fill-amber-400 animate-bounce' : 'text-white/40'}`} />
              <div>
                <p className="text-[10px] text-white/70 font-bold uppercase tracking-wider">Study Streak</p>
                <p className="text-sm font-black text-amber-300">
                  {metrics.studyStreak === 0 ? '0 Days' : `${metrics.studyStreak} ${metrics.studyStreak === 1 ? 'Day' : 'Days'} 🔥`}
                </p>
              </div>
            </div>

            {/* Edit Learning Profile Action */}
            {onOpenProfileSettings && (
              <button 
                id="student-edit-profile-btn"
                onClick={onOpenProfileSettings}
                className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs border border-white/30 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                title="Change your Board, Class, Subjects, or Study Target"
              >
                <Settings className="w-4 h-4" />
                <span>Edit Learning Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Student Navigation Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none no-scrollbar">
        {[
          { id: 'subjects', label: '1. My Subjects', icon: BookOpen, badge: subjectList.length > 0 ? `${subjectList.length} Enrolled` : 'None' },
          { id: 'practice', label: '2. Practice', icon: Target, badge: 'Interactive' },
          { id: 'mock-tests', label: '3. Mock Tests', icon: Clock, badge: 'Timed' },
          { id: 'ai-tutor', label: '4. AI Tutor', icon: Brain, badge: 'Companion' },
          { id: 'mistakes', label: '5. Mistake Notebook', icon: Bookmark, badge: `${savedMistakes.filter(m => !m.resolved).length} Tricky` },
          { id: 'revision', label: '6. Revision', icon: Sparkles, badge: 'Cheat Sheets' },
          { id: 'progress', label: '7. My Progress', icon: TrendingUp, badge: metrics.questionsSolved > 0 ? `${metrics.overallAccuracy}% Avg` : 'New' }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`student-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as ActiveStudentTab)}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                isActive
                  ? 'bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] text-white shadow-md shadow-[#3C128D]/20 scale-[1.02]'
                  : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 border border-gray-200/60 dark:border-gray-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-[#8A2CB0] dark:text-purple-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  isActive ? 'bg-amber-400 text-purple-950' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT AREAS */}

      {/* 1. MY SUBJECTS */}
      {activeTab === 'subjects' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#8A2CB0]" />
                <span>Enrolled Subjects & Syllabus Coverage</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Track chapter completion, mastery percentage, and focus topics according to {selectedBoard} {selectedGrade} standards.
              </p>
            </div>
            <button 
              onClick={() => setActiveTab('practice')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#EEA727] to-[#DD2476] text-white text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center gap-2 w-fit cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Start Daily Practice</span>
            </button>
          </div>

          {subjectList.length === 0 ? (
            <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 text-center space-y-4 max-w-xl mx-auto">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-[#3C128D] to-[#8A2CB0] text-white flex items-center justify-center text-3xl shadow-lg">
                📚
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  No subjects selected yet
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                  Choose the subjects you want to focus on to personalize your chapter progress, topic practice, and revision notes.
                </p>
              </div>
              {onOpenProfileSettings && (
                <button
                  id="student-choose-subjects-btn"
                  onClick={onOpenProfileSettings}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-900/20 hover:opacity-95 transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Choose Subjects</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subjectList.map((subject) => (
                <div 
                  key={subject.id}
                  className="glass-panel p-6 rounded-2xl border border-white/40 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#3C128D] to-[#8A2CB0] text-white flex items-center justify-center text-2xl shadow-md">
                        {subject.iconName}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">{subject.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          {subject.board} • {subject.grade} • {subject.completedChapters}/{subject.totalChapters} Chapters Completed
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-black px-3 py-1 rounded-full ${
                      subject.masteryPercentage > 0
                        ? 'bg-purple-100 dark:bg-purple-900/40 text-[#3C128D] dark:text-purple-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}>
                      {subject.masteryPercentage > 0 ? `${subject.masteryPercentage}% Mastery` : 'Not Started'}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                      <span>Syllabus Progress</span>
                      <span>{subject.totalChapters > 0 ? Math.round((subject.completedChapters / subject.totalChapters) * 100) : 0}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#3C128D] via-[#8A2CB0] to-[#EEA727] rounded-full transition-all duration-500"
                        style={{ width: `${subject.totalChapters > 0 ? Math.round((subject.completedChapters / subject.totalChapters) * 100) : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Focus Topics guidance */}
                  <div className="mb-4 p-3 rounded-xl bg-purple-500/10 border border-purple-400/20 text-purple-900 dark:text-purple-200 text-xs">
                    <p className="font-bold mb-0.5 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-[#8A2CB0] dark:text-purple-300" />
                      <span>Focus Recommendation:</span>
                    </p>
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      {subject.weakTopics && subject.weakTopics.length > 0
                        ? subject.weakTopics[0]
                        : subject.completedChapters === 0
                        ? 'Solve your first practice questions to identify key focus topics.'
                        : 'Maintain accuracy across high-weightage formulas.'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <button 
                      onClick={() => setActiveTab('practice')}
                      className="flex-1 py-2 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-[#3C128D] dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Target className="w-3.5 h-3.5" />
                      <span>Practice Topic</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('revision')}
                      className="flex-1 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>View Formulas</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. PRACTICE */}
      {activeTab === 'practice' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-500" />
                <span>Interactive Topic Practice Shell</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Sharpen conceptual clarity with curriculum-aligned questions. Every answered question counts towards your daily study streak!
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                Session Score: <span className="text-[#3C128D] dark:text-purple-400 font-black">{practiceSessionScore.correct}/{practiceSessionScore.total}</span>
              </span>
              <button 
                onClick={handleNextPracticeQuestion}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] text-white text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Question Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/40 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 shadow-xl">
            {/* Meta Tags */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-[#3C128D] dark:text-purple-300 text-xs font-black">
                  {currentQuestion.subject} • {currentQuestion.topic}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-[11px] font-bold">
                  Bloom: {currentQuestion.bloomLevel}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-[11px] font-bold">
                  Level: {currentQuestion.difficulty}
                </span>
              </div>
              <span className="text-xs font-bold text-gray-400">
                Question {practiceIndex + 1} of {SAMPLE_PRACTICE_QUESTIONS.length}
              </span>
            </div>

            {/* Question Text */}
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-6 leading-relaxed">
              {currentQuestion.questionText}
            </h3>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {currentQuestion.options?.map((option, idx) => {
                const isSelected = selectedOption === option;
                const isCorrect = option === currentQuestion.correctAnswer;
                let optionStyle = 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-700';

                if (isAnswerChecked) {
                  if (isCorrect) {
                    optionStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 font-bold';
                  } else if (isSelected && !isCorrect) {
                    optionStyle = 'border-red-500 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-200';
                  }
                } else if (isSelected) {
                  optionStyle = 'border-[#3C128D] dark:border-[#a855f7] bg-purple-50 dark:bg-purple-950/30 text-[#3C128D] dark:text-purple-300 font-bold shadow-md';
                }

                return (
                  <div
                    key={idx}
                    onClick={() => handleOptionSelect(option)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${optionStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-black flex items-center justify-center shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-sm font-medium">{option}</span>
                    </div>
                    {isAnswerChecked && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {isAnswerChecked && isSelected && !isCorrect && (
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Hint Box */}
            {showHint && currentQuestion.hint && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700/50 text-amber-900 dark:text-amber-200 text-xs animate-fade-in flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold mb-0.5">Socratic Hint:</p>
                  <p className="font-medium">{currentQuestion.hint}</p>
                </div>
              </div>
            )}

            {/* Solution & Explanation Box */}
            {isAnswerChecked && (
              <div className="mb-6 p-5 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-950 dark:text-purple-100 text-xs animate-fade-in">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <p className="font-black text-sm flex items-center gap-1.5 text-[#3C128D] dark:text-purple-300">
                    <Check className="w-4 h-4" />
                    <span>Detailed Step-by-Step Explanation:</span>
                  </p>
                  <button
                    onClick={() => handleSaveToMistakes(currentQuestion)}
                    className="px-3 py-1 rounded-lg bg-white dark:bg-gray-800 border border-purple-300 dark:border-purple-700 text-[#3C128D] dark:text-purple-300 font-bold hover:bg-purple-50 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Save to Mistake Notebook</span>
                  </button>
                </div>
                <p className="leading-relaxed font-medium text-gray-700 dark:text-gray-300">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => setShowHint(prev => !prev)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Lightbulb className="w-4 h-4" />
                <span>{showHint ? 'Hide Hint' : 'Need a Hint?'}</span>
              </button>

              <div className="flex items-center gap-3">
                {!isAnswerChecked ? (
                  <button
                    onClick={handleCheckAnswer}
                    disabled={!selectedOption || isSubmittingActivity}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#EEA727] to-[#DD2476] text-white text-xs font-black shadow-md hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    {isSubmittingActivity ? 'Saving...' : 'Check Answer & Log Streak'}
                  </button>
                ) : (
                  <button
                    onClick={handleNextPracticeQuestion}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] text-white text-xs font-black shadow-md hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. MOCK TESTS */}
      {activeTab === 'mock-tests' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              <span>Mock Tests & Timed Assessments</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Simulate actual examination hall conditions with strict timers, section navigation, and blueprint scoring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockTests.map((test) => (
              <div 
                key={test.id}
                className="glass-panel p-6 rounded-2xl border border-white/40 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-[#3C128D] dark:text-purple-300 text-[11px] font-black">
                      {test.subject}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      test.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                    }`}>
                      {test.status === 'completed' ? `Score: ${test.score}/${test.maxScore}` : 'Available'}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {test.title}
                  </h3>

                  <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400 mb-4 font-medium">
                    <p className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>Duration: {test.durationMinutes} Minutes</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-gray-400" />
                      <span>Total Marks: {test.totalMarks} Marks ({test.questionCount} Questions)</span>
                    </p>
                    {test.assignedBy && (
                      <p className="text-amber-700 dark:text-amber-300 font-semibold pt-1">
                        👨‍🏫 Assigned by: {test.assignedBy.teacherName}
                      </p>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => handleStartMockTest(test)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    test.status === 'completed'
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200'
                      : 'bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] text-white hover:opacity-95'
                  }`}
                >
                  {test.status === 'completed' ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retake Mock Assessment</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      <span>Start Timed Mock Test</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Teacher Connection Teaser Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-900/10 via-amber-500/10 to-transparent border border-purple-300/30 dark:border-purple-800/40">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-purple-950 flex items-center justify-center text-xl font-bold shrink-0">
                👨‍🏫
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <span>Teacher & Classroom Assignments</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-purple-950 font-bold uppercase">Automated Sync</span>
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  When your school educator generates curriculum papers via GenPaperAI, assigned mock assessments will appear directly on your dashboard for automated grading and instant feedback.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. AI TUTOR */}
      {activeTab === 'ai-tutor' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              <span>AI Study Companion & Concept Tutor</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-[#3C128D] dark:text-purple-300 font-bold uppercase">
                Interactive Shell
              </span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Learn concepts step-by-step with your AI study companion. Get instant conceptual breakdowns without just copying answers.
            </p>
          </div>

          <div className="glass-panel rounded-3xl border border-white/40 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 shadow-xl overflow-hidden flex flex-col h-[520px]">
            {/* Quick concept suggestions */}
            <div className="p-3 bg-purple-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
              <span className="font-bold text-gray-500 shrink-0 text-[11px]">Quick Prompts:</span>
              {[
                'Explain Photoelectric Effect simply',
                'How to factorize Quadratic Equations?',
                'Difference between Mitosis and Meiosis',
                'Explain Snell\'s Law with formula'
              ].map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendTutorMessage(prompt)}
                  className="px-3 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-purple-400 hover:text-purple-600 text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Chat History Window */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {tutorConversation.map((msg, i) => (
                <div 
                  key={i}
                  className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'tutor' && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#3C128D] to-[#8A2CB0] text-white flex items-center justify-center text-sm font-bold shrink-0">
                      🤖
                    </div>
                  )}
                  <div className={`p-4 rounded-2xl max-w-xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] text-white shadow-md rounded-tr-none'
                      : 'bg-gray-100 dark:bg-gray-700/70 text-gray-900 dark:text-gray-100 rounded-tl-none border border-gray-200/50 dark:border-gray-600'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTutorThinking && (
                <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-300 font-bold p-2 animate-pulse">
                  <Brain className="w-4 h-4 animate-spin" />
                  <span>AI Tutor is preparing your conceptual explanation...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendTutorMessage();
              }}
              className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex items-center gap-3"
            >
              <input
                type="text"
                value={tutorInput}
                onChange={(e) => setTutorInput(e.target.value)}
                placeholder="Ask your AI tutor a question, e.g. 'Why is the sky blue?' or 'Explain Ohm\'s Law'..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8A2CB0]"
              />
              <button
                type="submit"
                disabled={!tutorInput.trim() || isTutorThinking}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] text-white text-xs font-bold shadow-md hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                Ask Tutor
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. MISTAKE NOTEBOOK */}
      {activeTab === 'mistakes' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-red-500" />
                <span>Smart Mistake Notebook</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Turn past errors into mastery. Automatically stores tricky questions with step-by-step conceptual corrections.
              </p>
            </div>
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
              {savedMistakes.length} Questions Tracked
            </span>
          </div>

          {savedMistakes.length === 0 ? (
            /* Clean Empty State for New Accounts */
            <div className="p-12 text-center glass-panel rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl shadow-sm">
                <Bookmark className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Mistake Notebook is Clear</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Whenever you miss a question during practice or want to save a tricky problem for later revision, tap <span className="font-semibold text-[#8A2CB0]">"Save to Mistake Notebook"</span> to track it here.
                </p>
              </div>
              <button 
                onClick={() => setActiveTab('practice')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] text-white text-xs font-bold shadow-md hover:opacity-95 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <Target className="w-4 h-4" />
                <span>Start Practice Questions</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {savedMistakes.map((record) => (
                <div 
                  key={record.id}
                  className="glass-panel p-6 rounded-2xl border border-white/40 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 shadow-md space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-[#3C128D] dark:text-purple-300 text-xs font-black">
                        {record.subject}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[11px] font-bold">
                        {record.topic}
                      </span>
                    </div>
                    <button
                      onClick={() => handleToggleResolveMistake(record.id)}
                      className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider transition-all cursor-pointer ${
                        record.resolved 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 hover:bg-red-200'
                      }`}
                    >
                      {record.resolved ? '✓ Concept Mastered' : 'Mark as Mastered'}
                    </button>
                  </div>

                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {record.questionText}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-900 dark:text-red-300">
                      <p className="font-bold mb-1">Your Attempted Answer:</p>
                      <p className="font-medium">{record.yourAnswer}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-300">
                      <p className="font-bold mb-1">Correct Key Approach:</p>
                      <p className="font-medium">{record.correctAnswer}</p>
                    </div>
                  </div>

                  {record.explanation && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                      💡 <span className="font-bold">Insight:</span> {record.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. REVISION */}
      {activeTab === 'revision' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Revision Decks & Formula Cheat Sheets</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              One-page high-yield revision summaries and formula banks for quick exam-day brush-ups.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {INITIAL_REVISION_DECKS.map((deck) => (
              <div 
                key={deck.id}
                className="glass-panel p-6 rounded-3xl border border-white/40 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 shadow-lg space-y-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 text-xs font-black">
                    {deck.subject}
                  </span>
                  <span className="text-xs text-gray-400 font-semibold">{deck.chapter}</span>
                </div>

                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {deck.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                  {deck.summary}
                </p>

                {/* Key Points */}
                <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 text-xs space-y-1.5 text-gray-700 dark:text-gray-200">
                  <p className="font-bold text-[#3C128D] dark:text-purple-300 text-xs mb-1">Key Principles:</p>
                  {deck.keyPoints.map((pt, idx) => (
                    <p key={idx} className="font-medium">• {pt}</p>
                  ))}
                </div>

                {/* Formulas */}
                {deck.formulas && (
                  <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-xs space-y-1 text-amber-900 dark:text-amber-200">
                    <p className="font-bold text-amber-800 dark:text-amber-300 mb-1">High-Yield Formulas:</p>
                    {deck.formulas.map((f, idx) => (
                      <p key={idx} className="font-mono font-bold">{f}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. MY PROGRESS */}
      {activeTab === 'progress' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <span>Learning Analytics & Progress Insights</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Real-time breakdown of accuracy, solved questions, and topic mastery across subjects.
            </p>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-white/40 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70 text-center">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Overall Accuracy</p>
              <p className="text-3xl font-extrabold text-[#3C128D] dark:text-purple-400 mt-1">
                {metrics.questionsSolved > 0 ? `${metrics.overallAccuracy}%` : '0%'}
              </p>
              <p className="text-[10px] text-gray-500 font-medium mt-1">
                {metrics.questionsSolved > 0 ? `${metrics.correctAnswers} of ${metrics.questionsSolved} correct` : 'No questions answered yet'}
              </p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/40 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70 text-center">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Questions Solved</p>
              <p className="text-3xl font-extrabold text-[#8A2CB0] dark:text-purple-300 mt-1">
                {metrics.questionsSolved}
              </p>
              <p className="text-[10px] text-gray-500 font-medium mt-1">
                {metrics.questionsSolved > 0 ? 'Across practiced topics' : 'Start your first practice session'}
              </p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/40 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70 text-center">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Mock Tests Taken</p>
              <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                {metrics.mockTestsCompleted}
              </p>
              <p className="text-[10px] text-gray-500 font-medium mt-1">
                {metrics.mockTestsCompleted > 0 ? `${metrics.mockTestsCompleted} completed` : 'No mock tests taken yet'}
              </p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/40 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70 text-center">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Study Streak</p>
              <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {metrics.studyStreak} {metrics.studyStreak > 0 ? '🔥' : 'Days'}
              </p>
              <p className="text-[10px] text-gray-500 font-medium mt-1">
                {metrics.studyStreak === 0 
                  ? 'Start your first study session to begin your streak.' 
                  : (metrics.isStreakActiveToday ? 'Active today! Great work 🔥' : `Personal Best: ${metrics.bestStreak} ${metrics.bestStreak === 1 ? 'day' : 'days'}`)}
              </p>
            </div>
          </div>

          {/* Empty State / Welcome Guide when learner has no activity yet */}
          {metrics.questionsSolved === 0 && metrics.mockTestsCompleted === 0 && (
            <div className="p-8 text-center glass-panel rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-[#3C128D] to-[#8A2CB0] text-white flex items-center justify-center text-xl shadow-md">
                <TrendingUp className="w-6 h-6 text-amber-300" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="text-base font-bold text-gray-900 dark:text-white">Your Learning Journey Starts Here</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Solve practice questions or complete mock tests to start your daily study streak, calculate your topic accuracy, and track syllabus coverage.
                </p>
              </div>
              <button 
                onClick={() => setActiveTab('practice')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#EEA727] to-[#DD2476] text-white text-xs font-bold shadow-md hover:opacity-95 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Begin First Practice Session</span>
              </button>
            </div>
          )}

          {/* Subject Mastery Breakdown */}
          <div className="glass-panel p-6 rounded-3xl border border-white/40 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Subject-Wise Mastery Breakdown
              </h3>
              <span className="text-xs text-gray-500 font-medium">
                {metrics.questionsSolved > 0 ? 'Live syllabus coverage' : 'Not started yet'}
              </span>
            </div>

            {subjectList.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-500 dark:text-gray-400 italic">
                No subjects enrolled yet. Add subjects in your Learning Profile to track topic breakdown.
              </div>
            ) : (
              <div className="space-y-4">
                {subjectList.map((sub) => (
                  <div key={sub.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-200">
                      <span>{sub.name}</span>
                      <span>{sub.masteryPercentage}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] rounded-full transition-all duration-500"
                        style={{ width: `${sub.masteryPercentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* INTERACTIVE TIMED MOCK TEST MODAL */}
      <AnimatePresence>
        {activeTestRunner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="glass-panel max-w-2xl w-full rounded-3xl border border-white/30 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl p-6 sm:p-8 space-y-6 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-[#3C128D] dark:text-purple-300 text-[10px] font-black uppercase">
                    {activeTestRunner.subject} • Timed Assessment
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                    {activeTestRunner.title}
                  </h3>
                </div>
                {!testRunnerResult && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs font-bold font-mono">
                    <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                    <span>
                      {Math.floor(testRunnerSecondsLeft / 60)}:{String(testRunnerSecondsLeft % 60).padStart(2, '0')}
                    </span>
                  </div>
                )}
              </div>

              {/* Body: Result Card or Active Question */}
              {testRunnerResult ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl shadow-sm">
                    🎉
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-gray-900 dark:text-white">Assessment Submitted!</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Your qualifying mock test activity and study streak have been recorded.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 max-w-sm mx-auto">
                    <p className="text-xs text-purple-700 dark:text-purple-300 font-bold">Your Score</p>
                    <p className="text-3xl font-black text-[#3C128D] dark:text-purple-300 mt-1">
                      {testRunnerResult.score} / {testRunnerResult.maxScore}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {Math.round((testRunnerResult.score / testRunnerResult.maxScore) * 100)}% Accuracy
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTestRunner(null);
                      setTestRunnerResult(null);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] text-white text-xs font-bold shadow-md hover:opacity-95 transition-all cursor-pointer"
                  >
                    Return to Dashboard
                  </button>
                </div>
              ) : (
                (() => {
                  const questions = MOCK_TEST_SAMPLE_QUESTIONS[activeTestRunner.id] || SAMPLE_PRACTICE_QUESTIONS;
                  const q = questions[testRunnerQuestionIndex % questions.length];
                  const selected = testRunnerAnswers[q.id];

                  return (
                    <div className="space-y-4">
                      <div className="flex justify-between text-xs font-bold text-gray-500">
                        <span>Question {testRunnerQuestionIndex + 1} of {questions.length}</span>
                        <span>{q.topic}</span>
                      </div>

                      <p className="text-sm font-bold text-gray-900 dark:text-white leading-relaxed">
                        {q.questionText}
                      </p>

                      <div className="space-y-2">
                        {q.options?.map((opt, i) => {
                          const isOptSelected = selected === opt;
                          return (
                            <div
                              key={i}
                              onClick={() => setTestRunnerAnswers(prev => ({ ...prev, [q.id]: opt }))}
                              className={`p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
                                isOptSelected
                                  ? 'border-[#8A2CB0] bg-purple-50 dark:bg-purple-950/40 text-[#3C128D] dark:text-purple-300 font-bold'
                                  : 'border-gray-200 dark:border-gray-700 bg-white/40 dark:bg-gray-800/40 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-[10px]">
                                  {String.fromCharCode(65 + i)}
                                </span>
                                <span>{opt}</span>
                              </div>
                              {isOptSelected && <Check className="w-4 h-4 text-[#8A2CB0]" />}
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                        <button
                          disabled={testRunnerQuestionIndex === 0}
                          onClick={() => setTestRunnerQuestionIndex(prev => prev - 1)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                        >
                          Previous
                        </button>

                        <div className="flex items-center gap-2">
                          {testRunnerQuestionIndex < questions.length - 1 ? (
                            <button
                              onClick={() => setTestRunnerQuestionIndex(prev => prev + 1)}
                              className="px-5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-900 dark:text-white text-xs font-bold cursor-pointer"
                            >
                              Next
                            </button>
                          ) : (
                            <button
                              onClick={handleSubmitMockTest}
                              className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#EEA727] to-[#DD2476] text-white text-xs font-black shadow-md hover:opacity-95 cursor-pointer"
                            >
                              Submit Mock Test
                            </button>
                          )}
                          <button
                            onClick={() => setActiveTestRunner(null)}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
