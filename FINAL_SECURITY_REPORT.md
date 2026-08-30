# Final security report

Verdict: **local/source RC4 security gate passed; hosted and account-level gates unverified**.

Verified with synthetic data:

- owner-scoped RLS, anonymous denial, private Storage prefix ownership, explicit grants, fixed-search-path functions, and a narrow account-deletion RPC;
- server-only secrets, hashed scoped ingestion credentials, revocation/idempotency/rate bounds, bounded payloads, and safe logs;
- no generic database query, arbitrary SQL/table/URL fetch, write MCP tool, raw GPS/FIT/heart stream/private note/medication tool output, or user-supplied subject;
- query range/result bounds, evidence/source freshness/completeness/baseline semantics, prompt-injection defense, XSS sanitization, urgent-message rules, diagnosis/medication refusal, and maximum three actions;
- PKCE/state/audience/issuer/expiry/scope/revocation/replay primitives in unit/integration tests;
- secret scan, dependency audit, private release exclusions, restrictive headers/CSP, privacy-safe service-worker caching, and non-root digest-pinned FIT container.

Finding classification: 0 P0 and 0 P1 in the tested local/source scope. No penetration-test, compliance, hosted-security, real-tunnel, provider, physical-device, or real-data claim is made. Those unexecuted gates are release blockers rather than hidden passes.
