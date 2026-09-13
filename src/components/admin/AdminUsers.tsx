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
  Filter,
  RefreshCw,
  Sparkles,
  ArrowRightLeft,
  X,
  BookOpen,
  Check,
  Shield,
  Layers,
  Sparkle
} from 'lucide-react';
import { UserProfile, UserRole, UserType } from '../../types';
import { updateUserRole, updateUserAccountType, isSuperAdmin, OWNER_EMAIL } from '../../services/adminService';

interface AdminUsersProps {
  users: UserProfile[];
  currentUserEmail: string;
  currentUserRole?: string;
  onRefreshUsers: () => void;
  onCurrentUserUpdated?: (updatedUser: UserProfile) => void;
}

type AdminUserSection = 'account_types' | 'security_roles';

export const AdminUsers: React.FC<AdminUsersProps> = ({
  users,
  currentUserEmail,
  currentUserRole,
  onRefreshUsers,
  onCurrentUserUpdated
}) => {
  const [activeSection, setActiveSection] = useState<AdminUserSection>('account_types');
  const [searchTerm, setSearchTerm] = useState('');
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  
  // Account Type Modal State
  const [modalTargetUser, setModalTargetUser] = useState<UserProfile | null>(null);
  const [selectedNewType, setSelectedNewType] = useState<UserType>('teacher');
  const [isSubmittingAccountType, setIsSubmittingAccountType] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Global Action State
  const [loadingUid, setLoadingUid] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const isCallerSuperAdmin = isSuperAdmin(currentUserEmail, currentUserRole);

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.uid.toLowerCase().includes(searchTerm.toLowerCase());

    const currentType = user.userType || 'unset';
    const matchesAccountType = 
      accountTypeFilter === 'all' || 
      (accountTypeFilter === 'not_set' ? !user.userType : user.userType === accountTypeFilter);

    const matchesRole = 
      roleFilter === 'all' || 
      (roleFilter === 'user' ? (user.role === 'user' || user.role === 'teacher' || user.role === 'student' || user.role === 'plus' || !user.role) : user.role === roleFilter);

    const isPlus = user.isPlusSubscriber || user.subscriptionTier === 'plus';
    const matchesSubscription = 
      subscriptionFilter === 'all' || 
      (subscriptionFilter === 'plus' ? isPlus : !isPlus);

    const matchesProvider = providerFilter === 'all' || user.provider === providerFilter;

    return matchesSearch && matchesAccountType && matchesRole && matchesSubscription && matchesProvider;
  });

  // Open modal to change account type
  const handleOpenAccountTypeModal = (targetUser: UserProfile) => {
    if (!isCallerSuperAdmin) {
      setActionError("Permission Denied: Only the Platform Owner / Super Admin is authorized to modify user account types.");
      return;
    }
    setModalTargetUser(targetUser);
    // Pre-select opposite type or default to teacher if unset
    if (targetUser.userType === 'student') {
      setSelectedNewType('teacher');
    } else if (targetUser.userType === 'teacher') {
      setSelectedNewType('student');
    } else {
      setSelectedNewType('teacher');
    }
    setModalError(null);
  };

  // Submit account type change
  const handleConfirmAccountTypeChange = async () => {
    if (!modalTargetUser) return;

    if (!isCallerSuperAdmin) {
      setModalError("Permission Denied: Only the Platform Owner / Super Admin can change account types.");
      return;
    }

    setIsSubmittingAccountType(true);
    setModalError(null);

    try {
      await updateUserAccountType(
        currentUserEmail,
        modalTargetUser.uid,
        modalTargetUser.email,
        modalTargetUser.name,
        modalTargetUser.userType,
        selectedNewType,
        currentUserRole
      );

      const typeLabel = selectedNewType === 'student' ? 'Student 🎓' : 'Teacher 👨‍🏫';
      setActionSuccess(`Successfully updated account type for ${modalTargetUser.name || modalTargetUser.email} to ${typeLabel}.`);
      
      // If current logged-in user changed their own account type (e.g. Owner self-change)
      if (modalTargetUser.uid === currentUserEmail || 
          modalTargetUser.email.toLowerCase() === currentUserEmail.toLowerCase()) {
        const updatedLocalUser: UserProfile = {
          ...modalTargetUser,
          userType: selectedNewType,
          needsOnboarding: false
        };
        onCurrentUserUpdated?.(updatedLocalUser);
      }

      setModalTargetUser(null);
      onRefreshUsers();
    } catch (err: any) {
      console.error("Account type change error:", err);
      setModalError(err?.message || "Failed to change account type. Please verify permissions.");
    } finally {
      setIsSubmittingAccountType(false);
      setTimeout(() => {
        setActionSuccess(null);
        setActionError(null);
      }, 6000);
    }
  };

  // Role Change (Separated Platform Security Roles)
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

  const getAccountTypeBadge = (userType?: UserType) => {
    if (userType === 'teacher') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30">
          <span className="text-sm">👨‍🏫</span>
          Teacher
        </span>
      );
    }
    if (userType === 'student') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
          <span className="text-sm">🎓</span>
          Student
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700">
        <span className="text-xs">⚠️</span>
        Not Set
      </span>
    );
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
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
        <UserIcon className="w-3.5 h-3.5" />
        User
      </span>
    );
  };

  const getSubscriptionBadge = (user: UserProfile) => {
    const isPlus = user.isPlusSubscriber || user.subscriptionTier === 'plus';
    if (isPlus) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
          <Sparkles className="w-3 h-3 text-[#8A2CB0]" />
          Plus Subscriber
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
        Free Tier
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
      case 'phone':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Phone / OTP
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20">
            Email
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
            User Account & Role Management
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Super Admin control over Teacher / Student workspace account types and platform administrative security roles.
          </p>
        </div>

        <button
          onClick={onRefreshUsers}
          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Directory
        </button>
      </div>

      {/* Sub-section Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
        <button
          id="btn-tab-account-types"
          onClick={() => setActiveSection('account_types')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeSection === 'account_types'
              ? 'bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>User Account Type Management</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-mono">
            {users.length}
          </span>
        </button>

        <button
          id="btn-tab-security-roles"
          onClick={() => setActiveSection('security_roles')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeSection === 'security_roles'
              ? 'bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Security Roles & Access Control</span>
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

        <div className="flex flex-wrap items-center gap-2">
          {activeSection === 'account_types' && (
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/60 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={accountTypeFilter}
                onChange={(e) => setAccountTypeFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none"
              >
                <option value="all">All Account Types</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
                <option value="not_set">Not Set</option>
              </select>
            </div>
          )}

          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/60 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none"
            >
              <option value="all">All Administrative Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/60 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
            <select
              value={subscriptionFilter}
              onChange={(e) => setSubscriptionFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none"
            >
              <option value="all">All Subscriptions</option>
              <option value="plus">Plus Subscriber</option>
              <option value="free">Free Tier</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 1: USER ACCOUNT TYPE MANAGEMENT */}
      {activeSection === 'account_types' && (
        <div className="space-y-4" id="section-user-account-type-management">
          <div className="bg-purple-50/50 dark:bg-purple-950/20 p-4 rounded-2xl border border-purple-200 dark:border-purple-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#8A2CB0]" />
                User Account Type Management
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                The Owner / Super Admin can change any account between <strong>Teacher</strong> and <strong>Student</strong> (including self-account). Changes apply immediately without modifying security roles or subscriptions.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Name</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Current Account Type</th>
                    <th className="py-3.5 px-4">User Role</th>
                    <th className="py-3.5 px-4">Subscription</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-gray-400">
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
                          {/* 1. Name */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {u.profilePhoto ? (
                                <img 
                                  src={u.profilePhoto} 
                                  alt={u.name} 
                                  className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700 shrink-0" 
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs shrink-0">
                                  {(u.name || u.email || 'U').charAt(0)}
                                </div>
                              )}
                              <div className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5 truncate max-w-[160px]">
                                <span className="truncate">{u.name || 'Anonymous User'}</span>
                                {isCurrentUser && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold shrink-0">
                                    You
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* 2. Email */}
                          <td className="py-3.5 px-4 font-mono text-gray-600 dark:text-gray-300 text-[11px]">
                            {u.email}
                          </td>

                          {/* 3. Current Account Type */}
                          <td className="py-3.5 px-4">
                            {getAccountTypeBadge(u.userType)}
                          </td>

                          {/* 4. User Role */}
                          <td className="py-3.5 px-4">
                            {getRoleBadge(u.role, u.email)}
                          </td>

                          {/* 5. Subscription */}
                          <td className="py-3.5 px-4">
                            {getSubscriptionBadge(u)}
                          </td>

                          {/* 6. Action */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleOpenAccountTypeModal(u)}
                              disabled={!isCallerSuperAdmin}
                              title={isCallerSuperAdmin ? "Change Account Type (Teacher ↔ Student)" : "Super Admin privileges required"}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 border border-indigo-200 dark:border-indigo-800 shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
                              <span>Change Account Type</span>
                            </button>
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
      )}

      {/* SECTION 2: SECURITY ROLES & ACCESS CONTROL */}
      {activeSection === 'security_roles' && (
        <div className="space-y-4" id="section-user-security-roles">
          <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-800/40">
            <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-500" />
              Administrative Security Roles & Access Control
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Governs administrative permissions (Super Admin, Admin, User). Account Type (Teacher / Student) and Subscriptions (Free / Plus) are managed independently.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">User Account</th>
                    <th className="py-3.5 px-4">Auth Provider</th>
                    <th className="py-3.5 px-4">Administrative Role</th>
                    <th className="py-3.5 px-4">Account Type</th>
                    <th className="py-3.5 px-4">Created Date</th>
                    <th className="py-3.5 px-4 text-right">Role Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-gray-400">
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

                          <td className="py-3.5 px-4">
                            {getAccountTypeBadge(u.userType)}
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
                                {/* Toggle Admin */}
                                <button
                                  onClick={() => handleRoleChange(u, u.role === 'admin' ? 'user' : 'admin')}
                                  title={u.role === 'admin' ? 'Revoke Admin Privileges' : 'Promote to Administrator'}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
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
                                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition-colors cursor-pointer ${
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
      )}

      {/* CHANGE ACCOUNT TYPE MODAL */}
      {modalTargetUser && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmittingAccountType) {
              setModalTargetUser(null);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-lg w-full overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
                  🎓
                </div>
                <div>
                  <h3 className="text-base font-black">Change Account Type</h3>
                  <p className="text-xs text-purple-200">
                    Modify workspace environment for {modalTargetUser.name || modalTargetUser.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalTargetUser(null)}
                disabled={isSubmittingAccountType}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* User Overview Card */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500">Target User</span>
                  <span className="text-xs font-black text-gray-900 dark:text-white">
                    {modalTargetUser.name || 'Anonymous User'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500">Email</span>
                  <span className="text-xs font-mono text-gray-700 dark:text-gray-300">
                    {modalTargetUser.email}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-2.5">
                  <span className="text-xs font-bold text-gray-500">Current Account Type</span>
                  <span className="font-black text-xs">
                    {modalTargetUser.userType === 'teacher' ? (
                      <span className="text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1">
                        👨‍🏫 Teacher
                      </span>
                    ) : modalTargetUser.userType === 'student' ? (
                      <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                        🎓 Student
                      </span>
                    ) : (
                      <span className="text-gray-500 font-bold flex items-center gap-1">
                        ⚠️ Not Set
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Selection: Change To */}
              <div className="space-y-3">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider">
                  Change to:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option: Teacher */}
                  <div
                    onClick={() => setSelectedNewType('teacher')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      selectedNewType === 'teacher'
                        ? 'border-[#8A2CB0] bg-purple-50/50 dark:bg-purple-950/30 ring-2 ring-purple-400/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-xl">
                        👨‍🏫
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedNewType === 'teacher' 
                          ? 'border-[#8A2CB0] bg-[#8A2CB0] text-white' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {selectedNewType === 'teacher' && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-gray-900 dark:text-white">Teacher</h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">
                        Question paper generation, question banks, CBSE/NCERT blueprints, and test creation tools.
                      </p>
                    </div>
                  </div>

                  {/* Option: Student */}
                  <div
                    onClick={() => setSelectedNewType('student')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      selectedNewType === 'student'
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 ring-2 ring-amber-400/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-xl">
                        🎓
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedNewType === 'student' 
                          ? 'border-amber-500 bg-amber-500 text-white' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {selectedNewType === 'student' && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-gray-900 dark:text-white">Student</h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">
                        AI study companion, interactive chapter practice, mock tests, and mistake notebook.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security & Data Safety Note */}
              <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-300 text-[11px] leading-relaxed">
                <strong>Data Safety:</strong> Changing account type updates only the workspace routing (<code className="font-mono">userType</code>). User role ({modalTargetUser.role}), subscription tier, and existing question papers remain completely intact.
              </div>

              {modalError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  {modalError}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalTargetUser(null)}
                disabled={isSubmittingAccountType}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-change-account-type"
                onClick={handleConfirmAccountTypeChange}
                disabled={isSubmittingAccountType}
                className="px-6 py-2.5 rounded-xl font-black text-xs text-white bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] hover:from-[#320f77] hover:to-[#772499] shadow-md transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2 cursor-pointer"
              >
                {isSubmittingAccountType ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Confirm Change</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
