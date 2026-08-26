import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  UserProfile, 
  SubscriptionGlobalConfig, 
  SubscriptionPlanConfig, 
  SubscriptionSource, 
  SubscriptionDuration, 
  UserSubscriptionDetails,
  SubscriptionEntitlements 
} from '../types';
import { isSuperAdmin, isAdmin, logAdminAction, OWNER_EMAIL } from './adminService';

// ==========================================
// DEFAULT CENTRALIZED SUBSCRIPTION CONFIG
// ==========================================

export const DEFAULT_FREE_ENTITLEMENTS: SubscriptionEntitlements = {
  papersPerMonth: 5,
  advancedModelsAllowed: false,
  questionBankMaxItems: 50,
  webExtractsPerMonth: 10,
  adFree: false,
  advancedCustomization: false,
  priorityGeneration: false,
  increasedStorage: false
};

export const DEFAULT_PLUS_ENTITLEMENTS: SubscriptionEntitlements = {
  papersPerMonth: 50,
  advancedModelsAllowed: true,
  questionBankMaxItems: 'unlimited',
  webExtractsPerMonth: 200,
  adFree: true,
  advancedCustomization: true,
  priorityGeneration: true,
  increasedStorage: true
};

export const DEFAULT_SUBSCRIPTION_CONFIG: SubscriptionGlobalConfig = {
  pricingVisible: true, // Super Admin Master Toggle for customer-facing pricing section
  plans: {
    free: {
      id: 'free',
      name: 'Free',
      price: 0,
      currency: '₹',
      billingPeriodMonths: 0,
      billingPeriodDisplay: 'Free Forever',
      description: 'Essential question paper generation for everyday teaching needs.',
      entitlements: DEFAULT_FREE_ENTITLEMENTS,
      featuresList: [
        'Basic question-paper generation (5 papers / month)',
        'Standard curriculum question bank (up to 50 questions)',
        'Basic Web Extract capability (10 extracts / month)',
        'Standard curriculum formatting & PDF export',
        'Advertisements enabled'
      ]
    },
    plus: {
      id: 'plus',
      name: 'GenPaperAI Plus',
      price: 100,
      currency: '₹',
      billingPeriodMonths: 6,
      billingPeriodDisplay: '6 months',
      description: 'High-capacity examination engineering with priority models and zero advertisements.',
      badge: 'Recommended',
      highlight: true,
      entitlements: DEFAULT_PLUS_ENTITLEMENTS,
      featuresList: [
        'Higher question-paper generation limits (50 papers / month)',
        'Access to advanced paper-generation AI models where enabled',
        'Higher Question Bank usage limits (Unlimited storage)',
        'Higher Web Extract usage limits (200 extracts / month)',
        '100% Ad-Free experience across all views',
        'Advanced customization & custom school watermark',
        'Priority generation processing',
        'Increased paper history & revision storage'
      ]
    }
  },
  updatedAt: Date.now(),
  updatedBy: 'system'
};

// ==========================================
// 1. REAL-TIME SUBSCRIPTION CONFIGURATION
// ==========================================

export async function getSubscriptionConfig(): Promise<SubscriptionGlobalConfig> {
  try {
    const configDocRef = doc(db, 'app_config', 'subscriptions');
    const snap = await getDoc(configDocRef);
    if (snap.exists()) {
      const data = snap.data() as SubscriptionGlobalConfig;
      return {
        ...DEFAULT_SUBSCRIPTION_CONFIG,
        ...data,
        pricingVisible: typeof data.pricingVisible === 'boolean' ? data.pricingVisible : DEFAULT_SUBSCRIPTION_CONFIG.pricingVisible,
        plans: {
          free: { ...DEFAULT_SUBSCRIPTION_CONFIG.plans.free, ...(data.plans?.free || {}) },
          plus: { ...DEFAULT_SUBSCRIPTION_CONFIG.plans.plus, ...(data.plans?.plus || {}) }
        }
      };
    }
  } catch (err) {
    console.warn('[Subscription Service] Failed to load config from Firestore, using default:', err);
  }
  return DEFAULT_SUBSCRIPTION_CONFIG;
}

