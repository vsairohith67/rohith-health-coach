# RC8.1 Vercel Production deployment report

Verified: 2026-08-31

## Deployment identity

- Team: existing Hobby/free team `team_LO8H9E9FSHIgcfz1I0yTc4is`.
- Project: `rohith-health-coach` (`prj_l23ScHanPfBEMXz3TjQ8w2KXIGN8`).
- Production URL: [rohith-health-coach.vercel.app](https://rohith-health-coach.vercel.app).
- Deployment: `dpl_CmkJPcuRKgbxqYG34HrSQV8gZdRu`.
- Target: Production.
- Source: Git integration from `main`.
- Source commit: `c430d41323a2a423a2fccb8db89b0074e9dc8195`.
- State: `READY`.

The deployment was created automatically from the guarded GitHub merge. No local branch upload or stale deployment promotion was used.

## Build and runtime readback

- Vercel build version: `1.0.0-rc8.1`.
- Frozen pnpm install: pass across 14 workspaces.
- Next.js: 16.3.3.
- TypeScript: pass.
- Production compilation: pass.
- Generated routes/pages: 29.
- Deployment alias error: none.
- Runtime errors during validation window: none.

## Production isolation

No Vercel environment mutation was made in RC8.1. Production inherited the previously verified private configuration: Demo Mode, AI providers, local LLM, health MCP, ChatGPT, Codex MCP, Garmin cloud, and public signup remain Off. Live `/api/health` denial proves Production is not running Demo Mode, and six live Supabase Auth denial probes prove public signup, anonymous Auth, OTP creation for unknown users, and phone Auth remain disabled.

Preview remains a separate protected, synthetic Demo Mode deployment. No Production server secret, database password, ingestion pepper, device credential, owner identity, or external AI key was added to Preview.

## Hosted boundary and client checks

- Anonymous `/settings/ingestion`: 307 redirect to `/sign-in`.
- Anonymous `/api/health`: 401 `AUTHENTICATION_REQUIRED`.
- `/sign-in`, credential-route redirect, API denial, manifest, and service worker: private/no-store headers verified.
- Credential page documents: never cached by the service worker.
- API and Authorization-bearing requests: never cached by the service worker.
- Deployed service worker: exact match to the reviewed source.
- Credential UI localStorage/sessionStorage references: zero.
- Live sign-in client assets scanned: 9 files, 599,797 bytes, zero high-risk secret signatures.
- Full client/source secret verification: green in exact-main CI.
- One-time warning, accessible live-region status, explicit clear action, and iPhone-width layout: passed in the exact-source 18/18 Playwright suite.

The existing owner private shell had already passed 10/10 hosted checks in RC7. RC8.1 intentionally does not exercise the new owner issuance button using an agent-controlled owner session; that is the Phase 8 owner-only handoff.

Production deployment gate: **PASS**.
