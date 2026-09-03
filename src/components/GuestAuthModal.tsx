import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Download, 
  Database, 
  Globe, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  Loader2,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { GoogleIcon, MicrosoftIcon, EmailIcon } from './BrandIcons';

export interface GuestAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: 'download' | 'bank' | 'web-extract' | 'save' | 'customization' | 'general';
  customMessage?: string;
  onLoginGoogle: () => void;
  onLoginMicrosoft: () => void;
  onOpenEmailAuth: (mode: 'login' | 'signup') => void;
  isLoggingIn?: string | null;
}

export const GuestAuthModal: React.FC<GuestAuthModalProps> = ({
  isOpen,
  onClose,
  feature = 'general',
  customMessage,
  onLoginGoogle,
  onLoginMicrosoft,
  onOpenEmailAuth,
  isLoggingIn = null
}) => {
  if (!isOpen) return null;

  const getFeatureDetails = () => {
    switch (feature) {
      case 'download':
        return {
          title: 'Sign in to Download',
          subtitle: customMessage || 'Export your question paper in clean PDF, Microsoft Word (.doc), or TXT format and download ready-to-print papers.',
          icon: Download,
          badge: 'Download Feature',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
        };
      case 'bank':
        return {
          title: 'Sign in for Question Bank',
          subtitle: customMessage || 'Save, organize, and reuse curated questions in your personal Question Bank library.',
          icon: Database,
          badge: 'Question Bank',
          badgeColor: 'bg-purple-100 text-purple-800 border-purple-200'
        };
      case 'web-extract':
        return {
          title: 'Sign in for Web Extract',
          subtitle: customMessage || 'Unlock live Google Grounding web research and extract questions directly from curriculum URLs.',
          icon: Globe,
          badge: 'Web Research',
          badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200'
        };
      case 'customization':
        return {
          title: 'Sign in for Custom Preferences',
          subtitle: customMessage || 'Personalize your profile, school branding, custom backgrounds, and theme preferences.',
          icon: Sparkles,
          badge: 'Account Customization',
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
        };
      case 'save':
      default:
        return {
          title: 'Sign in to Save Your Paper',
          subtitle: customMessage || 'Your generated paper will be permanently preserved in your account history across all devices.',
          icon: FileText,
          badge: 'Save & Preserve',
          badgeColor: 'bg-purple-100 text-purple-800 border-purple-200'
        };
    }
  };

  const details = getFeatureDetails();
  const Icon = details.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => {
            if (!isLoggingIn) onClose();
          }}
        />

        {/* Modal Dialog */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/60 z-10 text-gray-900 overflow-hidden"
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

          {/* Header Icon */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#3C128D] to-[#8A2CB0] text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
              <Icon className="w-7 h-7" />
            </div>

            <div className="inline-block mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${details.badgeColor}`}>
                {details.badge}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              {details.title}
            </h3>

            <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1.5 leading-relaxed px-2">
              {details.subtitle}
            </p>
          </div>

          {/* Account Benefits Pill List */}
          <div className="bg-purple-50/60 rounded-2xl p-3.5 mb-6 border border-purple-100 text-left">
            <div className="text-[11px] font-bold text-[#3C128D] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8A2CB0]" />
              <span>With a free account you get:</span>
            </div>
            <ul className="space-y-1.5 text-xs text-gray-700 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Unlimited paper editing & permanent cloud history</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Instant PDF, Word, & Print exports</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Your current session paper is saved immediately</span>
              </li>
            </ul>
          </div>

          {/* Login Options */}
          <div className="space-y-2.5">
            {/* Google Authentication */}
            <button 
              type="button"
              onClick={onLoginGoogle}
              disabled={!!isLoggingIn}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-white text-gray-800 border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-60 cursor-pointer"
            >
              {isLoggingIn === 'google' ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#8A2CB0]" />
              ) : (
                <GoogleIcon className="w-4 h-4 shrink-0" />
              )}
              <span>Continue with Google</span>
            </button>

            {/* Microsoft Authentication */}
            <button 
              type="button"
              onClick={onLoginMicrosoft}
              disabled={!!isLoggingIn}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-white text-gray-800 border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-60 cursor-pointer"
            >
              {isLoggingIn === 'microsoft' ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#8A2CB0]" />
              ) : (
                <MicrosoftIcon className="w-4 h-4 shrink-0" />
              )}
              <span>Continue with Microsoft</span>
            </button>

            {/* Email Authentication */}
            <button 
              type="button"
              onClick={() => {
                onClose();
                onOpenEmailAuth('login');
              }}
              disabled={!!isLoggingIn}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] text-white shadow-md hover:shadow-lg hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-60 cursor-pointer"
            >
              <EmailIcon className="w-4 h-4 shrink-0" />
              <span>Continue with Email</span>
            </button>
          </div>

          {/* Footer Dismiss / Continue as Guest */}
          <div className="mt-5 pt-3 text-center border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-gray-500 hover:text-gray-800 font-bold transition-colors cursor-pointer"
            >
              Continue in Guest Mode for now →
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
