begin;

create extension if not exists pgcrypto with schema extensions;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  timezone text not null default 'Asia/Kolkata', locale text not null default 'en-IN',
  unit_system text not null default 'metric' check (unit_system in ('metric','imperial')),
  date_format text not null default 'DD MMM YYYY', time_format text not null default '24h',
  onboarding_completed_at timestamptz, created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  sleep_target_minutes integer check (sleep_target_minutes between 180 and 900),
  daily_step_target integer check (daily_step_target between 100 and 100000),
  coaching_tone text not null default 'supportive', maximum_daily_actions integer not null default 3 check (maximum_daily_actions between 0 and 3),
  checkins_enabled boolean not null default true, ai_narrative_enabled boolean not null default false,
  ai_notes_access_enabled boolean not null default false, raw_sample_retention_days integer not null default 90 check (raw_sample_retention_days between 1 and 3650),
  raw_fit_retention_mode text not null default 'delete_after_parse' check (raw_fit_retention_mode in ('delete_after_parse','retain_30_days','retain_until_deleted')),
  location_privacy_mode text not null default 'hidden' check (location_privacy_mode in ('hidden','redact_endpoints','visible_private')),
  theme text not null default 'system' check (theme in ('system','light','dark')), reduced_motion_override boolean,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.provider_connections (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  provider_type text not null check (provider_type in ('apple_shortcut','garmin_fit_upload','garmin_health_api','garmin_activity_api','apple_healthkit_native','manual_checkin','demo')),
  display_name text not null, status text not null default 'disconnected' check (status in ('disconnected','connected','error','revoked','disabled')),
  capabilities jsonb not null default '{}', last_successful_sync_at timestamptz, last_attempted_sync_at timestamptz,
  last_error_code text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), revoked_at timestamptz
);

create table public.devices (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  provider_connection_id uuid references public.provider_connections(id) on delete set null, device_name text not null,
  device_type text not null, manufacturer text not null, model text not null, external_device_id text,
  source_system text not null, last_successful_sync_at timestamptz, last_seen_at timestamptz,
  created_at timestamptz not null default now(), revoked_at timestamptz
);

create table private.ingestion_credentials (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  device_id uuid not null references public.devices(id) on delete cascade, token_hash text not null unique,
  token_hint text not null, scopes text[] not null default array['health:ingest'], created_at timestamptz not null default now(),
  expires_at timestamptz, last_used_at timestamptz, revoked_at timestamptz,
  rotation_parent_id uuid references private.ingestion_credentials(id) on delete set null
);

create table public.ingestion_events (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  device_id uuid references public.devices(id) on delete set null, provider_type text not null,
  request_id uuid not null, idempotency_key text not null, schema_version text not null, received_at timestamptz not null,
  exported_at timestamptz not null, window_start timestamptz not null, window_end timestamptz not null,
  sample_count integer not null check (sample_count >= 0), inserted_count integer not null default 0,
  duplicate_count integer not null default 0, rejected_count integer not null default 0, conflict_count integer not null default 0,
  status text not null check (status in ('processing','completed','partial','failed')),
  error_code text, safe_error_summary text, processing_duration_ms integer,
  created_at timestamptz not null default now(), unique(user_id, device_id, idempotency_key)
);

create table public.raw_health_samples (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  device_id uuid references public.devices(id) on delete set null,
  ingestion_event_id uuid references public.ingestion_events(id) on delete set null, metric_type text not null,
  start_at timestamptz not null, end_at timestamptz not null check (end_at >= start_at),
  numeric_value double precision, text_value text, category_value text, unit text, source_name text not null,
  source_bundle text, source_record_id text, source_hash text not null, metadata jsonb not null default '{}',
  quality_flags jsonb not null default '[]', imported_at timestamptz not null default now(), expires_at timestamptz,
  unique(user_id, source_hash)
);

