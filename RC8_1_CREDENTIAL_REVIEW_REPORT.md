# RC8.1 credential security review

Date: 2026-08-31

Input branch: `codex/rc8-unattended-prep`

Prepared input commits: `529ea9c83d0b33962830f2cb3bfaf04e7fe840bb`, `ad4e2c1ea2ca061c78aceeccb875e18ba4176655`

RC8.1 hardening commit: `7fb28855727ed58bf7fd703eac1fbc32e509c99b`

Data classification: sanitized source and synthetic tests only

## Outcome

`CREDENTIAL_SECURITY_REVIEW = PASSED`

The migration is additive for the verified zero-credential Production state. It does not drop or truncate a user table, rewrite health rows, weaken an existing RLS policy, expose the private schema, or add a plaintext-token column.

## Changed-file classification

- Database migration: `supabase/migrations/20260831084851_rc8_owner_ingestion_credentials.sql`
- Database security tests: `supabase/tests/004_rc8_owner_ingestion_credentials.sql`
- Server credential logic: `apps/web/app/settings/ingestion/actions.ts`
- Owner page and UI: `apps/web/app/settings/ingestion/page.tsx`, `apps/web/components/ingestion-credential-manager.tsx`, `apps/web/app/styles.css`, and the Settings navigation update
- Typed contract: `packages/health-contracts/src/database.types.ts`
- Browser/local verification: `apps/web/tests/product.spec.ts`, `scripts/verify-local-ingestion-zero-sample.mjs`, and `scripts/verify-no-private-data.mjs`
- Documentation and evidence: the RC8 reports/guides, Garmin MCP evaluation, MCP hosting decision, release metadata, changelog, and release notes

## Credential control review

- Randomness: `extensions.gen_random_bytes(32)` creates 256 bits using Postgres cryptographic randomness.
- One-time plaintext: the token exists only as a function-local value and the authenticated RPC response at issuance or rotation. It is not inserted into a table.
- Persistence: only a keyed HMAC-SHA-256 digest, six-hex-character hint, scope, ownership, expiry, and lifecycle metadata are stored.
- Comparison: the trusted service resolver compares fixed-length HMAC digests; untrusted roles cannot call the hash helper or private resolver, so no browser timing oracle is exposed.
- Identity: ownership is derived from verified Supabase Auth through `auth.uid()`. No `user_id` is accepted from the client.
- Device scope: rotation and revocation lock and re-read an active Apple Shortcut device owned by the caller.
- Capability scope: every issued credential has only `health:ingest`.
- Expiry: owner-issued credentials expire after seven days.
- Rotation: the device row is locked, all prior active credentials are revoked, the prior row is linked as rotation parent, and a unique partial index enforces one unrevoked credential per device.
- Concurrent creation: the authenticated user's row is locked before enforcing the three-active-device limit.
- Revocation: owner-scoped device revocation revokes all active credentials, and the resolver rejects revoked devices/credentials.
- Private storage: `private.ingestion_credentials` has no browser table grant; hash and resolver helpers have no `anon` or `authenticated` execute grant.
- Privileged SQL: all credential `SECURITY DEFINER` functions use `set search_path = ''`, fully qualified objects, static SQL, and narrow execute grants.
- Server entry point: every Server Action re-verifies the user, validates the untrusted form field with Zod, and returns only a bounded safe shape or a generic error.
- Browser handling: no token is placed in a URL, cookie, local storage, session storage, service worker cache, log statement, or report. The one-time panel includes a full `location.replace()` clear action; the private proxy sets `Cache-Control: private, no-store` and `Pragma: no-cache`.
- User warning: the page states that the token is shown once and must be moved directly to the iPhone.

## Migration safety

The migration adds one partial unique index, replaces the existing service-only issuer with a serialized compatible implementation, and adds four narrowly granted owner functions. Production had zero device and credential rows at the preceding readback, so the uniqueness index has no data-reconciliation precondition there. A fresh local reset applied the complete migration chain successfully.

## Rollback readiness

Issuance can be disabled immediately by revoking execute on the four owner functions and by removing the owner UI entry in a follow-up deployment. Existing credentials can be owner-revoked or administratively revoked without exposing their digests. Removing functions or the unique index is deliberately deferred until metadata confirms that no real credential remains; no destructive rollback was performed.

Plaintext token stored: **NO**

Token recoverable after one-time response: **NO**

Real owner credential created during review: **NO**
