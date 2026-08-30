# Security report

Verdict: **source/local security gate passed; hosted security unverified**.

Verified controls include explicit least-privilege table/function grants, owner RLS, anonymous denial, private credential schemas, private Storage prefix ownership, server-only secrets, hashed scoped credentials, bounded/idempotent ingestion, safe fixed-search-path RPCs, non-root FIT container, no shell decoder, pinned locks/image/action SHAs, restrictive web headers, private no-store APIs, privacy-safe PWA caching, read-only scoped MCP, PKCE/OAuth checks, AI evidence/numeric/medical validation, and source/archive secret scanning.

Local adversarial evidence: 40 database/Storage assertions, 220 safety cases, 254 total unit/integration tests, 5 FIT tests, MCP transport/auth tests, dependency audit with no known vulnerabilities, and clean schema lint.

Blocking unknowns: cloud plan/config drift, hosted Auth/RLS/Storage/Edge Function/logs/advisors, real tunnel/OAuth provider, host secret configuration, distributed rate limit, backup/restore, official FIT decoder/corpus, physical iPhone, and real records. No compliance or penetration-test certification is claimed.
