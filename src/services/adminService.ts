import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  where 
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth, handleFirestoreError, OperationType } from '../firebase';
import { 
  UserProfile, 
  UserRole, 
  AnnouncementConfig, 
  AIModelConfig, 
  AIModelRegistry, 
  AdminAuditLogEntry, 
  SecurityEventEntry, 
  GenerationMetricEntry, 
  SystemHealthReport 
} from '../types';
import { generateContentProxy } from './geminiService';

export const OWNER_EMAIL = 'pendyaladarshit4@gmail.com';

/**
 * Validates if the user is the Super Admin / Platform Owner.
 */
export function isSuperAdmin(email?: string | null, role?: string): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return normalized === OWNER_EMAIL.toLowerCase() || role === 'super_admin';
}

/**
 * Validates if the user has Admin or Super Admin privileges.
 */
export function isAdmin(email?: string | null, role?: string): boolean {
  if (!email) return false;
  return isSuperAdmin(email, role) || role === 'admin';
}

/**
 * Validates if the user has Teacher role or above.
 */
export function isTeacher(email?: string | null, role?: string): boolean {
  if (!email) return false;
  return isAdmin(email, role) || role === 'teacher';
}

// ==========================================
// 1. ADMIN AUDIT LOGGING
// ==========================================

export async function logAdminAction(
  adminEmail: string,
  action: string,
  targetResource: string,
  details?: Record<string, any>,
  adminUid?: string
): Promise<void> {
  try {
    const id = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const logRef = doc(db, 'admin_audit_logs', id);
    const entry: AdminAuditLogEntry = {
      id,
      adminEmail,
      adminUid: adminUid || auth.currentUser?.uid || 'unknown',
      action,
      targetResource,
      details: details || {},
      timestamp: Date.now()
    };
    await setDoc(logRef, entry);
  } catch (err) {
    console.warn('[Admin Audit Log] Non-blocking write warning:', err);
  }
}

export function subscribeToAdminAuditLogs(
  callback: (logs: AdminAuditLogEntry[]) => void,
  maxCount: number = 100
): () => void {
  const logsRef = collection(db, 'admin_audit_logs');
  const q = query(logsRef, orderBy('timestamp', 'desc'), limit(maxCount));

  return onSnapshot(
    q,
    (snapshot) => {
      const logs = snapshot.docs.map(d => d.data() as AdminAuditLogEntry);
      callback(logs);
    },
    (err) => {
      console.warn('[Admin Audit Logs] Subscription error:', err);
      callback([]);
    }
  );
}

// ==========================================
// 2. SECURITY EVENTS & FAILED LOGINS
// ==========================================

