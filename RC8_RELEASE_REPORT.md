# RC8 release report

Prepared: 2026-08-31 (Asia/Calcutta)

## Artifact

- Version: `1.0.0-rc8`
- Preparation source commit: `529ea9c83d0b33962830f2cb3bfaf04e7fe840bb`
- Preparation source tree: `10d623bdd5595b6f934efaaa2b60c60c91ece59e`
- Branch: `codex/rc8-unattended-prep`
- Filename: `rohith-health-coach-v1.0.0-rc8.zip`
- Path: `release/rohith-health-coach-v1.0.0-rc8.zip`
- SHA-256: `4e54076c5b77a066050904ae0fe3703c23e9bdb225abae478611c178a0dc6544`
- Compressed size: 3,127,687 bytes
- Uncompressed size: 3,870,989 bytes
- File count: 357
- Data classification: synthetic only

The archive excludes `.git`, `node_modules`, `.next`, `.vercel`, `.supabase`, virtual environments, browser/test output, caches, all ZIPs, non-example environment files, logs, key/certificate material, FIT/GPX/TCX files, model weights, and its own release report/checksum/manifest evidence.

## Committed source gate

- Frozen pnpm install: pass.
- Prettier: pass.
- ESLint: pass with zero warnings.
- TypeScript: pass.
- Unit/integration: 282/282 pass across 17 files.
- Agent evaluations: 222/222 pass.
- Source arbitration: 12/12 pass.
- Database replay: 7/7 migrations applied from empty local state.
- Database lint: pass with zero issues.
- Database tests: 91/91 pass across four pgTAP files.
- RC8 device-credential tests: 36/36 pass.
- FIT lint: pass.
- FIT tests: 5/5 pass.
- Playwright: 18/18 pass.
- Production build: pass; 29 static pages generated.
- Source secret scan: pass, 371 text files and zero credential signatures.
- Private-data scan: pass, 372 text files and zero private-data artifacts.
- Built source bundle secret scan: pass, 943 text files and zero credential signatures.
- Local zero-sample ingestion: HTTP 200, all result counts zero, all fixture cleanup counts zero.

## Gitleaks result

The all-history and archive-directory Gitleaks runs reproduce one reviewed false positive: `generic-api-key` on prose in `FINAL_SECURITY_REPORT.md`, line 8, introduced by commit `2eb3b1fb48658317005d2bf9d66c5ca3c8d9cbe6`. The text describes bounded safety controls; it is not a credential or token. No new finding was introduced by RC8.

## Extracted-copy gate

- ZIP opened and extracted: pass.
- Entry count and extracted file count: 357/357.
- Forbidden entries: 0.
- Archive secret scan before install: pass, 351 text files.
- Archive private-data scan before install: pass, 351 text files.
- Frozen install: pass, 455 packages from the locked graph.
- Prettier, ESLint, TypeScript: pass.
- Unit/integration: 282/282 pass.
- Agent evaluations: 222/222 pass.
- Database replay/lint: pass.
- Database assertions: 91/91 pass.
- FIT lint/tests: pass, 5/5.
- Production build: pass, 29 static pages.
- Playwright: 18/18 pass.
- Post-build source secret/private-data scan: pass, 359 text files.
- Extracted build-bundle secret scan: pass, 697 text files.
- Local zero-sample ingestion and cleanup: pass.

## Verdict

RC8 sanitized local preparation archive: **PASS**.

Hosted deployment: **NOT PERFORMED**.

Real-data readiness: **NOT SAFE FOR REAL DATA** until the prepared credential migration/UI completes exact-head review, CI, merge, hosted migration, and Vercel deployment. The real-data pilot has not started.
