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
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { UserType } from '../types';
import Logo from './Logo';

interface LegacyMigrationModalProps {
  isOpen: boolean;
  onComplete: (type: UserType) => Promise<void> | void;
  userEmail?: string;
  userName?: string;
}

export const LegacyMigrationModal: React.FC<LegacyMigrationModalProps> = ({
  isOpen,
  onComplete,
  userEmail,
  userName
}) => {
  const [selected, setSelected] = useState<UserType>('teacher');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onComplete(selected);
    } catch (err: any) {
      console.error('Migration selection error:', err);
      setError(err?.message || 'Failed to complete migration. Please check your connection and try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div 
        id="legacy-migration-overlay"
        className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-gray-950/85 backdrop-blur-xl animate-fade-in overflow-y-auto pointer-events-auto"
      >
        <motion.div
          id="legacy-migration-modal-container"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-9 shadow-2xl border border-white/40 dark:border-gray-800 backdrop-blur-2xl my-auto text-gray-900 dark:text-white"
        >
          {/* Ambient Glows */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-[#8A2CB0]/30 to-[#3C128D]/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gradient-to-tr from-[#EEA727]/25 to-[#8A2CB0]/25 rounded-full blur-3xl pointer-events-none" />

          {/* Header & App Branding */}
          <div className="text-center mb-7 relative z-10">
            <div className="inline-flex items-center justify-center mb-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#3C128D] to-[#8A2CB0] text-white shadow-lg">
                <Logo className="w-8 h-8" />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#3C128D]/10 to-[#8A2CB0]/10 border border-[#8A2CB0]/20 text-[#8A2CB0] dark:text-[#d8b4fe] text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>System Update • Account Setup</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
              Welcome to the new GenPaperAI
            </h1>
            <p className="mt-1.5 text-base sm:text-lg font-bold text-[#3C128D] dark:text-purple-300">
              Choose how you'll use GenPaperAI
            </p>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              {userName ? `Welcome back, ${userName}!` : 'Welcome back!'} Please select your primary role to configure your dedicated workspace.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 font-semibold text-center">
              {error}
            </div>
          )}

          {/* Two-Option Selection Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-7 relative z-10">
            {/* Teacher Option */}
            <div
              id="migration-select-teacher"
              onClick={() => !isSubmitting && setSelected('teacher')}
              className={`group relative p-5 sm:p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                selected === 'teacher'
                  ? 'border-[#3C128D] dark:border-[#a855f7] bg-gradient-to-b from-[#3C128D]/5 to-[#8A2CB0]/10 dark:from-[#3C128D]/30 dark:to-[#8A2CB0]/20 shadow-lg shadow-[#3C128D]/15'
                  : 'border-gray-200 dark:border-gray-800 hover:border-[#8A2CB0]/40 bg-gray-50/60 dark:bg-gray-800/40 hover:bg-white dark:hover:bg-gray-800/70'
              }`}
            >
              {selected === 'teacher' && (
                <div className="absolute top-3.5 right-3.5 text-[#3C128D] dark:text-[#a855f7]">
                  <CheckCircle2 className="w-5 h-5 fill-current text-white dark:text-gray-900" />
                </div>
              )}

              <div>
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#3C128D] to-[#8A2CB0] text-white flex items-center justify-center text-2xl shadow-md mb-3.5 group-hover:scale-105 transition-transform">
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
                    <span>Official Answer Keys & Solutions</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Student Option */}
            <div
              id="migration-select-student"
              onClick={() => !isSubmitting && setSelected('student')}
              className={`group relative p-5 sm:p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                selected === 'student'
                  ? 'border-[#EEA727] dark:border-[#f59e0b] bg-gradient-to-b from-[#EEA727]/10 to-[#DD2476]/10 dark:from-[#EEA727]/25 dark:to-[#DD2476]/20 shadow-lg shadow-[#EEA727]/15'
                  : 'border-gray-200 dark:border-gray-800 hover:border-[#EEA727]/40 bg-gray-50/60 dark:bg-gray-800/40 hover:bg-white dark:hover:bg-gray-800/70'
              }`}
            >
              {selected === 'student' && (
                <div className="absolute top-3.5 right-3.5 text-[#d97706] dark:text-[#f59e0b]">
                  <CheckCircle2 className="w-5 h-5 fill-current text-white dark:text-gray-900" />
                </div>
              )}

              <div>
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#EEA727] to-[#DD2476] text-white flex items-center justify-center text-2xl shadow-md mb-3.5 group-hover:scale-105 transition-transform">
                  🎓
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Student</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-800 dark:bg-amber-400/20 dark:text-amber-300 font-bold uppercase">
                    Learner
                  </span>
                </div>
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-3">
                  Practice, take tests, and improve your learning.
                </p>
                <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-[#EEA727] dark:text-amber-400 shrink-0" />
                    <span>Topic Practice & Mock Tests</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Brain className="w-3.5 h-3.5 text-[#EEA727] dark:text-amber-400 shrink-0" />
                    <span>AI Step-by-Step Guidance & Tutor</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5 text-[#EEA727] dark:text-amber-400 shrink-0" />
                    <span>Mistake Notebook & Revision Decks</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Safety Reassurance Notice */}
          <div className="mb-6 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60 flex items-center gap-3 text-left">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
              <strong>Your data is 100% safe:</strong> All your previous question papers, question banks, and preferences will be preserved intact.
            </p>
          </div>

          {/* Single Action Button (No Skip, No Cancel, No Dismissal) */}
          <div className="flex justify-end relative z-10">
            <button
              id="confirm-migration-btn"
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting}
              className={`w-full py-4 rounded-2xl font-black text-sm text-white shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                selected === 'student'
                  ? 'bg-gradient-to-r from-[#EEA727] to-[#DD2476] hover:opacity-95 shadow-amber-500/25'
                  : 'bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] hover:opacity-95 shadow-purple-900/25'
              } disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Configuring your workspace...</span>
                </>
              ) : (
                <>
                  <span>
                    {selected === 'student' ? 'Continue as Student' : 'Continue as Teacher'}
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
