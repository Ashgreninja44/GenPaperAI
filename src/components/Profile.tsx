import React, { useState } from 'react';
import { UserProfile, MaintenanceConfig } from '../types';
import { Shield, Mail, Calendar, User as UserIcon, AlertTriangle, CheckCircle2, Loader2, Power, Globe, Radio } from 'lucide-react';
import { GoogleIcon, MicrosoftIcon, EmailIcon } from './BrandIcons';
import { isSuperAdmin, setMaintenanceMode } from '../services/maintenanceService';

interface ProfileProps {
  profile: UserProfile;
  onBack: () => void;
  onGoToSettings: () => void;
  maintenanceConfig?: MaintenanceConfig | null;
}

const Profile: React.FC<ProfileProps> = ({ 
  profile, 
  onBack, 
  onGoToSettings,
  maintenanceConfig 
}) => {
  const isAdmin = isSuperAdmin(profile.email, profile.role);
  const [isUpdatingMode, setIsUpdatingMode] = useState(false);
  const [adminFeedback, setAdminFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isModeActive = Boolean(maintenanceConfig?.enabled);

  const handleToggleMaintenance = async () => {
    setIsUpdatingMode(true);
    setAdminFeedback(null);
    try {
      const nextState = !isModeActive;
      await setMaintenanceMode(nextState, profile.email);
      setAdminFeedback({
        type: 'success',
        message: nextState 
          ? 'Maintenance Mode is now ACTIVE globally! Public visitors will see the maintenance landing page.'
          : 'Maintenance Mode has been TURNED OFF! The website is now live for all visitors.'
      });
    } catch (err: any) {
      setAdminFeedback({
        type: 'error',
        message: err?.message || 'Failed to update maintenance mode. Please try again.'
      });
    } finally {
      setIsUpdatingMode(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="text-white hover:text-white/80 flex items-center gap-2 font-medium drop-shadow-sm transition-colors text-sm sm:text-base cursor-pointer"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">My Profile</h1>
      </div>

      <div className="glass-panel overflow-hidden rounded-3xl shadow-2xl">
        {/* Header/Cover Area */}
        <div className="h-32 bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] relative">
            <div className="absolute -bottom-12 left-8">
                <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white">
                    {profile.profilePhoto ? (
                        <img 
                            src={profile.profilePhoto} 
                            alt={profile.name} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[#3C128D]">
                            <UserIcon className="w-12 h-12" />
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Profile Content */}
        <div className="pt-16 pb-8 px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-3xl font-black text-gray-900">{profile.name}</h2>
                      {isAdmin && (
                        <span className="px-3 py-1 bg-amber-100 border border-amber-300 text-amber-800 text-xs font-black rounded-full flex items-center gap-1 shadow-sm">
                          👑 Super Admin & Creator
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 font-medium flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4" />
                        {profile.email}
                    </p>
                </div>
                <button 
                    onClick={onGoToSettings}
                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all active:scale-95 cursor-pointer"
                >
                    Edit Profile
                </button>
            </div>

            {/* SUPER ADMIN / CREATOR CONTROL PANEL */}
            {isAdmin && (
              <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-purple-900/90 via-[#3C128D] to-[#1c0847] text-white border-2 border-amber-400/40 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/15 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-400 text-gray-950 flex items-center justify-center font-black shadow-lg">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white flex items-center gap-2">
                        GenPaperAI Global System Controls
                      </h3>
                      <p className="text-xs text-purple-200">
                        Owner Admin Panel for {profile.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold w-fit">
                    <Radio className={`w-3.5 h-3.5 ${isModeActive ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`} />
                    <span>Global Status:</span>
                    <span className={`font-black ${isModeActive ? 'text-amber-300' : 'text-emerald-300'}`}>
                      {isModeActive ? 'MAINTENANCE MODE' : 'LIVE (NORMAL)'}
                    </span>
                  </div>
                </div>

                {/* Feedback Notification */}
                {adminFeedback && (
                  <div className={`p-4 mb-5 rounded-xl text-xs sm:text-sm font-bold flex items-start gap-2.5 border ${
                    adminFeedback.type === 'success' 
                      ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200' 
                      : 'bg-rose-500/20 border-rose-400/40 text-rose-200'
                  }`}>
                    {adminFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                    )}
                    <span>{adminFeedback.message}</span>
                  </div>
                )}

                {/* Maintenance Toggle Card */}
                <div className="bg-black/30 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="space-y-1.5 max-w-lg">
                    <div className="flex items-center gap-2 text-sm font-black text-amber-300">
                      <Power className="w-4 h-4" />
                      <span>One-Click Public Maintenance Mode</span>
                    </div>
                    <p className="text-xs text-white/80 leading-relaxed">
                      {isModeActive 
                        ? 'The maintenance page is currently SHOWN to all public production visitors across all routes. Toggle this OFF to make the website live.' 
                        : 'The website is currently LIVE for all users. Toggle this ON anytime you want to perform updates or improvements.'}
                    </p>
                    {maintenanceConfig?.updatedAt && (
                      <p className="text-[10px] text-purple-300">
                        Last changed: {new Date(maintenanceConfig.updatedAt).toLocaleString()} {maintenanceConfig.updatedBy ? `by ${maintenanceConfig.updatedBy}` : ''}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleToggleMaintenance}
                    disabled={isUpdatingMode}
                    className={`px-6 py-3.5 rounded-xl font-black text-sm transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50 ${
                      isModeActive
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-gray-950 shadow-emerald-500/20'
                        : 'bg-amber-400 hover:bg-amber-300 text-gray-950 shadow-amber-400/20'
                    }`}
                  >
                    {isUpdatingMode ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Power className="w-4 h-4" />
                    )}
                    <span>
                      {isModeActive ? 'Turn OFF Maintenance Mode' : 'Turn ON Maintenance Mode'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Account Details</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-sm">Account Role</span>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                                isAdmin 
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                                  : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}>
                                <Shield className="w-3 h-3" />
                                {isAdmin ? 'Super Admin' : (profile.role || 'User')}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-sm">Login Provider</span>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                                profile.provider === 'google' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                profile.provider === 'microsoft' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                                'bg-rose-50 text-rose-600 border border-rose-100'
                            }`}>
                                {profile.provider === 'google' && <GoogleIcon className="w-3 h-3" />}
                                {profile.provider === 'microsoft' && <MicrosoftIcon className="w-3 h-3" />}
                                {profile.provider === 'email' && <EmailIcon className="w-3 h-3" />}
                                {profile.provider === 'email' ? 'e-mail' : profile.provider}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-sm">Member Since</span>
                            <span className="text-gray-800 font-bold text-sm flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                {new Date(profile.createdAt || Date.now()).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-sm">User ID</span>
                            <span className="text-gray-400 font-mono text-[10px] truncate max-w-[150px]">{profile.uid}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Current Preferences</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-sm">Active Theme</span>
                            <span className="text-gray-800 font-bold text-sm capitalize">{profile.selectedTheme}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-sm">Default Board</span>
                            <span className="text-gray-800 font-bold text-sm">{profile.defaultPaperSettings?.board || 'Not set'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-sm">Default Grade</span>
                            <span className="text-gray-800 font-bold text-sm">{profile.defaultPaperSettings?.grade || 'Not set'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
