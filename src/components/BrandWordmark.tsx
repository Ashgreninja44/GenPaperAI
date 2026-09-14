import React from 'react';
import { Crown, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';
import { isSuperAdmin, isAdmin } from '../services/adminService';
import { isUserPlusSubscriber } from '../services/subscriptionService';
import { User } from 'firebase/auth';

export type BrandBadgeType = 'super_admin' | 'admin' | 'plus' | 'free' | 'guest';

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
 * 3. PLUS SUBSCRIBER      → "+" character (GenPaperAI+)
 * 4. GUEST                → Guest indicator
 * 5. FREE / NORMAL USER   → No badge (GenPaperAI)
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

  // 3. PLUS SUBSCRIBER
  if (userProfile && isUserPlusSubscriber(userProfile)) {
    return { type: 'plus', title: 'GenPaperAI Plus Subscriber' };
  }

  // 4. FREE / NORMAL USER
  return { type: 'free', title: 'GenPaperAI' };
}

export const BrandWordmark: React.FC<BrandWordmarkProps> = ({
  user,
  userProfile,
  isGuest,
  className = "inline-flex items-center tracking-tight font-extrabold whitespace-nowrap select-none",
  textClassName = "text-white dark:text-white font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]",
  aiClassName = "text-amber-300 dark:text-amber-300 font-black ml-0.5 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] tracking-wide",
  iconSize = "w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5",
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
          className="inline-flex items-center ml-1.5 text-amber-200 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-400/30 border border-amber-300/60 shadow-sm transform -translate-y-0.5" 
          title={badge.title}
          aria-label={badge.title}
        >
          Guest
        </span>
      )}

      {badge.type === 'super_admin' && (
        <span 
          className="inline-flex items-center ml-1.5 text-amber-300 drop-shadow-[0_0_10px_rgba(252,211,77,0.9)] transform -translate-y-0.5 transition-transform hover:scale-115" 
          title={badge.title}
          aria-label={badge.title}
        >
          <Crown className={`${iconSize} fill-amber-400 text-amber-300 drop-shadow-md`} strokeWidth={2.4} />
        </span>
      )}

      {badge.type === 'admin' && (
        <span 
          className="inline-flex items-center ml-1.5 text-sky-300 drop-shadow-[0_0_10px_rgba(56,189,248,0.9)] transform -translate-y-0.5 transition-transform hover:scale-115" 
          title={badge.title}
          aria-label={badge.title}
        >
          <ShieldCheck className={`${iconSize} fill-sky-400 text-sky-300 drop-shadow-md`} strokeWidth={2.4} />
        </span>
      )}

      {badge.type === 'plus' && (
        <span 
          className={`${aiClassName} ml-1 font-black text-[1.15em] leading-none transform -translate-y-0.5 select-none transition-transform hover:scale-115 drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]`}
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
