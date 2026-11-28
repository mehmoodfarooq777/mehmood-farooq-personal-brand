import { initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  browserSessionPersistence,
  getAuth,
  setPersistence,
  type User,
} from 'firebase/auth';
import { doc, getDocFromServer, getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);

export const AUTHORIZED_ADMIN_EMAIL = 'mehmoodfarooq789@gmail.com';
export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
export const FIRESTORE_DATABASE_ID = firebaseConfig.firestoreDatabaseId;
export const FIREBASE_STORAGE_BUCKET = firebaseConfig.storageBucket;

export function isAuthorizedAdminEmail(user: User | null | undefined): boolean {
  if (!user || !user.email) return false;
  return user.email.trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL;
}

export function isAuthorizedAdminUser(user: User | null | undefined): boolean {
  if (!user || !user.email || !user.emailVerified) {
    return false;
  }
  return user.email.trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL;
}

export async function configureAuthPersistence(rememberMe: boolean): Promise<void> {
  await setPersistence(
    auth,
    rememberMe ? browserLocalPersistence : browserSessionPersistence
  );
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function extractReadableFirebaseError(error: unknown): string {
  let rawMessage = error instanceof Error ? error.message : String(error);
  let code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : '';

  if (rawMessage.startsWith('{')) {
    try {
      const parsed = JSON.parse(rawMessage) as { error?: string; path?: string };
      if (parsed.error) {
        rawMessage = parsed.path
          ? `${parsed.error} (path: ${parsed.path})`
          : parsed.error;
      }
    } catch {
      // Keep original rawMessage
    }
  }

  const lower = `${code} ${rawMessage}`.toLowerCase();

  if (lower.includes('permission-denied') || lower.includes('missing or insufficient permissions')) {
    if (auth.currentUser && !auth.currentUser.emailVerified) {
      return 'Permission denied: Your administrator email is not verified yet. Please verify your email in Firebase Authentication.';
    }
    return `Permission denied by Firestore rules. Verify you are signed in as verified ${AUTHORIZED_ADMIN_EMAIL} and all required fields meet length/URL constraints. (${rawMessage})`;
  }

  if (lower.includes('exceeds maximum size') || lower.includes('1048576')) {
    return 'Save failed because document size exceeded Firestore’s 1 MB limit. Upload photos via Firebase Storage (or use shorter image URLs) instead of large embedded image files.';
  }

  if (lower.includes('unauthenticated')) {
    return 'Your administrator authentication session has expired. Please sign in again.';
  }

  if (lower.includes('quota exceeded')) {
    return 'Firebase daily free-tier quota exceeded. Please try again after quota reset or upgrade the Firebase plan.';
  }

  if (lower.includes('offline') || lower.includes('unavailable') || lower.includes('network')) {
    return 'Unable to reach Firebase right now. Please check your internet connection and try again.';
  }

  if (lower.includes('storage/unauthorized')) {
    return 'Firebase Storage denied the upload. Deploy storage.rules in Firebase Console -> Storage -> Rules.';
  }

  if (
    lower.includes('storage/bucket-not-found') ||
    lower.includes('storage/project-not-found') ||
    lower.includes('storage/retry-limit-exceeded')
  ) {
    return `Firebase Storage bucket (${FIREBASE_STORAGE_BUCKET}) is not enabled or unreachable. Enable Storage in Firebase Console -> Build -> Storage.`;
  }

  return rawMessage || 'An unexpected Firebase error occurred.';
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('the client is offline')
    ) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

void testConnection();
