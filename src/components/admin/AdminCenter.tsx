import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Users, 
  Cpu, 
  BarChart3, 
  Settings, 
  Activity, 
  ShieldAlert, 
  FileCheck2, 
  ArrowLeft,
  Crown,
  RefreshCw
} from 'lucide-react';
import { 
  UserProfile, 
  AIModelRegistry, 
  AdminAuditLogEntry, 
  SecurityEventEntry, 
  GenerationMetricEntry, 
  MaintenanceConfig, 
  AnnouncementConfig,
  GeneratedPaper
} from '../../types';
import { 
  subscribeToUsers, 
  subscribeToAuditLogs, 
  subscribeToSecurityEvents, 
  subscribeToGenerationMetrics,
  getAIModelRegistry,
  getAnnouncementConfig,
  isSuperAdmin,
  OWNER_EMAIL
} from '../../services/adminService';
import { getMaintenanceConfig } from '../../services/maintenanceService';
import { getAllStoredPapers } from '../../services/paperStorageService';
import { getEffectiveProfilePhoto } from '../../services/profilePhotoService';

import { AdminOverview } from './AdminOverview';
import { AdminUsers } from './AdminUsers';
import { AdminAIModels } from './AdminAIModels';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminSystem } from './AdminSystem';
import { AdminDiagnostics } from './AdminDiagnostics';
import { AdminSecurity } from './AdminSecurity';
import { AdminAuditLog } from './AdminAuditLog';
import { AdminAdvertisements } from './AdminAdvertisements';
import { AdminMonetization } from './AdminMonetization';
import { Coins } from 'lucide-react';

export interface AdminCenterProps {
  user: UserProfile;
  onBackToDashboard: () => void;
  onBackToProfile?: () => void;
}

type AdminTab = 'overview' | 'users' | 'ai-models' | 'analytics' | 'monetization' | 'system' | 'diagnostics' | 'security' | 'audit-log';

