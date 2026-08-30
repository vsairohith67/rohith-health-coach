# Test report

Final local evidence:

| Suite                  | Result                                                                                         |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| Vitest full            | 13 files, 254 tests passed                                                                     |
| Fixed agent evaluation | 220/220 cases passed; 120/120 critical                                                         |
| Playwright             | 14/14 passed, including seven exact sizes and dark/reduced-motion state                        |
| Axe                    | No serious or critical findings on tested Today/Ask pages in both projects                     |
| Supabase pgTAP         | 40/40 passed after clean reset                                                                 |
| Supabase schema lint   | No schema errors                                                                               |
| FIT pytest             | 5/5 passed                                                                                     |
| Ruff                   | Passed                                                                                         |
| MCP                    | Official SDK initialize/list/call, stdio spawn, loopback metadata/401, OAuth primitives passed |
| Dependency audit       | pnpm reported no known vulnerabilities                                                         |
| Secret scan            | 205 source text files passed before archive creation                                           |

The responsive matrix exercised 360×800, 390×844, 430×932, 768×1024, 1024×768, 1280×800, and 1440×900 across Today, Ask, and AI settings. Playwright’s development server printed expected React CSP `eval()` diagnostics; the production build uses no `unsafe-eval`. Hosted, physical-device, screen-reader, official-decoder corpus, real OAuth/ChatGPT/Codex, and model-specific tests have not run.
