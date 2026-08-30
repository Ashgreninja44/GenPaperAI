import React, { useState, useEffect, useRef } from 'react';
import { 
  UserProfile, 
  ThemeAnimationConfig, 
  BackgroundMode, 
  CustomBackgroundConfig 
} from '../types';
import { 
  Globe, 
  Shield, 
  Mail, 
  Palette, 
  Sparkles, 
  Check, 
  ArrowRight, 
  Save, 
  User as UserIcon,
  Camera,
  RotateCcw,
  Image as ImageIcon,
  AlertCircle,
  UploadCloud,
  CheckCircle2,
  Sparkle
} from 'lucide-react';
import { GoogleIcon, MicrosoftIcon, EmailIcon } from './BrandIcons';
import { ImageCropModal } from './ImageCropModal';
import { 
  validateProfileImageFile, 
  uploadCustomProfilePicture, 
  deletePreviousProfilePicture,
  getEffectiveProfilePhoto,
  isUsingCustomProfilePicture
} from '../services/profilePhotoService';

interface SettingsProps {
  profile: UserProfile;
  currentTheme?: string;
  themeConfig?: ThemeAnimationConfig;
  backgroundMode?: BackgroundMode;
  customBackground?: CustomBackgroundConfig | null;
  liquidGlassEnabled?: boolean;
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<void> | void;
  onUpdateLiquidGlass?: (enabled: boolean) => Promise<void> | void;
  onNavigateToThemeStudio: () => void;
  onBack: () => void;
}

const THEME_NAMES: Record<string, string> = {
  default: 'Premium Vibrant',
  ocean: 'Deep Ocean',
  sunset: 'Golden Sunset',
  forest: 'Emerald Forest',
  midnight: 'Midnight Sky',
};

