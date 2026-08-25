import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  GraduationCap, 
  User as UserIcon, 
  Crown, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Filter,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { UserProfile, UserRole } from '../../types';
import { updateUserRole, isSuperAdmin, OWNER_EMAIL } from '../../services/adminService';

interface AdminUsersProps {
  users: UserProfile[];
  currentUserEmail: string;
  currentUserRole?: string;
  onRefreshUsers: () => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({
  users,
  currentUserEmail,
  currentUserRole,
  onRefreshUsers
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [loadingUid, setLoadingUid] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const isCallerSuperAdmin = isSuperAdmin(currentUserEmail, currentUserRole);

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.uid.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesProvider = providerFilter === 'all' || user.provider === providerFilter;

    return matchesSearch && matchesRole && matchesProvider;
  });

  const handleRoleChange = async (targetUser: UserProfile, newRole: UserRole) => {
    if (targetUser.role === newRole) return;

    // Check permissions
    if ((newRole === 'super_admin' || targetUser.role === 'super_admin') && !isCallerSuperAdmin) {
      setActionError("Permission Denied: Only a Super Admin / Owner can grant or revoke Super Admin privileges.");
      return;
    }

    if (targetUser.email.toLowerCase() === OWNER_EMAIL.toLowerCase() && newRole !== 'super_admin') {
      setActionError("Forbidden: The primary platform owner cannot have Super Admin revoked.");
      return;
    }

    setLoadingUid(targetUser.uid);
    setActionError(null);
    setActionSuccess(null);

    try {
      await updateUserRole(
        currentUserEmail,
        targetUser.uid,
        targetUser.email,
        targetUser.role,
        newRole,
        currentUserRole
      );
      setActionSuccess(`Successfully updated role for ${targetUser.name || targetUser.email} to ${newRole.toUpperCase()}.`);
      onRefreshUsers();
    } catch (err: any) {
      setActionError(err?.message || "Failed to update user role.");
    } finally {
      setLoadingUid(null);
      setTimeout(() => {
        setActionSuccess(null);
        setActionError(null);
      }, 5000);
    }
  };

  const getRoleBadge = (role: UserRole, email: string) => {
    const isOwner = email.toLowerCase() === OWNER_EMAIL.toLowerCase();
    
    if (isOwner || role === 'super_admin') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs">
          <Crown className="w-3.5 h-3.5" />
          Super Admin {isOwner && '• Owner'}
        </span>
      );
    }
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
          <ShieldCheck className="w-3.5 h-3.5" />
          Admin
        </span>
      );
    }
    if (role === 'teacher') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
          <GraduationCap className="w-3.5 h-3.5" />
          Teacher
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
        <UserIcon className="w-3.5 h-3.5" />
        User
      </span>
    );
  };

  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case 'google':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
            Google
          </span>
        );
      case 'microsoft':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Microsoft
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20">
            Email/Pass
          </span>
        );
    }
  };

  return (
    <div className="space-y-6" id="admin-users-container">
      {/* Header & Feedback Alert */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-500" />
            User Management & Role Control
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Authorize accounts, assign educator roles, and govern administrative privileges securely.
          </p>
        </div>

        <button
          onClick={onRefreshUsers}
          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Directory
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
          {actionSuccess}
        </div>
      )}

      {actionError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-800 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          {actionError}
        </div>
      )}

      {/* Filters & Search Controls */}
      <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or UID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/60 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/60 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none"
            >
              <option value="all">All Providers</option>
              <option value="google">Google</option>
              <option value="microsoft">Microsoft</option>
              <option value="email">Email</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">User Account</th>
                <th className="py-3.5 px-4">Auth Provider</th>
                <th className="py-3.5 px-4">Current Role</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-4 text-right">Role Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-400">
                    No users found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isOwnerAccount = u.email.toLowerCase() === OWNER_EMAIL.toLowerCase();
                  const isCurrentUser = u.email.toLowerCase() === currentUserEmail.toLowerCase();
                  const isLoading = loadingUid === u.uid;

                  return (
                    <tr key={u.uid} className="hover:bg-gray-50/75 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {u.profilePhoto ? (
                            <img 
                              src={u.profilePhoto} 
                              alt={u.name} 
                              className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700" 
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                              {(u.name || u.email || 'U').charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                              {u.name || 'Anonymous User'}
                              {isCurrentUser && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-gray-500 font-mono text-[11px]">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {getProviderBadge(u.provider)}
                      </td>

                      <td className="py-3.5 px-4">
                        {getRoleBadge(u.role, u.email)}
                      </td>

                      <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {isLoading ? (
                          <span className="text-indigo-500 font-bold flex items-center justify-end gap-1">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Updating...
                          </span>
                        ) : isOwnerAccount ? (
                          <span className="text-gray-400 italic text-[11px]">Primary Owner</span>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Toggle Teacher */}
                            <button
                              onClick={() => handleRoleChange(u, u.role === 'teacher' ? 'user' : 'teacher')}
                              title={u.role === 'teacher' ? 'Demote to regular User' : 'Promote to Teacher'}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                                u.role === 'teacher'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-emerald-500/10 hover:text-emerald-600'
                              }`}
                            >
                              {u.role === 'teacher' ? 'Revoke Teacher' : '+ Teacher'}
                            </button>

                            {/* Toggle Admin */}
                            <button
                              onClick={() => handleRoleChange(u, u.role === 'admin' ? 'user' : 'admin')}
                              title={u.role === 'admin' ? 'Revoke Admin Privileges' : 'Promote to Administrator'}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                                u.role === 'admin'
                                  ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-indigo-500/10 hover:text-indigo-600'
                              }`}
                            >
                              {u.role === 'admin' ? 'Revoke Admin' : '+ Admin'}
                            </button>

                            {/* Super Admin Privileges (Owner / Super Admin Only) */}
                            {isCallerSuperAdmin && (
                              <button
                                onClick={() => handleRoleChange(u, u.role === 'super_admin' ? 'admin' : 'super_admin')}
                                title={u.role === 'super_admin' ? 'Demote from Super Admin' : 'Grant Full Super Admin Access'}
                                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-colors ${
                                  u.role === 'super_admin'
                                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-200'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-amber-500/10 hover:text-amber-600'
                                }`}
                              >
                                {u.role === 'super_admin' ? 'Revoke Super Admin' : '★ Super Admin'}
                              </button>
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
    </div>
  );
};
