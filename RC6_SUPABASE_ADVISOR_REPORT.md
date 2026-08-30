# RC6 Supabase advisor report

Reviewed: 2026-08-30 against `wmzrkkqcfvuhjpduplod`

## Security Advisor

One warning:

- `public.request_account_deletion(p_scope text)` is a `SECURITY DEFINER` function executable by `authenticated`.
- Applicability: intentional authenticated self-service boundary.
- Audit: fixed empty `search_path`; obtains `auth.uid()`; rejects anonymous calls; accepts only `all`, `health_data`, or `account`; inserts only a job owned by the requester; no dynamic SQL; only authenticated and service role can execute.
- Pilot impact: non-blocking.
- Remediation: retain the ownership regression test and re-audit if the function changes.

The table-inventory connector separately raised a critical heuristic because two tables in the non-exposed `private` schema do not have RLS. Exact grant readback found no `anon` or `authenticated` table grants, and hosted tests prove access only through scoped fixed-search-path functions. Enabling RLS without deliberately designed policies could break trusted ingestion/token paths, so no automatic SQL was applied. This must be reconsidered if the private schema is ever exposed or direct client grants are added.

## Performance Advisor

Eleven informational unindexed-foreign-key findings:

- `private.agent_access_tokens.user_id`
- `public.activities.device_id`
- `public.activities.fit_file_id`
- `public.activity_records.activity_id`
- `public.fit_files.device_id`
- `public.fit_ingestion_jobs.fit_file_id`
- `public.fit_ingestion_jobs.user_id`
- `public.ingestion_events.device_id`
- `public.raw_health_samples.device_id`
- `public.raw_health_samples.ingestion_event_id`
- `public.sleep_stages.sleep_session_id`

Six informational unused-index findings were also returned. The hosted database is empty and newly created, so unused-index telemetry is expected. No index was removed, and no speculative migration was added for a single-user pilot without query evidence.

## Verdict

Advisor review: **COMPLETE**. No advisor item currently demonstrates cross-user access or blocks the synthetic source release. Hosted Auth and Production E2E remain the blocking gates.
