import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  UserProfile, 
  AdvertisementConfig, 
  AdPlacementId, 
  AdPlacementConfig, 
  AdAnalyticsSummary, 
  AdErrorLog 
} from '../types';
import { isSuperAdmin, isAdmin, logAdminAction } from './adminService';

export const ADSENSE_CLIENT_ID = 'ca-pub-7837168331919243';

// Strictly Prohibited Placements (Enforced at Service Layer)
export const PROHIBITED_PLACEMENT_IDS: ReadonlyArray<AdPlacementId> = [
  'paper_preview',
  'generated_pdf',
  'question_content'
];

export const DEFAULT_AD_PLACEMENTS: Record<string, AdPlacementConfig> = {
  dashboard_banner: {
    id: 'dashboard_banner',
    name: 'Dashboard Utility Banner',
    description: 'Displays at the non-critical utility footer section of the dashboard overview.',
    allowed: true,
    enabled: true,
    category: 'dashboard',
    format: 'horizontal'
  },
  dashboard_sidebar: {
    id: 'dashboard_sidebar',
    name: 'Dashboard Utility Sidebar',
    description: 'Displays in the secondary dashboard side panel when visible.',
    allowed: true,
    enabled: false,
    category: 'dashboard',
    format: 'rectangle'
  },
  footer_banner: {
    id: 'footer_banner',
    name: 'Platform Utility Footer Banner',
    description: 'Displays at the bottom of non-generation secondary views (e.g. Question Bank list).',
    allowed: true,
    enabled: true,
    category: 'general',
    format: 'horizontal'
  },
  // Immutable prohibited placements - can NEVER be enabled
  paper_preview: {
    id: 'paper_preview',
    name: 'Question Paper Preview & Viewers',
    description: 'STRICTLY PROHIBITED: Advertisements must never appear over or inside question paper previews.',
    allowed: false,
    enabled: false,
    category: 'prohibited'
  },
  generated_pdf: {
    id: 'generated_pdf',
    name: 'Generated PDF Documents & Exports',
    description: 'STRICTLY PROHIBITED: Advertisements must never be embedded into printable documents or PDFs.',
    allowed: false,
    enabled: false,
    category: 'prohibited'
  },
  question_content: {
    id: 'question_content',
    name: 'Active Question & Answer Editor',
    description: 'STRICTLY PROHIBITED: Advertisements must never obscure questions, options, or active editing fields.',
    allowed: false,
    enabled: false,
    category: 'prohibited'
  }
};

export const DEFAULT_AD_CONFIG: AdvertisementConfig = {
  enabled: true,
  adSense: {
    clientId: ADSENSE_CLIENT_ID,
    isVerified: true,
    testMode: false
  },
  placements: DEFAULT_AD_PLACEMENTS,
  updatedAt: Date.now()
};

// ==========================================
// 1. CENTRALIZED AD ELIGIBILITY & ENTITLEMENTS
// ==========================================

/**
 * Checks if a user is eligible to see advertisements.
 * Single source of truth across the entire application:
 * - If global ads are OFF -> false
 * - Owner / Super Admin / Platform Admins -> false (Ad-Free)
 * - Plus Subscribers -> false (Ad-Free Entitlement)
 * - Free Users -> true (when global ads are enabled)
 */
export function isUserEligibleForAds(
  user?: UserProfile | null,
  config?: AdvertisementConfig | null
): boolean {
  const effectiveConfig = config || DEFAULT_AD_CONFIG;

  // 1. Master Global Switch Check
  if (!effectiveConfig.enabled) {
    return false;
  }

  // 2. Unauthenticated / Guest Users -> Treated as Free Tier
  if (!user) {
    return true;
  }

  // 3. Platform Owner & Administrators -> Suppressed / Ad-Free
  if (isSuperAdmin(user.email, user.role) || isAdmin(user.email, user.role)) {
    return false;
  }

  // 4. Plus Subscribers -> Ad-Free Entitlement
  if (
    user.role === 'plus' ||
    user.subscriptionTier === 'plus' ||
    user.isPlusSubscriber === true
  ) {
    return false;
  }

  // 5. Standard Free Users -> Eligible for Advertisements
  return true;
}

/**
 * Validates if an individual ad placement is active and allowed for the user.
 */
export function isPlacementActive(
  placementId: AdPlacementId,
  user?: UserProfile | null,
  config?: AdvertisementConfig | null
): boolean {
  // 1. Strict Prohibited Placements Gate - NEVER ALLOWED under any condition
  if (PROHIBITED_PLACEMENT_IDS.includes(placementId)) {
    return false;
  }

  const effectiveConfig = config || DEFAULT_AD_CONFIG;

  // 2. Global Ads Check
  if (!effectiveConfig.enabled) {
    return false;
  }

  // 3. User Entitlement Check
  if (!isUserEligibleForAds(user, effectiveConfig)) {
    return false;
  }

  // 4. Placement Specific Switch
  const placement = effectiveConfig.placements[placementId];
  if (!placement) {
    return false;
  }

  return Boolean(placement.allowed && placement.enabled);
}

// ==========================================
// 2. CONFIGURATION PERSISTENCE & AUDIT LOGS
// ==========================================

/**
 * Sanitizes an advertisement configuration, ensuring prohibited placements are strictly locked.
 */
