import React, { useState } from 'react';
import { 
  UserProfile, 
  SubscriptionGlobalConfig, 
  SubscriptionPlanConfig 
} from '../types';
import { 
  Crown, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  Calendar, 
  Layers, 
  X, 
  ExternalLink,
  Lock,
  ArrowRight,
  Info,
  Clock
} from 'lucide-react';
import { 
  getUserSubscriptionStatus, 
  isUserPlusSubscriber, 
  DEFAULT_SUBSCRIPTION_CONFIG 
} from '../services/subscriptionService';
import { isSuperAdmin, OWNER_EMAIL } from '../services/adminService';

interface SubscriptionViewProps {
  user: UserProfile;
  config?: SubscriptionGlobalConfig | null;
  onBack: () => void;
  onNavigateToSettings?: () => void;
}

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({
  user,
  config,
  onBack,
  onNavigateToSettings
}) => {
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const effectiveConfig = config || DEFAULT_SUBSCRIPTION_CONFIG;
  const statusInfo = getUserSubscriptionStatus(user, effectiveConfig);
  const isSuper = isSuperAdmin(user.email, user.role);
  const isOwner = user.email.trim().toLowerCase() === OWNER_EMAIL.toLowerCase();
  const isPlus = isUserPlusSubscriber(user);

  const freePlan = effectiveConfig.plans.free;
  const plusPlan = effectiveConfig.plans.plus;

  // Determine whether to show the pricing cards
  // Super Admins always see pricing. Normal users see pricing only if pricingVisible is TRUE.
  const isPricingVisible = effectiveConfig ? (effectiveConfig.pricingVisible !== false) : true;
  const canViewPricing = isPricingVisible || isSuper;

  // If pricing is turned off and the user is NOT Plus and NOT Super Admin, do not render the storefront
  if (!canViewPricing && !isPlus && !isSuper) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 animate-fade-in text-gray-900 pb-16">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="text-white hover:text-white/80 flex items-center gap-2 font-bold drop-shadow-sm transition-colors text-sm sm:text-base cursor-pointer"
        >
          ← Back to Dashboard
        </button>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            GenPaperAI Plans & Entitlements
          </span>
        </div>
      </div>

      {/* Main Title Section */}
      <div className="text-center max-w-2xl mx-auto mb-10 text-white">
        <h1 className="text-3xl sm:text-4xl font-black drop-shadow-md tracking-tight mb-3">
          Subscription & Plans
        </h1>
        <p className="text-sm sm:text-base text-white/90 leading-relaxed font-medium">
          Choose the right tier for your teaching workflow. Transparent limits, zero hidden charges, and reliable examination tools.
        </p>
      </div>

      {/* Current Subscription Status Card */}
      <div className="glass-panel bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/50 mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
              isOwner || isSuper
                ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white ring-4 ring-amber-100'
                : isPlus
                ? 'bg-gradient-to-br from-[#8A2CB0] to-purple-600 text-white ring-4 ring-purple-100'
                : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 ring-4 ring-gray-100'
            }`}>
              {isOwner || isSuper ? (
                <Crown className="w-7 h-7" />
              ) : isPlus ? (
                <Sparkles className="w-7 h-7" />
              ) : (
                <Layers className="w-7 h-7" />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                  {statusInfo.planName}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                  isPlus || isSuper
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  {isPlus || isSuper ? 'Active' : 'Standard'}
                </span>
                {isOwner && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                    <Crown className="w-3 h-3" /> Owner
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium flex items-center gap-2">
                <span>Account: <strong>{user.email}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {isPlus || isSuper ? (
              <div className="px-4 py-2 bg-purple-50 border border-purple-200 rounded-2xl">
                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">Status</span>
                <span className="text-sm font-black text-purple-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  {statusInfo.formattedExpiration}
                </span>
              </div>
            ) : canViewPricing ? (
              <button
                onClick={() => setShowCheckoutModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] hover:from-[#320f77] hover:to-[#772499] text-white font-black text-sm rounded-2xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Upgrade to Plus</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        </div>

        {/* Subscription Metadata & Entitlement Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
              Subscription Source
            </span>
            <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-purple-500" />
              {statusInfo.source}
            </span>
          </div>

          <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
              Valid From
            </span>
            <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              {statusInfo.formattedStartDate}
            </span>
          </div>

          <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
              Valid Until
            </span>
            <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              {statusInfo.formattedExpiration}
            </span>
          </div>

          <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
              Advertisement Status
            </span>
            <span className={`text-xs font-bold flex items-center gap-1.5 ${
              isPlus || isSuper ? 'text-emerald-700' : 'text-amber-700'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              {isPlus || isSuper ? 'Ad-Free (Suppressed)' : 'Standard (Enabled)'}
            </span>
          </div>
        </div>

        {statusInfo.grantReason && (
          <div className="mt-4 p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-xs text-purple-900 flex items-center gap-2">
            <Info className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Note: <strong>{statusInfo.grantReason}</strong> {statusInfo.grantedBy ? `(by ${statusInfo.grantedBy})` : ''}</span>
          </div>
        )}
      </div>

      {/* Pricing Plans Section */}
      {canViewPricing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* FREE PLAN */}
          <div className="glass-panel bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl border border-white/40 flex flex-col justify-between transition-all hover:shadow-2xl">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-black uppercase tracking-wider rounded-full">
                    {freePlan.name}
                  </span>
                  <h3 className="text-2xl font-black text-gray-900 mt-2">
                    {freePlan.name} Tier
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-gray-900">
                    {freePlan.currency}{freePlan.price}
                  </div>
                  <span className="text-xs font-bold text-gray-500">
                    {freePlan.billingPeriodDisplay}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-600 mb-6 leading-relaxed">
                {freePlan.description}
              </p>

              <div className="space-y-3 pt-4 border-t border-gray-100 mb-8">
                <p className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">
                  Included Free Entitlements:
                </p>
                {freePlan.featuresList.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-700">
                    <div className="w-4 h-4 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              {!isPlus && !isSuper ? (
                <div className="w-full py-3 px-4 bg-gray-100 text-gray-600 font-bold text-xs rounded-2xl text-center border border-gray-200">
                  Current Active Plan
                </div>
              ) : (
                <div className="w-full py-3 px-4 bg-gray-50 text-gray-400 font-medium text-xs rounded-2xl text-center">
                  Base Plan
                </div>
              )}
            </div>
          </div>

          {/* PLUS PLAN */}
          <div className="glass-panel bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-purple-500 relative flex flex-col justify-between transition-all hover:shadow-purple-500/20 hover:shadow-2xl">
            {/* Highlight Badge */}
            <div className="absolute -top-3.5 right-8">
              <span className="px-4 py-1 bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] text-white text-xs font-black uppercase tracking-widest rounded-full shadow-lg flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {plusPlan.badge || 'Recommended'}
              </span>
            </div>

            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="px-3 py-1 bg-purple-100 text-purple-900 text-xs font-black uppercase tracking-wider rounded-full">
                    {plusPlan.name}
                  </span>
                  <h3 className="text-2xl font-black text-purple-950 mt-2">
                    {plusPlan.name}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-[#8A2CB0]">
                    {plusPlan.currency}{plusPlan.price}
                  </div>
                  <span className="text-xs font-bold text-purple-700">
                    / {plusPlan.billingPeriodDisplay}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-600 mb-6 leading-relaxed">
                {plusPlan.description}
              </p>

              <div className="space-y-3 pt-4 border-t border-purple-100 mb-8">
                <p className="text-[11px] font-black uppercase tracking-wider text-purple-900 mb-2">
                  Plus Member Benefits:
                </p>
                {plusPlan.featuresList.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-800 font-medium">
                    <div className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              {isOwner || isSuper ? (
                <div className="w-full py-3.5 px-4 bg-amber-50 border border-amber-300 text-amber-900 font-black text-xs rounded-2xl text-center flex items-center justify-center gap-2 shadow-sm">
                  <Crown className="w-4 h-4 text-amber-600" />
                  <span>Platform Owner & Super Admin (Full Access)</span>
                </div>
              ) : isPlus ? (
                <div className="w-full py-3.5 px-4 bg-emerald-50 border border-emerald-300 text-emerald-900 font-black text-xs rounded-2xl text-center flex items-center justify-center gap-2 shadow-sm">
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  <span>Current Active Plan ({statusInfo.formattedExpiration})</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowCheckoutModal(true)}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] hover:from-[#320f77] hover:to-[#772499] text-white font-black text-sm rounded-2xl shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Upgrade to Plus — {plusPlan.currency}{plusPlan.price} / {plusPlan.billingPeriodDisplay}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* When customer-facing pricing is turned OFF by Super Admin */
        <div className="glass-panel bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50 text-center max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-2">
            Managed Subscription Enrollment
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
            Public self-service plan upgrades are currently paused or managed through institutional invitation. Your active plan entitlements remain fully effective.
          </p>
          {isPlus && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-900 inline-flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Your GenPaperAI Plus access is active and fully honored.</span>
            </div>
          )}
        </div>
      )}

      {/* Honest "Checkout Integration in Progress" Modal (No fake payments) */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 text-gray-900 relative">
            <button 
              onClick={() => setShowCheckoutModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-[#8A2CB0]" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">
              Online Checkout Integration In Progress
            </h3>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
              Direct payment gateway integration (UPI, Credit/Debit Cards, NetBanking) for <strong>GenPaperAI Plus ({plusPlan.currency}{plusPlan.price} / {plusPlan.billingPeriodDisplay})</strong> is currently being finalized.
            </p>

            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 text-xs text-purple-900 space-y-2 mb-6">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Need instant access?</strong> Institutional licenses, beta testing access, and manual administrator activations can be granted directly by the platform administration team.
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="w-full py-3 px-4 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Understood, Return to Plans
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionView;