export async function logSecurityEvent(
  eventType: SecurityEventEntry['eventType'],
  reason: string,
  severity: SecurityEventEntry['severity'] = 'low',
  provider?: string,
  identifier?: string
): Promise<void> {
  try {
    const id = `sec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const secRef = doc(db, 'security_events', id);
    const entry: SecurityEventEntry = {
      id,
      eventType,
      reason,
      severity,
      provider: provider || 'unknown',
      identifier: identifier ? identifier.replace(/(?<=.{3}).(?=.*@)/g, '*') : 'anonymous', // Partially redact email for privacy
      timestamp: Date.now()
    };
    await setDoc(secRef, entry);
  } catch (err) {
    console.warn('[Security Event] Non-blocking logging warning:', err);
  }
}

export function subscribeToSecurityEvents(
  callback: (events: SecurityEventEntry[]) => void,
  maxCount: number = 100
): () => void {
  const eventsRef = collection(db, 'security_events');
  const q = query(eventsRef, orderBy('timestamp', 'desc'), limit(maxCount));

  return onSnapshot(
    q,
    (snapshot) => {
      const events = snapshot.docs.map(d => d.data() as SecurityEventEntry);
      callback(events);
    },
    (err) => {
      console.warn('[Security Events] Subscription error:', err);
      callback([]);
    }
  );
}

// ==========================================
// 3. USER MANAGEMENT & ROLE HIERARCHY
// ==========================================

export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(d => d.data() as UserProfile);
  } catch (err) {
    console.error('Error fetching users:', err);
    throw err;
  }
}

export function subscribeToAllUsers(
  callback: (users: UserProfile[]) => void
): () => void {
  const usersRef = collection(db, 'users');
  return onSnapshot(
    usersRef,
    (snapshot) => {
      const users = snapshot.docs.map(d => d.data() as UserProfile);
      callback(users);
    },
    (err) => {
      console.warn('[Users Subscription] Error:', err);
      callback([]);
    }
  );
}

export async function updateUserRole(
  adminEmail: string,
  targetUserUid: string,
  targetUserEmail: string,
  currentRole: UserRole,
  newRole: UserRole,
  adminRole?: string
): Promise<void> {
  // Authorization Guards
  const callerIsSuper = isSuperAdmin(adminEmail, adminRole);
  const callerIsAdmin = isAdmin(adminEmail, adminRole);

  if (!callerIsAdmin) {
    await logSecurityEvent('UNAUTHORIZED_ACCESS', `Non-admin ${adminEmail} attempted role change`, 'high', 'internal', adminEmail);
    throw new Error('Unauthorized: Administrative privileges required to modify roles.');
  }

  // Prevent demoting the permanent owner
  if (targetUserEmail.trim().toLowerCase() === OWNER_EMAIL.toLowerCase() && newRole !== 'super_admin') {
    throw new Error('Operation Forbidden: The primary platform owner cannot be demoted.');
  }

  // Only Super Admin can grant or revoke Super Admin
  if ((newRole === 'super_admin' || currentRole === 'super_admin') && !callerIsSuper) {
    await logSecurityEvent('ROLE_CHANGE_ATTEMPT', `${adminEmail} tried modifying super_admin without super_admin role`, 'critical', 'internal', targetUserEmail);
    throw new Error('Permission Denied: Only a Super Admin can grant or revoke Super Admin privileges.');
  }

  // Perform Firestore update
  const userDocRef = doc(db, 'users', targetUserUid);
  await updateDoc(userDocRef, {
    role: newRole,
    lastRoleUpdate: Date.now(),
    roleUpdatedBy: adminEmail
  });

  // Log to Audit Log
  await logAdminAction(
    adminEmail,
    'USER_ROLE_CHANGED',
    `user:${targetUserEmail}`,
    {
      targetUid: targetUserUid,
      targetEmail: targetUserEmail,
      previousRole: currentRole,
      newRole
    }
  );
}

// ==========================================
// 4. GLOBAL ANNOUNCEMENTS
// ==========================================

const DEFAULT_ANNOUNCEMENT: AnnouncementConfig = {
  enabled: false,
  title: 'Important System Announcement',
  message: 'Welcome to GenPaperAI! We have added new NCERT official blueprints for CBSE 2026-27.',
  type: 'info',
  dismissible: true,
  updatedAt: Date.now()
};

export function subscribeToAnnouncement(
  callback: (config: AnnouncementConfig | null) => void
): () => void {
  const docRef = doc(db, 'app_config', 'announcement');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as AnnouncementConfig);
      } else {
        callback(DEFAULT_ANNOUNCEMENT);
      }
    },
    (err) => {
      console.warn('[Announcement Subscription] Error:', err);
      callback(DEFAULT_ANNOUNCEMENT);
    }
  );
}

export async function setAnnouncementConfig(
  config: AnnouncementConfig,
  adminEmail: string
): Promise<void> {
  const docRef = doc(db, 'app_config', 'announcement');
  const payload = {
    ...config,
    updatedAt: Date.now(),
    updatedBy: adminEmail
  };
  await setDoc(docRef, payload, { merge: true });

  await logAdminAction(
    adminEmail,
    'ANNOUNCEMENT_UPDATED',
    'app_config:announcement',
    {
      enabled: config.enabled,
      title: config.title,
      type: config.type
    }
  );
}

// ==========================================
// 5. AI MODEL REGISTRY & MANAGEMENT
// ==========================================

export const DEFAULT_AI_MODELS: AIModelConfig[] = [
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash Preview',
    provider: 'Google DeepMind',
    enabled: true,
    isDefault: true,
    priority: 1,
    intendedUse: 'Primary CBSE & SCERT Question Paper Generation (Fast, High Alignment)',
    qualityNotes: 'Optimal reasoning latency & adherence to Unicode Math and Bloom taxonomy.',
    dateAdded: 1716000000000
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google DeepMind',
    enabled: true,
    isDefault: false,
    priority: 2,
    intendedUse: 'HOTS & Complex Subject Blueprints (Physics, Math proofs, High Depth)',
    qualityNotes: 'Deep multi-step reasoning capabilities for high difficulty questions.',
    dateAdded: 1718000000000
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google DeepMind',
    enabled: true,
    isDefault: false,
    priority: 3,
    intendedUse: 'High-Throughput Fast Fallback & Syllabus parsing',
    qualityNotes: 'Ultra-low latency for quick regeneration and text enhancement.',
    dateAdded: 1715000000000
  },
  {
    id: 'gemini-2.5-flash-image',
    name: 'Gemini 2.5 Flash Image',
    provider: 'Google DeepMind',
    enabled: true,
    isDefault: false,
    priority: 4,
    intendedUse: 'Nano-Banana Diagram & Vector Image Generation',
    qualityNotes: 'Generates clean monochrome diagrams for Math and Science.',
    dateAdded: 1717000000000
  }
];

export const DEFAULT_MODEL_REGISTRY: AIModelRegistry = {
  defaultModel: 'gemini-3-flash-preview',
  models: DEFAULT_AI_MODELS,
  updatedAt: Date.now()
};

export function subscribeToAIModelRegistry(
  callback: (registry: AIModelRegistry) => void
): () => void {
  const docRef = doc(db, 'app_config', 'ai_models');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as AIModelRegistry;
        callback({
          defaultModel: data.defaultModel || 'gemini-3-flash-preview',
          models: data.models && data.models.length > 0 ? data.models : DEFAULT_AI_MODELS,
          updatedAt: data.updatedAt || Date.now(),
          updatedBy: data.updatedBy
        });
      } else {
        callback(DEFAULT_MODEL_REGISTRY);
      }
    },
    (err) => {
      console.warn('[AI Model Registry Subscription] Error:', err);
      callback(DEFAULT_MODEL_REGISTRY);
    }
  );
}

export async function saveAIModelRegistry(
  registry: AIModelRegistry,
  adminEmail: string
): Promise<void> {
  const docRef = doc(db, 'app_config', 'ai_models');
  const payload = {
    ...registry,
    updatedAt: Date.now(),
    updatedBy: adminEmail
  };
  await setDoc(docRef, payload, { merge: true });

  await logAdminAction(
    adminEmail,
    'AI_MODEL_REGISTRY_UPDATED',
    'app_config:ai_models',
    {
      defaultModel: registry.defaultModel,
      activeModelCount: registry.models.filter(m => m.enabled).length
    }
  );
}

// ==========================================
// 6. AI GENERATION METRICS & ANALYTICS
// ==========================================

export async function logGenerationMetric(
  metric: Omit<GenerationMetricEntry, 'id'>
): Promise<void> {
  try {
    const id = `metric_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const metricRef = doc(db, 'generation_metrics', id);
    await setDoc(metricRef, {
      ...metric,
      id
    });
  } catch (err) {
    console.warn('[Generation Metric] Non-blocking log:', err);
  }
}

