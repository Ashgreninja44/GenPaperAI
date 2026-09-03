import React from 'react';
import { UserProfile, MaintenanceConfig, SubscriptionGlobalConfig } from '../types';
import { 
  Shield, 
  Mail, 
  Calendar, 
  Crown, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  ArrowRight,
  Clock,
  Layers
} from 'lucide-react';
import { GoogleIcon, MicrosoftIcon, EmailIcon, PhoneBrandIcon } from './BrandIcons';
import { isSuperAdmin, isPlatformAdmin, OWNER_EMAIL } from '../services/adminService';
import { getEffectiveProfilePhoto, isUsingCustomProfilePicture } from '../services/profilePhotoService';
import { 
  getUserSubscriptionStatus, 
  isUserPlusSubscriber, 
  DEFAULT_SUBSCRIPTION_CONFIG 
} from '../services/subscriptionService';

interface ProfileProps {
  profile: UserProfile;
  onBack: () => void;
  onGoToSettings: () => void;
  onGoToSubscription?: () => void;
  maintenanceConfig?: MaintenanceConfig | null;
  subscriptionConfig?: SubscriptionGlobalConfig | null;
}

const Profile: React.FC<ProfileProps> = ({ 
  profile, 
  onBack, 
  onGoToSettings,
  onGoToSubscription,
  maintenanceConfig,
  subscriptionConfig 
}) => {
  const isOwner = profile.email.toLowerCase() === OWNER_EMAIL.toLowerCase();
  const isSuper = isSuperAdmin(profile.email, profile.role);
  const isAdmin = isPlatformAdmin(profile.email, profile.role);
  const isPlus = isUserPlusSubscriber(profile);
  const effectivePhoto = getEffectiveProfilePhoto(profile);
  const isCustomPhoto = isUsingCustomProfilePicture(profile);
  const isPricingVisible = subscriptionConfig ? (subscriptionConfig.pricingVisible !== false) : true;
  const subStatus = getUserSubscriptionStatus(profile, subscriptionConfig || DEFAULT_SUBSCRIPTION_CONFIG);

  // Can the user access subscription management / storefront?
  const canAccessSubscription = (isSuper || isPlus || isPricingVisible) && !!onGoToSubscription;

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in text-gray-900">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="text-white hover:text-white/80 flex items-center gap-2 font-medium drop-shadow-sm transition-colors text-sm sm:text-base cursor-pointer"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">My Profile</h1>
      </div>

      <div className="glass-panel overflow-hidden rounded-3xl shadow-2xl bg-white/95 backdrop-blur-xl">
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
                      ) : isPlus ? (
                        <span className="px-3 py-1 bg-purple-100 border border-purple-300 text-purple-900 text-xs font-black rounded-full flex items-center gap-1 shadow-sm">
                          <Sparkles className="w-3.5 h-3.5 text-[#8A2CB0]" />
                          GenPaperAI Plus
                        </span>
                      ) : null}
                    </div>
                    <p className="text-gray-500 font-medium flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4" />
                        {profile.email}
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                  {canAccessSubscription && (
                    <button 
                        onClick={onGoToSubscription}
                        className="px-5 py-2.5 bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] hover:from-[#320f77] hover:to-[#772499] text-white font-black text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>{isPlus || isSuper ? 'Manage Subscription' : 'Upgrade Plan'}</span>
                    </button>
                  )}
                  <button 
                      onClick={onGoToSettings}
                      className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all active:scale-95 cursor-pointer"
                  >
                      Edit Profile
                  </button>
                </div>
            </div>

            {/* Subscription & Entitlement Banner */}
            <div className="mb-6 p-5 rounded-2xl border bg-gradient-to-r from-purple-50/70 to-indigo-50/70 border-purple-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                  isOwner || isSuper
                    ? 'bg-amber-100 text-amber-700'
                    : isPlus
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {isOwner || isSuper ? (
                    <Crown className="w-5 h-5" />
                  ) : isPlus ? (
                    <Sparkles className="w-5 h-5" />
                  ) : (
                    <Layers className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-gray-900">
                      {subStatus.planName}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      isPlus || isSuper ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {isPlus || isSuper ? 'Ad-Free Active' : 'Free Tier'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-0.5 flex items-center gap-2">
                    <span>Valid until: <strong>{subStatus.formattedExpiration}</strong></span>
                    <span>•</span>
                    <span>Source: {subStatus.source}</span>
                  </p>
                </div>
              </div>

              {canAccessSubscription && (
                <button
                  onClick={onGoToSubscription}
                  className="px-4 py-2 bg-white hover:bg-gray-50 text-purple-900 font-black text-xs rounded-xl shadow-sm border border-purple-200 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <span>{isPlus || isSuper ? 'View Entitlements' : 'Upgrade Plan'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

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
                                profile.provider === 'phone' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                'bg-rose-50 text-rose-600 border border-rose-100'
                            }`}>
                                {profile.provider === 'google' && <GoogleIcon className="w-3 h-3" />}
                                {profile.provider === 'microsoft' && <MicrosoftIcon className="w-3 h-3" />}
                                {profile.provider === 'email' && <EmailIcon className="w-3 h-3" />}
                                {profile.provider === 'phone' && <PhoneBrandIcon className="w-3 h-3" />}
                                {profile.provider === 'email' ? 'e-mail' : profile.provider === 'phone' ? 'Mobile Phone' : profile.provider}
                            </span>
                        </div>
                        {profile.phoneNumber && (
                          <div className="flex items-center justify-between">
                              <span className="text-gray-500 text-sm">Mobile Phone</span>
                              <span className="text-gray-800 font-bold text-sm font-mono">{profile.phoneNumber}</span>
                          </div>
                        )}
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
