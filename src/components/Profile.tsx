import React, { useState } from 'react';
import { UserProfile, MaintenanceConfig } from '../types';
import { Shield, Mail, Calendar, User as UserIcon, Crown, ArrowRight, Settings as SettingsIcon, ShieldCheck, Sparkles, Camera } from 'lucide-react';
import { GoogleIcon, MicrosoftIcon, EmailIcon } from './BrandIcons';
import { isSuperAdmin, isPlatformAdmin, OWNER_EMAIL } from '../services/adminService';
import { getEffectiveProfilePhoto, isUsingCustomProfilePicture } from '../services/profilePhotoService';
import { AdminCenter } from './admin/AdminCenter';

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
  const [showAdminCenter, setShowAdminCenter] = useState(false);

  const isOwner = profile.email.toLowerCase() === OWNER_EMAIL.toLowerCase();
  const isSuper = isSuperAdmin(profile.email, profile.role);
  const isAdmin = isPlatformAdmin(profile.email, profile.role);
  const effectivePhoto = getEffectiveProfilePhoto(profile);
  const isCustomPhoto = isUsingCustomProfilePicture(profile);

  // If the admin opened the dedicated Admin Center, render it
  if (showAdminCenter && isAdmin) {
    return (
      <AdminCenter 
        user={profile} 
        onBackToProfile={() => setShowAdminCenter(false)} 
      />
    );
  }

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
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white ring-2 ring-purple-200 relative group">
                    {effectivePhoto ? (
                        <img 
                            src={effectivePhoto} 
                            alt={profile.name} 
                            className="w-full h-full object-cover rounded-full"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#3C128D] to-[#8A2CB0] flex items-center justify-center text-white text-3xl font-black rounded-full">
                            {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                    )}
                    {isCustomPhoto && (
                      <div className="absolute bottom-0 right-0 p-1 rounded-full bg-amber-400 text-gray-900 border-2 border-white shadow-sm" title="Custom Profile Picture">
                        <Sparkles className="w-3 h-3" />
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
                      {isSuper ? (
                        <span className="px-3 py-1 bg-amber-100 border border-amber-300 text-amber-800 text-xs font-black rounded-full flex items-center gap-1 shadow-sm">
                          <Crown className="w-3.5 h-3.5" />
                          {isOwner ? 'Platform Owner / Super Admin' : 'Super Admin'}
                        </span>
                      ) : isAdmin ? (
                        <span className="px-3 py-1 bg-indigo-100 border border-indigo-300 text-indigo-800 text-xs font-bold rounded-full flex items-center gap-1 shadow-sm">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Administrator
                        </span>
                      ) : null}
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

            {/* DEDICATED SEPARATE ADMIN CENTER ACCESS (VISIBLE ONLY TO ADMINS/SUPER ADMINS) */}
            {isAdmin && (
              <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-purple-950 via-[#3C128D] to-indigo-950 text-white border-2 border-amber-400/40 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1.5 z-10">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-amber-400 text-gray-950 font-black shadow-md">
                      <Crown className="w-5 h-5" />
                    </span>
                    <h3 className="text-lg font-black text-white">
                      GenPaperAI Admin Center
                    </h3>
                  </div>
                  <p className="text-xs text-purple-200 leading-relaxed max-w-xl">
                    Dedicated administrator area for User Roles, Gemini Model Registry, Platform Analytics, System Gates, Diagnostics, and Security Audit Logs.
                  </p>
                </div>

                <button
                  id="btn-open-admin-center"
                  onClick={() => setShowAdminCenter(true)}
                  className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-gray-950 font-black text-sm transition-all shadow-lg hover:shadow-amber-400/25 active:scale-95 flex items-center justify-center gap-2 shrink-0 cursor-pointer z-10"
                >
                  <span>Open Admin Center</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Account Details</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-sm">Account Role</span>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                                isSuper
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                                  : isAdmin
                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                  : profile.role === 'teacher'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}>
                                <Shield className="w-3 h-3" />
                                {isSuper ? 'Super Admin' : (profile.role || 'User')}
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
