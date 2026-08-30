# Supabase deployment report

Status: **NOT DEPLOYED**.

The connected organization is `Supabase test Organisation` and contains no project. Creating `rohith-health-coach-prod` requires a fresh, explicit organization/cost/region confirmation in the Supabase workflow, so no project, billing commitment, link, migration, function, bucket, or secret was created.

Local evidence is strong but is not hosted evidence: three migrations reset cleanly; 40/40 pgTAP assertions passed; schema lint reported no errors; representative owner/date queries used `daily_metrics_user_date_idx`, `raw_health_user_metric_time_idx`, and `coach_reports_user_period_idx`. The intended hosted sequence is documented in `docs/SUPABASE_SETUP.md` and fails closed before real-data use.
