import React from 'react';
import { Crown, ShieldCheck, GraduationCap } from 'lucide-react';
import { UserProfile } from '../types';
import { isSuperAdmin, isAdmin } from '../services/adminService';
import { isUserPlusSubscriber } from '../services/subscriptionService';
import { User } from 'firebase/auth';

export type BrandBadgeType = 'super_admin' | 'admin' | 'teacher' | 'plus' | 'free' | 'guest';

export interface BrandWordmarkProps {
  user?: User | null;
  userProfile?: UserProfile | null;
  isGuest?: boolean;
  className?: string;
  textClassName?: string;
  aiClassName?: string;
  iconSize?: string;
  showBadge?: boolean;
}

/**
 * Evaluates the highest-priority entitlement badge for the given user.
 * 
 * Priority Hierarchy:
 * 1. OWNER / SUPER ADMIN  → Crown icon
 * 2. ADMIN                → ShieldCheck icon
 * 3. TEACHER              → GraduationCap icon
 * 4. PLUS SUBSCRIBER      → "+" character (GenPaperAI+)
 * 5. GUEST                → Guest indicator
 * 6. FREE / NORMAL USER   → No badge (GenPaperAI)
 */
export function getBrandBadge(
  user?: User | null,
  userProfile?: UserProfile | null,
  isGuest?: boolean
): { type: BrandBadgeType; title: string } {
  if (isGuest && !user) {
    return { type: 'guest', title: 'Guest Mode (Unregistered)' };
  }

  const email = user?.email || userProfile?.email || null;
  const role = userProfile?.role;

  // 1. OWNER / SUPER ADMIN (Highest Priority)
  if (isSuperAdmin(email, role)) {
    return { type: 'super_admin', title: 'Platform Owner & Super Admin' };
  }

  // 2. ADMIN
  if (role === 'admin' || isAdmin(email, role)) {
    return { type: 'admin', title: 'Administrator' };
  }

  // 3. TEACHER
  if (role === 'teacher') {
    return { type: 'teacher', title: 'Educator' };
  }

  // 4. PLUS SUBSCRIBER
  if (userProfile && isUserPlusSubscriber(userProfile)) {
    return { type: 'plus', title: 'GenPaperAI Plus Subscriber' };
  }

  // 5. FREE / NORMAL USER
  return { type: 'free', title: 'GenPaperAI' };
}

export const BrandWordmark: React.FC<BrandWordmarkProps> = ({
  user,
  userProfile,
  isGuest,
  className = "inline-flex items-center tracking-tight font-bold whitespace-nowrap select-none",
  textClassName = "text-white drop-shadow-md",
  aiClassName = "text-amber-400 drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]",
  iconSize = "w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5",
  showBadge = true,
}) => {
  const badge = showBadge ? getBrandBadge(user, userProfile, isGuest) : { type: 'free' as BrandBadgeType, title: 'GenPaperAI' };

  return (
    <span className={className}>
      <span className={textClassName}>GenPaper</span>
      <span className={aiClassName}>AI</span>
      
      {/* Account Status / Role Badge appearing directly after "AI" */}
      {badge.type === 'guest' && (
        <span 
          className="inline-flex items-center ml-1 text-amber-200 text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-400/20 border border-amber-300/40 transform -translate-y-0.5" 
          title={badge.title}
          aria-label={badge.title}
        >
          Guest
        </span>
      )}

      {badge.type === 'super_admin' && (
        <span 
          className="inline-flex items-center ml-1 text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.7)] transform -translate-y-0.5 transition-transform hover:scale-110" 
          title={badge.title}
          aria-label={badge.title}
        >
          <Crown className={`${iconSize} fill-amber-400/40 text-amber-300`} strokeWidth={2.2} />
        </span>
      )}

      {badge.type === 'admin' && (
        <span 
          className="inline-flex items-center ml-1 text-sky-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.7)] transform -translate-y-0.5 transition-transform hover:scale-110" 
          title={badge.title}
          aria-label={badge.title}
        >
          <ShieldCheck className={`${iconSize} fill-sky-400/30 text-sky-300`} strokeWidth={2.2} />
        </span>
      )}

      {badge.type === 'teacher' && (
        <span 
          className="inline-flex items-center ml-1 text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.7)] transform -translate-y-0.5 transition-transform hover:scale-110" 
          title={badge.title}
          aria-label={badge.title}
        >
          <GraduationCap className={`${iconSize} fill-emerald-400/30 text-emerald-300`} strokeWidth={2.2} />
        </span>
      )}

      {badge.type === 'plus' && (
        <span 
          className={`${aiClassName} ml-0.5 font-black text-[1.1em] leading-none transform -translate-y-0.5 select-none transition-transform hover:scale-110`}
          title={badge.title}
          aria-label={badge.title}
        >
          +
        </span>
      )}
    </span>
  );
};

export default BrandWordmark;
