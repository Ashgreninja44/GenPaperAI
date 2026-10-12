import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Sparkles, 
  BookOpen, 
  School, 
  GraduationCap, 
  Layers, 
  X, 
  Plus, 
  Sun, 
  Moon,
  Building,
  CheckCircle2
} from 'lucide-react';
import { TeacherProfileSettings, AppearanceMode } from '../types';
import { SUPPORTED_CURRICULUM_BOARDS } from '../services/curriculumService';

interface TeacherOnboardingModalProps {
  isOpen: boolean;
  initialSettings?: TeacherProfileSettings | null;
  initialDefaultPaperSettings?: {
    board?: string;
    grade?: string;
    subject?: string;
    schoolName?: string;
  } | null;
  currentAppearanceMode?: AppearanceMode;
  mode?: 'onboarding' | 'edit';
  isMandatory?: boolean;
  onComplete: (
    teacherSettings: TeacherProfileSettings,
    paperSettings: { board: string; grade: string; subject: string; schoolName: string },
    appearance: AppearanceMode
  ) => Promise<void> | void;
  onAppearanceChange?: (mode: AppearanceMode) => void;
  onClose?: () => void;
  userName?: string;
  isGuest?: boolean;
}

const TEACHER_ROLES = [
  { id: 'School Teacher', label: 'School Teacher', icon: '🏫', desc: 'Teaching in a recognized school or junior college' },
  { id: 'Coaching Faculty', label: 'Coaching Institute Faculty', icon: '🎯', desc: 'Preparing students for competitive exams & board tests' },
  { id: 'Private Tutor', label: 'Private Tutor / Independent Educator', icon: '✍️', desc: 'One-on-one or small batch personalized coaching' },
  { id: 'Professor / Lecturer', label: 'College Professor / Lecturer', icon: '🎓', desc: 'Higher education, university, or diploma courses' },
  { id: 'Academic Coordinator', label: 'Academic Coordinator / HOD', icon: '📋', desc: 'Curriculum planning, exam moderation, and department head' }
];

const COMMON_GRADES = [
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Primary (1-5)', 'Undergraduate'
];

const COMMON_SUBJECTS = [
  'Mathematics',
  'Science',
  'Physics',
  'Chemistry',
  'Biology',
  'Social Science',
  'English',
  'Computer Science',
  'Informatics Practices',
  'Economics',
  'Accountancy',
  'Business Studies',
  'Hindi'
];

const STEPS = [
  { id: 1, title: 'Role', label: '1. Role' },
  { id: 2, title: 'Board', label: '2. Board' },
  { id: 3, title: 'Classes', label: '3. Classes' },
  { id: 4, title: 'Subjects', label: '4. Subjects' },
  { id: 5, title: 'Theme', label: '5. Theme' },
  { id: 6, title: 'Confirm', label: '6. Review' }
];

