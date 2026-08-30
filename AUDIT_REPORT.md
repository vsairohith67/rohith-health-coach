# Audit report

Date: 30 August 2026
Output target: `1.0.0-rc4`

## Input selection

The workspace did not contain an existing RC1 ZIP or application source when work began; the four supplied prompts were cumulative and the application was constructed in `rohith-health-coach`. Therefore RC1–RC3 archives are reconstructed compatibility artefacts from the final cumulative source and are labelled as such, not represented as historical commit snapshots.

## Material findings and repairs

| Severity | Finding                                                              | Repair / evidence                                                                                    |
| -------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| P0       | No application, schema, or release evidence existed                  | Implemented monorepo, PWA, migrations, services, tests, docs, and release tooling                    |
| P0       | Derived tables initially inherited owner `FOR ALL` policy/grants     | Explicit least-privilege migration makes canonical/derived records browser read-only; 40 pgTAP tests |
| P0       | Account-deletion RPC could not work without broad table insert       | Narrow security-definer RPC validates subject/scope; public/anon execute revoked                     |
| P1       | Initial FIT base image digest no longer resolved                     | Verified current official multi-arch digest; lock copied and `uv sync --frozen`                      |
| P1       | Generated database type capture included container pull logs         | Regenerated after image availability and stripped non-TypeScript prefix                              |
| P1       | ESLint config did not globally ignore nested Next build output       | Added a global flat-config ignore block; lint passes with zero warnings                              |
| P1       | Urgent phrase and dangerous URL edge cases failed early safety tests | Expanded patterns/sanitization; fixed suite passes                                                   |
| P1       | Mobile profile/contrast/action copy defects in visual pass           | Repaired breakpoints, contrast tokens, labels, and action grammar                                    |

No unresolved P0 source defect remains. Hosted, physical-device, real-data, provider, and connection gates are intentionally unresolved and block GA.
