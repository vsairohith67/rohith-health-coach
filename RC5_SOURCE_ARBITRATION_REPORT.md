# RC5 source arbitration report

Verified: 2026-08-30.

## Implementation

- Added one pure deterministic arbitration engine shared by local tests and hosted ingestion.
- Namespaced deduplication now includes provider, source bundle/name, source-generating device, registered ingestion device, metric, and record/fingerprint identity.
- Garmin/CIRQA evidence has first priority; iPhone is fallback only when Garmin is absent or a non-overlapping interval gap is explicitly confirmed.
- Full-day totals are never added across sources and the maximum total is never selected merely because it is larger.
- Alternatives remain traceable and overlapping disagreements become structured diagnostics.
- Ambiguous equal-priority or unknown-source conflicts produce `null`, not an invented number.
- Current/partial days are not eligible for complete-day comparison.
- Garmin-derived sleep outranks manual sleep while preserving the manual record.
- Garmin Apple Health/FIT workout duplicates collapse conservatively to one logical workout; distinct non-overlapping activities remain separate.

## Automated matrix

Required cases: **9 passed, 0 failed**.

| Case                                                         | Result                                                                                 |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| A — Garmin 4,861 plus overlapping iPhone 8,148               | Garmin 4,861 selected; 13,009 forbidden; iPhone preserved; overlap diagnostic recorded |
| B — Garmin 4,861 plus iPhone 5,024                           | Garmin 4,861 selected                                                                  |
| C — confirmed Garmin 00:00–15:00 gap plus iPhone 15:00–17:00 | only explicit non-overlapping interval fallback combined; result remains partial       |
| D — Garmin workout via Apple Health plus same FIT activity   | one logical workout, FIT canonical                                                     |
| E — distinct non-overlapping iPhone and Garmin activities    | two logical workouts                                                                   |
| F — manual sleep plus later valid Garmin sleep               | Garmin selected; manual preserved                                                      |
| G — current partial day                                      | comparison ineligible                                                                  |
| H — Garmin absent                                            | iPhone selected as fallback                                                            |
| I — ambiguous equal-priority conflicting totals              | conflict with no value                                                                 |

Additional provenance safeguards: **3 passed, 0 failed**. They verify that a shared record ID across distinct sources is preserved, a true same-source replay is deduplicated, and generic Apple Health provenance remains unknown unless explicit Garmin evidence exists.

## Persistence and diagnostics

Hosted ingestion recomputes Step decisions for affected local dates and writes the decision beneath `daily_metrics.source_coverage.steps`. Conflict/unavailable decisions write a null Step value. Source alternatives remain in `raw_health_samples`. No raw values are written to operational logs.

Result: the code-level source-arbitration gate passes. Hosted ingestion verification is reported separately.
