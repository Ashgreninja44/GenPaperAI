import React, { useState, useMemo } from 'react';
import { 
  UserProfile, 
  SubscriptionGlobalConfig, 
  SubscriptionDuration, 
  SubscriptionSource 
} from '../../types';
import { 
  Crown, 
  Sparkles, 
  Search, 
  ShieldCheck, 
  UserPlus, 
  RotateCcw, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  HelpCircle,
  Eye,
  EyeOff,
  UserCheck,
  Zap,
  Tag,
  FileText
} from 'lucide-react';
import { 
  updateSubscriptionGlobalConfig, 
  grantUserSubscription, 
  revokeUserSubscription, 
  extendUserSubscription,
  formatDurationLabel,
  isUserPlusSubscriber,
  getUserSubscriptionStatus,
  DEFAULT_SUBSCRIPTION_CONFIG
} from '../../services/subscriptionService';
import { isSuperAdmin, OWNER_EMAIL } from '../../services/adminService';

interface AdminSubscriptionsProps {
  currentUser: UserProfile;
  users: UserProfile[];
  config?: SubscriptionGlobalConfig | null;
  onRefreshUsers?: () => void;
}

export const AdminSubscriptions: React.FC<AdminSubscriptionsProps> = ({
  currentUser,
  users,
  config,
  onRefreshUsers
}) => {
  const [subConfig, setSubConfig] = useState<SubscriptionGlobalConfig>(
    config || DEFAULT_SUBSCRIPTION_CONFIG
  );

  // Synchronize state with real-time incoming config prop
  React.useEffect(() => {
    if (config) {
      setSubConfig(config);
    }
  }, [config]);

  const [isUpdatingConfig, setIsUpdatingConfig] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | 'plus' | 'free' | 'super_admin'>('all');

  // Modals state
  const [selectedUserForGrant, setSelectedUserForGrant] = useState<UserProfile | null>(null);
  const [selectedUserForExtend, setSelectedUserForExtend] = useState<UserProfile | null>(null);
  const [selectedUserForRevoke, setSelectedUserForRevoke] = useState<UserProfile | null>(null);

  // Form states for Granting
  const [grantDuration, setGrantDuration] = useState<SubscriptionDuration>('6_months');
  const [grantSource, setGrantSource] = useState<SubscriptionSource>('Admin Grant');
  const [grantReason, setGrantReason] = useState('');
  const [isSubmittingGrant, setIsSubmittingGrant] = useState(false);

  // Form states for Extending
  const [extendDuration, setExtendDuration] = useState<SubscriptionDuration>('6_months');
  const [extendReason, setExtendReason] = useState('');
  const [isSubmittingExtend, setIsSubmittingExtend] = useState(false);

  // Form states for Revoking
  const [revokeReason, setRevokeReason] = useState('');
  const [isSubmittingRevoke, setIsSubmittingRevoke] = useState(false);

  // Notifications
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isSuper = isSuperAdmin(currentUser.email, currentUser.role);

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const isOwner = u.email.trim().toLowerCase() === OWNER_EMAIL.toLowerCase();
      const isUserSuper = isSuperAdmin(u.email, u.role);
      const isPlus = isUserPlusSubscriber(u);

      // Search match
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        u.email.toLowerCase().includes(query) || 
        u.name.toLowerCase().includes(query) || 
        u.uid.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      // Tier filter
      if (tierFilter === 'all') return true;
      if (tierFilter === 'super_admin') return isOwner || isUserSuper;
      if (tierFilter === 'plus') return isPlus && !isOwner && !isUserSuper;
      if (tierFilter === 'free') return !isPlus && !isOwner && !isUserSuper;

      return true;
    });
  }, [users, searchQuery, tierFilter]);

  // Handle visibility master toggle
  const handleTogglePricingVisibility = async () => {
    setIsUpdatingConfig(true);
    setFeedback(null);
    try {
      const nextState = !subConfig.pricingVisible;
      const updatedConfig: SubscriptionGlobalConfig = {
        ...subConfig,
        pricingVisible: nextState
      };
      await updateSubscriptionGlobalConfig(updatedConfig, currentUser.email, currentUser.role);
      setSubConfig(updatedConfig);
      setFeedback({
        type: 'success',
        message: `Customer-facing pricing visibility set to ${nextState ? 'ENABLED (Visible)' : 'DISABLED (Hidden)'}.`
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Failed to update pricing visibility setting.'
      });
    } finally {
      setIsUpdatingConfig(false);
    }
  };

  // Handle Granting Plus
  const handleExecuteGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForGrant) return;

    setIsSubmittingGrant(true);
    setFeedback(null);
    try {
      await grantUserSubscription(
        selectedUserForGrant.uid,
        selectedUserForGrant.email,
        'plus',
        grantDuration,
        grantSource,
        grantReason,
        currentUser.email,
        currentUser.role
      );

      setFeedback({
        type: 'success',
        message: `Successfully granted GenPaperAI Plus to ${selectedUserForGrant.email} (${formatDurationLabel(grantDuration)}).`
      });
      setSelectedUserForGrant(null);
      setGrantReason('');
      if (onRefreshUsers) onRefreshUsers();
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Failed to grant subscription.'
      });
    } finally {
      setIsSubmittingGrant(false);
    }
  };

  // Handle Extending Plus
  const handleExecuteExtend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForExtend) return;

    setIsSubmittingExtend(true);
    setFeedback(null);
    try {
      const currentExpiry = selectedUserForExtend.subscriptionDetails?.expirationDate;
      await extendUserSubscription(
        selectedUserForExtend.uid,
        selectedUserForExtend.email,
        extendDuration,
        extendReason,
        currentUser.email,
        currentUser.role,
        currentExpiry
      );

      setFeedback({
        type: 'success',
        message: `Extended subscription for ${selectedUserForExtend.email} by +${formatDurationLabel(extendDuration)}.`
      });
      setSelectedUserForExtend(null);
      setExtendReason('');
      if (onRefreshUsers) onRefreshUsers();
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Failed to extend subscription.'
      });
    } finally {
      setIsSubmittingExtend(false);
    }
  };

  // Handle Revoking Plus
  const handleExecuteRevoke = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForRevoke) return;

    setIsSubmittingRevoke(true);
    setFeedback(null);
    try {
      await revokeUserSubscription(
        selectedUserForRevoke.uid,
        selectedUserForRevoke.email,
        revokeReason,
        currentUser.email,
        currentUser.role
      );

      setFeedback({
        type: 'success',
        message: `Revoked subscription from ${selectedUserForRevoke.email}. User reverted to Free tier.`
      });
      setSelectedUserForRevoke(null);
      setRevokeReason('');
      if (onRefreshUsers) onRefreshUsers();
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Failed to revoke subscription.'
      });
    } finally {
      setIsSubmittingRevoke(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-gray-900">
      {/* Toast Feedback */}
      {feedback && (
        <div className={`p-4 rounded-2xl border shadow-lg flex items-center justify-between gap-3 ${
          feedback.type === 'success'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
            : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}>
          <div className="flex items-center gap-2 text-sm font-bold">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button 
            onClick={() => setFeedback(null)}
            className="text-xs font-black opacity-70 hover:opacity-100 p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header / Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer-Facing Visibility Toggle Card */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  subConfig.pricingVisible ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {subConfig.pricingVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">
                    Customer-Facing Pricing Visibility
                  </h3>
                  <span className="text-xs text-gray-500 font-medium">
                    Controls whether normal users see subscription plans & the Upgrade button.
                  </span>
                </div>
              </div>

              {/* Master Switch Button */}
              <button
                type="button"
                onClick={handleTogglePricingVisibility}
                disabled={isUpdatingConfig}
                className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                  subConfig.pricingVisible ? 'bg-[#8A2CB0]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    subConfig.pricingVisible ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl text-xs text-gray-600 leading-relaxed border border-gray-100 mt-2">
              <p>
                <strong>Status:</strong> {subConfig.pricingVisible ? (
                  <span className="text-emerald-700 font-bold">Publicly Visible (Normal users can browse Free & Plus plans)</span>
                ) : (
                  <span className="text-amber-800 font-bold">Hidden from Customers (Existing Plus subscribers retain all benefits)</span>
                )}
              </p>
              <p className="mt-1 text-[11px] text-gray-500">
                Note: Disabling visibility never cancels active subscriptions or disables Plus privileges. It strictly controls customer-facing UI display.
              </p>
            </div>
          </div>
        </div>

        {/* Current Active Plan Card */}
        <div className="bg-gradient-to-br from-[#3C128D] to-[#8A2CB0] text-white rounded-3xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider">
                Configured Plan
              </span>
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <h4 className="text-xl font-black">{subConfig.plans.plus.name}</h4>
            <div className="text-2xl font-black text-amber-300 mt-1">
              {subConfig.plans.plus.currency}{subConfig.plans.plus.price} <span className="text-xs font-bold text-white/80">/ {subConfig.plans.plus.billingPeriodDisplay}</span>
            </div>
            <p className="text-xs text-white/80 mt-2 leading-relaxed">
              Standard pricing stored centrally. Ad-free, priority generation, and elevated quota limits.
            </p>
          </div>
          <div className="pt-4 border-t border-white/20 mt-4 text-[11px] text-white/70">
            Admins have full authority to grant or revoke subscriptions manually below.
          </div>
        </div>
      </div>

      {/* Manual Subscription Administration Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#8A2CB0]" />
              <span>User Subscription & Entitlement Management</span>
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Search any registered user to inspect their status, grant GenPaperAI Plus, extend durations, or revoke access.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-500">Filter:</span>
            <button
              onClick={() => setTierFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                tierFilter === 'all' ? 'bg-[#3C128D] text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({users.length})
            </button>
            <button
              onClick={() => setTierFilter('plus')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                tierFilter === 'plus' ? 'bg-[#8A2CB0] text-white shadow-sm' : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
              }`}
            >
              Plus Subscribers
            </button>
            <button
              onClick={() => setTierFilter('free')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                tierFilter === 'free' ? 'bg-gray-800 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Free Users
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="my-6 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by email, name, or UID..."
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8A2CB0]/30 focus:border-[#8A2CB0] transition-all"
          />
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50 text-[11px] font-black uppercase tracking-wider text-gray-500">
                <th className="py-3.5 px-4 rounded-l-xl">User</th>
                <th className="py-3.5 px-4">Plan & Status</th>
                <th className="py-3.5 px-4">Subscription Source</th>
                <th className="py-3.5 px-4">Expiration</th>
                <th className="py-3.5 px-4 text-right rounded-r-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 font-medium">
                    No users matching the query or filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((targetUser) => {
                  const isTargetOwner = targetUser.email.trim().toLowerCase() === OWNER_EMAIL.toLowerCase();
                  const isTargetSuper = isSuperAdmin(targetUser.email, targetUser.role);
                  const isPlus = isUserPlusSubscriber(targetUser);
                  const statusInfo = getUserSubscriptionStatus(targetUser, subConfig);

                  return (
                    <tr key={targetUser.uid} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-[#8A2CB0] flex items-center justify-center font-bold text-xs shrink-0">
                            {(targetUser.name || targetUser.email || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-gray-900 truncate">
                              {targetUser.name || 'Anonymous User'}
                            </div>
                            <div className="text-[11px] text-gray-500 truncate font-mono">
                              {targetUser.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        {isTargetOwner || isTargetSuper ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                            <Crown className="w-3 h-3" />
                            {isTargetOwner ? 'Owner' : 'Super Admin'}
                          </span>
                        ) : isPlus ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-900 border border-purple-300">
                            <Sparkles className="w-3 h-3 text-[#8A2CB0]" />
                            GenPaperAI Plus
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-200">
                            Free Tier
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 font-medium text-gray-600">
                        {isTargetOwner || isTargetSuper ? (
                          <span className="text-[11px] font-bold text-amber-800">System Privilege</span>
                        ) : (
                          <span className="text-[11px] font-bold text-gray-700">{statusInfo.source}</span>
                        )}
                      </td>

                      <td className="py-4 px-4 font-medium text-gray-600">
                        <span className="text-[11px]">{statusInfo.formattedExpiration}</span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        {isTargetOwner ? (
                          <span className="text-[11px] font-bold text-gray-400 italic">Protected</span>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            {!isPlus ? (
                              <button
                                onClick={() => {
                                  setSelectedUserForGrant(targetUser);
                                  setGrantDuration('6_months');
                                  setGrantSource('Admin Grant');
                                  setGrantReason('');
                                }}
                                className="px-3 py-1.5 bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] hover:from-[#320f77] hover:to-[#772499] text-white font-bold text-[11px] rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <UserPlus className="w-3.5 h-3.5" />
                                <span>Grant Plus</span>
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedUserForExtend(targetUser);
                                    setExtendDuration('6_months');
                                    setExtendReason('');
                                  }}
                                  className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-bold text-[11px] rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                                  title="Extend subscription duration"
                                >
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>Extend</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedUserForRevoke(targetUser);
                                    setRevokeReason('');
                                  }}
                                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                                  title="Revoke subscription"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Revoke</span>
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================== */}
      {/* 1. GRANT PLUS MODAL                        */}
      {/* ========================================== */}
      {selectedUserForGrant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 text-gray-900 relative">
            <button 
              onClick={() => setSelectedUserForGrant(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#8A2CB0] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">Grant GenPaperAI Plus</h3>
                <p className="text-xs text-gray-500">Provide direct subscriber entitlements to this user account.</p>
              </div>
            </div>

            <form onSubmit={handleExecuteGrant} className="space-y-4">
              {/* User info display */}
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-xs">
                <span className="text-gray-400 font-bold uppercase tracking-wider block text-[10px]">Target User</span>
                <span className="font-bold text-gray-900 text-sm block mt-0.5">{selectedUserForGrant.name || 'Anonymous User'}</span>
                <span className="text-gray-500 font-mono text-xs">{selectedUserForGrant.email}</span>
              </div>

              {/* Plan selector */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-1.5">
                  Plan Entitlement
                </label>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl text-xs font-bold text-purple-950 flex items-center justify-between">
                  <span>GenPaperAI Plus ({subConfig.plans.plus.currency}{subConfig.plans.plus.price} / {subConfig.plans.plus.billingPeriodDisplay})</span>
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                </div>
              </div>

              {/* Duration selector */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-1.5">
                  Grant Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['1_month', '3_months', '6_months', '1_year', 'lifetime'] as SubscriptionDuration[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setGrantDuration(d)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        grantDuration === d
                          ? 'bg-[#8A2CB0] text-white border-[#8A2CB0] shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {formatDurationLabel(d)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subscription Source */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-1.5">
                  Subscription Source
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Admin Grant', 'Paid', 'Promotional', 'Beta/Test'] as SubscriptionSource[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setGrantSource(s)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        grantSource === s
                          ? 'bg-[#3C128D] text-white border-[#3C128D] shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason input */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-1.5">
                  Grant Reason / Note (Optional)
                </label>
                <input
                  type="text"
                  value={grantReason}
                  onChange={(e) => setGrantReason(e.target.value)}
                  placeholder="e.g. Beta tester, Institutional partnership, Promotion"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8A2CB0]/30"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedUserForGrant(null)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingGrant}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] hover:from-[#320f77] hover:to-[#772499] text-white font-black text-xs rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isSubmittingGrant ? 'Granting...' : 'Grant Subscription'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 2. EXTEND SUBSCRIPTION MODAL               */}
      {/* ========================================== */}
      {selectedUserForExtend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 text-gray-900 relative">
            <button 
              onClick={() => setSelectedUserForExtend(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#8A2CB0] flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">Extend Subscription</h3>
                <p className="text-xs text-gray-500">Add more time to this user's active Plus entitlement.</p>
              </div>
            </div>

            <form onSubmit={handleExecuteExtend} className="space-y-4">
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-xs">
                <span className="text-gray-400 font-bold uppercase tracking-wider block text-[10px]">Target User</span>
                <span className="font-bold text-gray-900 text-sm block mt-0.5">{selectedUserForExtend.name || 'Anonymous User'}</span>
                <span className="text-gray-500 font-mono text-xs">{selectedUserForExtend.email}</span>
                <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between text-[11px]">
                  <span className="text-gray-500">Current Expiry:</span>
                  <span className="font-bold text-purple-900">
                    {selectedUserForExtend.subscriptionDetails?.expirationDate 
                      ? new Date(selectedUserForExtend.subscriptionDetails.expirationDate).toLocaleDateString()
                      : 'Lifetime Access'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-1.5">
                  Extension Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['1_month', '3_months', '6_months', '1_year', 'lifetime'] as SubscriptionDuration[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setExtendDuration(d)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        extendDuration === d
                          ? 'bg-[#8A2CB0] text-white border-[#8A2CB0] shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      +{formatDurationLabel(d)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-1.5">
                  Reason for Extension (Optional)
                </label>
                <input
                  type="text"
                  value={extendReason}
                  onChange={(e) => setExtendReason(e.target.value)}
                  placeholder="e.g. Loyalty extension, Special customer bonus"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8A2CB0]/30"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedUserForExtend(null)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingExtend}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] hover:from-[#320f77] hover:to-[#772499] text-white font-black text-xs rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{isSubmittingExtend ? 'Extending...' : 'Extend Subscription'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 3. REVOKE SUBSCRIPTION DIALOG             */}
      {/* ========================================== */}
      {selectedUserForRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 text-gray-900 relative">
            <button 
              onClick={() => setSelectedUserForRevoke(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">Revoke GenPaperAI Plus</h3>
                <p className="text-xs text-gray-500">Revert this user account immediately to the Free plan tier.</p>
              </div>
            </div>

            <form onSubmit={handleExecuteRevoke} className="space-y-4">
              <div className="p-3.5 bg-rose-50/60 rounded-2xl border border-rose-100 text-xs">
                <span className="text-rose-500 font-bold uppercase tracking-wider block text-[10px]">Target User</span>
                <span className="font-bold text-gray-900 text-sm block mt-0.5">{selectedUserForRevoke.name || 'Anonymous User'}</span>
                <span className="text-gray-500 font-mono text-xs">{selectedUserForRevoke.email}</span>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-1.5">
                  Revocation Reason (Optional)
                </label>
                <input
                  type="text"
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="e.g. Refund processed, Expired manual grant, Test ended"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                />
              </div>

              <p className="text-[11px] text-gray-500 leading-normal">
                This action will be immediately recorded in the <strong>Admin Audit Log</strong>. The user will revert to standard Free quota limits and advertisements.
              </p>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedUserForRevoke(null)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRevoke}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isSubmittingRevoke ? 'Revoking...' : 'Revoke Plus Access'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptions;