export const TeacherOnboardingModal: React.FC<TeacherOnboardingModalProps> = ({
  isOpen,
  initialSettings,
  initialDefaultPaperSettings,
  currentAppearanceMode = 'dark',
  mode = 'onboarding',
  isMandatory = true,
  onComplete,
  onAppearanceChange,
  onClose,
  userName = 'Educator',
  isGuest = false
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  // Teacher Form State (Explicitly empty initially to avoid assuming CBSE, Class 10, or Science)
  const [teachingRole, setTeachingRole] = useState<string>(initialSettings?.teachingRole || '');
  const [institutionName, setInstitutionName] = useState<string>(
    initialSettings?.institutionName || initialDefaultPaperSettings?.schoolName || ''
  );
  const [selectedBoard, setSelectedBoard] = useState<string>(
    initialSettings?.primaryBoard || initialDefaultPaperSettings?.board || ''
  );
  const [selectedGrades, setSelectedGrades] = useState<string[]>(
    initialSettings?.preferredGrades || (initialDefaultPaperSettings?.grade ? [initialDefaultPaperSettings.grade] : [])
  );
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    initialSettings?.preferredSubjects || (initialDefaultPaperSettings?.subject ? [initialDefaultPaperSettings.subject] : [])
  );
  const [customSubject, setCustomSubject] = useState('');
  const [selectedAppearance, setSelectedAppearance] = useState<AppearanceMode>(currentAppearanceMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state if initial settings change
  useEffect(() => {
    if (initialSettings) {
      if (initialSettings.teachingRole) setTeachingRole(initialSettings.teachingRole);
      if (initialSettings.institutionName) setInstitutionName(initialSettings.institutionName);
      if (initialSettings.primaryBoard) setSelectedBoard(initialSettings.primaryBoard);
      if (initialSettings.preferredGrades) setSelectedGrades(initialSettings.preferredGrades);
      if (initialSettings.preferredSubjects) setSelectedSubjects(initialSettings.preferredSubjects);
    }
  }, [initialSettings]);

  if (!isOpen) return null;

  const toggleGrade = (grade: string) => {
    setSelectedGrades(prev => 
      prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
    );
  };

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };

  const handleAddCustomSubject = () => {
    if (customSubject.trim() && !selectedSubjects.includes(customSubject.trim())) {
      setSelectedSubjects(prev => [...prev, customSubject.trim()]);
      setCustomSubject('');
    }
  };

  // Step-by-step validation
  const canProceed = () => {
    if (currentStep === 1) return teachingRole.trim().length > 0;
    if (currentStep === 2) return selectedBoard.trim().length > 0;
    if (currentStep === 3) return selectedGrades.length > 0;
    if (currentStep === 4) return selectedSubjects.length > 0;
    if (currentStep === 5) return true; // Appearance has valid default
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
      const cleanTeacherSettings: TeacherProfileSettings = {
        teachingRole,
        institutionName: institutionName.trim() || undefined,
        primaryBoard: selectedBoard,
        preferredBoards: [selectedBoard],
        primaryGrade: selectedGrades[0] || 'Class 10',
        preferredGrades: selectedGrades,
        primarySubject: selectedSubjects[0] || 'Mathematics',
        preferredSubjects: selectedSubjects,
        teacherOnboardingCompleted: true,
        onboardingCompletedAt: Date.now()
      };

      const cleanPaperSettings = {
        board: selectedBoard,
        grade: selectedGrades[0] || '10th',
        subject: selectedSubjects[0] || 'Science',
        schoolName: institutionName.trim()
      };

      await onComplete(cleanTeacherSettings, cleanPaperSettings, selectedAppearance);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div 
        id="teacher-onboarding-overlay"
        className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto animate-fade-in"
      >
        <motion.div
          id="teacher-onboarding-container"
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-white/40 dark:border-gray-800 overflow-hidden text-gray-900 dark:text-white my-auto flex flex-col max-h-[92vh]"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-[#3C128D]/20 to-[#8A2CB0]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-gradient-to-tr from-[#EEA727]/20 to-[#DD2476]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Modal Header */}
          <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#3C128D] to-[#8A2CB0] text-white flex items-center justify-center shadow-md">
                <Briefcase className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-gray-900 dark:text-white">
                  {mode === 'edit' ? 'Update Educator Profile' : `Welcome, ${userName.split(' ')[0]}! 👨‍🏫`}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {mode === 'edit' 
                    ? 'Adjust your teaching curriculum, classes, and default paper settings' 
                    : 'Personalize your educator workspace and default exam generators'}
                </p>
              </div>
            </div>

            {/* Close Button if not mandatory */}
            {!isMandatory && onClose && (
              <button
                type="button"
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

          {/* Step Content Container */}
          <div className="p-6 sm:p-8 overflow-y-auto flex-1 relative z-10 space-y-6">

            {/* STEP 1: TEACHING ROLE & CONTEXT */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    What is your teaching role?
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Select your primary teaching context so we can optimize your exam generation templates.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TEACHER_ROLES.map((role) => {
                    const isSelected = teachingRole === role.id;
                    return (
                      <div
                        key={role.id}
                        id={`teacher-role-${role.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                        onClick={() => setTeachingRole(role.id)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                          isSelected
                            ? 'border-[#3C128D] dark:border-purple-400 bg-purple-50/70 dark:bg-purple-950/30 shadow-md ring-2 ring-purple-400/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white/70 dark:bg-gray-800/60'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{role.icon}</span>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                              {role.label}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed font-medium">
                              {role.desc}
                            </p>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center mt-0.5 ${
                          isSelected 
                            ? 'bg-[#3C128D] dark:bg-purple-600 border-[#3C128D] text-white' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Optional School / Institution Name */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-purple-600" />
                    <span>School / Institute Name (Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    placeholder="e.g. Delhi Public School, R.K. Puram"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Will appear automatically on printed exam paper headers. You can always change it later.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2: PRIMARY BOARD / CURRICULUM */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Select Your Primary Board / Curriculum
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    GenPaperAI generates questions aligned with strict curriculum blueprint guidelines.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SUPPORTED_CURRICULUM_BOARDS.map((board) => {
                    const isSelected = selectedBoard === board.id;
                    return (
                      <div
                        key={board.id}
                        id={`teacher-board-${board.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                        onClick={() => setSelectedBoard(board.id)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-[#3C128D] dark:border-purple-400 bg-purple-50/70 dark:bg-purple-950/30 shadow-md ring-2 ring-purple-400/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white/70 dark:bg-gray-800/60'
                        }`}
                      >
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                            {board.name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
                            {board.description}
                          </p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                          isSelected 
                            ? 'bg-[#3C128D] dark:bg-purple-600 border-[#3C128D] text-white' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: CLASSES / GRADES TAUGHT */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Which classes or grades do you teach?
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Select all classes you create papers or assessments for. You can choose multiple.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {COMMON_GRADES.map((grade) => {
                    const isSelected = selectedGrades.includes(grade);
                    return (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => toggleGrade(grade)}
                        className={`p-3.5 rounded-xl border text-left font-bold text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#3C128D] text-white border-[#3C128D] shadow-sm'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span>{grade}</span>
                        {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>

                {selectedGrades.length === 0 && (
                  <p className="text-xs text-rose-500 font-medium">
                    Please select at least one grade to proceed.
                  </p>
                )}
              </div>
            )}

            {/* STEP 4: SUBJECTS TAUGHT */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Which subjects do you teach?
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Choose one or more subjects. This sets your default paper generation subject.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {COMMON_SUBJECTS.map((subject) => {
                    const isSelected = selectedSubjects.includes(subject);
                    return (
                      <button
                        key={subject}
                        type="button"
                        onClick={() => toggleSubject(subject)}
                        className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#8A2CB0] text-white border-[#8A2CB0] shadow-sm'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span>{subject}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Subject */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomSubject();
                      }
                    }}
                    placeholder="Add other subject (e.g. Sanskrit, French, Psychology)"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSubject}
                    disabled={!customSubject.trim()}
                    className="px-4 py-2.5 rounded-xl bg-[#3C128D] text-white font-bold text-xs hover:bg-[#2c0d68] transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>

                {selectedSubjects.length === 0 && (
                  <p className="text-xs text-rose-500 font-medium">
                    Please select at least one subject to proceed.
                  </p>
                )}
              </div>
            )}

            {/* STEP 5: WORKSPACE APPEARANCE */}
            {currentStep === 5 && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Choose Your Workspace Look
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Select your preferred appearance mode for paper drafting and question bank authoring.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Light Mode Card */}
                  <div
                    onClick={() => {
                      setSelectedAppearance('light');
                      onAppearanceChange?.('light');
                    }}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      selectedAppearance === 'light'
                        ? 'border-[#3C128D] dark:border-purple-400 bg-purple-50/60 dark:bg-purple-950/30 shadow-lg ring-2 ring-purple-400/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/60 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-sm">
                        <Sun className="w-6 h-6 stroke-[2.5]" />
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedAppearance === 'light'
                          ? 'bg-[#3C128D] border-[#3C128D] text-white'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {selectedAppearance === 'light' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-gray-900 dark:text-white">Light Mode</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed font-medium">
                        Bright, high-contrast daylight aesthetic ideal for proofreading question text and print layouts.
                      </p>
                    </div>
                  </div>

                  {/* Dark Mode Card */}
                  <div
                    onClick={() => {
                      setSelectedAppearance('dark');
                      onAppearanceChange?.('dark');
                    }}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      selectedAppearance === 'dark'
                        ? 'border-[#8A2CB0] dark:border-purple-400 bg-purple-900/15 dark:bg-purple-950/40 shadow-lg ring-2 ring-purple-400/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/60 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-900/30 text-purple-400 flex items-center justify-center shadow-sm">
                        <Moon className="w-6 h-6 stroke-[2.5]" />
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedAppearance === 'dark'
                          ? 'bg-[#8A2CB0] border-[#8A2CB0] text-white'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {selectedAppearance === 'dark' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-gray-900 dark:text-white">Dark Mode</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed font-medium">
                        Deep twilight palette optimized for evening lesson planning and low eye fatigue.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: CONFIRMATION / SUMMARY */}
            {currentStep === 6 && (
              <div className="space-y-5 animate-fade-in">
                <div className="text-center max-w-md mx-auto space-y-1">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#3C128D] to-[#8A2CB0] text-white flex items-center justify-center text-2xl shadow-lg mb-2">
                    👨‍🏫
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                    Your Educator Profile
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Review your default curriculum and paper preferences before launching your workspace.
                  </p>
                </div>

                <div className="p-5 sm:p-6 rounded-3xl bg-gray-50/80 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Teaching Role</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white mt-0.5">
                        {teachingRole || 'Not selected'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Institution</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white mt-0.5">
                        {institutionName.trim() || 'Independent Educator'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Primary Board</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white mt-0.5">
                        {selectedBoard || 'Not selected'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Appearance Mode</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white mt-0.5">
                        {selectedAppearance === 'light' ? '☀️ Light Mode' : '🌙 Dark Mode'}
                      </p>
                    </div>
                  </div>

                  {/* Grades */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">
                      Classes Taught ({selectedGrades.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedGrades.map((g) => (
                        <span
                          key={g}
                          className="px-3 py-1 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-[#3C128D] dark:text-purple-300 text-xs font-bold"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Subjects */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">
                      Subjects ({selectedSubjects.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSubjects.map((s) => (
                        <span
                          key={s}
                          className="px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-medium border border-amber-200 dark:border-amber-800"
                        >
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>
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
              {currentStep < 6 ? (
                <button
                  type="button"
                  id={`teacher-onboarding-next-step-${currentStep}`}
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
                  id="teacher-onboarding-finish-btn"
                  onClick={handleFinish}
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] text-white text-xs sm:text-sm font-black shadow-lg shadow-purple-900/25 hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span>Saving Profile...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>{mode === 'edit' ? 'Save Changes' : 'Launch Workspace'}</span>
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
