# Security Specification — Mehmood Farooq Personal Brand & Admin Portal

## 1. Data Invariants
1. **Single Authorized Administrator**: Only a Google-authenticated user with verified email `mehmoodfarooq789@gmail.com` (`request.auth.token.email_verified == true`) is recognized as administrator. Public registration is disabled; no client-side role self-assignment exists.
2. **Strict Content Ownership & Integrity**: Documents in `siteConfig`, `journeyStages`, and `principles` can only be created, modified, or deleted by the authorized administrator, must carry `updatedByUid == request.auth.uid`, and must enforce server timestamps (`request.time`).
3. **PII Isolation on Inquiries**: Visitor inquiries in `/inquiries/{inquiryId}` contain PII (`senderName`, `senderEmail`). Public visitors may only `create` valid inquiries with `status == 'new'` and `adminNotes == ''`; only the authorized administrator may `get`, `list`, `update`, or `delete` inquiries.
4. **No Shadow Fields or Resource Exhaustion**: Every collection enforces strict `keys().hasAll(...)` and `keys().hasOnly(...)` allowlists, path ID regex guards (`^[a-zA-Z0-9_-]+$`), and bounded `.size()` limits on every string.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Unauthenticated Write to `siteConfig/public`**: Unauthenticated client sends `setDoc` to `/siteConfig/public` -> `PERMISSION_DENIED`.
2. **Non-Admin Google Account Write**: Signed-in Google user `attacker@gmail.com` (`email_verified: true`) writes to `/siteConfig/public` -> `PERMISSION_DENIED`.
3. **Unverified Admin Email Spoof**: Signed-in user with `email: "mehmoodfarooq789@gmail.com"` and `email_verified: false` attempts write or `/inquiries` read -> `PERMISSION_DENIED`.
4. **Shadow Field Injection on `siteConfig/public`**: Admin sends valid fields plus `{ isSuperAdmin: true }` -> `PERMISSION_DENIED`.
5. **UID Spoofing on `journeyStages`**: Admin attempts write with `updatedByUid: "another_uid"` -> `PERMISSION_DENIED`.
6. **Client-Forged Timestamp**: Admin attempts write with `updatedAt` != `request.time` -> `PERMISSION_DENIED`.
7. **Oversized String DoS on `principles`**: Write with 50,000-character `summary` -> `PERMISSION_DENIED`.
8. **ID Poisoning**: Write to `/journeyStages/invalid$id*with#chars` or 200-char ID -> `PERMISSION_DENIED`.
9. **Public Read/List of Visitor PII (`/inquiries`)**: Unauthenticated or non-admin user calls `getDoc` or `getDocs` on `/inquiries` -> `PERMISSION_DENIED`.
10. **Public Inquiry Status Tampering**: Visitor creates inquiry with `status: "reviewed"` or non-empty `adminNotes` -> `PERMISSION_DENIED`.
11. **Inquiry `createdAt` Mutation**: Admin update attempts to alter `createdAt` or `senderEmail` -> `PERMISSION_DENIED`.
12. **Unpublished Content Scraping**: Non-admin queries `list` on `/journeyStages` without filtering `isPublished == true` -> `PERMISSION_DENIED`.
