# Changelog

## 1.0.0-rc5 — 2026-08-30

- Merged the green RC4 integration PR and verified its exact hosted CI result on `main`.
- Created the free Mumbai Supabase foundation and applied/audited five reproducible migrations.
- Added owner-relationship and ingestion-token hardening, then passed 179 hosted RLS, 21 hosted Storage, and 26 hosted ingestion checks with synthetic identities only.
- Added fail-closed Garmin/iPhone source arbitration, workout deduplication, Apple Shortcut provenance limits, and 12 automated source cases.
- Deployed and validated a synthetic-only Vercel Preview across seven exact viewports, six data states, accessibility, PWA, dark mode, and reduced motion.
- Kept Production and real-data E2E blocked because public Supabase email signup remains enabled.

## 1.0.0-rc4 — 2026-08-30

- Added Health Query Service, result/evidence contracts, AI safety/gateway, read-only MCP, OAuth primitives, Codex plugin, ChatGPT widget, and 220-case eval suite.
- Added explicit least-privilege Supabase grants and 40-case database/Storage red-team suite.
- Added local-model/provider privacy controls and all-disable workflow.
- Added complete deployment/owner/security documentation and final release tooling.

## 1.0.0-rc3 — reconstructed compatibility gate

- Added deployment preflight/inventory, private-hosting guidance, iPhone build/runbooks, privacy/retention, and hosted gate reports.

## 1.0.0-rc2 — reconstructed compatibility gate

- Added independent audit, traceability, security/accessibility/visual/performance evidence, and hardening repairs.

## 1.0.0-rc1 — reconstructed compatibility gate

- Established deterministic PWA, data model, ingestion, analytics/coaching, FIT validation boundary, tests, and base documentation.

RC1–RC3 ZIPs are generated from the cumulative RC4 source and include an explicit reconstruction marker.
