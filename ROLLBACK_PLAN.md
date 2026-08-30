# Rollback plan

1. Disable new ingestion, AI/MCP/ChatGPT, public signup, and iPhone automation.
2. Route web traffic to the last verified immutable deployment; do not roll database migrations backward destructively.
3. For an additive migration problem, deploy a forward repair after backup and synthetic rehearsal.
4. Stop/revert the FIT worker image and revoke its internal token if implicated.
5. Verify Auth, User A/B/anonymous RLS, Storage, ingestion idempotency, API no-store, and Demo Mode before reopening.
6. Preserve privacy-safe incident evidence and reconcile records/objects; never restore over live production without an isolated test.

Each production promotion must record exact commit/deployment/image/migration IDs and the previous known-good targets. No hosted rollback has been exercised in RC4.
