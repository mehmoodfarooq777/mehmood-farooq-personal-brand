/**
 * Firestore Security Rules Test Specification (Dirty Dozen Adversarial Suite)
 * Documents expected PERMISSION_DENIED and ALLOW outcomes for all collections.
 */

export interface SecurityTestCase {
  id: string;
  description: string;
  collection: 'siteConfig' | 'journeyStages' | 'principles' | 'inquiries';
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: { uid: string; email?: string; email_verified?: boolean } | null;
  expected: 'ALLOW' | 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_SECURITY_TESTS: SecurityTestCase[] = [
  {
    id: 'DD-01',
    description: 'Unauthenticated client attempts to create or update siteConfig/public',
    collection: 'siteConfig',
    operation: 'create',
    auth: null,
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-02',
    description: 'Verified non-admin Google user attempts to update siteConfig/public',
    collection: 'siteConfig',
    operation: 'update',
    auth: { uid: 'user_other', email: 'visitor@gmail.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-03',
    description: 'Unverified admin email spoof attempts to write siteConfig or read inquiries',
    collection: 'inquiries',
    operation: 'list',
    auth: { uid: 'spoof_uid', email: 'mehmoodfarooq789@gmail.com', email_verified: false },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-04',
    description: 'Admin payload with shadow field isSuperAdmin injected',
    collection: 'siteConfig',
    operation: 'update',
    auth: { uid: 'admin_uid', email: 'mehmoodfarooq789@gmail.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-05',
    description: 'Admin payload with mismatched updatedByUid',
    collection: 'journeyStages',
    operation: 'create',
    auth: { uid: 'admin_uid', email: 'mehmoodfarooq789@gmail.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-06',
    description: 'Admin payload with forged client timestamp instead of serverTimestamp()',
    collection: 'journeyStages',
    operation: 'update',
    auth: { uid: 'admin_uid', email: 'mehmoodfarooq789@gmail.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-07',
    description: 'Oversized string payload (>400 chars) on principles.summary',
    collection: 'principles',
    operation: 'create',
    auth: { uid: 'admin_uid', email: 'mehmoodfarooq789@gmail.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-08',
    description: 'ID poisoning with invalid characters or length > 128',
    collection: 'journeyStages',
    operation: 'create',
    auth: { uid: 'admin_uid', email: 'mehmoodfarooq789@gmail.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-09',
    description: 'Non-admin attempts to read or list visitor PII in /inquiries',
    collection: 'inquiries',
    operation: 'get',
    auth: { uid: 'user_other', email: 'visitor@gmail.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-10',
    description: 'Public visitor creates inquiry with forged status=reviewed or non-empty adminNotes',
    collection: 'inquiries',
    operation: 'create',
    auth: null,
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-11',
    description: 'Admin update attempts to mutate immutable createdAt or senderEmail on inquiry',
    collection: 'inquiries',
    operation: 'update',
    auth: { uid: 'admin_uid', email: 'mehmoodfarooq789@gmail.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-12',
    description: 'Non-admin attempts to list unpublished journeyStages without isPublished == true filter',
    collection: 'journeyStages',
    operation: 'list',
    auth: null,
    expected: 'PERMISSION_DENIED',
  },
];