export function sanitizeAdConfig(incomingConfig: AdvertisementConfig): AdvertisementConfig {
  const mergedPlacements = { ...DEFAULT_AD_PLACEMENTS, ...(incomingConfig.placements || {}) };

  // Enforce prohibited placement locks
  PROHIBITED_PLACEMENT_IDS.forEach((prohibitedId) => {
    if (mergedPlacements[prohibitedId]) {
      mergedPlacements[prohibitedId] = {
        ...mergedPlacements[prohibitedId],
        allowed: false,
        enabled: false
      };
    }
  });

  return {
    enabled: Boolean(incomingConfig.enabled),
    adSense: {
      clientId: incomingConfig.adSense?.clientId || ADSENSE_CLIENT_ID,
      isVerified: Boolean(incomingConfig.adSense?.isVerified),
      testMode: Boolean(incomingConfig.adSense?.testMode)
    },
    placements: mergedPlacements,
    updatedAt: Date.now(),
    updatedBy: incomingConfig.updatedBy
  };
}

/**
 * Subscribes to real-time updates for global advertisement configuration.
 */
export function subscribeToAdvertisementConfig(
  callback: (config: AdvertisementConfig) => void
): () => void {
  const docRef = doc(db, 'app_config', 'advertisements');

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const rawData = snapshot.data() as AdvertisementConfig;
        callback(sanitizeAdConfig(rawData));
      } else {
        callback(DEFAULT_AD_CONFIG);
      }
    },
    (err) => {
      console.warn('[Ad Configuration Subscription] Error:', err);
      callback(DEFAULT_AD_CONFIG);
    }
  );
}

/**
 * Fetches the current advertisement configuration.
 */
export async function getAdvertisementConfig(): Promise<AdvertisementConfig> {
  try {
    const docRef = doc(db, 'app_config', 'advertisements');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return sanitizeAdConfig(snap.data() as AdvertisementConfig);
    }
  } catch (err) {
    console.warn('[Get Ad Configuration] Error:', err);
  }
  return DEFAULT_AD_CONFIG;
}

/**
 * Updates advertisement configuration with administrator authorization checks and audit logging.
 */
export async function updateAdvertisementConfig(
  newConfig: AdvertisementConfig,
  adminEmail: string,
  adminRole?: string,
  previousConfig?: AdvertisementConfig | null
): Promise<void> {
  if (!isAdmin(adminEmail, adminRole)) {
    throw new Error('Unauthorized: Administrative privileges required to configure advertisements.');
  }

  const sanitized = sanitizeAdConfig({
    ...newConfig,
    updatedBy: adminEmail
  });

  const docRef = doc(db, 'app_config', 'advertisements');
  await setDoc(docRef, sanitized, { merge: true });

  // Generate clear descriptive audit log actions
  const auditActions: string[] = [];

  if (previousConfig) {
    if (previousConfig.enabled !== sanitized.enabled) {
      auditActions.push(sanitized.enabled ? 'Advertisements enabled' : 'Advertisements disabled');
    }

    Object.keys(sanitized.placements).forEach((pId) => {
      const prevP = previousConfig.placements[pId];
      const curP = sanitized.placements[pId];
      if (prevP && curP && prevP.enabled !== curP.enabled && curP.allowed) {
        auditActions.push(`${curP.name} placement ${curP.enabled ? 'enabled' : 'disabled'}`);
      }
    });

    if (previousConfig.adSense.testMode !== sanitized.adSense.testMode) {
      auditActions.push(`AdSense test mode set to ${sanitized.adSense.testMode ? 'ON' : 'OFF'}`);
    }
  }

  const primaryAction = auditActions.length > 0 ? auditActions.join('; ') : 'Ad configuration changed';

  await logAdminAction(
    adminEmail,
    'AD_CONFIG_UPDATED',
    'app_config:advertisements',
    {
      summary: primaryAction,
      globallyEnabled: sanitized.enabled,
      activePlacementsCount: Object.values(sanitized.placements).filter(p => p.allowed && p.enabled).length,
      clientId: sanitized.adSense.clientId
    }
  );
}

// ==========================================
// 3. AD ERROR DIAGNOSTICS & TELEMETRY
// ==========================================

const inMemoryAdErrors: AdErrorLog[] = [];

/**
 * Logs a non-critical advertisement rendering or network failure.
 */
export function logAdError(placementId: string, errorReason: string): void {
  const errorEntry: AdErrorLog = {
    id: `ad_err_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    placementId,
    errorReason,
    timestamp: Date.now()
  };

  inMemoryAdErrors.unshift(errorEntry);
  if (inMemoryAdErrors.length > 50) {
    inMemoryAdErrors.pop();
  }

  // Non-blocking log to console for debugging
  console.info(`[GenPaperAI Ad Telemetry] Non-critical ad error at placement "${placementId}":`, errorReason);
}

/**
 * Retrieves recent non-critical ad error events for administrator review.
 */
export function getRecentAdErrors(): AdErrorLog[] {
  return [...inMemoryAdErrors];
}

// ==========================================
// 4. AD REPORTING & METRICS (NO FABRICATION)
// ==========================================

/**
 * Returns advertisement metrics summary.
 * Strictly complies with accuracy requirements: does NOT fabricate fake revenue or clicks.
 */
export function getAdSenseAnalyticsReport(): AdAnalyticsSummary {
  return {
    reportingConnected: false,
    statusMessage: 'AdSense reporting not connected',
    totalImpressions: 0,
    totalClicks: 0,
    estimatedRevenue: 'AdSense reporting not connected',
    lastUpdated: Date.now()
  };
}
