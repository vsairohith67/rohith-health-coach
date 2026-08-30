# Apple Health Shortcut setup

The Shortcut is an owner-built ingestion client; it is not bundled as an opaque binary.

1. Deploy the private Supabase project and `ingest-health` Edge Function first.
2. From an authenticated server-only bootstrap flow, register one device and issue a long random token. Store only its SHA-256 hash in `private.ingestion_credentials`.
3. In Shortcuts, add a private text value for the HTTPS ingestion URL and token. Do not place them in screenshots, shared iCloud links, notes, or source control.
4. Use “Find Health Samples” only for the allowlisted types in `APPLE_HEALTH_MAPPING.md`, within a small bounded window.
5. Convert samples to the versioned JSON envelope, set a random request ID and stable idempotency key, then send one HTTPS POST with `Authorization: Bearer …` and `Content-Type: application/json`.
6. Accept only a 2xx response with the expected schema. Preserve the safe error code for troubleshooting; never log the payload/token.
7. Start manually with synthetic/non-sensitive test values. Enable automation only after hosted RLS, rate-limit, revocation, and duplicate tests pass.

Rotate immediately if the token or Shortcut is shared. Revoke the old credential before issuing a replacement. See `IPHONE_SHORTCUT_BUILD_GUIDE.md` for the exact build flow.
