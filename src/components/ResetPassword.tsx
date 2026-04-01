
import React, { useState, useEffect } from 'react';
import { auth, confirmPasswordReset } from '../firebase';
import { Loader2, AlertCircle, CheckCircle2, Key, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [oobCode, setOobCode] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('oobCode');
    const mode = params.get('mode');

    if (mode !== 'resetPassword' || !code) {
      setError('Invalid or expired password reset link.');
    } else {
      setOobCode(code);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!oobCode) {
      setError('Invalid reset code.');
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);
    } catch (err: any) {
      console.error('Reset password error:', err);
      if (err.code === 'auth/expired-action-code') {
        setError('The password reset link has expired.');
      } else if (err.code === 'auth/invalid-action-code') {
        setError('The password reset link is invalid.');
      } else {
        setError(err.message || 'Failed to update password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-[#3C128D] via-[#8A2CB0] to-[#EEA727]">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#3C128D] opacity-20 blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#EEA727] opacity-20 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="glass-panel w-full max-w-md rounded-3xl shadow-2xl z-10 overflow-hidden animate-scale-in border border-white/40 bg-white/10 backdrop-blur-xl">
        <div className="bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] p-8 text-white text-center">
          <h3 className="text-3xl font-black tracking-tight">Reset Password</h3>
          <p className="text-white/70 text-sm mt-2 font-medium">
            {success ? 'Your security is updated' : 'Enter your new secure password'}
          </p>
        </div>

        <div className="p-8">
          {success ? (
            <div className="space-y-6 text-center py-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-gray-800">Success!</h4>
                <p className="text-gray-500 text-sm">Your password has been updated successfully. You can now login with your new credentials.</p>
              </div>
              <button 
                onClick={() => window.location.href = '/'}
                className="w-full py-4 bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] text-white font-black rounded-2xl shadow-xl hover:shadow-[#3C128D]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-bold rounded-xl flex items-center gap-3 animate-shake">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                <div className="relative group">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#8A2CB0] transition-colors" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-4 bg-white/50 border border-white/20 rounded-2xl focus:ring-2 focus:ring-[#8A2CB0] focus:border-transparent outline-none transition-all text-sm shadow-inner"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
                <div className="relative group">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#8A2CB0] transition-colors" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-4 bg-white/50 border border-white/20 rounded-2xl focus:ring-2 focus:ring-[#8A2CB0] focus:border-transparent outline-none transition-all text-sm shadow-inner"
                  />
                </div>
                <p className="text-[10px] text-gray-400 ml-1">Minimum 6 characters</p>
              </div>

              <button 
                type="submit"
                disabled={loading || !oobCode}
                className="w-full py-4 bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] text-white font-black rounded-2xl shadow-xl hover:shadow-[#3C128D]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
              </button>

              <div className="text-center">
                <button 
                  type="button"
                  onClick={() => window.location.href = '/'}
                  className="text-sm font-bold text-[#8A2CB0] hover:underline flex items-center justify-center gap-2 mx-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
