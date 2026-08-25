import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { MaintenanceConfig } from '../types';

const CONFIG_DOC_PATH = 'app_config/maintenance';

export const ADMIN_EMAIL = 'pendyaladarshit4@gmail.com';

/**
 * Check if the given email or profile represents the super admin / creator.
 */
export function isSuperAdmin(email?: string | null, role?: string): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return normalized === ADMIN_EMAIL.toLowerCase() || role === 'admin';
}

/**
 * Subscribes to real-time changes to the maintenance status in Firestore.
 */
export function subscribeToMaintenanceMode(
  callback: (config: MaintenanceConfig | null) => void
): () => void {
  const docRef = doc(db, 'app_config', 'maintenance');
  
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as MaintenanceConfig);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.warn('[Maintenance Mode] Firestore subscription error:', error);
      // Non-blocking fallback
      callback(null);
    }
  );
}

/**
 * Fetches the current maintenance mode status once.
 */
export async function getMaintenanceMode(): Promise<MaintenanceConfig | null> {
  try {
    const docRef = doc(db, 'app_config', 'maintenance');
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data() as MaintenanceConfig;
    }
    return null;
  } catch (error) {
    console.warn('[Maintenance Mode] Error fetching config:', error);
    return null;
  }
}

export const getMaintenanceConfig = getMaintenanceMode;

/**
 * Updates the maintenance status in Firestore.
 * Requires admin privileges in security rules.
 */
export async function setMaintenanceMode(
  enabled: boolean,
  updatedBy: string,
  message?: string
): Promise<void> {
  try {
    const docRef = doc(db, 'app_config', 'maintenance');
    await setDoc(
      docRef,
      {
        enabled,
        message: message || "GenPaperAI is currently undergoing scheduled maintenance. We're working on improvements and will be back soon.",
        updatedAt: Date.now(),
        updatedBy,
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, CONFIG_DOC_PATH);
  }
}
