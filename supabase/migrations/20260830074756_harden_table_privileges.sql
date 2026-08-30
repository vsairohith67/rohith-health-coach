begin;

-- Fail closed on Data API exposure. New Supabase projects no longer grant
-- public-schema access automatically, so the application declares every
-- browser privilege instead of depending on project-era defaults.
revoke all on table
  public.profiles,
  public.user_preferences,
  public.provider_connections,
  public.devices,
  public.ingestion_events,
  public.raw_health_samples,
  public.sleep_sessions,
  public.sleep_stages,
  public.activities,
  public.activity_laps,
  public.activity_records,
  public.fit_files,
  public.fit_ingestion_jobs,
  public.daily_metrics,
  public.daily_checkins,
  public.goals,
  public.experiments,
  public.baseline_snapshots,
  public.insights,
  public.coach_reports,
  public.knowledge_sources,
  public.audit_events,
  public.export_jobs,
  public.deletion_jobs
from public, anon, authenticated;
revoke all on sequence public.activity_records_id_seq, public.audit_events_id_seq
from public, anon, authenticated;
revoke all on function
  public.set_updated_at(),
  public.service_resolve_ingestion_credential(text, uuid),
  public.service_mark_credential_used(uuid),
  public.service_issue_ingestion_credential(uuid, uuid, text, text, timestamptz, uuid),
  public.claim_fit_job(text),
  public.request_account_deletion(text)
from public, anon, authenticated;

-- Owner-managed records. Row ownership is still enforced by the policies from
-- the core migration; these grants only define which verbs reach those checks.
grant select, insert, update, delete on table
  public.profiles,
  public.user_preferences,
  public.provider_connections,
  public.devices,
  public.daily_checkins,
  public.goals,
  public.experiments
to authenticated;

-- Canonical and derived health records are written only by trusted services.
grant select on table
  public.ingestion_events,
  public.raw_health_samples,
  public.sleep_sessions,
  public.sleep_stages,
  public.activities,
  public.activity_laps,
  public.activity_records,
  public.fit_files,
  public.fit_ingestion_jobs,
  public.daily_metrics,
  public.baseline_snapshots,
  public.insights,
  public.coach_reports,
  public.audit_events,
  public.export_jobs,
  public.deletion_jobs
to authenticated;

grant select on table public.knowledge_sources to authenticated;

-- Trigger functions do not need direct client execution. Account deletion is
-- the sole browser-callable RPC and performs its own authenticated-user check.
create or replace function public.request_account_deletion(p_scope text default 'all')
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  requesting_user uuid := auth.uid();
  job_id uuid;
begin
  if requesting_user is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;
  if p_scope not in ('all', 'health_data', 'account') then
    raise exception using errcode = '22023', message = 'invalid_deletion_scope';
  end if;
  insert into public.deletion_jobs(user_id, scope, status)
  values (requesting_user, p_scope, 'queued')
  returning id into job_id;
  return job_id;
end;
$$;
revoke all on function public.request_account_deletion(text) from public, anon, authenticated;
grant execute on function public.request_account_deletion(text) to authenticated;

-- The service role is server-only and needs the explicit privileges that new
-- Data API configurations may otherwise omit. RLS bypass remains inherent to
-- this trusted role and is never placed in browser configuration.
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
grant execute on function public.service_resolve_ingestion_credential(text, uuid) to service_role;
grant execute on function public.service_mark_credential_used(uuid) to service_role;
grant execute on function public.service_issue_ingestion_credential(uuid, uuid, text, text, timestamptz, uuid) to service_role;
grant execute on function public.claim_fit_job(text) to service_role;
grant execute on function public.request_account_deletion(text) to service_role;

-- Storage owns its schema privileges; object access stays restricted to the
-- private bucket policies and user-id path prefix declared in the core migration.

commit;
