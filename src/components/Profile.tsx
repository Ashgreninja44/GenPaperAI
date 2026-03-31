import React from 'react';
import { UserProfile } from '../types';
import { Globe, Shield, Mail, Calendar, User as UserIcon } from 'lucide-react';

interface ProfileProps {
  profile: UserProfile;
  onBack: () => void;
  onGoToSettings: () => void;
}

const Profile: React.FC<ProfileProps> = ({ profile, onBack, onGoToSettings }) => {
  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="text-white hover:text-white/80 flex items-center gap-2 font-medium drop-shadow-sm transition-colors text-sm sm:text-base"
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
                    <h2 className="text-3xl font-black text-gray-900">{profile.name}</h2>
                    <p className="text-gray-500 font-medium flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4" />
                        {profile.email}
                    </p>
                </div>
                <button 
                    onClick={onGoToSettings}
                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all active:scale-95"
                >
                    Edit Profile
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Account Details</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-sm">Login Provider</span>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                                profile.provider === 'google' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                profile.provider === 'microsoft' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                                'bg-rose-50 text-rose-600 border border-rose-100'
                            }`}>
                                {profile.provider === 'google' && <Globe className="w-3 h-3" />}
                                {profile.provider === 'microsoft' && <Shield className="w-3 h-3" />}
                                {profile.provider === 'email' && <Mail className="w-3 h-3" />}
                                {profile.provider}
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
