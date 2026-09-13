import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  Brain, 
  Layers, 
  Target,
  Compass,
  X,
  Loader2
} from 'lucide-react';
import { UserType } from '../types';

interface UserTypeSelectionModalProps {
  isOpen: boolean;
  onSelect: (type: UserType) => Promise<void> | void;
  onClose?: () => void;
  currentType?: UserType;
  isGuest?: boolean;
  isMandatory?: boolean;
}

export const UserTypeSelectionModal: React.FC<UserTypeSelectionModalProps> = ({
  isOpen,
  onSelect,
  onClose,
  currentType,
  isGuest = false,
  isMandatory = false,
}) => {
  const [selected, setSelected] = useState<UserType>(currentType || 'teacher');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onSelect(selected);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div 
        id="user-type-modal-overlay"
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
      >
        <motion.div
          id="user-type-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/40 dark:border-gray-800 backdrop-blur-xl overflow-hidden text-gray-900 dark:text-white"
        >
          {/* Subtle background ambient light */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-gradient-to-br from-[#8A2CB0]/25 to-[#3C128D]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-gradient-to-tr from-[#EEA727]/20 to-[#8A2CB0]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close button only if explicitly non-mandatory */}
          {!isMandatory && onClose && (
            <button
              id="close-user-type-modal-btn"
              onClick={onClose}
              disabled={isSubmitting}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Header */}
          <div className="text-center mb-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#3C128D]/10 to-[#8A2CB0]/10 border border-[#8A2CB0]/20 text-[#8A2CB0] dark:text-[#d8b4fe] text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGuest ? 'Guest Experience' : 'Account Setup'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              How will you use GenPaperAI?
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              Choose your primary role to configure your dedicated workspace, tools, and learning materials.
            </p>
          </div>

          {/* Two-Option Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 relative z-10">
            {/* Teacher Option */}
            <div
              id="select-teacher-option"
              onClick={() => !isSubmitting && setSelected('teacher')}
              className={`group relative p-5 sm:p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                selected === 'teacher'
                  ? 'border-[#3C128D] dark:border-[#a855f7] bg-gradient-to-b from-[#3C128D]/5 to-[#8A2CB0]/10 dark:from-[#3C128D]/30 dark:to-[#8A2CB0]/20 shadow-lg shadow-[#3C128D]/15'
                  : 'border-gray-200 dark:border-gray-800 hover:border-[#8A2CB0]/40 bg-gray-50/50 dark:bg-gray-800/40 hover:bg-white dark:hover:bg-gray-800/70'
              }`}
            >
              {selected === 'teacher' && (
                <div className="absolute top-3.5 right-3.5 text-[#3C128D] dark:text-[#a855f7]">
                  <CheckCircle2 className="w-5 h-5 fill-current text-white dark:text-gray-900" />
                </div>
              )}

              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3C128D] to-[#8A2CB0] text-white flex items-center justify-center text-2xl shadow-md mb-4 group-hover:scale-105 transition-transform">
                  👨‍🏫
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Teacher</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#3C128D]/10 text-[#3C128D] dark:bg-[#3C128D]/30 dark:text-purple-300 font-bold uppercase">
                    Educator
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#8A2CB0] dark:text-purple-300 mb-3">
                  Create question papers, manage question banks, and assess students.
                </p>
                <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[#3C128D] dark:text-purple-400 shrink-0" />
                    <span>AI Question Paper Generator</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-[#3C128D] dark:text-purple-400 shrink-0" />
                    <span>Curated Question Banks & Blueprints</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#3C128D] dark:text-purple-400 shrink-0" />
                    <span>Answer Keys & Marking Schemes</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Student Option */}
            <div
              id="select-student-option"
              onClick={() => !isSubmitting && setSelected('student')}
              className={`group relative p-5 sm:p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                selected === 'student'
                  ? 'border-[#EEA727] dark:border-[#f59e0b] bg-gradient-to-b from-[#EEA727]/10 to-[#DD2476]/10 dark:from-[#EEA727]/25 dark:to-[#DD2476]/20 shadow-lg shadow-[#EEA727]/15'
                  : 'border-gray-200 dark:border-gray-800 hover:border-[#EEA727]/40 bg-gray-50/50 dark:bg-gray-800/40 hover:bg-white dark:hover:bg-gray-800/70'
              }`}
            >
              {selected === 'student' && (
                <div className="absolute top-3.5 right-3.5 text-[#d97706] dark:text-[#f59e0b]">
                  <CheckCircle2 className="w-5 h-5 fill-current text-white dark:text-gray-900" />
                </div>
              )}

              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#EEA727] to-[#DD2476] text-white flex items-center justify-center text-2xl shadow-md mb-4 group-hover:scale-105 transition-transform">
                  🎓
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Student</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-800 dark:bg-amber-400/20 dark:text-amber-300 font-bold uppercase">
                    Learner
                  </span>
                </div>
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-3">
                  Practice questions, take tests, and improve your learning.
                </p>
                <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-[#EEA727] dark:text-amber-400 shrink-0" />
                    <span>Topic Practice & Mock Tests</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Brain className="w-3.5 h-3.5 text-[#EEA727] dark:text-amber-400 shrink-0" />
                    <span>AI Tutor & Step-by-Step Help</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5 text-[#EEA727] dark:text-amber-400 shrink-0" />
                    <span>Mistake Notebook & Revision Decks</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 relative z-10">
            {!isMandatory && onClose && (
              <button
                id="cancel-user-type-selection-btn"
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              id="confirm-user-type-selection-btn"
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                selected === 'student'
                  ? 'bg-gradient-to-r from-[#EEA727] to-[#DD2476] hover:opacity-95 shadow-amber-500/25'
                  : 'bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] hover:opacity-95 shadow-purple-900/25'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Setting up your workspace...</span>
                </>
              ) : (
                <>
                  <span>
                    {isGuest 
                      ? (selected === 'student' ? 'Continue as Student Guest' : 'Continue as Teacher Guest') 
                      : (selected === 'student' ? 'Continue as Student' : 'Continue as Teacher')}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