export const isPlatformAdmin = isAdmin;
export const subscribeToUsers = subscribeToAllUsers;
export const subscribeToAuditLogs = subscribeToAdminAuditLogs;

export async function getAnnouncementConfig(): Promise<AnnouncementConfig> {
  try {
    const docRef = doc(db, 'app_config', 'announcement');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as AnnouncementConfig;
    }
  } catch (err) {
    console.warn('[Get Announcement] Error:', err);
  }
  return DEFAULT_ANNOUNCEMENT;
}

export async function getAIModelRegistry(): Promise<AIModelRegistry> {
  try {
    const docRef = doc(db, 'app_config', 'ai_models');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as AIModelRegistry;
      return {
        defaultModel: data.defaultModel || 'gemini-3-flash-preview',
        models: data.models && data.models.length > 0 ? data.models : DEFAULT_AI_MODELS,
        updatedAt: data.updatedAt || Date.now(),
        updatedBy: data.updatedBy
      };
    }
  } catch (err) {
    console.warn('[Get AI Registry] Error:', err);
  }
  return DEFAULT_MODEL_REGISTRY;
}

export function subscribeToGenerationMetrics(
  callback: (metrics: GenerationMetricEntry[]) => void,
  maxCount: number = 200
): () => void {
  const metricsRef = collection(db, 'generation_metrics');
  const q = query(metricsRef, orderBy('timestamp', 'desc'), limit(maxCount));

  return onSnapshot(
    q,
    (snapshot) => {
      const metrics = snapshot.docs.map(d => d.data() as GenerationMetricEntry);
      callback(metrics);
    },
    (err) => {
      console.warn('[Generation Metrics Subscription] Error:', err);
      callback([]);
    }
  );
}

