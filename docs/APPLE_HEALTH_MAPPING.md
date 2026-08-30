# Apple Health mapping

Only the following initial aggregates are supported. Identifiers must be confirmed in Apple’s current HealthKit/Shortcuts UI; the server rejects unknown `metric_type` values.

| Product metric           | Apple Health concept        | Unit      | Safe arbitration rule                                                    |
| ------------------------ | --------------------------- | --------- | ------------------------------------------------------------------------ |
| Steps                    | Step Count                  | count     | Select one authoritative source; add only proven non-overlapping deltas  |
| Active energy            | Active Energy Burned        | kcal      | Select one source/date; never add overlapping device totals              |
| Walking/running distance | Walking + Running Distance  | km        | Select one source/date; interval fallback requires proven non-overlap    |
| Workout time/count       | Workouts                    | min/count | Logical-session deduplication before bounded union/count                 |
| Resting heart rate       | Resting Heart Rate          | bpm       | One source-qualified daily representative value                          |
| Heart-rate range         | Heart Rate                  | bpm       | One source-qualified series for daily min/max/average; no series to AI   |
| HRV                      | Heart Rate Variability SDNN | ms        | Source-qualified observations; not inferred or combined across sources   |
| Sleep duration/stages    | Sleep Analysis              | min/stage | Garmin-derived session preferred; overlapping sessions are not added     |
| Body mass                | Body Mass                   | kg        | Latest valid observation from the authoritative source for the local day |

Not supported in this release: ECG, blood glucose, blood pressure, medications, symptoms, reproductive data, clinical records, contacts, GPS routes, Garmin Body Battery/stress/readiness, Pulse Ox, or respiratory metrics. Missing permissions and absent samples remain missing rather than zero.

Each sample carries start/end timestamps, source name/bundle, provider, source-generating device details, source-record identifier, aggregation shape, coverage, unit, and quality metadata when Shortcuts exposes them. Missing provenance remains missing; it is never guessed. Server normalization owns timezone/local-day assignment. See `SOURCE_ARBITRATION.md`.

Steps are excluded from the first real Shortcut pilot unless the actual iPhone exposes reliable Garmin-versus-iPhone source fields in a manual Shortcut run. Ambiguous source data produces no daily Step number.
