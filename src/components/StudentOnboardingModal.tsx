import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Sparkles, 
  Target, 
  BookOpen, 
  Calendar, 
  Clock, 
  Award, 
  Layers, 
  CheckCircle2, 
  X,
  Plus
} from 'lucide-react';
import { StudentProfileSettings } from '../types';
import { sanitizeForFirestore } from '../firebase';
import { 
  SUPPORTED_STUDENT_BOARDS, 
  SUPPORTED_STUDENT_GRADES, 
  LEARNING_GOAL_OPTIONS, 
  getAvailableSubjectsForGrade,
  SubjectOption
} from '../services/studentCurriculumService';

interface StudentOnboardingModalProps {
  isOpen: boolean;
  initialSettings?: StudentProfileSettings | null;
  mode?: 'onboarding' | 'edit';
  isMandatory?: boolean;
  onComplete: (settings: StudentProfileSettings) => Promise<void> | void;
  onClose?: () => void;
  userName?: string;
  isGuest?: boolean;
}

const STEPS = [
  { id: 1, title: 'Board', label: '1. Board' },
  { id: 2, title: 'Class', label: '2. Class' },
  { id: 3, title: 'Subjects', label: '3. Subjects' },
  { id: 4, title: 'Goals', label: '4. Goals' },
  { id: 5, title: 'Target', label: '5. Target' },
  { id: 6, title: 'Confirm', label: '6. Review' }
];