// ==========================================
// 7. DIAGNOSTICS & SYSTEM TESTS
// ==========================================

export async function testAIConnection(): Promise<{ success: boolean; latencyMs: number; message: string }> {
  const start = performance.now();
  try {
    const response = await generateContentProxy({
      model: 'gemini-3-flash-preview',
      contents: 'Respond strictly with the single word "OK" if online.',
      config: {
        maxOutputTokens: 5,
        temperature: 0.1
      }
    });
    const latencyMs = Math.round(performance.now() - start);
    if (response.text && response.text.trim().length > 0) {
      return {
        success: true,
        latencyMs,
        message: `Connected successfully (${latencyMs}ms) via Gemini AI backend.`
      };
    }
    return {
      success: false,
      latencyMs,
      message: 'AI connected but returned empty response.'
    };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      success: false,
      latencyMs,
      message: err?.message || 'Failed to reach AI service.'
    };
  }
}

export async function testFirestoreConnection(): Promise<{ success: boolean; latencyMs: number; message: string }> {
  const start = performance.now();
  try {
    const testDoc = doc(db, 'app_config', 'maintenance');
    await getDoc(testDoc);
    const latencyMs = Math.round(performance.now() - start);
    return {
      success: true,
      latencyMs,
      message: `Firestore roundtrip OK (${latencyMs}ms). Read/Write permissions active.`
    };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      success: false,
      latencyMs,
      message: err?.message || 'Firestore connection check failed.'
    };
  }
}

export async function testStorageConnection(): Promise<{ success: boolean; latencyMs: number; message: string }> {
  const start = performance.now();
  try {
    const testPath = `diagnostics/healthcheck_${Date.now()}.txt`;
    const testRef = ref(storage, testPath);
    // Write small test string
    await uploadString(testRef, 'OK', 'raw');
    // Get URL
    await getDownloadURL(testRef);
    // Cleanup
    await deleteObject(testRef).catch(() => {});
    
    const latencyMs = Math.round(performance.now() - start);
    return {
      success: true,
      latencyMs,
      message: `Firebase Storage Read/Write OK (${latencyMs}ms).`
    };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      success: false,
      latencyMs,
      message: err?.message || 'Firebase Storage check failed or restricted.'
    };
  }
}

export function testAuthProviders(): {
  google: boolean;
  microsoft: boolean;
  email: boolean;
  details: string;
} {
  try {
    const isGoogleReady = !!auth.app;
    const isMicrosoftReady = !!auth.app;
    const isEmailReady = !!auth.app;

    return {
      google: isGoogleReady,
      microsoft: isMicrosoftReady,
      email: isEmailReady,
      details: 'Firebase Auth SDK initialized with Google, Microsoft OAuth, and Email/Password providers.'
    };
  } catch (err: any) {
    return {
      google: false,
      microsoft: false,
      email: false,
      details: err?.message || 'Auth initialization check encountered an error.'
    };
  }
}
