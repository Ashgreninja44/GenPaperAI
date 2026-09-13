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
  user: { email?: string | null; role?: string } | null,
  profile: UserProfile | null
): boolean {
  if (!user || !profile) {
    return false;
  }

  // 1. Platform Owner / Super Admin Exemption (Requirement 5 & 7):
  // The verified Platform Owner must NEVER be forced to select Teacher/Student during migration.
  if (isSuperAdmin(user.email, profile.role)) {
    return false;
  }

  // 2. Already completed migration (or created post-deployment):
  if (
    typeof profile.accountTypeMigrationVersion === 'number' &&
    profile.accountTypeMigrationVersion >= CURRENT_ACCOUNT_TYPE_MIGRATION_VERSION &&
    !!profile.userType
  ) {
    return false;
  }

  // 3. Newly created accounts going through standard first-time onboarding:
  // If it's a new account created with accountTypeMigrationVersion = 1 and needsOnboarding = true
  if (
    profile.needsOnboarding === true &&
    profile.accountTypeMigrationVersion === CURRENT_ACCOUNT_TYPE_MIGRATION_VERSION
  ) {
    return false;
  }

  // 4. Legacy Account: Created before deployment, missing migration version
  return true;
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
