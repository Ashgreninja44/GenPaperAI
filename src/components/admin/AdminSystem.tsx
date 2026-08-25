import React, { useState } from 'react';
import { 
  Settings, 
  Radio, 
  AlertTriangle, 
  Info, 
  Bell, 
  ShieldAlert, 
  CheckCircle, 
  Server, 
  GitBranch, 
  Package, 
  Calendar,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { MaintenanceConfig, AnnouncementConfig } from '../../types';
import { setMaintenanceMode } from '../../services/maintenanceService';
import { setAnnouncementConfig } from '../../services/adminService';

interface AdminSystemProps {
  maintenanceConfig: MaintenanceConfig;
  announcementConfig: AnnouncementConfig | null;
  currentUserEmail: string;
}

export const AdminSystem: React.FC<AdminSystemProps> = ({
  maintenanceConfig,
  announcementConfig,
  currentUserEmail
}) => {
  // Maintenance State
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(maintenanceConfig.enabled);
  const [maintenanceMsg, setMaintenanceMsg] = useState(maintenanceConfig.message || '');
  const [isSavingMaintenance, setIsSavingMaintenance] = useState(false);
  const [maintenanceSuccess, setMaintenanceSuccess] = useState<string | null>(null);

  // Announcement State
  const [announcement, setAnnouncement] = useState<AnnouncementConfig>(
    announcementConfig || {
      enabled: false,
      title: 'Official NCERT Blueprints Active',
      message: 'New CBSE 2026-27 Class 10 Science (3-section) & Social Science (4-section) patterns are live.',
      type: 'info',
      dismissible: true,
      updatedAt: Date.now()
    }
  );
  const [isSavingAnnouncement, setIsSavingAnnouncement] = useState(false);
  const [announcementSuccess, setAnnouncementSuccess] = useState<string | null>(null);

  const handleSaveMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMaintenance(true);
    setMaintenanceSuccess(null);
    try {
      await setMaintenanceMode(maintenanceEnabled, currentUserEmail, maintenanceMsg);
      setMaintenanceSuccess(`Maintenance mode is now ${maintenanceEnabled ? 'ACTIVATED globally' : 'DEACTIVATED (Live)'}.`);
    } catch (err: any) {
      alert("Error saving maintenance mode: " + err?.message);
    } finally {
      setIsSavingMaintenance(false);
      setTimeout(() => setMaintenanceSuccess(null), 5000);
    }
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAnnouncement(true);
    setAnnouncementSuccess(null);
    try {
      await setAnnouncementConfig(announcement, currentUserEmail);
      setAnnouncementSuccess(`Global broadcast ${announcement.enabled ? 'published' : 'disabled'}.`);
    } catch (err: any) {
      alert("Error saving announcement: " + err?.message);
    } finally {
      setIsSavingAnnouncement(false);
      setTimeout(() => setAnnouncementSuccess(null), 5000);
    }
  };

  return (
    <div className="space-y-6" id="admin-system-container">
      <div>
        <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-500" />
          System & Website Controls
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Control global platform maintenance gates, broadcast notifications to teachers, and monitor deployment health.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. MAINTENANCE MODE CONTROLS */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Maintenance Mode Gate</h3>
                <p className="text-xs text-gray-500">Locks public traffic with Super Admin bypass</p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase ${
              maintenanceEnabled 
                ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
            }`}>
              {maintenanceEnabled ? 'Active' : 'Live'}
            </span>
          </div>

          {maintenanceSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              {maintenanceSuccess}
            </div>
          )}

          <form onSubmit={handleSaveMaintenance} className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
              <div>
                <div className="font-bold text-gray-900 dark:text-white">Enable Maintenance Mode</div>
                <div className="text-gray-500">Public visitors will see the branded maintenance screen</div>
              </div>
              <button
                type="button"
                onClick={() => setMaintenanceEnabled(!maintenanceEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  maintenanceEnabled ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  maintenanceEnabled ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Custom Maintenance Message (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="We are upgrading GenPaperAI to latest NCERT blueprints..."
                value={maintenanceMsg}
                onChange={(e) => setMaintenanceMsg(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingMaintenance}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-gray-950 font-black transition-colors shadow-xs cursor-pointer"
            >
              {isSavingMaintenance ? 'Saving Changes...' : 'Update Maintenance Mode'}
            </button>
          </form>
        </div>

        {/* 2. GLOBAL ANNOUNCEMENT MODE */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-blue-500" />
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Global Announcement Banner</h3>
                <p className="text-xs text-gray-500">Broadcast updates to all users</p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase ${
              announcement.enabled 
                ? 'bg-blue-500/10 text-blue-600 border border-blue-500/30'
                : 'bg-gray-500/10 text-gray-500 border border-gray-500/30'
            }`}>
              {announcement.enabled ? 'Broadcasting' : 'Disabled'}
            </span>
          </div>

          {announcementSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              {announcementSuccess}
            </div>
          )}

          <form onSubmit={handleSaveAnnouncement} className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
              <div>
                <div className="font-bold text-gray-900 dark:text-white">Broadcast Announcement</div>
                <div className="text-gray-500">Show notification bar on top of the web app</div>
              </div>
              <button
                type="button"
                onClick={() => setAnnouncement({ ...announcement, enabled: !announcement.enabled })}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  announcement.enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  announcement.enabled ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Announcement Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CBSE 2026-27 Updates"
                  value={announcement.title}
                  onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Severity / Style
                </label>
                <select
                  value={announcement.type}
                  onChange={(e) => setAnnouncement({ ...announcement, type: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold"
                >
                  <option value="info">Information (Blue)</option>
                  <option value="notice">Notice (Indigo)</option>
                  <option value="warning">Warning (Amber)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Announcement Message
              </label>
              <textarea
                rows={2}
                required
                placeholder="Message body shown to teachers..."
                value={announcement.message}
                onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="dismissible-check"
                checked={announcement.dismissible}
                onChange={(e) => setAnnouncement({ ...announcement, dismissible: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="dismissible-check" className="font-semibold text-gray-700 dark:text-gray-300">
                Allow users to dismiss this announcement
              </label>
            </div>

            <button
              type="submit"
              disabled={isSavingAnnouncement}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors shadow-xs cursor-pointer"
            >
              {isSavingAnnouncement ? 'Broadcasting...' : 'Publish Announcement'}
            </button>
          </form>
        </div>
      </div>

      {/* 3. VERSION & DEPLOYMENT INFORMATION */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Package className="w-5 h-5 text-indigo-500" />
          Version & Deployment Specifications (Safe Telemetry)
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="text-gray-400 font-semibold">Application Version</div>
            <div className="font-black text-gray-900 dark:text-white mt-1">v1.2.0-stable</div>
            <div className="text-[11px] text-indigo-500 mt-0.5 font-semibold">CBSE 2026-27 Core</div>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="text-gray-400 font-semibold">Target Environment</div>
            <div className="font-black text-gray-900 dark:text-white mt-1">Cloudflare Pages / Container</div>
            <div className="text-[11px] text-emerald-500 mt-0.5 font-semibold">Node.js 22 + React 19</div>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="text-gray-400 font-semibold">Build Status</div>
            <div className="font-black text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Compiled & Ready
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5 font-mono">esbuild cjs bundle</div>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="text-gray-400 font-semibold">Author & Super Admin</div>
            <div className="font-black text-gray-900 dark:text-white mt-1">Darshit Pendyala</div>
            <div className="text-[11px] text-gray-400 mt-0.5">GenPaperAI Platform Owner</div>
          </div>
        </div>
      </div>
    </div>
  );
};