create table public.sleep_sessions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  local_date date not null, timezone text not null, start_at timestamptz not null, end_at timestamptz not null check (end_at > start_at),
  in_bed_minutes integer, asleep_minutes integer, awake_minutes integer, nap boolean not null default false,
  source_name text not null, source_priority integer not null default 100, confidence numeric(4,3) check (confidence between 0 and 1),
  quality_flags jsonb not null default '[]', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.sleep_stages (
  id uuid primary key default gen_random_uuid(), sleep_session_id uuid not null references public.sleep_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  stage_type text not null check (stage_type in ('awake','core','light','deep','rem','asleep_unspecified','in_bed','unknown')),
  start_at timestamptz not null, end_at timestamptz not null check (end_at > start_at), duration_minutes integer not null check (duration_minutes >= 0),
  source_name text not null, created_at timestamptz not null default now()
);

create table public.fit_files (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  device_id uuid references public.devices(id) on delete set null, storage_object_path text not null unique,
  original_filename text not null, safe_filename text not null, byte_size bigint not null check (byte_size > 0), sha256 text not null,
  detected_file_type text not null, fit_profile_version text, crc_valid boolean, parse_status text not null default 'uploaded',
  parse_error_code text, retention_mode text not null default 'delete_after_parse', created_at timestamptz not null default now(),
  parsed_at timestamptz, deleted_at timestamptz, unique(user_id, sha256)
);

create table public.activities (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  device_id uuid references public.devices(id) on delete set null, source_type text not null, source_activity_id text,
  activity_type text not null, start_at timestamptz not null, end_at timestamptz not null check (end_at > start_at), timezone text not null,
  duration_seconds integer not null check (duration_seconds >= 0), moving_seconds integer, distance_meters double precision,
  active_energy_kcal double precision, resting_energy_kcal double precision, average_heart_rate double precision,
  maximum_heart_rate double precision, average_speed double precision, maximum_speed double precision,
  elevation_gain_meters double precision, training_load double precision, fit_file_id uuid references public.fit_files(id) on delete set null,
  source_hash text not null, metadata jsonb not null default '{}', created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(), unique(user_id, source_hash)
);

