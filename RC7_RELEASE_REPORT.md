# RC7 release report

Released: 2026-08-31 (Asia/Calcutta)

## Artifact

- Version: `1.0.0-rc7`
- Approved application source: Git `main` merge `3c32bdfb773ea23601eccad8b2f4af4646b3ec4c`
- Release PR: #4; hosted CI run `33354423345`
- Filename: `rohith-health-coach-v1.0.0-rc7.zip`
- Path: `release/rohith-health-coach-v1.0.0-rc7.zip`
- SHA-256: `1b5d3266f52f0a64dc07379d120d68338ed50c22e7e77a8e69cd91342bfb3c4f`
- Compressed size: 3,091,127 bytes
- Uncompressed size: 3,780,259 bytes
- File count: 340
- Data classification: synthetic only

The application/runtime source is the approved merged main source. The archive also contains the sanitized terminal deployment/session evidence completed after the merge: `RC7_AUTH_REPORT.md`, `RC7_OWNER_AUTH_REPORT.md`, `RC7_SESSION_READBACK_REPORT.md`, `RC7_VERCEL_PRODUCTION_REPORT.md`, and `rc7-deployment-state.json`. These evidence-only updates contain no owner address, token, cookie, health record, or secret.

The archive excludes `node_modules`, `.next`, `.git`, `.vercel`, `.supabase`, virtual environments, browser/test output, caches, prior ZIPs, non-example environment files, logs, key/certificate material, model weights, FIT files, and release checksum/manifest self-evidence.

## Source-tree gate

- Frozen pnpm install: pass.
- Prettier format check: pass.
- ESLint: pass with zero warnings.
- TypeScript: pass.
- Unit/integration: 282/282 pass across 17 files.
- Agent evaluation harness: 222/222 pass.
- Database reproducibility: 55/55 pass across three pgTAP files.
- FIT lint: pass.
- FIT tests: 5/5 pass.
- Playwright: 16/16 pass.
- Production build: pass, 28/28 generated pages.
- Secret scan: pass, 351 text files and zero credential signatures.
- Private-data scan: pass, zero owner-email or forbidden private-artifact hits.
- Final evidence-inclusive source scan: pass, 354 text files and zero credential signatures; zero Gmail-address hits.

## Hosted gate

- GitHub CI: Python and JavaScript success; PR #4 merged normally.
- Public-signup negative matrix: 6/6 pass.
- Hosted RLS: 179/179 pass.
- Private Storage: 21/21 pass.
- Hosted ingestion: 26/26 pass.
- Source arbitration: 12/12 pass.
- Hosted Production E2E: 24/24 pass.
- Authenticated private pages: 10/10 pass.
- Anonymous private routes/APIs: 13/13 denied.
- Owner global sign-out: pass; post-signout private access denied.
- Final hosted readback: one retained owner identity, zero active sessions, zero refresh tokens, zero health rows, and zero Storage objects.
- Client/server-secret marker hits: 0.
- Service-worker private-cache marker hits: 0.

## ZIP and extracted-copy gate

- ZIP open/read: pass.
- Release phase: `rc7`, source version `1.0.0-rc7`, no personal health data, no Production integrations enabled in the source package.
- Forbidden archive entries: 0/340.
- Extraction: pass to a clean temporary directory.
- Extracted frozen pnpm install: pass, 455 packages from the locked dependency graph.
- Extracted ESLint: pass with zero warnings.
- Extracted TypeScript: pass.
- Extracted unit/integration: 282/282 pass.
- Extracted Production build: pass, 28/28 pages.
- Extracted secret scan: pass, 334 text files and zero credential signatures.
- Extracted private-data scan: pass, zero Gmail-address hits and zero forbidden artifacts.

Exact final verification directory: `C:\Users\rohit\AppData\Local\Temp\rohith-health-rc7-final-verify-611c2c7237ff480fa90b673ef65f78b3\rohith-health-coach`.

## Verdict

RC7 sanitized source archive: **PASS**.

Real-data readiness: **NOT SAFE FOR REAL DATA** because GitHub visibility remains Public under the explicit temporary user override. Real health data, phone automation, AI, MCP, ChatGPT, Codex health MCP, Garmin cloud API, FIT cloud deployment, paid-plan changes, and GA promotion remain disabled.

Single remediation: make the GitHub repository Private and rerun privacy and secret-history verification.
