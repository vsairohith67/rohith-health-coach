# Changelog

## 1.0.0-rc8.1 — 2026-08-31

- Completed a line-by-line security review of the prepared device-credential migration, server actions, owner UI, private grants, rotation/revocation behavior, and synthetic tests.
- Added an explicit full-navigation clear action for the one-time credential and replaced its history entry after the user stores it.
- Stabilized the exact-viewport browser gate by waiting for hydration before the deterministic Ask interaction.
- Passed the fresh 282-test application suite, 222 agent evaluations, 91 database assertions including 36 credential assertions, five FIT tests, 18 Playwright tests, Production build, schema lint, and local zero-sample ingestion cleanup.
- Kept the real owner token, Apple Health data, phone automation, AI, MCP, Garmin authentication, Garmin cloud, and FIT cloud worker outside this source gate.

## 1.0.0-rc8 — 2026-08-31

- Passed a direct all-history public-repository secret/private-data scan and completed a read-only GitHub, Supabase, and Vercel configuration readback.
- Added a locally tested owner-scoped, one-time-display iPhone ingestion credential issuer with HMAC-only storage, bounded expiry, serialized rotation/revocation, and one-active-credential enforcement.
- Reconciled the iPhone guide with the deployed strict snake_case contract, limited the first Shortcut to five non-Step metrics, and added a local-only Step source-identity diagnostic.
- Reviewed the current Taxuspt Garmin MCP source and documented a conditional RC9 local-stdio/read-only candidate with a seven-tool allowlist and mandatory dependency/Windows fixes.
- Passed 282 application tests, 222 agent evaluations, 91 database assertions, five FIT tests, 18 Playwright tests, the Production build, secret scans, private-data scan, and zero-sample local ingestion cleanup.
- Kept the credential migration and UI local and undeployed. Real data, phone automation, Apple Health access, Garmin authentication, AI, MCP, ChatGPT, Codex, and Garmin cloud remain disabled.

## 1.0.0-rc7 — 2026-08-31

- Disabled hosted public signup, established one confirmed passwordless owner, verified exact callback URLs, and passed six hosted signup-denial probes.
- Connected the repository to Vercel Git, deployed the private Production shell from exact `main`, and passed authenticated/anonymous route and client-bundle security checks.
- Added a private owner-scoped export bucket and passed private export, signed expiration, selective deletion, and complete synthetic cleanup gates.
- Passed 24/24 hosted E2E cases, 179 hosted RLS checks, 21 FIT Storage checks, 26 ingestion checks, and the Garmin 4,861 versus iPhone 8,148 arbitration recheck.
- Kept real-data readiness blocked because the user explicitly chose to leave the GitHub repository temporarily Public. Real data, AI, MCP, ChatGPT, Codex, phone automation, and Garmin cloud remain disabled.

## 1.0.0-rc6 — 2026-08-30

- Added real passwordless private login with `shouldCreateUser: false`, generic anti-enumeration feedback, PKCE callback exchange, token-hash confirmation/recovery, verified server identity, and global/local sign-out handling.
- Added a fail-closed Production route/API boundary, deterministic private empty state, no-store responses, and explicit Secure/HttpOnly/SameSite cookie policy.
- Passed 282 unit/integration assertions, 55 database checks, five FIT tests, 222 evaluation-harness assertions, 16 Playwright cases, 11 callback attacks, and a compiled ten-route unauthenticated Production-shell matrix.
- Kept the hosted Auth negative matrix, Vercel Production, owner onboarding, and 24-case hosted E2E stopped because live Supabase readback remains `disable_signup=false`.

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
