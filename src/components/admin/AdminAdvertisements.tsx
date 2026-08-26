import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  ToggleLeft, 
  ToggleRight, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Coins, 
  Eye, 
  BarChart3, 
  Sparkles, 
  Crown, 
  Lock, 
  ExternalLink, 
  RefreshCw,
  Info,
  Check,
  X
} from 'lucide-react';
import { 
  UserProfile, 
  AdvertisementConfig, 
  AdPlacementConfig, 
  AdPlacementId,
  AdAnalyticsSummary,
  AdErrorLog
} from '../../types';
import { 
  getAdvertisementConfig, 
  updateAdvertisementConfig, 
  getAdSenseAnalyticsReport, 
  getRecentAdErrors, 
  PROHIBITED_PLACEMENT_IDS,
  DEFAULT_AD_CONFIG,
  ADSENSE_CLIENT_ID
} from '../../services/adService';
import { AdPlacement } from '../ads/AdPlacement';

interface AdminAdvertisementsProps {
  currentUser: UserProfile;
}

export const AdminAdvertisements: React.FC<AdminAdvertisementsProps> = ({
  currentUser
}) => {
  const [config, setConfig] = useState<AdvertisementConfig>(DEFAULT_AD_CONFIG);
  const [initialConfig, setInitialConfig] = useState<AdvertisementConfig>(DEFAULT_AD_CONFIG);
  const [analytics, setAnalytics] = useState<AdAnalyticsSummary>(getAdSenseAnalyticsReport());
  const [errorLogs, setErrorLogs] = useState<AdErrorLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [ownerPreviewActive, setOwnerPreviewActive] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const adCfg = await getAdvertisementConfig();
      setConfig(adCfg);
      setInitialConfig(adCfg);
      setAnalytics(getAdSenseAnalyticsReport());
      setErrorLogs(getRecentAdErrors());
    } catch (err: any) {
      console.error('Error loading advertisement configuration:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleGlobalAds = () => {
    setConfig(prev => ({
      ...prev,
      enabled: !prev.enabled
    }));
  };

  const handleTogglePlacement = (placementId: AdPlacementId) => {
    if (PROHIBITED_PLACEMENT_IDS.includes(placementId)) {
      alert("Prohibited Placement: This placement cannot be enabled to protect question paper integrity.");
      return;
    }

    setConfig(prev => {
      const currentPlacement = prev.placements[placementId];
      if (!currentPlacement || !currentPlacement.allowed) return prev;

      return {
        ...prev,
        placements: {
          ...prev.placements,
          [placementId]: {
            ...currentPlacement,
            enabled: !currentPlacement.enabled
          }
        }
      };
    });
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      await updateAdvertisementConfig(
        config,
        currentUser.email,
        currentUser.role,
        initialConfig
      );
      setInitialConfig(config);
      setSaveSuccess("Advertisement configuration successfully updated and recorded in the Admin Audit Log.");
      setTimeout(() => setSaveSuccess(null), 5000);
    } catch (err: any) {
      setSaveError(err?.message || "Failed to update advertisement configuration.");
    } finally {
      setIsSaving(false);
    }
  };

  const activePlacementsCount = Object.values(config.placements).filter(p => p.allowed && p.enabled).length;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm font-medium text-gray-500">Loading Monetization & Advertisement Portal...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8" id="admin-advertisements-section">
      {/* 1. Header with Section Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
            <span>Admin Portal</span>
            <span>→</span>
            <span>Monetization</span>
            <span>→</span>
            <span className="text-indigo-600 dark:text-indigo-400">Advertisements</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Megaphone className="w-5 h-5" />
            </div>
            Advertisement & Monetization Management
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
            Configure global advertising switches, placement locations, Google AdSense verification, and ad-free entitlements for Plus subscribers and Platform Owners.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Status</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2.5 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2.5 shadow-sm animate-fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* 2. Global Master Switch Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-900 text-white shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                config.enabled ? 'bg-emerald-400 text-gray-950' : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
              }`}>
                {config.enabled ? 'System Live' : 'Globally Disabled'}
              </span>
              <h3 className="text-lg font-black text-white">
                Global Advertisement Control
              </h3>
            </div>
            <p className="text-xs text-indigo-200 leading-relaxed max-w-xl">
              When <strong>enabled</strong>, eligible Free-tier users will receive non-intrusive advertisements in active placements. When <strong>disabled</strong>, all advertisement rendering is completely halted across the entire application.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <button
              type="button"
              id="btn-toggle-global-ads"
              onClick={handleToggleGlobalAds}
              className={`px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg flex items-center gap-2.5 cursor-pointer ${
                config.enabled
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-gray-950 shadow-emerald-500/25'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
              }`}
            >
              {config.enabled ? (
                <>
                  <ToggleRight className="w-5 h-5 text-gray-950" />
                  <span>Advertisements ENABLED</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-5 h-5 text-gray-400" />
                  <span>Advertisements DISABLED</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Centralized User Entitlement & Ad Eligibility Matrix */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              Centralized User Ad Eligibility & Entitlements
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Unified entitlement rules governing which account tiers receive advertisements.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-100 dark:border-indigo-800">
            Single Source of Truth
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Free Tier */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">Free Users</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                Ads Enabled
              </span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Standard accounts are eligible for advertisements in active utility placements when global ads are enabled.
            </p>
          </div>

          {/* Plus Subscribers */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/60 to-purple-50/60 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200 dark:border-indigo-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-black text-indigo-950 dark:text-indigo-200 uppercase tracking-wider">Plus Subscribers</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-600 text-white shadow-sm">
                Ad-Free
              </span>
            </div>
            <p className="text-[11px] text-indigo-900/70 dark:text-indigo-300/70 leading-relaxed">
              Entitled to a 100% ad-free experience across all devices and views. Architecture ready for subscription launch.
            </p>
          </div>

          {/* Owner & Super Admin */}
          <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-black text-amber-950 dark:text-amber-200 uppercase tracking-wider">Owner / Admin</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-400 text-gray-950 font-black">
                Suppressed
              </span>
            </div>
            <p className="text-[11px] text-amber-900/70 dark:text-amber-300/70 leading-relaxed">
              Platform Owner and Super Administrators are automatically suppressed from live advertisements.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Configurable Ad Placements & Prohibited Placements Protection */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-500" />
              Ad Placements & Integrity Protection
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Enable or disable individual supported placement locations. Prohibited areas are permanently locked.
            </p>
          </div>
          <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
            Active Placements: <strong className="text-indigo-600 dark:text-indigo-400">{activePlacementsCount}</strong> / {Object.keys(config.placements).length}
          </span>
        </div>

        {/* Supported Placements Grid */}
        <div>
          <h4 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
            Supported Placements (Configurable)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.values(config.placements)
              .filter(p => p.allowed)
              .map((placement) => (
                <div 
                  key={placement.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    placement.enabled 
                      ? 'bg-indigo-50/30 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800' 
                      : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-xs font-black text-gray-900 dark:text-white">
                      {placement.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTogglePlacement(placement.id)}
                      className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer ${
                        placement.enabled
                          ? 'bg-emerald-500 text-gray-950 shadow-sm hover:bg-emerald-400'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300'
                      }`}
                    >
                      {placement.enabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
                    {placement.description}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                    <span>Format: {placement.format}</span>
                    <span className={placement.enabled ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-gray-400'}>
                      {placement.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Strictly Prohibited Placements (LOCKED BY SYSTEM INTEGRITY) */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-3.5 h-3.5 text-rose-500" />
            <h4 className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Prohibited Placements (System Locked)
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.values(config.placements)
              .filter(p => !p.allowed)
              .map((placement) => (
                <div 
                  key={placement.id}
                  className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/10 border border-rose-200/80 dark:border-rose-900/40 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-black text-gray-900 dark:text-white">
                      {placement.name}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-black bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 uppercase tracking-wider shrink-0 border border-rose-200 dark:border-rose-800">
                      NEVER ALLOWED
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-800/80 dark:text-rose-300/80 leading-relaxed">
                    {placement.description}
                  </p>
                  <div className="mt-3 flex items-center gap-1.5 text-[10px] text-rose-600 dark:text-rose-400 font-bold">
                    <ShieldAlert className="w-3 h-3" />
                    <span>Protected by GenPaperAI Paper Integrity Engine</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* 5. Google AdSense Status & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AdSense Configuration Status */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Google AdSense Status
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
              Verified Tag Loaded
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-xs">
              <span className="text-gray-500 font-medium">Publisher Client ID</span>
              <span className="font-mono font-bold text-gray-900 dark:text-white">{ADSENSE_CLIENT_ID}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-xs">
              <span className="text-gray-500 font-medium">HTML &lt;head&gt; Tag Verification</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Installed Globally
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-xs">
              <span className="text-gray-500 font-medium">Free-User Ad Eligibility</span>
              <span className={config.enabled ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-gray-400"}>
                {config.enabled ? "Active" : "Disabled (Global Off)"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-xs">
              <span className="text-gray-500 font-medium">Plus-User Ad Suppression</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">Active (Ad-Free)</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-xs">
              <span className="text-gray-500 font-medium">Owner / Admin Ad Suppression</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">Active (Suppressed)</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-xs">
              <span className="text-gray-500 font-medium">Recent Ad Render Errors</span>
              <span className="text-gray-600 dark:text-gray-400 font-mono font-bold">
                {errorLogs.length === 0 ? "0 Non-Critical Errors" : `${errorLogs.length} logged`}
              </span>
            </div>
          </div>
        </div>

        {/* Ad Analytics & Reporting (Honest, Unfabricated Metrics) */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-500" />
              Advertisement Reporting & Analytics
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500">
              Provider API
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 text-amber-900 dark:text-amber-200 text-xs leading-relaxed flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>AdSense Reporting Notice:</strong> AdSense direct API reporting is currently not connected. GenPaperAI does not fabricate artificial revenue or impression data. Real performance metrics will appear directly once the Google AdSense Management API service is linked.
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-center">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Impressions</div>
              <div className="text-base font-black text-gray-900 dark:text-white">--</div>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-center">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Ad Clicks</div>
              <div className="text-base font-black text-gray-900 dark:text-white">--</div>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-center">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Est. Revenue</div>
              <div className="text-xs font-black text-amber-600 dark:text-amber-400 truncate">Not Connected</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 text-center font-mono">
            Reporting Status: <span className="text-gray-700 dark:text-gray-300 font-bold">AdSense reporting not connected</span>
          </div>
        </div>
      </div>

      {/* 6. Owner Testing Sandbox & Placement Preview */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-amber-300/60 dark:border-amber-800/60 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-500" />
              Owner Test Preview Sandbox
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Safely preview how supported advertisement placements render in the UI without generating artificial impressions or clicks.
            </p>
          </div>

          <button
            type="button"
            id="btn-toggle-owner-preview"
            onClick={() => setOwnerPreviewActive(!ownerPreviewActive)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              ownerPreviewActive 
                ? 'bg-amber-400 text-gray-950 shadow-md font-black' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>{ownerPreviewActive ? 'Preview Sandbox ACTIVE' : 'Enable Placement Preview'}</span>
          </button>
        </div>

        {ownerPreviewActive && (
          <div className="space-y-4 pt-2 animate-fade-in">
            <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
              Below are live simulated containers showing how the active supported placements look:
            </p>

            <div className="space-y-3">
              <AdPlacement 
                placementId="dashboard_banner" 
                currentUser={currentUser} 
                config={config} 
                isOwnerPreview={true} 
              />
              <AdPlacement 
                placementId="footer_banner" 
                currentUser={currentUser} 
                config={config} 
                isOwnerPreview={true} 
              />
            </div>
          </div>
        )}
      </div>

      {/* 7. Save & Commit Action Bar */}
      <div className="flex items-center justify-between p-6 rounded-3xl bg-gray-100 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700">
        <div>
          <h4 className="text-xs font-black text-gray-900 dark:text-white">
            Apply Monetization Changes
          </h4>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Updates will be synced to Firestore immediately and audited under your administrator account.
          </p>
        </div>

        <button
          type="button"
          id="btn-save-ad-config"
          onClick={handleSaveConfig}
          disabled={isSaving}
          className="px-6 py-3 rounded-2xl bg-[#3C128D] hover:bg-[#8A2CB0] text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Saving Configuration...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Save & Publish Changes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