export function subscribeToSubscriptionConfig(
  callback: (config: SubscriptionGlobalConfig) => void
): () => void {
  const configDocRef = doc(db, 'app_config', 'subscriptions');
  return onSnapshot(
    configDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as SubscriptionGlobalConfig;
        callback({
          ...DEFAULT_SUBSCRIPTION_CONFIG,
          ...data,
          pricingVisible: typeof data.pricingVisible === 'boolean' ? data.pricingVisible : DEFAULT_SUBSCRIPTION_CONFIG.pricingVisible,
          plans: {
            free: { ...DEFAULT_SUBSCRIPTION_CONFIG.plans.free, ...(data.plans?.free || {}) },
            plus: { ...DEFAULT_SUBSCRIPTION_CONFIG.plans.plus, ...(data.plans?.plus || {}) }
          }
        });
      } else {
        callback(DEFAULT_SUBSCRIPTION_CONFIG);
      }
    },
    (err) => {
      console.warn('[Subscription Service] Subscription listener error:', err);
      callback(DEFAULT_SUBSCRIPTION_CONFIG);
    }
  );
}

export async function updateSubscriptionGlobalConfig(
  newConfig: SubscriptionGlobalConfig,
  adminEmail: string,
  adminRole?: string
): Promise<void> {
  const isSuper = isSuperAdmin(adminEmail, adminRole);
  const isAdm = isAdmin(adminEmail, adminRole);

  if (!isSuper && !isAdm) {
    throw new Error('Unauthorized: Administrative privileges required to modify subscription settings.');
  }

  const updatedConfig: SubscriptionGlobalConfig = {
    ...newConfig,
    updatedAt: Date.now(),
    updatedBy: adminEmail
  };

  const configDocRef = doc(db, 'app_config', 'subscriptions');
  await setDoc(configDocRef, updatedConfig, { merge: true });

  // Record action in Admin Audit Log
  await logAdminAction(
    adminEmail,
    'CHANGED_SUBSCRIPTION_CONFIG',
    'app_config/subscriptions',
    {
      pricingVisible: updatedConfig.pricingVisible,
      plusPrice: updatedConfig.plans.plus.price,
      plusCurrency: updatedConfig.plans.plus.currency,
      plusBillingPeriod: updatedConfig.plans.plus.billingPeriodDisplay,
      summary: `Changed subscription configuration: Customer-Facing Pricing set to ${updatedConfig.pricingVisible ? 'ON' : 'OFF'}, Plus Price: ${updatedConfig.plans.plus.currency}${updatedConfig.plans.plus.price}/${updatedConfig.plans.plus.billingPeriodDisplay}`
    }
  );
}

// ==========================================
// 2. DURATION CALCULATIONS
// ==========================================

export function calculateExpirationTimestamp(duration: SubscriptionDuration, baseTimestamp: number = Date.now()): number | null {
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  switch (duration) {
    case '1_month':
      return baseTimestamp + 30 * ONE_DAY_MS;
    case '3_months':
      return baseTimestamp + 90 * ONE_DAY_MS;
    case '6_months':
      return baseTimestamp + 180 * ONE_DAY_MS;
    case '1_year':
      return baseTimestamp + 365 * ONE_DAY_MS;
    case 'lifetime':
      return null;
    default:
      return baseTimestamp + 180 * ONE_DAY_MS;
  }
}

export function formatDurationLabel(duration: SubscriptionDuration): string {
  switch (duration) {
    case '1_month': return '1 Month';
    case '3_months': return '3 Months';
    case '6_months': return '6 Months';
    case '1_year': return '1 Year';
    case 'lifetime': return 'Lifetime';
    default: return duration;
  }
}

// ==========================================
// 3. USER ENTITLEMENT HELPERS
// ==========================================

export function isUserPlusSubscriber(user?: UserProfile | null): boolean {
  if (!user) return false;

  // Platform Owner & Super Admins automatically receive full entitlements
  if (isSuperAdmin(user.email, user.role)) {
    return true;
  }

  // Check expiration if set
  if (user.subscriptionDetails?.expirationDate) {
    if (Date.now() > user.subscriptionDetails.expirationDate) {
      return false;
    }
  }

  if (user.subscriptionTier === 'plus' || user.isPlusSubscriber === true || user.role === 'plus') {
    return true;
  }

  return false;
}

