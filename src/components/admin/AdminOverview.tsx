import React from 'react';
import { 
  Users, 
  FileText, 
  Cpu, 
  ShieldCheck, 
  Activity, 
  Radio, 
  Clock, 
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Coins
} from 'lucide-react';
import { UserProfile, AIModelRegistry, AdminAuditLogEntry, MaintenanceConfig, AnnouncementConfig } from '../../types';

interface AdminOverviewProps {
  users: UserProfile[];
  papersCount: number;
  aiRegistry: AIModelRegistry;
  maintenanceConfig: MaintenanceConfig;
  announcementConfig: AnnouncementConfig | null;
  recentAuditLogs: AdminAuditLogEntry[];
  onNavigateTab: (tabId: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  users,
  papersCount,
  aiRegistry,
  maintenanceConfig,
  announcementConfig,
  recentAuditLogs,
  onNavigateTab
}) => {
  const activeModelsCount = aiRegistry.models.filter(m => m.enabled).length;
  const adminUsersCount = users.filter(u => u.role === 'admin' || u.role === 'super_admin').length;
  const teacherUsersCount = users.filter(u => u.role === 'teacher').length;

  return (
    <div className="space-y-6" id="admin-overview-container">
      {/* Platform Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
          maintenanceConfig.enabled 
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200' 
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
        }`}>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider opacity-75">Platform State</div>
            <div className="text-lg font-black flex items-center gap-2 mt-0.5">
              <span className={`w-2.5 h-2.5 rounded-full ${maintenanceConfig.enabled ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
              {maintenanceConfig.enabled ? 'Maintenance Mode' : 'Live & Operational'}
            </div>
          </div>
          <button 
            id="admin-btn-manage-system"
            onClick={() => onNavigateTab('system')}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
          >
            Configure
          </button>
        </div>

        <div className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
          announcementConfig?.enabled
            ? 'bg-blue-500/10 border-blue-500/30 text-blue-900 dark:text-blue-200'
            : 'bg-slate-500/10 border-slate-500/20 text-slate-700 dark:text-slate-300'
        }`}>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider opacity-75">Global Broadcast</div>
            <div className="text-lg font-black flex items-center gap-2 mt-0.5">
              <Radio className="w-4 h-4 text-blue-500" />
              {announcementConfig?.enabled ? 'Announcement Active' : 'No Broadcast'}
            </div>
          </div>
          <button 
            id="admin-btn-manage-announcement"
            onClick={() => onNavigateTab('system')}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
          >
            Manage
          </button>
        </div>

        <div className="p-4 rounded-xl border bg-indigo-500/10 border-indigo-500/30 text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider opacity-75">Primary AI Model</div>
            <div className="text-sm font-black truncate max-w-[180px] mt-0.5">
              {aiRegistry.defaultModel}
            </div>
            <div className="text-xs opacity-75">{activeModelsCount} of {aiRegistry.models.length} models active</div>
          </div>
          <button 
            id="admin-btn-manage-models"
            onClick={() => onNavigateTab('ai-models')}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 transition-colors"
          >
            Registry
          </button>
        </div>
      </div>

      {/* Primary SaaS KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Registered</span>
            <Users className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-2">
            {users.length}
          </div>
          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{adminUsersCount} Admins</span>
            <span>•</span>
            <span>{teacherUsersCount} Teachers</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Papers Generated</span>
            <FileText className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-2">
            {papersCount}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            Across CBSE & SCERT
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">AI Engines</span>
            <Cpu className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-2">
            {activeModelsCount}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {aiRegistry.models.length} registered in routing pool
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">System Health</span>
            <Activity className="w-5 h-5 text-cyan-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-2 flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            100%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Firestore & Gemini Online
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards & Recent Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Access Actions */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Administrative Shortcuts</h3>
          
          <button
            onClick={() => onNavigateTab('users')}
            className="w-full text-left p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all flex items-center justify-between group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">Manage User Roles</div>
                <div className="text-xs text-gray-500">Promote / Revoke Teacher & Admin</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => onNavigateTab('ai-models')}
            className="w-full text-left p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-purple-500 dark:hover:border-purple-500 transition-all flex items-center justify-between group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">AI Routing & Models</div>
                <div className="text-xs text-gray-500">Manage fallback & default engine</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => onNavigateTab('monetization')}
            className="w-full text-left p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-amber-500 dark:hover:border-amber-500 transition-all flex items-center justify-between group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors">Monetization & Ads</div>
                <div className="text-xs text-gray-500">Global toggles & AdSense status</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => onNavigateTab('diagnostics')}
            className="w-full text-left p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all flex items-center justify-between group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">Live Diagnostics</div>
                <div className="text-xs text-gray-500">Test Gemini, Auth, Storage & DB</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Recent Admin Audit Activity Feed */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Recent Admin Activity</h3>
              <p className="text-xs text-gray-500">Privileged actions recorded in immutable audit log</p>
            </div>
            <button
              onClick={() => onNavigateTab('audit-log')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View Full Audit Log <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-3 divide-y divide-gray-100 dark:divide-gray-800 max-h-[280px] overflow-y-auto">
            {recentAuditLogs.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">
                No administrative actions logged yet.
              </div>
            ) : (
              recentAuditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-[10px] text-gray-600 dark:text-gray-300">
                        {log.action}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 truncate max-w-[200px] sm:max-w-xs">{log.targetResource}</span>
                    </div>
                    <div className="text-gray-400">By: {log.adminEmail}</div>
                  </div>
                  <div className="text-gray-400 shrink-0 font-mono text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