create table public.activity_laps (
  id uuid primary key default gen_random_uuid(), activity_id uuid not null references public.activities(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, lap_index integer not null check (lap_index >= 0),
  start_at timestamptz not null, end_at timestamptz not null, duration_seconds integer not null,
  distance_meters double precision, average_heart_rate double precision, maximum_heart_rate double precision,
  metadata jsonb not null default '{}', unique(activity_id, lap_index)
);

create table public.activity_records (
  id bigint generated always as identity primary key, activity_id uuid not null references public.activities(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, recorded_at timestamptz not null,
  latitude double precision check (latitude between -90 and 90), longitude double precision check (longitude between -180 and 180),
  altitude_meters double precision, heart_rate double precision, cadence double precision, speed double precision,
  power double precision, distance_meters double precision, temperature double precision, metadata jsonb not null default '{}'
);

create table public.fit_ingestion_jobs (
  id uuid primary key default gen_random_uuid(), fit_file_id uuid not null references public.fit_files(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, status text not null default 'queued' check (status in ('queued','claimed','processing','completed','failed','cancelled')),
  attempt_count integer not null default 0, claimed_at timestamptz, worker_id text, started_at timestamptz,
  completed_at timestamptz, safe_error_code text, safe_error_summary text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.daily_metrics (
  user_id uuid not null references auth.users(id) on delete cascade, local_date date not null, timezone text not null,
  day_completion_status text not null default 'partial' check (day_completion_status in ('partial','complete','missing')),
  sleep_minutes integer, in_bed_minutes integer, awake_minutes integer, deep_sleep_minutes integer, rem_sleep_minutes integer,
  core_sleep_minutes integer, nap_minutes integer, bedtime_local time, wake_time_local time, sleep_midpoint_local time,
  steps integer, active_energy_kcal double precision, resting_energy_kcal double precision,
  walking_running_distance_km double precision, workout_minutes integer, workout_count integer,
  resting_heart_rate double precision, average_heart_rate double precision, sleeping_heart_rate double precision,
  minimum_heart_rate double precision, maximum_heart_rate double precision, hrv_sdnn_ms double precision,
  body_mass_kg double precision, water_ml double precision, data_completeness_percent numeric(5,2) not null default 0 check (data_completeness_percent between 0 and 100),
  source_coverage jsonb not null default '{}', quality_flags jsonb not null default '[]', calculated_at timestamptz not null default now(),
  updated_at timestamptz not null default now(), primary key(user_id, local_date)
);

create table public.daily_checkins (
  user_id uuid not null references auth.users(id) on delete cascade, local_date date not null,
  energy_rating integer check (energy_rating between 1 and 5), mood_rating integer check (mood_rating between 1 and 5),
  anxiety_rating integer check (anxiety_rating between 1 and 5), stress_rating integer check (stress_rating between 1 and 5),
  focus_rating integer check (focus_rating between 1 and 5), perceived_sleep_quality integer check (perceived_sleep_quality between 1 and 5),
  soreness_rating integer check (soreness_rating between 1 and 5), illness_flag boolean, caffeine_value numeric check (caffeine_value >= 0),
  caffeine_unit text, notes text check (char_length(notes) <= 2000), notes_ai_access_enabled boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), primary key(user_id, local_date)
);

create table public.goals (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  goal_type text not null, target_value double precision not null, unit text not null, start_date date not null,
  end_date date, active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.experiments (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  title text not null, hypothesis text not null, intervention text not null, primary_metric text not null,
  baseline_start date not null, baseline_end date not null, experiment_start date not null, experiment_end date not null,
  status text not null default 'draft' check (status in ('draft','active','completed','cancelled')),
  confounders_notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.baseline_snapshots (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  metric_type text not null, as_of_date date not null, window_days integer not null check (window_days between 7 and 365),
  valid_day_count integer not null, maturity_status text not null, median_value double precision, mean_value double precision,
  mad_value double precision, p10 double precision, p25 double precision, p75 double precision, p90 double precision,
  trend_slope double precision, data_completeness numeric(5,2) not null, calculation_version text not null,
  created_at timestamptz not null default now(), unique(user_id, metric_type, as_of_date, window_days, calculation_version)
);

create table public.insights (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  local_date date not null, insight_type text not null, severity text not null, headline text not null, observation text not null,
  comparison text not null, interpretation text not null, recommended_action text, confidence numeric(4,3) not null,
  data_completeness numeric(5,2) not null, evidence jsonb not null default '{}', calculation_version text not null,
  dismissed_at timestamptz, created_at timestamptz not null default now()
);

create table public.coach_reports (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  report_type text not null, period_start date not null, period_end date not null, deterministic_findings jsonb not null,
  narrative_text text not null, generation_mode text not null check (generation_mode in ('deterministic','ai_assisted')),
  model_provider text, model_name text, prompt_version text, safety_flags jsonb not null default '[]',
  data_completeness numeric(5,2) not null, generated_at timestamptz not null default now()
);

create table public.knowledge_sources (
  id uuid primary key default gen_random_uuid(), title text not null, organization text not null, official_url text not null,
  topic text not null, reviewed_at date not null, valid_from date, valid_until date, summary text not null,
  active boolean not null default true
);

create table public.audit_events (
  id bigint generated always as identity primary key, user_id uuid references auth.users(id) on delete set null,
  event_type text not null, actor_type text not null, actor_id text, request_id uuid not null,
  resource_type text, resource_id text, safe_metadata jsonb not null default '{}', created_at timestamptz not null default now()
);

create table public.export_jobs (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  format text not null check (format in ('json','csv')), date_range daterange not null, status text not null,
  private_storage_path text, expires_at timestamptz, created_at timestamptz not null default now(), completed_at timestamptz
);

create table public.deletion_jobs (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  scope text not null, status text not null, requested_at timestamptz not null default now(), completed_at timestamptz, safe_error text
);

create table private.agent_access_tokens (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  token_hash text not null unique, token_hint text not null, scopes text[] not null, allowed_tools text[] not null,
  created_at timestamptz not null default now(), expires_at timestamptz not null, revoked_at timestamptz, last_used_at timestamptz
);

create index profiles_user_idx on public.profiles(user_id);
create index provider_connections_user_idx on public.provider_connections(user_id);
create index devices_user_idx on public.devices(user_id);
create index ingestion_events_user_created_idx on public.ingestion_events(user_id, created_at desc);
create index raw_health_user_metric_time_idx on public.raw_health_samples(user_id, metric_type, start_at desc);
create index raw_health_source_hash_idx on public.raw_health_samples(source_hash);
create index sleep_sessions_user_date_idx on public.sleep_sessions(user_id, local_date desc);
create index sleep_stages_user_time_idx on public.sleep_stages(user_id, start_at desc);
create index activities_user_time_idx on public.activities(user_id, start_at desc);
create index activities_source_hash_idx on public.activities(source_hash);
create index activity_laps_user_idx on public.activity_laps(user_id, activity_id);
create index activity_records_range_idx on public.activity_records(user_id, activity_id, recorded_at);
create index fit_files_user_status_idx on public.fit_files(user_id, parse_status, created_at desc) where deleted_at is null;
create index fit_jobs_claim_idx on public.fit_ingestion_jobs(status, created_at) where status = 'queued';
create index daily_metrics_user_date_idx on public.daily_metrics(user_id, local_date desc);
create index daily_checkins_user_date_idx on public.daily_checkins(user_id, local_date desc);
create index goals_user_active_idx on public.goals(user_id, active) where active;
create index experiments_user_status_idx on public.experiments(user_id, status);
create index baseline_user_metric_date_idx on public.baseline_snapshots(user_id, metric_type, as_of_date desc);
create index insights_user_date_idx on public.insights(user_id, local_date desc);
create index coach_reports_user_period_idx on public.coach_reports(user_id, period_start desc, period_end desc);
create index audit_user_date_idx on public.audit_events(user_id, created_at desc);
create index export_jobs_user_status_idx on public.export_jobs(user_id, status);
create index deletion_jobs_user_status_idx on public.deletion_jobs(user_id, status);

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'profiles','user_preferences','provider_connections','devices','ingestion_events','raw_health_samples',
    'sleep_sessions','sleep_stages','activities','activity_laps','activity_records','fit_files','fit_ingestion_jobs',
    'daily_metrics','daily_checkins','goals','experiments','baseline_snapshots','insights','coach_reports',
    'audit_events','export_jobs','deletion_jobs'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('alter table public.%I force row level security', table_name);
    execute format(
      'create policy %I on public.%I for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',
      table_name || '_owner_all', table_name
    );
  end loop;
end $$;

alter table public.knowledge_sources enable row level security;
alter table public.knowledge_sources force row level security;
create policy knowledge_active_read on public.knowledge_sources for select to authenticated using (active);

create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger preferences_updated before update on public.user_preferences for each row execute function public.set_updated_at();
create trigger provider_connections_updated before update on public.provider_connections for each row execute function public.set_updated_at();
create trigger sleep_sessions_updated before update on public.sleep_sessions for each row execute function public.set_updated_at();
create trigger activities_updated before update on public.activities for each row execute function public.set_updated_at();
create trigger fit_jobs_updated before update on public.fit_ingestion_jobs for each row execute function public.set_updated_at();
create trigger daily_metrics_updated before update on public.daily_metrics for each row execute function public.set_updated_at();
create trigger daily_checkins_updated before update on public.daily_checkins for each row execute function public.set_updated_at();
create trigger goals_updated before update on public.goals for each row execute function public.set_updated_at();
create trigger experiments_updated before update on public.experiments for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fit-private', 'fit-private', false, 26214400, array['application/octet-stream'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;

create policy fit_storage_owner_read on storage.objects for select to authenticated
using (bucket_id = 'fit-private' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy fit_storage_owner_insert on storage.objects for insert to authenticated
with check (bucket_id = 'fit-private' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy fit_storage_owner_delete on storage.objects for delete to authenticated
using (bucket_id = 'fit-private' and (storage.foldername(name))[1] = (select auth.uid())::text);

revoke all on all tables in schema private from public, anon, authenticated;
revoke all on all sequences in schema private from public, anon, authenticated;

commit;
