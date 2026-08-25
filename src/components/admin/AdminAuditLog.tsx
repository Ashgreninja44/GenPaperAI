import React, { useState } from 'react';
import { 
  FileCheck2, 
  Search, 
  Clock, 
  Filter, 
  User, 
  ShieldCheck, 
  Radio, 
  Cpu, 
  Info,
  Calendar
} from 'lucide-react';
import { AdminAuditLogEntry } from '../../types';

interface AdminAuditLogProps {
  auditLogs: AdminAuditLogEntry[];
}

export const AdminAuditLog: React.FC<AdminAuditLogProps> = ({
  auditLogs
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filteredLogs = auditLogs.filter(log => {
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesSearch = 
      (log.adminEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.targetResource || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(log.details || {}).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesAction && matchesSearch;
  });

  const getActionBadge = (action: string) => {
    if (action.includes('ROLE')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
          Role Change
        </span>
      );
    }
    if (action.includes('MAINTENANCE')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          Maintenance
        </span>
      );
    }
    if (action.includes('ANNOUNCEMENT')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          Broadcast
        </span>
      );
    }
    if (action.includes('MODEL')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
          AI Model
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20">
        System
      </span>
    );
  };

  return (
    <div className="space-y-6" id="admin-audit-log-container">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <FileCheck2 className="w-6 h-6 text-indigo-500" />
          Administrative Audit Trail
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Complete, tamper-evident log of all privileged configuration changes, role modifications, and system overrides.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by administrator email, resource, or action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/60 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-transparent text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            <option value="all">All Actions</option>
            <option value="USER_ROLE_CHANGED">Role Changes</option>
            <option value="MAINTENANCE_TOGGLED">Maintenance Mode</option>
            <option value="ANNOUNCEMENT_UPDATED">Announcements</option>
            <option value="AI_MODEL_REGISTRY_UPDATED">AI Models</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Administrator</th>
                <th className="py-3.5 px-4">Action Code</th>
                <th className="py-3.5 px-4">Target Resource</th>
                <th className="py-3.5 px-4">Audit Payload / Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    No administrative audit events recorded yet.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/75 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900 dark:text-gray-100">{log.adminEmail}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{log.adminUid || 'admin'}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {getActionBadge(log.action)}
                        <span className="font-mono text-[11px] font-bold text-gray-700 dark:text-gray-300">
                          {log.action}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-gray-600 dark:text-gray-400">
                      {log.targetResource}
                    </td>

                    <td className="py-3.5 px-4">
                      <pre className="p-2 rounded bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 font-mono text-[10px] text-gray-700 dark:text-gray-300 max-w-sm overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
