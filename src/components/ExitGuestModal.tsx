import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  X, 
  Sparkles, 
  ArrowRight, 
  Trash2, 
  ShieldCheck, 
  Loader2,
  FileText
} from 'lucide-react';
import { GoogleIcon, MicrosoftIcon, EmailIcon } from './BrandIcons';

export interface ExitGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmExit: () => void;
  onLoginGoogle: () => void;
  onLoginMicrosoft: () => void;
  onOpenEmailAuth: (mode: 'login' | 'signup') => void;
  paperCount: number;
  isLoggingIn?: string | null;
}

export const ExitGuestModal: React.FC<ExitGuestModalProps> = ({
  isOpen,
  onClose,
  onConfirmExit,
  onLoginGoogle,
  onLoginMicrosoft,
  onOpenEmailAuth,
  paperCount,
  isLoggingIn = null
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
          onClick={() => {
            if (!isLoggingIn) onClose();
          }}
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 z-10 text-gray-900 overflow-hidden"
        >
          {/* Close button */}
          <button 
            type="button"
            onClick={onClose}
            disabled={!!isLoggingIn}
            className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Warning Icon & Header */}
          <div className="text-center mb-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3.5 shadow-md border border-amber-200 ring-4 ring-amber-50">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-gray-950 tracking-tight">
              Exit Guest Mode?
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
              You are about to exit guest mode and return to the GenPaper AI home page.
            </p>
          </div>

          {/* Paper Loss Warning Box */}
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-950">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-500 text-white shrink-0 mt-0.5 shadow-sm">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-black text-rose-900">
                  {paperCount > 0 
                    ? `⚠️ ${paperCount} Generated Paper${paperCount === 1 ? '' : 's'} Will Be Lost!` 
                    : "⚠️ Guest Session Data Will Be Cleared!"}
                </h4>
                <p className="text-xs text-rose-800 font-medium mt-1 leading-relaxed">
                  {paperCount > 0 
                    ? `Papers generated in guest mode are only kept in your temporary browser session. If you exit without signing up, your ${paperCount} paper${paperCount === 1 ? '' : 's'} will be permanently erased.`
                    : "Any unsaved changes, question selections, or temporary inputs will be reset."}
                </p>
              </div>
            </div>
          </div>

          {/* Migrate Papers to Account Section */}
          <div className="bg-gradient-to-br from-purple-50 via-indigo-50/40 to-purple-50/60 rounded-2xl p-4 sm:p-5 border border-purple-100 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#8A2CB0]" />
                <span className="text-xs font-black uppercase tracking-wider text-[#3C128D]">
                  Recommended: Save & Migrate
                </span>
              </div>
              {paperCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-200 text-[#3C128D]">
                  {paperCount} {paperCount === 1 ? 'Paper' : 'Papers'}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-700 font-medium mb-4">
              Sign up or log in now with Google, Microsoft, or Email to instantly migrate your papers to a permanent free cloud account.
            </p>

            <div className="space-y-2.5">
              {/* Google Authentication */}
              <button 
                type="button"
                onClick={onLoginGoogle}
                disabled={!!isLoggingIn}
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-white text-gray-800 border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-60 cursor-pointer"
              >
                {isLoggingIn === 'google' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#8A2CB0]" />
                ) : (
                  <GoogleIcon className="w-4 h-4 shrink-0" />
                )}
                <span>Sign up with Google & Migrate</span>
              </button>

              {/* Microsoft Authentication */}
              <button 
                type="button"
                onClick={onLoginMicrosoft}
                disabled={!!isLoggingIn}
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-white text-gray-800 border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-60 cursor-pointer"
              >
                {isLoggingIn === 'microsoft' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#8A2CB0]" />
                ) : (
                  <MicrosoftIcon className="w-4 h-4 shrink-0" />
                )}
                <span>Sign up with Microsoft & Migrate</span>
              </button>

              {/* Email Authentication */}
              <button 
                type="button"
                onClick={() => {
                  onClose();
                  onOpenEmailAuth('signup');
                }}
                disabled={!!isLoggingIn}
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] text-white shadow-md hover:shadow-lg hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-60 cursor-pointer"
              >
                <EmailIcon className="w-4 h-4 shrink-0" />
                <span>Sign up with Email & Migrate</span>
              </button>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={!!isLoggingIn}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer text-center"
            >
              Stay in Guest Mode
            </button>

            <button
              type="button"
              onClick={onConfirmExit}
              disabled={!!isLoggingIn}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Discard & Return to Home</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
