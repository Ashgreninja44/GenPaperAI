import { doc, updateDoc, Firestore } from 'firebase/firestore';
import { UserProfile, UserType } from '../types';
import { isSuperAdmin } from './adminService';
import { handleFirestoreError, OperationType } from '../firebase';

export const CURRENT_ACCOUNT_TYPE_MIGRATION_VERSION = 1;

/**
 * Determines whether a signed-in user is a legacy account that requires
 * the mandatory Teacher/Student account-type migration.
 *
 * Rules:
 * 1. Platform Owner / Super Admin is ALWAYS exempt (never blocked).
 * 2. New accounts have accountTypeMigrationVersion === CURRENT_ACCOUNT_TYPE_MIGRATION_VERSION.
 * 3. Accounts that have already completed migration have accountTypeMigrationVersion >= CURRENT_ACCOUNT_TYPE_MIGRATION_VERSION.
 * 4. Existing/legacy accounts (created before this deployment) have missing or 0 accountTypeMigrationVersion.
 */
export function isLegacyUserRequiringMigration(
  _user: { email?: string | null; role?: string } | null,
  _profile: UserProfile | null
): boolean {
  // In the Teacher-First platform, users never need to choose account type.
  return false;
}

/**
 * Persists the user's migration selection to Firestore and marks migration as complete.
 * Preserves all existing user papers, question banks, profile preferences, and subscriptions.
 */
export async function completeLegacyMigration(
  db: Firestore,
  uid: string,
  selectedType: UserType
): Promise<{
  userType: UserType;
  accountTypeMigrationVersion: number;
  accountTypeMigrationCompletedAt: number;
  needsOnboarding: boolean;
}> {
  if (!uid) {
    throw new Error('User UID is required to complete migration.');
  }

  const migrationData = {
    userType: selectedType,
    accountTypeMigrationVersion: CURRENT_ACCOUNT_TYPE_MIGRATION_VERSION,
    accountTypeMigrationCompletedAt: Date.now(),
    needsOnboarding: false,
    lastUserTypeUpdate: Date.now(),
    userTypeUpdatedBy: 'legacy_migration'
  };

  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, migrationData);
    return migrationData;
  } catch (err: any) {
    console.error('[Legacy Migration Error] Failed to persist selection to Firestore:', err);
    handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    throw err;
  }
}
