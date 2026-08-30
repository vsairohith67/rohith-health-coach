# Real-data readiness

- Core hosted platform: **NOT SAFE FOR REAL DATA**.
- Real-data pilot: **NOT STARTED**.
- Phone automation: **DISABLED**.
- AI: **DISABLED**.
- MCP: **DISABLED**.
- ChatGPT: **DISABLED**.
- Codex: **DISABLED**.
- Garmin cloud API: **DISABLED**.
- FIT cloud worker: **DISABLED**; local boundary only.

Hosted migrations, RLS, private Storage, ingestion authentication/idempotency, source arbitration, Garmin/iPhone conflict handling, cleanup, and synthetic Preview QA passed. RC6 code-side private Auth, callback, cookie, and compiled unauthenticated-shell gates also passed.

Public Supabase email signup remains enabled. No real health information may enter the system until public signup is disabled, exact callback/recovery/session settings are read back, the invited owner authenticates, and the full hosted Production E2E matrix passes.
