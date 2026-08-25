import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Filter, 
  Search,
  UserX,
  Key
} from 'lucide-react';
import { SecurityEventEntry } from '../../types';

interface AdminSecurityProps {
  securityEvents: SecurityEventEntry[];
}

export const AdminSecurity: React.FC<AdminSecurityProps> = ({
  securityEvents
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = securityEvents.filter(e => {
    const matchesSeverity = filterSeverity === 'all' || e.severity === filterSeverity;
    const matchesSearch = 
      (e.eventType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.identifier || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.reason || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const getSeverityBadge = (severity: SecurityEventEntry['severity']) => {
    switch (severity) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-500 text-white shadow-xs">Critical</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-500/10 text-orange-600 border border-orange-500/30">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-600 border border-amber-500/30">Medium</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-500/10 text-gray-500 border border-gray-500/30">Low</span>;
    }
  };

  return (
    <div className="space-y-6" id="admin-security-container">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-rose-500" />
          Security Center & Threat Monitoring
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Monitor authentication failures, privileged role updates, and access security telemetry. Sensitive tokens and passwords are redacted.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search security events, reasons, or accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/60 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-transparent text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Security Events Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Event Type</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Provider / Source</th>
                <th className="py-3.5 px-4">Identifier</th>
                <th className="py-3.5 px-4">Reason / Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                    No security incidents or login anomalies recorded. System is secure.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-gray-50/75 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(evt.timestamp).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900 dark:text-gray-100">
                      {evt.eventType}
                    </td>

                    <td className="py-3.5 px-4">
                      {getSeverityBadge(evt.severity)}
                    </td>

                    <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">
                      {evt.provider || 'system'}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-gray-500">
                      {evt.identifier || 'anonymous'}
                    </td>

                    <td className="py-3.5 px-4 text-gray-700 dark:text-gray-300">
                      {evt.reason}
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
