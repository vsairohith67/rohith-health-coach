# RC5 Hosted end-to-end report

Verified: 2026-08-30 (Asia/Calcutta)

## Verdict

Status: **NOT RUN — FAIL-CLOSED AT HOSTED AUTH GATE**.

The required authenticated Production shell was not eligible for creation because Supabase Auth read-back reports `disable_signup: false`. The complete 24-step Stage 14 flow was therefore not run and no result is inferred from partial subsystem testing.

## Full flow status

The following Production E2E sequence remains unexecuted as a single hosted flow: private sign-in, device creation, token issuance, ingestion, provenance/aggregation/arbitration display, baseline and deterministic coach verification, replay and late-update recomputation, User B and anonymous isolation through the Production application, token revocation, private export, signed access, deletion, Storage cleanup, and application/edge log review.

No real owner account was created. No real health information was used.

## Hosted subsystem evidence completed before the stop gate

- Hosted database migration/local reproducibility assertions: 55/55 pass.
- Hosted RLS red-team matrix: 179/179 pass.
- Hosted private Storage matrix: 21/21 pass.
- Source-arbitration synthetic cases and provenance assertions: 12/12 pass.
- Hosted ingestion matrix: 26/26 pass.
- Vercel Preview route/viewport matrix: 28/28 pass.
- Hosted Preview accessibility routes: 3/3 pass, 0 serious/critical findings.
- Hosted synthetic cleanup: 0 test Auth users, devices, credentials, events, raw samples, daily metrics, and Storage objects remain.

These are valid component results, but they are not a substitute for the mandatory authenticated Production E2E flow.

## Readiness

Core hosted platform: **NOT SAFE FOR REAL DATA**.

Real-data pilot: **NOT STARTED**. Phone automation, AI, MCP, ChatGPT, Codex, and Garmin cloud API remain disabled.
