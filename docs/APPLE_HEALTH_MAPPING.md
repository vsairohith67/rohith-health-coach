# Apple Health mapping

Only the following initial aggregates are supported. Identifiers must be confirmed in Apple’s current HealthKit/Shortcuts UI; the server rejects unknown `metric_type` values.

| Product metric           | Apple Health concept        | Unit      | Aggregation                                          |
| ------------------------ | --------------------------- | --------- | ---------------------------------------------------- |
| Steps                    | Step Count                  | count     | Daily sum, de-duplicated by source record hash       |
| Active energy            | Active Energy Burned        | kcal      | Daily sum                                            |
| Walking/running distance | Walking + Running Distance  | km        | Daily sum                                            |
| Workout time/count       | Workouts                    | min/count | Bounded session union/count                          |
| Resting heart rate       | Resting Heart Rate          | bpm       | Daily representative value with source               |
| Heart-rate range         | Heart Rate                  | bpm       | Daily min/max/average; no raw series to AI           |
| HRV                      | Heart Rate Variability SDNN | ms        | Source observations; not inferred daily              |
| Sleep duration/stages    | Sleep Analysis              | min/stage | Session merge with source priority and overlap rules |
| Body mass                | Body Mass                   | kg        | Latest observation for local day                     |

Not supported in this release: ECG, blood glucose, blood pressure, medications, symptoms, reproductive data, clinical records, contacts, GPS routes, Garmin Body Battery/stress/readiness, Pulse Ox, or respiratory metrics. Missing permissions and absent samples remain missing rather than zero.

Each sample carries start/end timestamps, source name/bundle, source-record identifier when available, unit, and quality metadata. Server normalization owns timezone/local-day assignment.