export const StudentOnboardingModal: React.FC<StudentOnboardingModalProps> = ({
  isOpen,
  initialSettings,
  mode = 'onboarding',
  onComplete,
  onClose,
  userName = 'Learner',
  isGuest = false
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [selectedBoard, setSelectedBoard] = useState<string>(initialSettings?.targetBoard || '');
  const [selectedGrade, setSelectedGrade] = useState<string>(initialSettings?.targetGrade || '');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(initialSettings?.enrolledSubjects || []);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(initialSettings?.learningGoals || []);
  const [customGoal, setCustomGoal] = useState<string>(initialSettings?.customGoal || '');
  const [targetScore, setTargetScore] = useState<string>(initialSettings?.targetScore || '');
  const [targetExam, setTargetExam] = useState<string>(initialSettings?.targetExam || '');
  const [targetExamDate, setTargetExamDate] = useState<string>(initialSettings?.targetExamDate || '');
  const [dailyStudyGoal, setDailyStudyGoal] = useState<string>(initialSettings?.dailyStudyGoal || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState<SubjectOption[]>([]);

  // Update available subjects whenever board or grade changes
  useEffect(() => {
    if (selectedBoard && selectedGrade) {
      const list = getAvailableSubjectsForGrade(selectedBoard, selectedGrade);
      setAvailableSubjects(list);
    } else {
      setAvailableSubjects([]);
    }
  }, [selectedBoard, selectedGrade]);

  // Sync state if initialSettings changes
  useEffect(() => {
    if (initialSettings) {
      if (initialSettings.targetBoard) setSelectedBoard(initialSettings.targetBoard);
      if (initialSettings.targetGrade) setSelectedGrade(initialSettings.targetGrade);
      if (initialSettings.enrolledSubjects) setSelectedSubjects(initialSettings.enrolledSubjects);
      if (initialSettings.learningGoals) setSelectedGoals(initialSettings.learningGoals);
      if (initialSettings.customGoal) setCustomGoal(initialSettings.customGoal);
      if (initialSettings.targetScore) setTargetScore(initialSettings.targetScore);
      if (initialSettings.targetExam) setTargetExam(initialSettings.targetExam);
      if (initialSettings.targetExamDate) setTargetExamDate(initialSettings.targetExamDate);
      if (initialSettings.dailyStudyGoal) setDailyStudyGoal(initialSettings.dailyStudyGoal);
    }
  }, [initialSettings]);

  if (!isOpen) return null;

  // Toggle subject selection
  const toggleSubject = (subjectName: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectName) 
        ? prev.filter(s => s !== subjectName)
        : [...prev, subjectName]
    );
  };

  // Toggle goal selection
  const toggleGoal = (goalLabel: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalLabel)
        ? prev.filter(g => g !== goalLabel)
        : [...prev, goalLabel]
    );
  };

  // Validation checks per step
  const canProceed = () => {
    if (currentStep === 1) return selectedBoard.trim().length > 0;
    if (currentStep === 2) return selectedGrade.trim().length > 0;
    if (currentStep === 3) return true; // Subjects can be selected or left empty with confirmation
    if (currentStep === 4) return true; // Goals are recommended but not blocking
    if (currentStep === 5) return true; // Targets are purely optional
    return true;
  };

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const finalGoals = [...selectedGoals];
      if (customGoal.trim() && !finalGoals.includes(customGoal.trim())) {
        finalGoals.push(customGoal.trim());
      }

      const updatedSettings: StudentProfileSettings = {
        ...(initialSettings || {}),
        targetBoard: selectedBoard,
        targetGrade: selectedGrade,
        enrolledSubjects: selectedSubjects,
        primarySubjects: selectedSubjects,
        learningGoals: finalGoals,
        ...(customGoal.trim() ? { customGoal: customGoal.trim() } : {}),
        ...(targetScore.trim() ? { targetScore: targetScore.trim() } : {}),
        ...(targetExam.trim() ? { targetExam: targetExam.trim() } : {}),
        ...(targetExamDate.trim() ? { targetExamDate: targetExamDate.trim() } : {}),
        ...(dailyStudyGoal.trim() ? { dailyStudyGoal: dailyStudyGoal.trim() } : {}),
        studentOnboardingCompleted: true,
        onboardingCompletedAt: Date.now(),
        // Keep existing activity data or start brand new
        studyStreak: initialSettings?.studyStreak || 0,
        bestStreak: initialSettings?.bestStreak || 0,
        lastActivityDate: initialSettings?.lastActivityDate || '',
        activityDates: initialSettings?.activityDates || [],
        questionsSolved: initialSettings?.questionsSolved || 0,
        correctAnswers: initialSettings?.correctAnswers || 0,
        mockTestsCompleted: initialSettings?.mockTestsCompleted || 0,
        mockTestScores: initialSettings?.mockTestScores || [],
        mistakes: initialSettings?.mistakes || []
      };

      // Ensure no undefined fields leak into Firestore updateDoc
      const cleanSettings = sanitizeForFirestore(updatedSettings);

      await onComplete(cleanSettings);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div 
        id="student-onboarding-overlay"
        className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto animate-fade-in"
      >
        <motion.div
          id="student-onboarding-container"
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-white/40 dark:border-gray-800 overflow-hidden text-gray-900 dark:text-white my-auto flex flex-col max-h-[92vh]"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-[#8A2CB0]/20 to-[#3C128D]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-gradient-to-tr from-[#EEA727]/20 to-[#DD2476]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Modal Header */}
          <div className="relative z-10 px-6 sm:px-8 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#EEA727] to-[#DD2476] text-white flex items-center justify-center text-xl shadow-md">
                🎓
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
                  {mode === 'edit' ? 'Edit Learning Profile' : 'Set up your learning profile'}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Tell GenPaperAI what you're preparing for so we can personalize your practice and progress.
                </p>
              </div>
            </div>

            {mode === 'edit' && onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Progress Ribbon */}
          <div className="px-6 sm:px-8 py-3 bg-gray-50/70 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800 relative z-10">
            <div className="flex items-center justify-between gap-1 max-w-2xl mx-auto">
              {STEPS.map((step) => {
                const isCompleted = step.id < currentStep;
                const isCurrent = step.id === currentStep;

                return (
                  <div 
                    key={step.id} 
                    className="flex-1 flex flex-col items-center cursor-pointer group"
                    onClick={() => {
                      // Allow jumping backward or to next validated step
                      if (step.id < currentStep || (step.id === currentStep + 1 && canProceed())) {
                        setCurrentStep(step.id);
                      }
                    }}
                  >
                    <div className="flex items-center w-full">
                      <div 
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                          isCompleted
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : isCurrent
                            ? 'bg-[#3C128D] dark:bg-purple-600 text-white ring-4 ring-purple-200 dark:ring-purple-900/50 shadow-md'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.id}
                      </div>
                      {step.id < STEPS.length && (
                        <div 
                          className={`flex-1 h-1 mx-1.5 rounded-full transition-all ${
                            step.id < currentStep 
                              ? 'bg-emerald-500' 
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        />
                      )}
                    </div>
                    <span className={`text-[10px] sm:text-xs font-bold mt-1 transition-colors ${
                      isCurrent 
                        ? 'text-[#3C128D] dark:text-purple-300 font-black' 
                        : isCompleted
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Body Content */}
          <div className="p-6 sm:p-8 overflow-y-auto flex-1 relative z-10 space-y-6">
            
            {/* STEP 1: BOARD */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>What board are you studying under?</span>
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Select your education board to align your practice topics, syllabus coverage, and question designs.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {SUPPORTED_STUDENT_BOARDS.map((board) => {
                    const isSelected = selectedBoard === board.id;
                    return (
                      <div
                        key={board.id}
                        id={`board-option-${board.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                        onClick={() => setSelectedBoard(board.id)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#3C128D] dark:border-purple-400 bg-purple-50/50 dark:bg-purple-950/30 shadow-md ring-2 ring-purple-300/40'
                            : 'border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 bg-white dark:bg-gray-800/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-gray-900 dark:text-white">
                              {board.name}
                            </span>
                            {board.isPopular && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-bold uppercase">
                                Popular
                              </span>
                            )}
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-[#3C128D] dark:text-purple-400 fill-current text-white dark:text-gray-900 shrink-0" />
                          )}
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                          {board.description}
                        </p>
                        <div className="mt-3">
                          <span className="text-[10px] font-bold text-[#8A2CB0] dark:text-purple-300">
                            {board.badge}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: CLASS / GRADE */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    What class are you in?
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Select your current grade level to load your exact textbooks and chapter syllabus.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                  {SUPPORTED_STUDENT_GRADES.map((grade) => {
                    const isSelected = selectedGrade === grade;
                    return (
                      <div
                        key={grade}
                        id={`grade-option-${grade.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                        onClick={() => setSelectedGrade(grade)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all text-center flex flex-col items-center justify-center gap-1 ${
                          isSelected
                            ? 'border-[#3C128D] dark:border-purple-400 bg-purple-50/50 dark:bg-purple-950/30 shadow-md ring-2 ring-purple-300/40'
                            : 'border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 bg-white dark:bg-gray-800/60'
                        }`}
                      >
                        <span className="text-2xl mb-1">📚</span>
                        <span className="text-sm font-black text-gray-900 dark:text-white">
                          {grade}
                        </span>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#3C128D] dark:text-purple-300 font-bold mt-1">
                            <Check className="w-3 h-3" /> Selected
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: SUBJECTS */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Which subjects do you want to improve?
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Select multiple subjects. Only the subjects you choose will appear in "My Subjects".
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSubjects(availableSubjects.map(s => s.name))}
                      className="text-[11px] font-bold text-[#8A2CB0] dark:text-purple-300 hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300">•</span>
                    <button
                      type="button"
                      onClick={() => setSelectedSubjects([])}
                      className="text-[11px] font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {availableSubjects.map((sub) => {
                    const isSelected = selectedSubjects.includes(sub.name);
                    return (
                      <div
                        key={sub.id}
                        id={`subject-checkbox-${sub.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                        onClick={() => toggleSubject(sub.name)}
                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-[#3C128D] dark:border-purple-400 bg-purple-50/50 dark:bg-purple-950/30 shadow-md'
                            : 'border-gray-200 dark:border-gray-800 hover:border-purple-200 dark:hover:border-purple-800 bg-white dark:bg-gray-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${sub.color} text-white flex items-center justify-center text-lg shadow-sm`}>
                            {sub.icon}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {sub.name}
                            </p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                              {sub.totalChapters} syllabus chapters
                            </p>
                          </div>
                        </div>

                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                          isSelected 
                            ? 'bg-[#3C128D] dark:bg-purple-600 border-[#3C128D] text-white' 
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                        }`}>
                          {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedSubjects.length === 0 && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>No subjects selected yet. You can pick subjects now or add them later in your dashboard.</span>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: LEARNING GOALS */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    What do you want to improve?
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Choose the learning goals that match your study priorities.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {LEARNING_GOAL_OPTIONS.map((goal) => {
                    const isSelected = selectedGoals.includes(goal.label);
                    return (
                      <div
                        key={goal.id}
                        id={`goal-option-${goal.id}`}
                        onClick={() => toggleGoal(goal.label)}
                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-[#3C128D] dark:border-purple-400 bg-purple-50/50 dark:bg-purple-950/30 shadow-md'
                            : 'border-gray-200 dark:border-gray-800 hover:border-purple-200 dark:hover:border-purple-800 bg-white dark:bg-gray-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{goal.icon}</span>
                          <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                            {goal.label}
                          </span>
                        </div>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          isSelected 
                            ? 'bg-[#3C128D] dark:bg-purple-600 border-[#3C128D] text-white' 
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Custom Goal Option */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1.5">
                    Have a custom goal? (Optional)
                  </label>
                  <input
                    type="text"
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    placeholder="e.g. Master trigonometry formulas and speed up MCQ solving"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>
            )}

            {/* STEP 5: TARGET / STUDY GOAL */}
            {currentStep === 5 && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    What's your target?
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Set optional benchmarks to personalize your study recommendations. You can skip any field.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Target Percentage */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                      Target Percentage / Score
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {['95%+', '90%+', '85%+', '80%+'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setTargetScore(preset)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            targetScore === preset
                              ? 'bg-[#3C128D] text-white shadow-sm'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={targetScore}
                      onChange={(e) => setTargetScore(e.target.value)}
                      placeholder="e.g. 95% or 98/100"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>

                  {/* Target Exam */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                      Target Exam
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {['Board Exam 2026', 'Final Term Exam', 'Mid-Term Exam'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setTargetExam(preset)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            targetExam === preset
                              ? 'bg-[#3C128D] text-white shadow-sm'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={targetExam}
                      onChange={(e) => setTargetExam(e.target.value)}
                      placeholder="e.g. CBSE Board Exam 2026"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>

                  {/* Daily Study Goal */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                      Daily Study Goal
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {['15 mins/day', '30 mins/day', '1 hour/day', '15 questions/day'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setDailyStudyGoal(preset)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            dailyStudyGoal === preset
                              ? 'bg-[#3C128D] text-white shadow-sm'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={dailyStudyGoal}
                      onChange={(e) => setDailyStudyGoal(e.target.value)}
                      placeholder="e.g. 30 mins or 15 questions per day"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>

                  {/* Target Exam Date */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                      Target Exam Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={targetExamDate}
                      onChange={(e) => setTargetExamDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <p className="text-[10px] text-gray-400">
                      Leave unset if your exam schedule has not been announced yet.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: CONFIRMATION / SUMMARY */}
            {currentStep === 6 && (
              <div className="space-y-5 animate-fade-in">
                <div className="text-center max-w-md mx-auto space-y-1">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#3C128D] to-[#8A2CB0] text-white flex items-center justify-center text-2xl shadow-lg mb-2">
                    🚀
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                    Your Learning Profile
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Review your personalized configuration before starting your study workspace.
                  </p>
                </div>

                {/* Profile Card Summary */}
                <div className="p-5 sm:p-6 rounded-3xl bg-gray-50/80 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Board</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white mt-0.5">
                        {selectedBoard || 'Not selected'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Class</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white mt-0.5">
                        {selectedGrade || 'Not selected'}
                      </p>
                    </div>
                  </div>

                  {/* Subjects */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">
                      Selected Subjects ({selectedSubjects.length})
                    </p>
                    {selectedSubjects.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedSubjects.map((sub) => (
                          <span
                            key={sub}
                            className="px-3 py-1 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-[#3C128D] dark:text-purple-300 text-xs font-bold"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-amber-600 dark:text-amber-400 italic">
                        No subjects selected yet (you can choose them anytime in your dashboard)
                      </p>
                    )}
                  </div>

                  {/* Goals */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">
                      Learning Goals ({selectedGoals.length + (customGoal ? 1 : 0)})
                    </p>
                    {selectedGoals.length > 0 || customGoal ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedGoals.map((goal) => (
                          <span
                            key={goal}
                            className="px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-medium border border-amber-200 dark:border-amber-800"
                          >
                            ✓ {goal}
                          </span>
                        ))}
                        {customGoal && (
                          <span className="px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-medium border border-amber-200 dark:border-amber-800">
                            ✓ {customGoal}
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No specific goals selected</p>
                    )}
                  </div>

                  {/* Target & Daily Goal */}
                  {(targetScore || targetExam || dailyStudyGoal || targetExamDate) && (
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs">
                      {targetScore && (
                        <div>
                          <span className="text-gray-400 font-bold text-[10px] block">TARGET SCORE</span>
                          <span className="font-bold text-gray-800 dark:text-gray-200">{targetScore}</span>
                        </div>
                      )}
                      {targetExam && (
                        <div>
                          <span className="text-gray-400 font-bold text-[10px] block">TARGET EXAM</span>
                          <span className="font-bold text-gray-800 dark:text-gray-200">{targetExam}</span>
                        </div>
                      )}
                      {dailyStudyGoal && (
                        <div>
                          <span className="text-gray-400 font-bold text-[10px] block">DAILY STUDY GOAL</span>
                          <span className="font-bold text-gray-800 dark:text-gray-200">{dailyStudyGoal}</span>
                        </div>
                      )}
                      {targetExamDate && (
                        <div>
                          <span className="text-gray-400 font-bold text-[10px] block">EXAM DATE</span>
                          <span className="font-bold text-gray-800 dark:text-gray-200">{targetExamDate}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Controls */}
          <div className="px-6 sm:px-8 py-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 relative z-10">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              {currentStep === 5 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
                >
                  Skip
                </button>
              )}

              {currentStep < 6 ? (
                <button
                  type="button"
                  id={`student-onboarding-next-step-${currentStep}`}
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] text-white text-xs sm:text-sm font-bold shadow-md hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  id="student-onboarding-finish-btn"
                  onClick={handleFinish}
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#EEA727] to-[#DD2476] text-white text-xs sm:text-sm font-black shadow-lg shadow-amber-500/25 hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span>Saving Profile...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Start Learning</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