export interface UserSubscriptionStatusInfo {
  tier: 'free' | 'plus';
  isOwner: boolean;
  isAdmin: boolean;
  isActive: boolean;
  isExpired: boolean;
  source: SubscriptionSource;
  startDate: number | null;
  expirationDate: number | null;
  formattedExpiration: string;
  formattedStartDate: string;
  planName: string;
  entitlements: SubscriptionEntitlements;
  grantReason?: string;
  grantedBy?: string;
}

export function getUserSubscriptionStatus(
  user?: UserProfile | null,
  config?: SubscriptionGlobalConfig | null
): UserSubscriptionStatusInfo {
  const effectiveConfig = config || DEFAULT_SUBSCRIPTION_CONFIG;
  const isOwner = user ? (user.email.trim().toLowerCase() === OWNER_EMAIL.toLowerCase()) : false;
  const isSuper = user ? isSuperAdmin(user.email, user.role) : false;
  const isAdm = user ? isAdmin(user.email, user.role) : false;

  if (isOwner || isSuper) {
    return {
      tier: 'plus',
      isOwner: true,
      isAdmin: true,
      isActive: true,
      isExpired: false,
      source: 'Admin Grant',
      startDate: user?.createdAt || Date.now(),
      expirationDate: null,
      formattedExpiration: 'Permanent / Unlimited (Owner & Super Admin)',
      formattedStartDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active',
      planName: 'GenPaperAI Plus (Super Admin Entitlements)',
      entitlements: effectiveConfig.plans.plus.entitlements,
      grantReason: 'Platform Administrator Privilege',
      grantedBy: 'System'
    };
  }

  const sub = user?.subscriptionDetails;
  const isPlus = isUserPlusSubscriber(user);
  const isExpired = !!sub?.expirationDate && Date.now() > sub.expirationDate;

  if (isPlus) {
    return {
      tier: 'plus',
      isOwner: false,
      isAdmin: isAdm,
      isActive: true,
      isExpired: false,
      source: sub?.source || 'Admin Grant',
      startDate: sub?.startDate || user?.createdAt || Date.now(),
      expirationDate: sub?.expirationDate ?? null,
      formattedExpiration: sub?.expirationDate 
        ? new Date(sub.expirationDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
        : 'Lifetime Access',
      formattedStartDate: sub?.startDate 
        ? new Date(sub.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
        : (user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'),
      planName: effectiveConfig.plans.plus.name,
      entitlements: effectiveConfig.plans.plus.entitlements,
      grantReason: sub?.grantReason,
      grantedBy: sub?.grantedBy
    };
  }

  return {
    tier: 'free',
    isOwner: false,
    isAdmin: isAdm,
    isActive: true,
    isExpired,
    source: sub?.source || 'Promotional',
    startDate: user?.createdAt || null,
    expirationDate: sub?.expirationDate ?? null,
    formattedExpiration: isExpired ? 'Expired' : 'Free Forever',
    formattedStartDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active',
    planName: effectiveConfig.plans.free.name,
    entitlements: effectiveConfig.plans.free.entitlements,
    grantReason: sub?.grantReason,
    grantedBy: sub?.grantedBy
  };
}

// ==========================================
// 4. SUPER ADMIN MANUAL SUBSCRIPTION GRANTS
// ==========================================

export async function grantUserSubscription(
  targetUserUid: string,
  targetUserEmail: string,
  planId: 'plus',
  duration: SubscriptionDuration,
  source: SubscriptionSource,
  reason: string | undefined,
  adminEmail: string,
  adminRole?: string
): Promise<void> {
  const isSuper = isSuperAdmin(adminEmail, adminRole);
  const isAdm = isAdmin(adminEmail, adminRole);

  if (!isSuper && !isAdm) {
    throw new Error('Unauthorized: Only Super Admins and authorized Administrators can grant subscriptions.');
  }

  const expirationDate = calculateExpirationTimestamp(duration, Date.now());
  const formattedDuration = formatDurationLabel(duration);

  const subscriptionDetails: UserSubscriptionDetails = {
    tier: 'plus',
    status: 'active',
    source,
    startDate: Date.now(),
    expirationDate,
    grantedBy: adminEmail,
    grantReason: reason?.trim() || '',
    lastUpdated: Date.now()
  };

  const userDocRef = doc(db, 'users', targetUserUid);
  await updateDoc(userDocRef, {
    subscriptionTier: 'plus',
    isPlusSubscriber: true,
    subscriptionDetails
  });

  // Log in Admin Audit Log
  await logAdminAction(
    adminEmail,
    'GRANT_SUBSCRIPTION',
    `users/${targetUserUid}`,
    {
      targetUserEmail,
      targetUserUid,
      plan: 'GenPaperAI Plus',
      duration: formattedDuration,
      source,
      reason: reason?.trim() || 'No reason provided',
      expirationDate: expirationDate ? new Date(expirationDate).toISOString() : 'Lifetime',
      summary: `Granted GenPaperAI Plus to user: ${targetUserEmail} (Duration: ${formattedDuration}, Source: ${source}${reason ? `, Reason: ${reason}` : ''})`
    }
  );
}

export async function revokeUserSubscription(
  targetUserUid: string,
  targetUserEmail: string,
  reason: string | undefined,
  adminEmail: string,
  adminRole?: string
): Promise<void> {
  const isSuper = isSuperAdmin(adminEmail, adminRole);
  const isAdm = isAdmin(adminEmail, adminRole);

  if (!isSuper && !isAdm) {
    throw new Error('Unauthorized: Only Super Admins and authorized Administrators can revoke subscriptions.');
  }

  const subscriptionDetails: UserSubscriptionDetails = {
    tier: 'free',
    status: 'canceled',
    source: 'Admin Grant',
    startDate: Date.now(),
    expirationDate: Date.now(),
    grantedBy: adminEmail,
    grantReason: reason?.trim() || 'Revoked by administrator',
    lastUpdated: Date.now()
  };

  const userDocRef = doc(db, 'users', targetUserUid);
  await updateDoc(userDocRef, {
    subscriptionTier: 'free',
    isPlusSubscriber: false,
    subscriptionDetails
  });

  // Log in Admin Audit Log
  await logAdminAction(
    adminEmail,
    'REVOKE_SUBSCRIPTION',
    `users/${targetUserUid}`,
    {
      targetUserEmail,
      targetUserUid,
      reason: reason?.trim() || 'No reason provided',
      summary: `Revoked GenPaperAI Plus from user: ${targetUserEmail}${reason ? ` (Reason: ${reason})` : ''}`
    }
  );
}

export async function extendUserSubscription(
  targetUserUid: string,
  targetUserEmail: string,
  extensionDuration: SubscriptionDuration,
  reason: string | undefined,
  adminEmail: string,
  adminRole?: string,
  currentExpirationDate?: number | null
): Promise<void> {
  const isSuper = isSuperAdmin(adminEmail, adminRole);
  const isAdm = isAdmin(adminEmail, adminRole);

  if (!isSuper && !isAdm) {
    throw new Error('Unauthorized: Only Super Admins and authorized Administrators can extend subscriptions.');
  }

  const baseTimestamp = (currentExpirationDate && currentExpirationDate > Date.now())
    ? currentExpirationDate
    : Date.now();

  const newExpirationDate = calculateExpirationTimestamp(extensionDuration, baseTimestamp);
  const formattedDuration = formatDurationLabel(extensionDuration);

  const subscriptionDetails: UserSubscriptionDetails = {
    tier: 'plus',
    status: 'active',
    source: 'Admin Grant',
    startDate: Date.now(),
    expirationDate: newExpirationDate,
    grantedBy: adminEmail,
    grantReason: reason?.trim() || `Extended by ${formattedDuration}`,
    lastUpdated: Date.now()
  };

  const userDocRef = doc(db, 'users', targetUserUid);
  await updateDoc(userDocRef, {
    subscriptionTier: 'plus',
    isPlusSubscriber: true,
    subscriptionDetails
  });

  // Log in Admin Audit Log
  await logAdminAction(
    adminEmail,
    'EXTEND_SUBSCRIPTION',
    `users/${targetUserUid}`,
    {
      targetUserEmail,
      targetUserUid,
      extension: formattedDuration,
      reason: reason?.trim() || 'None',
      newExpirationDate: newExpirationDate ? new Date(newExpirationDate).toISOString() : 'Lifetime',
      summary: `Extended GenPaperAI Plus for user: ${targetUserEmail} by ${formattedDuration}${reason ? ` (Reason: ${reason})` : ''}`
    }
  );
}
