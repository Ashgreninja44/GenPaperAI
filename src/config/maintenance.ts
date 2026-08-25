import { MaintenanceConfig } from '../types';
import { isSuperAdmin } from '../services/maintenanceService';

/**
 * Maintenance Mode Configuration
 * 
 * Maintenance mode can be toggled:
 * 1. Automatically via Firestore in the Admin Dashboard (1-click toggle by the owner).
 * 2. Via `MAINTENANCE_MODE_ENABLED` below (true / false / null for auto-detect).
 * 3. Via `VITE_MAINTENANCE_MODE` in environment variables.
 */

// Set to `true` to force maintenance page, `false` to disable, or `null` for automatic Firestore/Environment detection
export const MAINTENANCE_MODE_ENABLED: boolean | null = null;

export function isMaintenanceModeActive(
  firestoreConfig?: MaintenanceConfig | null,
  userEmail?: string | null,
  userRole?: string
): boolean {
  // If user is the Super Admin / Creator, never lock them out
  if (isSuperAdmin(userEmail, userRole)) {
    return false;
  }

  // 1. Live Firestore configuration has highest dynamic priority
  if (firestoreConfig !== undefined && firestoreConfig !== null) {
    return Boolean(firestoreConfig.enabled);
  }

  // 2. Direct code-level override
  if (MAINTENANCE_MODE_ENABLED === true) return true;
  if (MAINTENANCE_MODE_ENABLED === false) return false;

  // 3. Environment variable override
  const envMode = import.meta.env.VITE_MAINTENANCE_MODE;
  if (envMode === 'false' || envMode === '0' || envMode === 'off') {
    return false;
  }
  if (envMode === 'true' || envMode === '1' || envMode === 'on') {
    return true;
  }

  // 4. Auto-detection for Dev/Preview environments:
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // In local development or AI Studio dev preview, keep app accessible
    if (
      hostname === 'localhost' || 
      hostname === '127.0.0.1' || 
      hostname.startsWith('ais-dev-') ||
      import.meta.env.DEV
    ) {
      return false;
    }
  }

  // In production builds / Cloudflare by default
  return Boolean(import.meta.env.PROD);
}
