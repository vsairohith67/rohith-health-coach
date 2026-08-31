# RC8 local synthetic regression report

Executed: 2026-08-31

Version: `1.0.0-rc8`

Branch: `codex/rc8-unattended-prep`

## Result

**PASS — LOCAL/SYNTHETIC PREPARATION ONLY**

No real health record, Production device token, owner email interaction, iPhone operation, Apple Health permission, Garmin authentication, hosted migration, or deployment was used.

## Exact results

| Gate                               | Result | Evidence                                                                     |
| ---------------------------------- | ------ | ---------------------------------------------------------------------------- |
| Install                            | PASS   | 14 workspaces; frozen lockfile current                                       |
| Format                             | PASS   | Prettier check, all matched files                                            |
| ESLint                             | PASS   | zero warnings/errors                                                         |
| TypeScript                         | PASS   | `tsc --noEmit`                                                               |
| Unit/integration                   | PASS   | 17 files, 282/282 Vitest tests                                               |
| Agent evaluations                  | PASS   | 222/222                                                                      |
| Source arbitration                 | PASS   | 12/12, included in Vitest total                                              |
| Migration reproducibility          | PASS   | empty local database replayed all 7 migrations                               |
| Database lint                      | PASS   | extensions/private/public, zero issues                                       |
| Database assertions                | PASS   | 4 pgTAP files, 91/91                                                         |
| RC8 credential assertions          | PASS   | 36/36, included in database total                                            |
| FIT lint                           | PASS   | Ruff                                                                         |
| FIT tests                          | PASS   | 5/5 pytest tests                                                             |
| Playwright                         | PASS   | 18/18 across desktop Chromium and mobile emulation                           |
| Accessibility                      | PASS   | no serious/critical Axe violations in tested routes                          |
| Exact viewport matrix              | PASS   | 360x800, 390x844, 430x932, 768x1024, 1024x768, 1280x800, 1440x900            |
| Production build                   | PASS   | Next.js 16.3.3 optimized build; 29 static pages generated                    |
| Source secret scan                 | PASS   | 367 text files                                                               |
| Built-bundle secret scan           | PASS   | 943 text files under `.next`                                                 |
| Private-data scan                  | PASS   | 368 text files; no non-synthetic email, raw health file, or unreviewed image |
| Local zero-sample ingestion        | PASS   | HTTP 200; all counters and affected dates zero                               |
| Synthetic cleanup                  | PASS   | auth user, device, credential, event, and sample counts all zero             |
| Recent local Edge Runtime log scan | PASS   | 0 bearer tokens, 0 authorization headers, 0 sample-value field names         |

## Critical source-arbitration proof

The synthetic full-day overlap case used:

- Garmin: 4,861 steps
- iPhone: 8,148 steps

Result:

- selected value: **4,861**
- authoritative source: Garmin
- iPhone observation: preserved as an alternative
- conflict: `overlap_not_combined`
- forbidden 13,009 total: **not produced**

The full matrix also covers confirmed non-overlap fallback, ambiguous conflict, current partial day, missing Garmin fallback, Garmin Apple Health/FIT workout deduplication, distinct non-overlapping workouts, and Garmin-over-manual sleep precedence.

## Credential runtime proof

`test:ingestion:local` accepts only a loopback HTTP endpoint and the expected local Supabase database container. It creates a fixed synthetic identity, obtains an owner RPC credential into process memory, sends the strict empty-sample envelope, validates only safe counters, deletes the identity in a `finally` block, and fails unless all cleanup counts are zero. It never prints the credential.

## External Garmin review note

The Garmin MCP upstream repository is not part of this application's passing regression. Its selected Windows run produced 488 passing and 5 failing tests after excluding a startup test that breaks pytest capture on Windows. Its locked environment also had three dependency advisories. Those are explicit RC9 admission blocks in `docs/GARMIN_MCP_EVALUATION.md`; Garmin authentication remains disabled.

## Boundary

This report clears the local RC8 preparation source only. It does not clear hosted deployment, real-data ingestion, phone automation, Apple Health permission, Garmin account authentication, MCP, AI, ChatGPT, Codex health access, or GA.