export const AdminCenter: React.FC<AdminCenterProps> = ({
  user,
  onBackToDashboard,
  onBackToProfile
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [papers, setPapers] = useState<GeneratedPaper[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogEntry[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEventEntry[]>([]);
  const [metrics, setMetrics] = useState<GenerationMetricEntry[]>([]);
  const [aiRegistry, setAiRegistry] = useState<AIModelRegistry>({
    defaultModel: 'gemini-3-flash-preview',
    models: [
      {
        id: 'gemini-3-flash-preview',
        name: 'Gemini 3 Flash Preview',
        provider: 'Google DeepMind',
        enabled: true,
        isDefault: true,
        priority: 1,
        intendedUse: 'Next-Gen Default Generation Engine',
        qualityNotes: 'High-speed reasoning, full JSON schema fidelity, and CBSE pattern adherence.',
        dateAdded: 1716000000000
      }
    ],
    updatedAt: Date.now()
  });
  const [maintenanceConfig, setMaintenanceConfig] = useState<MaintenanceConfig>({
    enabled: false,
    message: '',
    updatedAt: Date.now()
  });
  const [announcementConfig, setAnnouncementConfigState] = useState<AnnouncementConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isOwner = user.email.toLowerCase() === OWNER_EMAIL.toLowerCase();
  const isSuper = isSuperAdmin(user.email, user.role);

  // Load initial data and attach real-time listeners
  useEffect(() => {
    setIsLoading(true);

    // Initial configs
    getMaintenanceConfig().then(cfg => setMaintenanceConfig(cfg)).catch(() => {});
    getAIModelRegistry().then(reg => setAiRegistry(reg)).catch(() => {});
    getAnnouncementConfig().then(ann => setAnnouncementConfigState(ann)).catch(() => {});
    getAllStoredPapers().then(p => setPapers(p)).catch(() => {});

    // Subscriptions
    const unsubUsers = subscribeToUsers((allUsers) => {
      setUsers(allUsers);
      setIsLoading(false);
    });

    const unsubLogs = subscribeToAuditLogs((logs) => {
      setAuditLogs(logs);
    });

    const unsubSec = subscribeToSecurityEvents((events) => {
      setSecurityEvents(events);
    });

    const unsubMetrics = subscribeToGenerationMetrics((metricEntries) => {
      setMetrics(metricEntries);
    });

    return () => {
      unsubUsers();
      unsubLogs();
      unsubSec();
      unsubMetrics();
    };
  }, []);

  const refreshAllData = async () => {
    setIsLoading(true);
    try {
      const [mCfg, reg, ann, p] = await Promise.all([
        getMaintenanceConfig(),
        getAIModelRegistry(),
        getAnnouncementConfig(),
        getAllStoredPapers()
      ]);
      setMaintenanceConfig(mCfg);
      setAiRegistry(reg);
      setAnnouncementConfigState(ann);
      setPapers(p);
    } catch (e) {
      console.error("Error refreshing admin data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users & Roles', icon: Users, badge: users.length },
    { id: 'ai-models', label: 'AI & Models', icon: Cpu },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'monetization', label: 'Monetization & Ads', icon: Coins },
    { id: 'system', label: 'System & Gates', icon: Settings },
    { id: 'diagnostics', label: 'Diagnostics', icon: Activity },
    { id: 'security', label: 'Security', icon: ShieldAlert, badge: securityEvents.length > 0 ? securityEvents.length : undefined },
    { id: 'audit-log', label: 'Audit Log', icon: FileCheck2 },
  ];

  const effectivePhoto = getEffectiveProfilePhoto(user);
  const handleExitAdmin = onBackToDashboard || onBackToProfile || (() => {});

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100" id="admin-center-root">
      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleExitAdmin}
              className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="Return to Main Application Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Exit to Dashboard</span>
              <span className="sm:hidden">Exit</span>
            </button>

            <div className="h-5 w-px bg-gray-200 dark:bg-gray-800" />

            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-sm">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-black text-gray-900 dark:text-white leading-none">
                  Admin Portal
                </h1>
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  {isOwner ? 'Platform Owner / Super Admin' : isSuper ? 'Super Administrator' : 'Administrator'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refreshAllData}
              disabled={isLoading}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              title="Refresh Admin State"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Refresh</span>
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-800">
              {effectivePhoto ? (
                <img 
                  src={effectivePhoto} 
                  alt={user.name} 
                  className="w-8 h-8 rounded-full object-cover border border-amber-500/40"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
              )}
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[140px]">
                  {user.name}
                </div>
                <div className="text-[10px] text-gray-500 font-mono truncate max-w-[140px]">
                  {user.email}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content Area with Tabbed Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-gray-200 dark:border-gray-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as AdminTab)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab View Render */}
        <main className="transition-all duration-200">
          {activeTab === 'overview' && (
            <AdminOverview
              users={users}
              papersCount={papers.length}
              aiRegistry={aiRegistry}
              maintenanceConfig={maintenanceConfig}
              announcementConfig={announcementConfig}
              recentAuditLogs={auditLogs}
              onNavigateTab={(tab) => setActiveTab(tab as AdminTab)}
            />
          )}

          {activeTab === 'users' && (
            <AdminUsers
              users={users}
              currentUserEmail={user.email}
              currentUserRole={user.role}
              onRefreshUsers={refreshAllData}
            />
          )}

          {activeTab === 'ai-models' && (
            <AdminAIModels
              registry={aiRegistry}
              currentUserEmail={user.email}
            />
          )}

          {activeTab === 'analytics' && (
            <AdminAnalytics
              users={users}
              papers={papers}
              metrics={metrics}
            />
          )}

          {activeTab === 'monetization' && (
            <AdminMonetization
              currentUser={user}
              users={users}
              onRefreshUsers={refreshAllData}
            />
          )}

          {activeTab === 'system' && (
            <AdminSystem
              maintenanceConfig={maintenanceConfig}
              announcementConfig={announcementConfig}
              currentUserEmail={user.email}
            />
          )}

          {activeTab === 'diagnostics' && (
            <AdminDiagnostics
              currentUserEmail={user.email}
            />
          )}

          {activeTab === 'security' && (
            <AdminSecurity
              securityEvents={securityEvents}
            />
          )}

          {activeTab === 'audit-log' && (
            <AdminAuditLog
              auditLogs={auditLogs}
            />
          )}
        </main>
      </div>
    </div>
  );
};
