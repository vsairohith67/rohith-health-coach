# RC8.1 Supabase migration report

Verified: 2026-08-31

## Target and preflight

- Organization: `Supabase test Organisation` (`fqskwypboimofbiwfrat`).
- Plan: Free.
- Project: `rohith-health-coach-prod`.
- Project reference: `wmzrkkqcfvuhjpduplod`.
- Region: `ap-south-1` / Mumbai.
- Final project state: `ACTIVE_HEALTHY`.
- PostgreSQL: 17.6.1.166.

Immediately before migration, the project had one existing Auth identity and zero profiles, devices, ingestion credentials, ingestion events, raw health samples, daily metrics, sleep sessions, activities, exports, or Storage objects. A sanitized schema/count snapshot was kept only in the ignored `private-evidence/` directory.

## Applied migration

The exact reviewed SQL from `supabase/migrations/20260831084851_rc8_owner_ingestion_credentials.sql` was applied once through the official Supabase migration connector. The hosted ledger records it as:

- Version: `20260831084851`.
- Name: `rc8_owner_ingestion_credentials`.

No table was dropped or truncated. No existing health row was rewritten. The migration added the one-active-credential partial unique index, hardened the trusted service issuer, and added the owner-facing create, list, rotate, and revoke RPCs.

## Repository ledger alignment

The seven repository migration filenames now use the exact versions recorded by the hosted Supabase migration ledger. This was a filename-only alignment: SQL contents and execution order were preserved, and no migration was reapplied to Production. It removes the GitHub integration error that reported remote migration versions as missing from the local migrations directory.

## Hosted security readback

- One unrevoked credential per device: enforced by a partial unique index.
- Owner issuer: authenticated only; anonymous execution denied.
- List, rotate, and revoke RPCs: authenticated only and scoped through `auth.uid()`.
- Trusted issuer and resolver: service-role only.
- Private hash and resolver helpers: unavailable to anonymous and authenticated browser roles.
- `private` schema usage for browser roles: denied.
- Direct browser `SELECT` or `INSERT` on `private.ingestion_credentials`: denied.
- All credential SECURITY DEFINER functions: fixed empty `search_path`.
- Dynamic SQL in credential functions: none.
- Plaintext credential column: none.
- Stored credential material: HMAC-SHA-256 digest plus a six-character hint.
- Credential scope: `health:ingest` only.
- Default owner credential expiry: seven days.

Hosted database verification passed:

- Credential assertions: 36/36.
- Full hosted RLS matrix: 179/179.
- Live Auth negative probes: 6/6.
- Final Auth identities: one.
- Final health, device, credential, event, and Storage rows: zero.

The hosted project does not install the optional pgTAP extension. The same 36 assertions were therefore executed through a standard-PostgreSQL transaction-only harness, followed by `ROLLBACK` and zero-residue readback. No Production extension was added.

## Advisor review

Supabase reports intentional warnings for authenticated SECURITY DEFINER execution on the four owner credential RPCs and the existing owner deletion RPC. These functions are deliberately authenticated entry points; direct inspection confirmed fixed `search_path`, verified ownership, narrow grants, no arbitrary SQL, and denied anonymous execution. Reference: [Supabase linter guidance](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).

Leaked-password protection remains disabled. The current owner flow is passwordless, public signup and anonymous Auth are disabled, and no billing or Auth-plan change was made. Reference: [Supabase password security](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

## Rollback readiness

No rollback was required or performed. If issuance must be disabled immediately, revoke authenticated execution from the create and rotate RPCs while retaining owner list/revoke access. If a credential incident occurs, revoke the affected synthetic or owner device first. Removal of the index and RPCs is a later reviewed migration only after confirming that no real credential remains; destructive ad hoc rollback is forbidden.

Migration and hosted database gate: **PASS**.
