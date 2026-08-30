# Data integrity report

## Verified locally

- Three ordered migrations reset cleanly on Supabase CLI `2.116.0`/local Postgres.
- 40 pgTAP assertions pass for two synthetic users, anonymous denial, explicit grants, private schemas, scoped RPCs, and private Storage paths.
- Source-hash and idempotency uniqueness, timestamp/duration/rating/value/status constraints, foreign keys, cascades, and owner indexes are present.
- Representative 90-day daily, raw metric, and report queries use `daily_metrics_user_date_idx`, `raw_health_user_metric_time_idx`, and `coach_reports_user_period_idx`.
- Generated TypeScript database types are included under `packages/health-contracts/src/database.types.ts`.
- Missing is `null`, never zero; partial/conflicting states remain explicit; local date/timezone and source timestamps are preserved.
- Synthetic Demo Mode uses one fixed seed and contains no personal data.

## Authority

Browser users may manage profile/preferences/connections/devices/check-ins/goals/experiments within owner RLS. Ingestion/raw/sleep/activity/FIT metadata/jobs/daily aggregates/baselines/insights/reports/audit/exports/deletions are read-only to authenticated clients and written by trusted services/RPCs. Private credential tables are not exposed.

## Remaining validation

Hosted migration/type drift, actual Auth claims, Storage service behavior, distributed ingestion concurrency, backup/restore, real Apple Health source overlap, and official FIT decode must be tested with synthetic data in the selected cloud before real-data readiness.
