# Final test report

All results are from 2026-08-30 and use synthetic data unless explicitly marked otherwise.

| Command/action                                    | Environment            | Result | Count / evidence                                        |
| ------------------------------------------------- | ---------------------- | ------ | ------------------------------------------------------- |
| `pnpm.cmd install --frozen-lockfile`              | Windows, repository    | PASS   | Lock synchronized                                       |
| `pnpm.cmd format:check`                           | Windows                | PASS   | Repository formatting                                   |
| `pnpm.cmd lint`                                   | Windows                | PASS   | Zero warnings                                           |
| `pnpm.cmd typecheck`                              | Windows                | PASS   | TypeScript no emit                                      |
| `pnpm.cmd test`                                   | Windows/Vitest         | PASS   | 13 files, 254 tests                                     |
| `pnpm.cmd test:evals`                             | Windows/Vitest         | PASS   | 220/220 cases; 120/120 critical; score 1.00             |
| `pnpm.cmd build`                                  | Windows/Next 16.3.3    | PASS   | 26 static pages plus dynamic server routes              |
| `pnpm.cmd test:e2e`                               | Local browser          | PASS   | 14/14; seven sizes, dark/reduced motion; Axe critical 0 |
| `pnpm.cmd db:test`                                | Local Supabase         | PASS   | 40/40 pgTAP                                             |
| `pnpm.cmd db:lint`                                | Local Supabase         | PASS   | No schema errors                                        |
| `pnpm.cmd fit:lint`                               | uv/Ruff                | PASS   | No findings                                             |
| `pnpm.cmd fit:test`                               | uv/pytest              | PASS   | 5/5                                                     |
| `pnpm.cmd audit --audit-level high`               | pnpm registry metadata | PASS   | No known vulnerabilities                                |
| `uv lock --check --directory services/fit-parser` | uv                     | PASS   | 31 packages resolved                                    |
| `pnpm.cmd verify:secrets`                         | Source                 | PASS   | 205 text files before final reports                     |
| FIT Docker build and loopback probe               | Docker Desktop         | PASS   | Non-root UID/GID 999; decoder intentionally unavailable |

MCP initialization/list/call, stdio process transport, loopback HTTP metadata/401, authorization/scope/output limits, and OAuth primitives are included in the Vitest total. Hosted infrastructure, MCP Inspector UI, model benchmark, actual Codex/ChatGPT registration, secure tunnel, real OAuth issuer, official FIT SDK/corpus, screen-reader/physical-device, real-data, and production tests were not run and are not counted as passes. Final archive verification is appended after packaging.
