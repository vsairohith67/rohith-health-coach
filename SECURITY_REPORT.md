# Security report

Verdict: **source/private-Auth code gate passed; real-data gate remains blocked**.

Verified controls include explicit least-privilege table/function grants, owner RLS, anonymous denial, private credential schemas, private Storage prefix ownership, server-only secrets, hashed scoped credentials, bounded/idempotent ingestion, safe fixed-search-path RPCs, non-root FIT container, no shell decoder, pinned locks/image/action SHAs, restrictive web headers, private no-store APIs, privacy-safe PWA caching, read-only scoped MCP, PKCE/OAuth checks, AI evidence/numeric/medical validation, and source/archive secret scanning.

Current adversarial evidence includes 179 hosted RLS, 21 hosted Storage, 26 hosted ingestion, 12 source-arbitration, 282 unit/integration, 55 local database, 5 FIT, 222 evaluation-harness, 16 Playwright, 11 compiled callback-attack, and 10 compiled unauthenticated Production-shell checks.

Blocking state: hosted Supabase public signup remains enabled; the exact Auth URL/lifetime configuration, invited-owner flow, RC6 Vercel Production target, and 24-case authenticated hosted E2E have not passed. No compliance or penetration-test certification is claimed.
