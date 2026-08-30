# RC5 release report

Released: 2026-08-30 (Asia/Calcutta)

## Artifact

- Version: `1.0.0-rc5`
- Source commit: `28ab35cf0c640a1c3ca4b9f41e1768a998b534a8`
- Filename: `rohith-health-coach-v1.0.0-rc5.zip`
- Path: `release/rohith-health-coach-v1.0.0-rc5.zip`
- SHA-256: `33bbd47109f0896284f424c6b9154031df3d75d38bfbbb6b4f44a76b6d128311`
- Compressed size: 3,044,827 bytes
- Uncompressed size: 3,693,281 bytes
- File count: 295
- Data classification: synthetic only

The archive excludes `node_modules`, `.next`, `.git`, `.vercel`, `.supabase`, virtual environments, test/browser output, caches, original ZIPs, non-example environment files, logs, keys/certificates, model weights, FIT/GPX/TCX files, and release checksum/manifest self-evidence.

## Source-tree gate

- Frozen pnpm install: pass.
- Frozen Python environment sync: pass.
- Prettier: pass.
- ESLint: pass with zero warnings.
- TypeScript: pass.
- Unit/integration: 266/266 pass across 14 files.
- Fixed agent evaluation report: 220/220 pass, including 120/120 critical cases; its Vitest harness executed 222/222 assertions.
- FIT lint: pass.
- FIT tests: 5/5 pass.
- Database reproducibility: 55/55 pass across three pgTAP files.
- Database schema lint: pass with zero findings.
- Local Playwright: 16/16 pass after increasing timing-only guards for the seven-viewport matrix and cold MCP child-process startup.
- Production build: pass, 26/26 generated pages.
- Secret scan: 300 text files, zero credential signatures.
- Private-data filename scan: 301 source files considered, zero forbidden files. The four email-shaped source files are synthetic SQL security fixtures.

## ZIP and extracted-copy gate

- ZIP open/read: pass.
- Release phase: `rc5`, source version `1.0.0-rc5`, no personal health data.
- Forbidden-entry scan: 0/295.
- Extraction: pass; extracted file count 295 and root version `1.0.0-rc5`.
- Pre-install extracted secret scan: 289 text files, zero credential signatures.
- Pre-install extracted private-data scan: 0 forbidden files.
- Extracted frozen pnpm install: pass.
- Extracted frozen Python environment sync: pass.
- Extracted formatting, lint, and typecheck: pass.
- Extracted unit/integration: 266/266 pass.
- Extracted agent evaluation harness: 222/222 assertions pass; fixed report 220/220.
- Extracted FIT lint and tests: pass, 5/5.
- Extracted database reproducibility: 55/55 pass; schema lint has zero findings.
- Extracted production build: pass, 26/26 pages.
- Extracted Playwright: 16/16 pass.
- Built client bundle secret scan: 15 text assets, zero credential signatures and zero server-secret markers.

## Hosted evidence carried by the release

- GitHub CI: Python and JavaScript success; PR #1 merged.
- Hosted RLS: 179/179 pass.
- Hosted private Storage: 21/21 pass.
- Hosted ingestion: 26/26 pass.
- Source arbitration: 12/12 pass.
- Hosted Vercel Preview: 28/28 route/viewport checks and 3/3 accessibility routes pass.
- Hosted Auth: blocked because public email signup remains enabled.
- Private Production shell and full hosted Production E2E: not approved/not run.

## Verdict

RC5 source archive: **PASS**.

Core hosted platform: **NOT SAFE FOR REAL DATA**. No real-data pilot, phone automation, AI, MCP, ChatGPT, Codex, Garmin cloud API, paid plan, or GA promotion was enabled.
