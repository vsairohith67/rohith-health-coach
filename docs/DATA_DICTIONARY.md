# Data dictionary

All time-series rows carry an explicit user owner, source, timestamp, and local-day/timezone context. `null` means unavailable; it is never converted to zero.

| Object                                            | Purpose                                    | Sensitive fields / rule                                 |
| ------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------- |
| `profiles`, `user_preferences`                    | Locale, timezone, targets, privacy choices | Owner-managed; AI consent defaults false                |
| `provider_connections`, `devices`                 | Revocable source/device inventory          | No plaintext ingestion token                            |
| `private.ingestion_credentials`                   | Hashed scoped device credentials           | Private schema; service role only                       |
| `ingestion_events`                                | Idempotency and safe processing audit      | Stores counts/codes, not request bodies                 |
| `raw_health_samples`                              | Normalized source observations             | Server-written, owner-readable, expiration supported    |
| `sleep_sessions`, `sleep_stages`                  | Sleep windows and stages                   | Explicit source/confidence/quality flags                |
| `activities`, `activity_laps`, `activity_records` | Workout summaries and optional detail      | Location never enters AI envelopes                      |
| `fit_files`, `fit_ingestion_jobs`                 | Private object metadata and job state      | Bucket path begins with owner UUID                      |
| `daily_metrics`                                   | One local-date aggregate per user          | `partial`, `complete`, or `missing`; server-written     |
| `daily_checkins`                                  | Optional 1–5 wellbeing ratings and note    | Note is excluded from AI unless separate consent exists |
| `baseline_snapshots`                              | Robust window statistics and maturity      | Valid-day count controls status                         |
| `insights`, `coach_reports`                       | Deterministic findings/reports             | Evidence references and calculation version required    |
| `knowledge_sources`                               | Reviewed official guidance metadata        | Active authenticated read only                          |
| `audit_events`                                    | Privacy-safe control-plane events          | No health values, request bodies, tokens, or filenames  |
| `export_jobs`, `deletion_jobs`                    | User data rights workflows                 | Private object path, expiry, scoped request             |
| `private.agent_access_tokens`                     | Future MCP token hashes and scopes         | Private schema; never browser-readable                  |

Units are explicit: minutes (`min`), steps (`count`), energy (`kcal`), heart rate (`bpm`), HRV SDNN (`ms`), distance (`km` or metres at raw boundary), mass (`kg`), and ratings (`rating_1_5`). Proprietary Garmin metrics are unsupported unless a future licensed mapping is reviewed.
