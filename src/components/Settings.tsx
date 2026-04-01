import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Globe, Shield, Mail } from 'lucide-react';

interface SettingsProps {
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onBack: () => void;
}

const THEMES = [
  { id: 'default', name: 'Premium Vibrant', colors: 'from-[#3C128D] to-[#8A2CB0]' },
  { id: 'ocean', name: 'Deep Ocean', colors: 'from-[#0F2027] to-[#2C5364]' },
  { id: 'sunset', name: 'Golden Sunset', colors: 'from-[#FF512F] to-[#DD2476]' },
  { id: 'forest', name: 'Emerald Forest', colors: 'from-[#134E5E] to-[#71B280]' },
  { id: 'midnight', name: 'Midnight Sky', colors: 'from-[#232526] to-[#414345]' },
];

const Settings: React.FC<SettingsProps> = ({ profile, onUpdateProfile, onBack }) => {
  const [name, setName] = useState(profile.name);
  const [profilePhoto, setProfilePhoto] = useState(profile.profilePhoto || '');
  const [defaultSettings, setDefaultSettings] = useState(profile.defaultPaperSettings || {
    board: 'CBSE',
    grade: '10th',
    subject: 'Science',
    schoolName: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    console.log("Settings component mounted for user:", profile.uid);
  }, [profile.uid]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateProfile({
        name,
        profilePhoto: profilePhoto || null,
        defaultPaperSettings: defaultSettings
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="text-white hover:text-white/80 flex items-center gap-2 font-medium drop-shadow-sm transition-colors text-sm sm:text-base"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <div className="glass-panel p-6 rounded-2xl text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full border-4 border-white/30 overflow-hidden shadow-xl bg-white/10">
              {profilePhoto ? (
                <img 
                  src={profilePhoto} 
                  alt={name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={() => setProfilePhoto('')}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#3C128D] to-[#8A2CB0] flex items-center justify-center text-white text-3xl font-bold">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-800 truncate">{name}</h3>
            <p className="text-gray-500 text-sm mb-2 truncate">{profile.email}</p>
            <div className="flex justify-center mb-4">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                profile.provider === 'google' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                profile.provider === 'microsoft' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                'bg-rose-50 text-rose-600 border border-rose-100'
              }`}>
                {profile.provider === 'google' && <Globe className="w-3 h-3" />}
                {profile.provider === 'microsoft' && <Shield className="w-3 h-3" />}
                {profile.provider === 'email' && <Mail className="w-3 h-3" />}
                {profile.provider} Account
              </span>
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-widest font-bold">
              Member Since {new Date(profile.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="mt-6 glass-panel p-6 rounded-2xl">
             <h4 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">Quick Actions</h4>
             <button 
                onClick={handleSave}
                disabled={isSaving}
                className={`w-full py-3 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                    saveSuccess ? 'bg-green-500' : 'bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] hover:shadow-lg active:scale-95'
                }`}
             >
                {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : saveSuccess ? (
                    <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Saved!
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                        Save Changes
                    </>
                )}
             </button>
          </div>
        </div>

        {/* Settings Options */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Info Section */}
          <div className="glass-panel p-8 rounded-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-[#8A2CB0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Full Name</label>
                <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full p-3 bg-gray-50 rounded-xl text-gray-700 font-medium border border-gray-200 focus:border-[#8A2CB0] focus:ring-2 focus:ring-[#8A2CB0]/20 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Email Address (Read-only)</label>
                <div className="p-3 bg-gray-100 rounded-xl text-gray-500 font-medium border border-gray-200 cursor-not-allowed">
                    {profile.email}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Profile Photo URL</label>
                <input 
                    type="text"
                    value={profilePhoto}
                    onChange={(e) => setProfilePhoto(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full p-3 bg-gray-50 rounded-xl text-gray-700 font-medium border border-gray-200 focus:border-[#8A2CB0] focus:ring-2 focus:ring-[#8A2CB0]/20 transition-all outline-none"
                />
                <p className="text-[10px] text-gray-400 mt-1 ml-1 italic">Leave blank to use default avatar</p>
              </div>
            </div>
          </div>

          {/* Default Paper Settings */}
          <div className="glass-panel p-8 rounded-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-[#8A2CB0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Default Paper Settings
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Default Board</label>
                <select 
                    value={defaultSettings.board}
                    onChange={(e) => setDefaultSettings({...defaultSettings, board: e.target.value})}
                    className="w-full p-3 bg-gray-50 rounded-xl text-gray-700 font-medium border border-gray-200 focus:border-[#8A2CB0] outline-none"
                >
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE</option>
                    <option value="State Board">State Board</option>
                    <option value="IB">IB</option>
                    <option value="IGCSE">IGCSE</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Default Grade</label>
                <select 
                    value={defaultSettings.grade}
                    onChange={(e) => setDefaultSettings({...defaultSettings, grade: e.target.value})}
                    className="w-full p-3 bg-gray-50 rounded-xl text-gray-700 font-medium border border-gray-200 focus:border-[#8A2CB0] outline-none"
                >
                    {['6th', '7th', '8th', '9th', '10th', '11th', '12th'].map(g => (
                        <option key={g} value={g}>{g}</option>
                    ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Default School Name</label>
                <input 
                    type="text"
                    value={defaultSettings.schoolName}
                    onChange={(e) => setDefaultSettings({...defaultSettings, schoolName: e.target.value})}
                    placeholder="Enter your school name"
                    className="w-full p-3 bg-gray-50 rounded-xl text-gray-700 font-medium border border-gray-200 focus:border-[#8A2CB0] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Appearance & Theme Section */}
          <div className="glass-panel p-8 rounded-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-[#8A2CB0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.172-1.172a4 4 0 115.656 5.656L10 17.657" />
              </svg>
              Appearance & Theme
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => onUpdateProfile({ 
                    selectedTheme: theme.id,
                    preferences: { 
                      ...profile.preferences, 
                      themeColor: theme.id,
                      background: theme.id // Assuming background follows theme for now
                    } 
                  })}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 text-left relative overflow-hidden group ${
                    (profile.preferences?.themeColor || profile.selectedTheme) === theme.id 
                      ? 'border-[#3C128D] bg-white shadow-lg scale-[1.02]' 
                      : 'border-transparent bg-gray-50 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <div className={`absolute top-0 right-0 w-12 h-12 bg-gradient-to-br ${theme.colors} opacity-20 rounded-bl-3xl`}></div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-bold ${(profile.preferences?.themeColor || profile.selectedTheme) === theme.id ? 'text-[#3C128D]' : 'text-gray-600'}`}>
                      {theme.name}
                    </span>
                    {(profile.preferences?.themeColor || profile.selectedTheme) === theme.id && (
                      <svg className="w-5 h-5 text-[#3C128D]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className={`h-2 w-full rounded-full bg-gradient-to-r ${theme.colors}`}></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
