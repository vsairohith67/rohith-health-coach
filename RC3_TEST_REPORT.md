# RC3 test report

RC3 compatibility evidence was reconstructed from the cumulative RC4 source; no historical RC3 archive was available.

| Area                  | Local result                                                 | Hosted/device result                  |
| --------------------- | ------------------------------------------------------------ | ------------------------------------- |
| JavaScript/TypeScript | Format, lint, typecheck, build passed                        | Not applicable                        |
| Unit/integration      | 254/254 assertions passed                                    | Not run                               |
| Database/RLS/Storage  | 40/40 pgTAP; lint clean                                      | Not run                               |
| FIT service           | Ruff and 5/5 pytest; Docker build/loopback passed            | Not deployed                          |
| Browser/a11y          | 14/14 Playwright, seven sizes; no serious/critical Axe issue | No Preview/Production/physical device |
| Security/dependencies | Source secret scan passed; no known pnpm vulnerabilities     | Hosted configuration unverified       |

No skipped hosted or phone check is counted as a pass.
