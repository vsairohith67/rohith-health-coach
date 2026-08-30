# RC6 release report

Released: 2026-08-30 (Asia/Calcutta)

## Artifact

- Version: `1.0.0-rc6`
- Source commit: `b54d0b45f6466a5d891773aed7ca1454534dca35`
- Filename: `rohith-health-coach-v1.0.0-rc6.zip`
- Path: `release/rohith-health-coach-v1.0.0-rc6.zip`
- SHA-256: `6127379f2193c19b774d1416b4cab9b6c35d06e44d5623f2d6ec72848e0c8687`
- Compressed size: 3,073,054 bytes
- Uncompressed size: 3,744,200 bytes
- File count: 324
- Data classification: synthetic only

The archive excludes `node_modules`, `.next`, `.git`, `.vercel`, `.supabase`, virtual environments, browser/test output, caches, original ZIPs, non-example environment files, logs, key/certificate material, model weights, FIT/GPX/TCX files, and release checksum/manifest self-evidence.

## Source-tree gate

- Frozen pnpm install: pass.
- Frozen Python environment sync: pass.
- Prettier: pass.
- ESLint: pass with zero warnings.
- TypeScript: pass.
- Unit/integration: 282/282 pass across 17 files.
- Fixed agent evaluation report: 220/220 pass, including 120/120 critical; its Vitest harness executed 222/222 assertions.
- FIT lint: pass.
- FIT tests: 5/5 pass.
- Database reproducibility: 55/55 pass across three pgTAP files.
- Database schema lint: pass with zero findings.
- Playwright: 16/16 pass.
- Explicit private Production build: pass, 28/28 generated pages.
- Final evidence-inclusive source secret scan: 335 text files, zero credential signatures.
- Production build scan: 858 text files, zero credential signatures; zero client secret-marker files.
- Private-data filename scan: 340 source files considered, zero forbidden files.

## ZIP and extracted-copy gate

- ZIP open/read: pass.
- Release phase: `rc6`, source version `1.0.0-rc6`, no personal health data.
- Forbidden-entry scan: 0/324.
- Extraction: pass; extracted file count 324 and root version `1.0.0-rc6`.
- Pre-install extracted secret scan: 318 text files, zero credential signatures.
- Pre-install extracted private-data scan: zero forbidden files.
- Extracted frozen pnpm install: pass.
- Extracted frozen Python environment sync: pass.
- Extracted formatting, lint, and typecheck: pass.
- Extracted unit/integration: 282/282 pass.
- Extracted agent evaluation harness: 222/222 assertions; fixed report 220/220 and 120/120 critical.
- Extracted FIT lint/tests: pass, 5/5.
- Extracted database reproducibility: 55/55; schema lint zero findings.
- Extracted Playwright: 16/16 pass.
- Extracted explicit Production build: pass, 28/28 pages.
- Extracted build secret scan: 664 text files, zero credential signatures.
- Extracted client bundle: zero server-secret markers; private empty state present; no Demo label, `4,861`, or `13,009`.

The Playwright development server emits the expected React development warning because the Production CSP excludes `unsafe-eval`; React states that Production mode does not use eval. Both compiled Production builds passed.

The complete extracted suite ran from `C:\Users\rohit\AppData\Local\Temp\rohith-health-rc6-final-5aa6071e`. After the final documentation-only scan-count correction, a fresh immutable extraction at `C:\Users\rohit\AppData\Local\Temp\rohith-health-rc6-immutable-4d09d3fb` passed 0 source-hash mismatches, 0 forbidden private files, and the 318-text-file scan. An earlier verified extraction remains at `C:\Users\rohit\Documents\ChatGPT\AI Health Coach\rc6-extracted-verification-d71cec49` because host policy rejected its exact, pre-verified recursive cleanup command. These directories contain only sanitized release verification material and are not in the ZIP.

## Hosted state

- GitHub CI: Python and JavaScript success; PR #1 merged.
- Hosted RLS: 179/179 pass.
- Hosted private Storage: 21/21 pass.
- Hosted ingestion: 26/26 pass.
- Source arbitration: 12/12 pass.
- Auth code/callback/session source gates: pass.
- Hosted public signup: still enabled.
- Public-signup negative matrix: 2/6; four direct cases correctly not run.
- RC6 private Vercel Production: not deployed.
- Hosted Production E2E: 0/24, correctly not run.
- Exact hosted cleanup: zero users, sessions, application rows, credentials, or Storage objects.

## Verdict

RC6 sanitized source archive: **PASS**.

Core platform: **NOT SAFE FOR REAL DATA**. No real-data pilot, phone automation, AI, MCP, ChatGPT, Codex, Garmin cloud API, paid plan, or GA promotion was enabled.
