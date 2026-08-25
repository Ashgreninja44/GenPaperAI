import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Clock, ShieldCheck, Lock, LogIn, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Logo from './Logo';
import { MaintenanceConfig, UserProfile } from '../types';
import { isSuperAdmin, setMaintenanceMode } from '../services/maintenanceService';
import { auth, googleProvider, microsoftProvider, signInWithPopup, signInWithEmailAndPassword, User } from '../firebase';
import { GoogleIcon, MicrosoftIcon, EmailIcon } from './BrandIcons';

interface MaintenanceProps {
  config?: MaintenanceConfig | null;
  currentUser?: User | null;
  userProfile?: UserProfile | null;
  onEnterApp?: () => void;
}

const Maintenance: React.FC<MaintenanceProps> = ({
  config,
  currentUser,
  userProfile,
  onEnterApp
}) => {
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState<string | null>(null);
  const [emailForm, setEmailForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isTogglingMode, setIsTogglingMode] = useState(false);

  const isAdminUser = isSuperAdmin(currentUser?.email, userProfile?.role);

  const handleGoogleLogin = async () => {
    setIsLoggingIn('google');
    setLoginError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      setShowAdminModal(false);
    } catch (err: any) {
      setLoginError(err?.message || 'Failed to sign in with Google');
    } finally {
      setIsLoggingIn(null);
    }
  };

  const handleMicrosoftLogin = async () => {
    setIsLoggingIn('microsoft');
    setLoginError(null);
    try {
      await signInWithPopup(auth, microsoftProvider);
      setShowAdminModal(false);
    } catch (err: any) {
      setLoginError(err?.message || 'Failed to sign in with Microsoft');
    } finally {
      setIsLoggingIn(null);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn('email');
    setLoginError(null);
    try {
      await signInWithEmailAndPassword(auth, emailForm.email, emailForm.password);
      setShowAdminModal(false);
    } catch (err: any) {
      setLoginError(err?.message || 'Invalid email or password');
    } finally {
      setIsLoggingIn(null);
    }
  };

  const handleQuickTurnOff = async () => {
    if (!currentUser?.email) return;
    setIsTogglingMode(true);
    try {
      await setMaintenanceMode(false, currentUser.email);
      if (onEnterApp) onEnterApp();
    } catch (err) {
      console.error('Failed to toggle maintenance mode:', err);
    } finally {
      setIsTogglingMode(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-gradient-to-br from-[#1c0847] via-[#3C128D] to-[#8A2CB0] text-white selection:bg-amber-400 selection:text-gray-900">
      {/* Dynamic Background Glow Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#EEA727]/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#8A2CB0]/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#3C128D]/40 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Subtle Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', 
          backgroundSize: '32px 32px' 
        }}
      />

      {/* Admin Logged-In Top Alert Banner */}
      {isAdminUser && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 z-50 px-4 py-3 rounded-2xl bg-amber-500/90 text-gray-950 font-bold shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-center gap-3 border border-amber-300 text-xs sm:text-sm"
        >
          <span className="flex items-center gap-1.5 font-black">
            👑 Admin Detected: <span className="underline">{currentUser?.email}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleQuickTurnOff}
              disabled={isTogglingMode}
              className="px-3 py-1.5 bg-gray-950 hover:bg-gray-900 text-amber-300 rounded-xl text-xs font-black transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isTogglingMode ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Turn OFF Maintenance Mode'}
            </button>
            {onEnterApp && (
              <button
                onClick={onEnterApp}
                className="px-3 py-1.5 bg-white/30 hover:bg-white/40 text-gray-950 rounded-xl text-xs font-black transition-transform active:scale-95 cursor-pointer"
              >
                Enter App →
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Center Maintenance Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-lg glass-panel bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 sm:p-12 shadow-2xl shadow-black/40 text-center flex flex-col items-center my-auto"
      >
        {/* Brand Header */}
        <div className="relative mb-6">
          <div className="absolute -inset-2 bg-gradient-to-r from-[#EEA727] to-[#8A2CB0] rounded-3xl blur-md opacity-60"></div>
          <div className="relative">
            <Logo className="w-20 h-20 sm:w-24 sm:h-24 shadow-2xl rounded-2xl" />
          </div>
        </div>

        {/* Status Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/25 backdrop-blur-md mb-5 shadow-inner"
        >
          <span className="text-base" role="img" aria-label="construction">🚧</span>
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          <span className="text-xs font-black tracking-wider uppercase text-amber-300">
            Scheduled Upgrade
          </span>
        </motion.div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-4 drop-shadow-md">
          Maintenance in Progress
        </h1>

        {/* Message Body */}
        <div className="space-y-3 mb-8 max-w-md">
          <p className="text-base sm:text-lg text-white/90 font-medium leading-relaxed">
            {config?.message || "GenPaperAI is currently undergoing maintenance."}
          </p>
          <p className="text-sm sm:text-base text-white/75 font-normal leading-relaxed">
            We're working on improvements and will be back soon.
          </p>
        </div>

        {/* Info Grid / Notice */}
        <div className="w-full bg-black/20 rounded-2xl p-4 sm:p-5 border border-white/10 mb-8 space-y-3 text-left">
          <div className="flex items-start gap-3 text-xs sm:text-sm text-white/80">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">Data & Workspaces Safe:</span> All stored question papers, curriculum updates, and account configurations remain securely protected.
            </div>
          </div>
          <div className="flex items-start gap-3 text-xs sm:text-sm text-white/80">
            <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">System Status:</span> Services will resume shortly once the system updates are deployed.
            </div>
          </div>
        </div>

        {/* Closing gratitude */}
        <div className="flex items-center gap-2 text-sm font-semibold text-amber-200/90">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Thank you for your patience.</span>
          <Sparkles className="w-4 h-4 text-amber-300" />
        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-6 border-t border-white/10 w-full flex items-center justify-between text-[11px] text-white/50 font-medium">
          <span>&copy; {new Date().getFullYear()} GenPaperAI</span>
          
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              Maintenance Mode
            </span>
            
            {/* Subtle Admin Link */}
            <button
              onClick={() => setShowAdminModal(true)}
              className="text-white/30 hover:text-white/80 transition-colors p-1 flex items-center gap-1 cursor-pointer"
              title="Admin Portal"
            >
              <Lock className="w-3 h-3" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showAdminModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          >
            <div className="fixed inset-0" onClick={() => setShowAdminModal(false)}></div>
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="glass-panel w-full max-w-md rounded-3xl shadow-2xl z-10 overflow-hidden bg-white text-gray-900 border border-white/40 p-6 sm:p-8"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#3C128D] to-[#8A2CB0] flex items-center justify-center text-white">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Admin Sign In</h3>
                    <p className="text-xs text-gray-500 font-medium">GenPaperAI Site Owner</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAdminModal(false)}
                  className="text-gray-400 hover:text-gray-600 font-bold p-1 text-2xl leading-none cursor-pointer"
                >
                  &times;
                </button>
              </div>

              {loginError && (
                <div className="p-3 mb-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {loginError}
                </div>
              )}

              <div className="space-y-3 mb-5">
                <button
                  onClick={handleGoogleLogin}
                  disabled={!!isLoggingIn}
                  className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-white text-gray-800 border border-gray-200 shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                >
                  {isLoggingIn === 'google' ? <Loader2 className="w-4 h-4 animate-spin text-[#8A2CB0]" /> : <GoogleIcon className="w-4 h-4" />}
                  <span>Sign in with Google</span>
                </button>

                <button
                  onClick={handleMicrosoftLogin}
                  disabled={!!isLoggingIn}
                  className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-white text-gray-800 border border-gray-200 shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                >
                  {isLoggingIn === 'microsoft' ? <Loader2 className="w-4 h-4 animate-spin text-[#8A2CB0]" /> : <MicrosoftIcon className="w-4 h-4" />}
                  <span>Sign in with Microsoft</span>
                </button>
              </div>

              <div className="relative py-2 flex items-center justify-center mb-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  or email
                </div>
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={emailForm.email}
                    onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                    placeholder="pendyaladarshit4@gmail.com"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#8A2CB0] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={emailForm.password}
                      onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#8A2CB0] outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!!isLoggingIn}
                  className="w-full py-3 bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] text-white font-bold rounded-xl shadow-md hover:opacity-95 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoggingIn === 'email' ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                  <span>Sign In as Admin</span>
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Maintenance;