export const Settings: React.FC<SettingsProps> = ({ 
  profile, 
  currentTheme,
  themeConfig,
  backgroundMode = 'preset',
  customBackground = null,
  liquidGlassEnabled = true,
  onUpdateProfile, 
  onUpdateLiquidGlass,
  onNavigateToThemeStudio,
  onBack 
}) => {
  const [name, setName] = useState(profile.name);
  const [defaultSettings, setDefaultSettings] = useState(profile.defaultPaperSettings || {
    board: 'CBSE',
    grade: '10th',
    subject: 'Science',
    schoolName: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile Picture Upload States
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoSuccessMsg, setPhotoSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setName(profile.name);
    if (profile.defaultPaperSettings) {
      setDefaultSettings(profile.defaultPaperSettings);
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateProfile({
        name,
        defaultPaperSettings: defaultSettings
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error("Error saving settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Profile Picture File Selection Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset file input so selecting the same file again triggers change
    if (e.target) {
      e.target.value = '';
    }

    if (!file) return;

    setPhotoError(null);
    setPhotoSuccessMsg(null);

    const validation = validateProfileImageFile(file);
    if (!validation.valid) {
      setPhotoError(validation.error || 'Invalid image file.');
      return;
    }

    setCropFile(file);
  };

  // Upload Confirmed Cropped Image
  const handleConfirmCroppedImage = async (blob: Blob) => {
    setIsUploadingPhoto(true);
    setPhotoError(null);
    try {
      const oldCustomPhoto = profile.customProfilePhoto;
      const downloadUrl = await uploadCustomProfilePicture(profile.uid, blob);
      
      // Update profile with new custom picture
      await onUpdateProfile({
        customProfilePhoto: downloadUrl,
        profilePhoto: downloadUrl
      });

      // Cleanup old custom photo if exists
      if (oldCustomPhoto && oldCustomPhoto !== downloadUrl) {
        deletePreviousProfilePicture(oldCustomPhoto).catch(() => {});
      }

      setCropFile(null);
      setPhotoSuccessMsg('Custom profile picture updated successfully!');
      setTimeout(() => setPhotoSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error("Failed to upload profile picture:", err);
      setPhotoError(err?.message || 'Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Revert back to Authentication Provider Picture
  const handleUseAccountPicture = async () => {
    if (!isUsingCustom) return;
    setIsUploadingPhoto(true);
    setPhotoError(null);
    try {
      const oldCustomPhoto = profile.customProfilePhoto;
      const resolvedProviderPhoto = profile.providerPhoto || null;

      await onUpdateProfile({
        customProfilePhoto: null,
        profilePhoto: resolvedProviderPhoto
      });

      if (oldCustomPhoto) {
        deletePreviousProfilePicture(oldCustomPhoto).catch(() => {});
      }

      setPhotoSuccessMsg('Switched back to your account profile picture.');
      setTimeout(() => setPhotoSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error("Failed to reset profile picture:", err);
      setPhotoError(err?.message || 'Failed to reset profile picture.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const activeThemeId = profile.selectedTheme || currentTheme || 'default';
  const activeThemeName = THEME_NAMES[activeThemeId] || 'Premium Vibrant';
  const isAnimOn = themeConfig ? themeConfig.enableAnimations : true;

  // Active Effective Picture & Status
  const effectivePhoto = getEffectiveProfilePhoto(profile);
  const isUsingCustom = isUsingCustomProfilePicture(profile);

  const providerName = 
    profile.provider === 'google' ? 'Google' :
    profile.provider === 'microsoft' ? 'Microsoft' : 'Email';

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 animate-fade-in text-gray-900 pb-16">
      {/* Hidden File Input for Image Selection */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        className="hidden"
      />

      {/* Image Crop & Framing Modal */}
      {cropFile && (
        <ImageCropModal
          file={cropFile}
          onConfirm={handleConfirmCroppedImage}
          onCancel={() => setCropFile(null)}
          isProcessing={isUploadingPhoto}
        />
      )}

      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="text-white hover:text-white/80 flex items-center gap-2 font-medium drop-shadow-sm transition-colors text-sm sm:text-base cursor-pointer"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">Account Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl text-center">
            {/* Circular Avatar Container */}
            <div className="w-24 h-24 mx-auto mb-4 rounded-full border-4 border-white overflow-hidden shadow-xl bg-white/10 relative">
              {effectivePhoto ? (
                <img 
                  src={effectivePhoto} 
                  alt={name} 
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback to initial if image fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#3C128D] to-[#8A2CB0] flex items-center justify-center text-white text-3xl font-black rounded-full">
                  {name ? name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>

            <h3 className="text-xl font-black text-gray-800 truncate">{name}</h3>
            <p className="text-gray-500 text-sm mb-3 truncate font-medium">{profile.email}</p>
            
            <div className="flex justify-center mb-4">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                profile.provider === 'google' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                profile.provider === 'microsoft' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                'bg-rose-50 text-rose-600 border border-rose-100'
              }`}>
                {profile.provider === 'google' && <GoogleIcon className="w-3 h-3" />}
                {profile.provider === 'microsoft' && <MicrosoftIcon className="w-3 h-3" />}
                {profile.provider === 'email' && <EmailIcon className="w-3 h-3" />}
                {profile.provider === 'email' ? 'e-mail' : profile.provider} Account
              </span>
            </div>

            <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
              Member Since {new Date(profile.createdAt || Date.now()).toLocaleDateString()}
            </div>
          </div>

          {/* Save Action Card */}
          <div className="glass-panel p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl">
            <h4 className="text-xs font-black text-gray-500 mb-3 uppercase tracking-wider">Commit Changes</h4>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed font-medium">
              Save your updated full name and default paper preferences across all devices.
            </p>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className={`w-full py-3.5 rounded-xl font-black text-sm text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-95 ${
                saveSuccess 
                  ? 'bg-emerald-600 shadow-emerald-500/25' 
                  : 'bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] hover:from-[#2c0d68] hover:to-[#732494] shadow-purple-900/25'
              }`}
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : saveSuccess ? (
                <>
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>Changes Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Settings Form Column */}
        <div className="md:col-span-2 space-y-6">
          {/* ================================================== */}
          {/* PROFILE PICTURE CUSTOMIZATION SECTION */}
          {/* ================================================== */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-purple-50 text-[#8A2CB0]">
                  <Camera className="w-4 h-4" />
                </span>
                Profile Picture
              </h2>

              {/* Status Badge */}
              <div>
                {isUsingCustom ? (
                  <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-100 text-[#3C128D] border border-purple-200 flex items-center gap-1.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    CUSTOM PROFILE PICTURE
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5 shadow-sm">
                    {profile.provider === 'google' && <GoogleIcon className="w-3 h-3" />}
                    {profile.provider === 'microsoft' && <MicrosoftIcon className="w-3 h-3" />}
                    {profile.provider === 'email' && <EmailIcon className="w-3 h-3" />}
                    ACCOUNT PROFILE PICTURE
                  </span>
                )}
              </div>
            </div>

            {/* Notification & Alerts */}
            {photoError && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{photoError}</span>
              </div>
            )}

            {photoSuccessMsg && (
              <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm flex items-center gap-2.5 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{photoSuccessMsg}</span>
              </div>
            )}

            {/* Profile Picture Controls Container */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-5 rounded-2xl bg-gray-50/70 border border-gray-200/80">
              {/* Circular Avatar Preview */}
              <div className="relative group shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gradient-to-br from-[#3C128D] to-[#8A2CB0] flex items-center justify-center ring-2 ring-purple-200">
                  {effectivePhoto ? (
                    <img 
                      src={effectivePhoto} 
                      alt={name} 
                      className="w-full h-full object-cover rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-white text-3xl font-black">
                      {name ? name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload picture"
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-[#8A2CB0] hover:bg-[#3C128D] text-white shadow-lg border-2 border-white transition-transform active:scale-90 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Information & Action Buttons */}
              <div className="flex-1 text-center sm:text-left space-y-3">
                <div>
                  <h4 className="text-sm font-black text-gray-800">
                    {isUsingCustom ? 'Custom Profile Picture Active' : `${providerName} Account Picture Active`}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {isUsingCustom 
                      ? 'Your custom profile picture is currently being used throughout GenPaperAI instead of your authentication-provider picture.' 
                      : profile.providerPhoto 
                      ? `Your ${providerName} profile picture is currently being used automatically. You can upload a custom image anytime.` 
                      : 'You are currently using the standard monogram avatar. You can upload a custom photo to personalize your account.'}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="px-4 py-2.5 rounded-xl bg-[#8A2CB0] hover:bg-[#3C128D] text-white font-black text-xs sm:text-sm transition-all shadow-md hover:shadow-purple-900/20 active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Change Profile Picture</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleUseAccountPicture}
                    disabled={!isUsingCustom || isUploadingPhoto}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all border flex items-center gap-2 ${
                      isUsingCustom && !isUploadingPhoto
                        ? 'border-gray-300 bg-white hover:bg-gray-100 text-gray-700 shadow-sm cursor-pointer active:scale-95'
                        : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Use Account Picture</span>
                  </button>
                </div>

                {/* Helper Note */}
                <p className="text-[11px] text-gray-400 pt-1">
                  Supports JPG, PNG, or WebP (up to 5MB). Centered circular crop preserves natural aspect ratio.
                </p>
              </div>
            </div>
          </div>

          {/* Profile Information (Full Name & Email) */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl">
            <h2 className="text-lg font-black text-gray-900 mb-5 flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-purple-50 text-[#8A2CB0]">
                <UserIcon className="w-4 h-4" />
              </span>
              Profile Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full p-3.5 bg-gray-50 rounded-xl text-gray-800 font-bold border border-gray-200 focus:border-[#8A2CB0] focus:ring-2 focus:ring-[#8A2CB0]/20 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address (Read-Only)</label>
                <div className="p-3.5 bg-gray-100/80 rounded-xl text-gray-500 font-medium border border-gray-200 cursor-not-allowed text-sm">
                  {profile.email}
                </div>
              </div>
            </div>
          </div>

          {/* Appearance & Customization Section */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-purple-50 text-[#8A2CB0]">
                  <Palette className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-lg font-black text-gray-900">Appearance & Customization</h2>
                  <p className="text-xs text-gray-500 font-medium">Control Liquid Glass materials, themes, and wallpaper</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onNavigateToThemeStudio}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] text-white font-bold text-xs transition-all shadow-md hover:shadow-purple-900/20 active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Open Theme Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Liquid Glass Toggle */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-50/70 to-indigo-50/50 border border-purple-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  liquidGlassEnabled 
                    ? 'bg-[#8A2CB0] text-amber-300 shadow-md' 
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  <Sparkle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-gray-900">Liquid Glass Material</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      liquidGlassEnabled ? 'bg-purple-100 text-[#8A2CB0]' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {liquidGlassEnabled ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5 max-w-lg">
                    {liquidGlassEnabled 
                      ? 'Luminous translucent frosted glass and specular sheen are active across all UI surfaces.' 
                      : 'Disabled. Interface surfaces use clean, solid opaque materials with high contrast.'}
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0 self-end sm:self-center">
                <input 
                  type="checkbox" 
                  checked={liquidGlassEnabled} 
                  onChange={(e) => onUpdateLiquidGlass && onUpdateLiquidGlass(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-sm peer-checked:bg-gradient-to-r peer-checked:from-[#3C128D] peer-checked:to-[#8A2CB0]"></div>
              </label>
            </div>

            {/* Current Background Status Banner */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-700 shadow-sm shrink-0">
                  {backgroundMode === 'custom' ? <ImageIcon className="w-4 h-4 text-amber-500" /> : <Sparkles className="w-4 h-4 text-[#8A2CB0]" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800">
                    {backgroundMode === 'custom' ? 'Custom Wallpaper Background' : `Preset Environment: ${activeThemeName}`}
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    {backgroundMode === 'custom' 
                      ? (customBackground?.fileName ? `Image: ${customBackground.fileName}` : 'Personal uploaded wallpaper active')
                      : (isAnimOn ? 'Dynamic celestial & particle animations active' : 'Static background theme')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onNavigateToThemeStudio}
                className="text-xs font-black text-[#8A2CB0] hover:text-[#3C128D] flex items-center gap-1 cursor-pointer"
              >
                <span>{backgroundMode === 'custom' ? 'Adjust Wallpaper' : 'Customize Environment'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Default Paper Settings */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl">
            <h2 className="text-lg font-black text-gray-900 mb-5 flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Globe className="w-4 h-4" />
              </span>
              Default Paper Settings
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Default Board</label>
                <select 
                  value={defaultSettings.board}
                  onChange={(e) => setDefaultSettings({...defaultSettings, board: e.target.value})}
                  className="w-full p-3.5 bg-gray-50 rounded-xl text-gray-800 font-bold border border-gray-200 focus:border-[#8A2CB0] outline-none cursor-pointer"
                >
                  <option value="CBSE">CBSE (Central Board)</option>
                  <option value="ICSE">ICSE / ISC</option>
                  <option value="State Board">State Board</option>
                  <option value="IB">IB (International Baccalaureate)</option>
                  <option value="IGCSE">Cambridge / IGCSE</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Default Grade / Class</label>
                <select 
                  value={defaultSettings.grade}
                  onChange={(e) => setDefaultSettings({...defaultSettings, grade: e.target.value})}
                  className="w-full p-3.5 bg-gray-50 rounded-xl text-gray-800 font-bold border border-gray-200 focus:border-[#8A2CB0] outline-none cursor-pointer"
                >
                  {['6th', '7th', '8th', '9th', '10th', '11th', '12th'].map(g => (
                    <option key={g} value={g}>{g} Grade</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Default School Name</label>
                <input 
                  type="text"
                  value={defaultSettings.schoolName}
                  onChange={(e) => setDefaultSettings({...defaultSettings, schoolName: e.target.value})}
                  placeholder="e.g. St. Xavier's International Academy"
                  className="w-full p-3.5 bg-gray-50 rounded-xl text-gray-800 font-medium border border-gray-200 focus:border-[#8A2CB0] outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
