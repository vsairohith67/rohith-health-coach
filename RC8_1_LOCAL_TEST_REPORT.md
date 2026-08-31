# RC8.1 fresh local regression

Date: 2026-08-31

Branch: `codex/rc8-unattended-prep`

Version: `1.0.0-rc8.1`

Data classification: synthetic only

## Final result

`RC8_1_LOCAL_REGRESSION = PASSED`

| Gate                      | Command                                                        | Result        |                                      Count |       Duration |
| ------------------------- | -------------------------------------------------------------- | ------------- | -----------------------------------------: | -------------: |
| Frozen install            | `pnpm.cmd install --frozen-lockfile`                           | PASS          |                      14 workspace projects |         1.64 s |
| Format                    | `pnpm.cmd format:check`                                        | PASS          |                           all tracked text |         5.43 s |
| Lint                      | `pnpm.cmd lint`                                                | PASS          |                              zero warnings |         9.36 s |
| TypeScript                | `pnpm.cmd typecheck`                                           | PASS          |                                zero errors |         7.13 s |
| Unit/integration          | `pnpm.cmd test`                                                | PASS          |                                    282/282 |         5.31 s |
| Agent evaluations         | `pnpm.cmd test:evals`                                          | PASS          |                                    222/222 |         4.68 s |
| Source arbitration        | included in `pnpm.cmd test`                                    | PASS          |                                      12/12 | included above |
| FIT lint                  | `pnpm.cmd fit:lint`                                            | PASS          |                              zero findings |         1.56 s |
| FIT tests                 | `pnpm.cmd fit:test`                                            | PASS          |                                        5/5 |         4.67 s |
| Production build          | `pnpm.cmd build`                                               | PASS          |                            29 static pages |        10.10 s |
| Local migration replay    | `supabase db reset --local --no-seed`                          | PASS          |                           all 7 migrations |        38.48 s |
| Database assertions       | `pnpm.cmd db:test`                                             | PASS          |                                      91/91 |         4.30 s |
| Credential assertions     | included in `pnpm.cmd db:test`                                 | PASS          |                                      36/36 | included above |
| Schema lint               | `pnpm.cmd db:lint`                                             | PASS          |                              zero findings |         2.69 s |
| Zero-sample ingestion     | `pnpm.cmd test:ingestion:local`                                | PASS          |  HTTP 200; all counters zero; cleanup zero |         6.42 s |
| Playwright targeted rerun | `pnpm.cmd exec playwright test --grep "exact viewport matrix"` | PASS          |                                        2/2 |        33.80 s |
| Playwright full rerun     | `pnpm.cmd test:e2e`                                            | PASS          |                                      18/18 |        49.19 s |
| Repository secret scan    | `pnpm.cmd verify:secrets`                                      | PASS          |                             374 text files |         1.86 s |
| Private-data scan         | `pnpm.cmd verify:private-data`                                 | PASS          |                             375 text files |         1.89 s |
| Git-history Gitleaks      | `gitleaks git . --redact=100`                                  | REVIEWED PASS | 19 commits; one known prose false positive |         0.65 s |
| Refined history patterns  | read-only `git grep` across every reachable commit             | PASS          |  zero value findings; zero forbidden paths |        10.80 s |

## Browser failure and repair

The first full Playwright run passed 17/18. In the mobile exact-viewport test, a button click could occur before the repeatedly navigated Ask page finished hydrating, leaving the previous deterministic answer visible. The test now waits for `networkidle` before the interaction. The targeted two-project test passed, followed by the complete 18/18 rerun.

## Critical synthetic arbitration result

The Garmin `4,861` plus iPhone `8,148` overlap case remained fail-closed: Garmin was selected, the alternative was preserved, and `13,009` was not produced.

## Skips

No requested local gate was skipped. Hosted tests are intentionally recorded in separate hosted reports after merge, migration, and deployment.
