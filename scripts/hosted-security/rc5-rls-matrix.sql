-- RC5 hosted-only synthetic authorization matrix (not a pgTAP test file).
-- Run against the selected hosted project through one database session.
-- The enclosing transaction rolls back every identity, row, and helper.

begin;

create temporary table rc5_results (
  category text not null,
  test_name text not null,
  passed boolean not null,
  details text not null
);

create or replace function pg_temp.rc5_record(
  p_category text,
  p_test_name text,
  p_passed boolean,
  p_details text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into pg_temp.rc5_results(category, test_name, passed, details)
  values (p_category, p_test_name, p_passed, p_details);
end;
$$;

create or replace function pg_temp.rc5_try(p_sql text)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  affected_rows bigint;
begin
  execute p_sql;
  get diagnostics affected_rows = row_count;
  return pg_catalog.jsonb_build_object(
    'accepted', true,
    'rows', affected_rows
  );
exception when others then
  return pg_catalog.jsonb_build_object(
    'accepted', false,
    'sqlstate', sqlstate,
    'error', sqlerrm
  );
end;
$$;

create or replace function pg_temp.rc5_record_try(
  p_category text,
  p_test_name text,
  p_sql text,
  p_expected_accepted boolean,
  p_expected_rows bigint default null,
  p_expected_sqlstate text default null
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  outcome jsonb := pg_temp.rc5_try(p_sql);
  actual_accepted boolean := (outcome ->> 'accepted')::boolean;
  actual_rows bigint := nullif(outcome ->> 'rows', '')::bigint;
  actual_sqlstate text := outcome ->> 'sqlstate';
  passed boolean;
begin
  passed := actual_accepted = p_expected_accepted
    and (p_expected_rows is null or actual_rows = p_expected_rows)
    and (p_expected_sqlstate is null or actual_sqlstate = p_expected_sqlstate);

  perform pg_temp.rc5_record(
    p_category,
    p_test_name,
    passed,
    outcome::text
  );
end;
$$;

create or replace function pg_temp.rc5_record_owned_select(
  p_actor text,
  p_table text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  visible_rows bigint;
begin
  execute pg_catalog.format('select count(*) from public.%I', p_table)
    into visible_rows;
  perform pg_temp.rc5_record(
    p_actor || '_SELECT',
    p_actor || ' sees only own row in public.' || p_table,
    visible_rows = 1,
    'visible_rows=' || visible_rows::text
  );
end;
$$;

insert into auth.users(id, email) values
  ('00000000-0000-0000-0000-00000000c50a', 'hosted-rc5-a@example.invalid'),
  ('00000000-0000-0000-0000-00000000c50b', 'hosted-rc5-b@example.invalid');

insert into public.profiles(user_id, display_name) values
  ('00000000-0000-0000-0000-00000000c50a', 'Hosted Synthetic A'),
  ('00000000-0000-0000-0000-00000000c50b', 'Hosted Synthetic B');

insert into public.user_preferences(user_id) values
  ('00000000-0000-0000-0000-00000000c50a'),
  ('00000000-0000-0000-0000-00000000c50b');

insert into public.provider_connections(
  id, user_id, provider_type, display_name, status
) values
  ('10000000-0000-0000-0000-00000000c50a', '00000000-0000-0000-0000-00000000c50a', 'apple_shortcut', 'Hosted Provider A', 'connected'),
  ('10000000-0000-0000-0000-00000000c50b', '00000000-0000-0000-0000-00000000c50b', 'apple_shortcut', 'Hosted Provider B', 'connected');

insert into public.devices(
  id, user_id, provider_connection_id, device_name, device_type,
  manufacturer, model, source_system
) values
  ('20000000-0000-0000-0000-00000000c50a', '00000000-0000-0000-0000-00000000c50a', '10000000-0000-0000-0000-00000000c50a', 'Hosted Device A', 'phone', 'Synthetic', 'A', 'apple_shortcut'),
  ('20000000-0000-0000-0000-00000000c50b', '00000000-0000-0000-0000-00000000c50b', '10000000-0000-0000-0000-00000000c50b', 'Hosted Device B', 'phone', 'Synthetic', 'B', 'apple_shortcut');

insert into public.ingestion_events(
  id, user_id, device_id, provider_type, request_id, idempotency_key,
  schema_version, received_at, exported_at, window_start, window_end,
  sample_count, inserted_count, status
) values
  ('30000000-0000-0000-0000-00000000c50a', '00000000-0000-0000-0000-00000000c50a', '20000000-0000-0000-0000-00000000c50a', 'apple_shortcut', '31000000-0000-0000-0000-00000000c50a', 'hosted-a', '1', '2026-08-29 12:00:00+00', '2026-08-29 11:59:00+00', '2026-08-29 00:00:00+00', '2026-08-29 11:59:00+00', 1, 1, 'completed'),
  ('30000000-0000-0000-0000-00000000c50b', '00000000-0000-0000-0000-00000000c50b', '20000000-0000-0000-0000-00000000c50b', 'apple_shortcut', '31000000-0000-0000-0000-00000000c50b', 'hosted-b', '1', '2026-08-29 12:00:00+00', '2026-08-29 11:59:00+00', '2026-08-29 00:00:00+00', '2026-08-29 11:59:00+00', 1, 1, 'completed');

insert into public.raw_health_samples(
  id, user_id, device_id, ingestion_event_id, metric_type, start_at, end_at,
  numeric_value, unit, source_name, source_bundle, source_record_id, source_hash
) values
  ('40000000-0000-0000-0000-00000000c50a', '00000000-0000-0000-0000-00000000c50a', '20000000-0000-0000-0000-00000000c50a', '30000000-0000-0000-0000-00000000c50a', 'steps', '2026-08-29 00:00:00+00', '2026-08-29 01:00:00+00', 100, 'count', 'Synthetic Garmin A', 'com.synthetic.garmin', 'sample-a', 'hosted-source-hash-a'),
  ('40000000-0000-0000-0000-00000000c50b', '00000000-0000-0000-0000-00000000c50b', '20000000-0000-0000-0000-00000000c50b', '30000000-0000-0000-0000-00000000c50b', 'steps', '2026-08-29 00:00:00+00', '2026-08-29 01:00:00+00', 200, 'count', 'Synthetic Garmin B', 'com.synthetic.garmin', 'sample-b', 'hosted-source-hash-b');

insert into public.sleep_sessions(
  id, user_id, local_date, timezone, start_at, end_at, asleep_minutes,
  source_name, source_priority, confidence
) values
  ('50000000-0000-0000-0000-00000000c50a', '00000000-0000-0000-0000-00000000c50a', '2026-08-29', 'Asia/Kolkata', '2026-08-28 17:00:00+00', '2026-08-29 01:00:00+00', 420, 'Synthetic Garmin A', 10, 0.900),
  ('50000000-0000-0000-0000-00000000c50b', '00000000-0000-0000-0000-00000000c50b', '2026-08-29', 'Asia/Kolkata', '2026-08-28 17:00:00+00', '2026-08-29 01:00:00+00', 400, 'Synthetic Garmin B', 10, 0.900);

insert into public.sleep_stages(
  id, sleep_session_id, user_id, stage_type, start_at, end_at,
  duration_minutes, source_name
) values
  ('51000000-0000-0000-0000-00000000c50a', '50000000-0000-0000-0000-00000000c50a', '00000000-0000-0000-0000-00000000c50a', 'deep', '2026-08-28 17:00:00+00', '2026-08-28 18:00:00+00', 60, 'Synthetic Garmin A'),
  ('51000000-0000-0000-0000-00000000c50b', '50000000-0000-0000-0000-00000000c50b', '00000000-0000-0000-0000-00000000c50b', 'deep', '2026-08-28 17:00:00+00', '2026-08-28 18:00:00+00', 60, 'Synthetic Garmin B');

insert into public.fit_files(
  id, user_id, device_id, storage_object_path, original_filename,
  safe_filename, byte_size, sha256, detected_file_type
) values
  ('60000000-0000-0000-0000-00000000c50a', '00000000-0000-0000-0000-00000000c50a', '20000000-0000-0000-0000-00000000c50a', '00000000-0000-0000-0000-00000000c50a/synthetic-a.fit', 'synthetic-a.fit', 'synthetic-a.fit', 16, repeat('a', 64), 'fit'),
  ('60000000-0000-0000-0000-00000000c50b', '00000000-0000-0000-0000-00000000c50b', '20000000-0000-0000-0000-00000000c50b', '00000000-0000-0000-0000-00000000c50b/synthetic-b.fit', 'synthetic-b.fit', 'synthetic-b.fit', 16, repeat('b', 64), 'fit');

insert into public.activities(
  id, user_id, device_id, source_type, source_activity_id, activity_type,
  start_at, end_at, timezone, duration_seconds, source_hash
) values
  ('70000000-0000-0000-0000-00000000c50a', '00000000-0000-0000-0000-00000000c50a', '20000000-0000-0000-0000-00000000c50a', 'garmin_fit', 'activity-a', 'walk', '2026-08-29 02:00:00+00', '2026-08-29 02:30:00+00', 'Asia/Kolkata', 1800, 'hosted-activity-a'),
  ('70000000-0000-0000-0000-00000000c50b', '00000000-0000-0000-0000-00000000c50b', '20000000-0000-0000-0000-00000000c50b', 'garmin_fit', 'activity-b', 'walk', '2026-08-29 02:00:00+00', '2026-08-29 02:30:00+00', 'Asia/Kolkata', 1800, 'hosted-activity-b');

insert into public.activity_laps(
  id, activity_id, user_id, lap_index, start_at, end_at, duration_seconds
) values
  ('71000000-0000-0000-0000-00000000c50a', '70000000-0000-0000-0000-00000000c50a', '00000000-0000-0000-0000-00000000c50a', 0, '2026-08-29 02:00:00+00', '2026-08-29 02:30:00+00', 1800),
  ('71000000-0000-0000-0000-00000000c50b', '70000000-0000-0000-0000-00000000c50b', '00000000-0000-0000-0000-00000000c50b', 0, '2026-08-29 02:00:00+00', '2026-08-29 02:30:00+00', 1800);

insert into public.activity_records(activity_id, user_id, recorded_at, heart_rate) values
  ('70000000-0000-0000-0000-00000000c50a', '00000000-0000-0000-0000-00000000c50a', '2026-08-29 02:15:00+00', 100),
  ('70000000-0000-0000-0000-00000000c50b', '00000000-0000-0000-0000-00000000c50b', '2026-08-29 02:15:00+00', 110);

insert into public.fit_ingestion_jobs(id, fit_file_id, user_id) values
  ('72000000-0000-0000-0000-00000000c50a', '60000000-0000-0000-0000-00000000c50a', '00000000-0000-0000-0000-00000000c50a'),
  ('72000000-0000-0000-0000-00000000c50b', '60000000-0000-0000-0000-00000000c50b', '00000000-0000-0000-0000-00000000c50b');

insert into public.daily_metrics(user_id, local_date, timezone, steps) values
  ('00000000-0000-0000-0000-00000000c50a', '2026-08-29', 'Asia/Kolkata', 100),
  ('00000000-0000-0000-0000-00000000c50b', '2026-08-29', 'Asia/Kolkata', 200);

insert into public.daily_checkins(user_id, local_date, mood_rating) values
  ('00000000-0000-0000-0000-00000000c50a', '2026-08-29', 3),
  ('00000000-0000-0000-0000-00000000c50b', '2026-08-29', 4);

insert into public.goals(id, user_id, goal_type, target_value, unit, start_date) values
  ('80000000-0000-0000-0000-00000000c50a', '00000000-0000-0000-0000-00000000c50a', 'steps', 100, 'count', '2026-08-29'),
  ('80000000-0000-0000-0000-00000000c50b', '00000000-0000-0000-0000-00000000c50b', 'steps', 200, 'count', '2026-08-29');

insert into public.experiments(
  id, user_id, title, hypothesis, intervention, primary_metric,
  baseline_start, baseline_end, experiment_start, experiment_end
) values
  ('81000000-0000-0000-0000-00000000c50a', '00000000-0000-0000-0000-00000000c50a', 'Synthetic A', 'Synthetic', 'Synthetic', 'steps', '2026-08-01', '2026-08-07', '2026-08-08', '2026-08-14'),
  ('81000000-0000-0000-0000-00000000c50b', '00000000-0000-0000-0000-00000000c50b', 'Synthetic B', 'Synthetic', 'Synthetic', 'steps', '2026-08-01', '2026-08-07', '2026-08-08', '2026-08-14');

insert into public.baseline_snapshots(
  id, user_id, metric_type, as_of_date, window_days, valid_day_count,
  maturity_status, median_value, data_completeness, calculation_version
) values
  ('82000000-0000-0000-0000-00000000c50a', '00000000-0000-0000-0000-00000000c50a', 'steps', '2026-08-29', 28, 1, 'immature', 100, 10, 'rc5-test'),
  ('82000000-0000-0000-0000-00000000c50b', '00000000-0000-0000-0000-00000000c50b', 'steps', '2026-08-29', 28, 1, 'immature', 200, 10, 'rc5-test');

insert into public.insights(
  id, user_id, local_date, insight_type, severity, headline, observation,
  comparison, interpretation, confidence, data_completeness,
  calculation_version
) values
  ('83000000-0000-0000-0000-00000000c50a', '00000000-0000-0000-0000-00000000c50a', '2026-08-29', 'synthetic', 'info', 'Synthetic A', 'Synthetic', 'Synthetic', 'Synthetic', 0.500, 10, 'rc5-test'),
  ('83000000-0000-0000-0000-00000000c50b', '00000000-0000-0000-0000-00000000c50b', '2026-08-29', 'synthetic', 'info', 'Synthetic B', 'Synthetic', 'Synthetic', 'Synthetic', 0.500, 10, 'rc5-test');

insert into public.coach_reports(
  id, user_id, report_type, period_start, period_end,
  deterministic_findings, narrative_text, generation_mode, data_completeness
) values
  ('84000000-0000-0000-0000-00000000c50a', '00000000-0000-0000-0000-00000000c50a', 'daily', '2026-08-29', '2026-08-29', '[]', 'Synthetic A', 'deterministic', 10),
  ('84000000-0000-0000-0000-00000000c50b', '00000000-0000-0000-0000-00000000c50b', 'daily', '2026-08-29', '2026-08-29', '[]', 'Synthetic B', 'deterministic', 10);

insert into public.knowledge_sources(
  id, title, organization, official_url, topic, reviewed_at, summary
) values (
  '85000000-0000-0000-0000-00000000c500', 'Synthetic Guidance',
  'Synthetic', 'https://example.invalid', 'testing', '2026-08-29',
  'Synthetic fixture only.'
);

insert into public.audit_events(user_id, event_type, actor_type, request_id) values
  ('00000000-0000-0000-0000-00000000c50a', 'synthetic', 'test', '86000000-0000-0000-0000-00000000c50a'),
  ('00000000-0000-0000-0000-00000000c50b', 'synthetic', 'test', '86000000-0000-0000-0000-00000000c50b');

insert into public.export_jobs(id, user_id, format, date_range, status) values
  ('87000000-0000-0000-0000-00000000c50a', '00000000-0000-0000-0000-00000000c50a', 'json', daterange('2026-08-01', '2026-08-29', '[]'), 'queued'),
  ('87000000-0000-0000-0000-00000000c50b', '00000000-0000-0000-0000-00000000c50b', 'json', daterange('2026-08-01', '2026-08-29', '[]'), 'queued');

insert into public.deletion_jobs(id, user_id, scope, status) values
  ('88000000-0000-0000-0000-00000000c50a', '00000000-0000-0000-0000-00000000c50a', 'health_data', 'queued'),
  ('88000000-0000-0000-0000-00000000c50b', '00000000-0000-0000-0000-00000000c50b', 'health_data', 'queued');

insert into storage.objects(bucket_id, name, owner_id) values
  ('fit-private', '00000000-0000-0000-0000-00000000c50a/seed.fit', '00000000-0000-0000-0000-00000000c50a'),
  ('fit-private', '00000000-0000-0000-0000-00000000c50b/seed.fit', '00000000-0000-0000-0000-00000000c50b');

-- Test User A.
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-00000000c50a","role":"authenticated"}',
  true
);

select pg_temp.rc5_record_owned_select('A', table_name)
from unnest(array[
  'profiles', 'user_preferences', 'provider_connections', 'devices',
  'ingestion_events', 'raw_health_samples', 'sleep_sessions', 'sleep_stages',
  'activities', 'activity_laps', 'activity_records', 'fit_files',
  'fit_ingestion_jobs', 'daily_metrics', 'daily_checkins', 'goals',
  'experiments', 'baseline_snapshots', 'insights', 'coach_reports',
  'audit_events', 'export_jobs', 'deletion_jobs'
]) as table_name;

select pg_temp.rc5_record_try(
  'A_CROSS_WRITE', 'A cannot update B row in public.' || table_name,
  pg_catalog.format(
    'update public.%I set user_id = user_id where user_id = %L',
    table_name, '00000000-0000-0000-0000-00000000c50b'
  ),
  true, 0, null
)
from unnest(array[
  'profiles', 'user_preferences', 'provider_connections', 'devices',
  'daily_checkins', 'goals', 'experiments'
]) as table_name;

select pg_temp.rc5_record_try(
  'A_CROSS_WRITE', 'A cannot delete B row in public.' || table_name,
  pg_catalog.format(
    'delete from public.%I where user_id = %L',
    table_name, '00000000-0000-0000-0000-00000000c50b'
  ),
  true, 0, null
)
from unnest(array[
  'profiles', 'user_preferences', 'provider_connections', 'devices',
  'daily_checkins', 'goals', 'experiments'
]) as table_name;

select pg_temp.rc5_record_try('A_CROSS_WRITE', 'A cannot insert B profile',
  $$insert into public.profiles(user_id, display_name) values ('00000000-0000-0000-0000-00000000c50b', 'Forged')$$,
  false, null, '42501');
select pg_temp.rc5_record_try('A_CROSS_WRITE', 'A cannot insert B preferences',
  $$insert into public.user_preferences(user_id) values ('00000000-0000-0000-0000-00000000c50b')$$,
  false, null, '42501');
select pg_temp.rc5_record_try('A_CROSS_WRITE', 'A cannot insert B provider connection',
  $$insert into public.provider_connections(user_id, provider_type, display_name) values ('00000000-0000-0000-0000-00000000c50b', 'apple_shortcut', 'Forged')$$,
  false, null, '42501');
select pg_temp.rc5_record_try('A_CROSS_WRITE', 'A cannot insert B device',
  $$insert into public.devices(user_id, device_name, device_type, manufacturer, model, source_system) values ('00000000-0000-0000-0000-00000000c50b', 'Forged', 'phone', 'Synthetic', 'Forged', 'apple_shortcut')$$,
  false, null, '42501');
select pg_temp.rc5_record_try('A_CROSS_WRITE', 'A cannot insert B check-in',
  $$insert into public.daily_checkins(user_id, local_date) values ('00000000-0000-0000-0000-00000000c50b', '2026-08-30')$$,
  false, null, '42501');
select pg_temp.rc5_record_try('A_CROSS_WRITE', 'A cannot insert B goal',
  $$insert into public.goals(user_id, goal_type, target_value, unit, start_date) values ('00000000-0000-0000-0000-00000000c50b', 'steps', 1, 'count', '2026-08-30')$$,
  false, null, '42501');
select pg_temp.rc5_record_try('A_CROSS_WRITE', 'A cannot insert B experiment',
  $$insert into public.experiments(user_id, title, hypothesis, intervention, primary_metric, baseline_start, baseline_end, experiment_start, experiment_end) values ('00000000-0000-0000-0000-00000000c50b', 'Forged', 'Forged', 'Forged', 'steps', '2026-08-01', '2026-08-02', '2026-08-03', '2026-08-04')$$,
  false, null, '42501');

select pg_temp.rc5_record(
  'STORAGE', 'A sees one own private Storage object',
  (select count(*) from storage.objects) = 1,
  'actor=A'
);
select pg_temp.rc5_record_try('STORAGE', 'A can insert matching own Storage object',
  $$insert into storage.objects(bucket_id, name, owner_id) values ('fit-private', '00000000-0000-0000-0000-00000000c50a/own.fit', '00000000-0000-0000-0000-00000000c50a')$$,
  true, 1, null);
select pg_temp.rc5_record_try('STORAGE', 'A cannot forge B Storage owner under A path',
  $$insert into storage.objects(bucket_id, name, owner_id) values ('fit-private', '00000000-0000-0000-0000-00000000c50a/forged-owner.fit', '00000000-0000-0000-0000-00000000c50b')$$,
  false, null, '42501');
select pg_temp.rc5_record_try('STORAGE', 'A cannot insert below guessed B path',
  $$insert into storage.objects(bucket_id, name, owner_id) values ('fit-private', '00000000-0000-0000-0000-00000000c50b/guessed.fit', '00000000-0000-0000-0000-00000000c50a')$$,
  false, null, '42501');
select pg_temp.rc5_record_try('STORAGE', 'Direct table deletion cannot bypass Storage API for B object',
  $$delete from storage.objects where name = '00000000-0000-0000-0000-00000000c50b/seed.fit'$$,
  false, null, '42501');
select pg_temp.rc5_record_try('STORAGE', 'Direct table deletion cannot bypass Storage API for A object',
  $$delete from storage.objects where name = '00000000-0000-0000-0000-00000000c50a/own.fit'$$,
  false, null, '42501');

select pg_temp.rc5_record_try('RPC', 'A may request own health-data deletion',
  $$select public.request_account_deletion('health_data')$$,
  true, 1, null);
select pg_temp.rc5_record(
  'RPC', 'A deletion RPC records only A ownership',
  (select count(*) from public.deletion_jobs) = 2,
  'actor=A'
);
select pg_temp.rc5_record_try('RPC', 'A deletion RPC rejects injected scope',
  $$select public.request_account_deletion('health_data''; select current_user; --')$$,
  false, null, '22023');

-- Test User B with the same row and write isolation matrix.
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-00000000c50b","role":"authenticated"}',
  true
);

select pg_temp.rc5_record_owned_select('B', table_name)
from unnest(array[
  'profiles', 'user_preferences', 'provider_connections', 'devices',
  'ingestion_events', 'raw_health_samples', 'sleep_sessions', 'sleep_stages',
  'activities', 'activity_laps', 'activity_records', 'fit_files',
  'fit_ingestion_jobs', 'daily_metrics', 'daily_checkins', 'goals',
  'experiments', 'baseline_snapshots', 'insights', 'coach_reports',
  'audit_events', 'export_jobs', 'deletion_jobs'
]) as table_name;

select pg_temp.rc5_record_try(
  'B_CROSS_WRITE', 'B cannot update A row in public.' || table_name,
  pg_catalog.format(
    'update public.%I set user_id = user_id where user_id = %L',
    table_name, '00000000-0000-0000-0000-00000000c50a'
  ),
  true, 0, null
)
from unnest(array[
  'profiles', 'user_preferences', 'provider_connections', 'devices',
  'daily_checkins', 'goals', 'experiments'
]) as table_name;

select pg_temp.rc5_record_try(
  'B_CROSS_WRITE', 'B cannot delete A row in public.' || table_name,
  pg_catalog.format(
    'delete from public.%I where user_id = %L',
    table_name, '00000000-0000-0000-0000-00000000c50a'
  ),
  true, 0, null
)
from unnest(array[
  'profiles', 'user_preferences', 'provider_connections', 'devices',
  'daily_checkins', 'goals', 'experiments'
]) as table_name;

select pg_temp.rc5_record_try('B_CROSS_WRITE', 'B cannot insert A profile',
  $$insert into public.profiles(user_id, display_name) values ('00000000-0000-0000-0000-00000000c50a', 'Forged')$$,
  false, null, '42501');
select pg_temp.rc5_record_try('B_CROSS_WRITE', 'B cannot insert A preferences',
  $$insert into public.user_preferences(user_id) values ('00000000-0000-0000-0000-00000000c50a')$$,
  false, null, '42501');
select pg_temp.rc5_record_try('B_CROSS_WRITE', 'B cannot insert A provider connection',
  $$insert into public.provider_connections(user_id, provider_type, display_name) values ('00000000-0000-0000-0000-00000000c50a', 'apple_shortcut', 'Forged')$$,
  false, null, '42501');
select pg_temp.rc5_record_try('B_CROSS_WRITE', 'B cannot insert A device',
  $$insert into public.devices(user_id, device_name, device_type, manufacturer, model, source_system) values ('00000000-0000-0000-0000-00000000c50a', 'Forged', 'phone', 'Synthetic', 'Forged', 'apple_shortcut')$$,
  false, null, '42501');
select pg_temp.rc5_record_try('B_CROSS_WRITE', 'B cannot insert A check-in',
  $$insert into public.daily_checkins(user_id, local_date) values ('00000000-0000-0000-0000-00000000c50a', '2026-08-30')$$,
  false, null, '42501');
select pg_temp.rc5_record_try('B_CROSS_WRITE', 'B cannot insert A goal',
  $$insert into public.goals(user_id, goal_type, target_value, unit, start_date) values ('00000000-0000-0000-0000-00000000c50a', 'steps', 1, 'count', '2026-08-30')$$,
  false, null, '42501');
select pg_temp.rc5_record_try('B_CROSS_WRITE', 'B cannot insert A experiment',
  $$insert into public.experiments(user_id, title, hypothesis, intervention, primary_metric, baseline_start, baseline_end, experiment_start, experiment_end) values ('00000000-0000-0000-0000-00000000c50a', 'Forged', 'Forged', 'Forged', 'steps', '2026-08-01', '2026-08-02', '2026-08-03', '2026-08-04')$$,
  false, null, '42501');

select pg_temp.rc5_record(
  'STORAGE', 'B sees one own private Storage object',
  (select count(*) from storage.objects) = 1,
  'actor=B'
);
select pg_temp.rc5_record_try('STORAGE', 'B cannot forge A Storage owner under B path',
  $$insert into storage.objects(bucket_id, name, owner_id) values ('fit-private', '00000000-0000-0000-0000-00000000c50b/forged-owner.fit', '00000000-0000-0000-0000-00000000c50a')$$,
  false, null, '42501');
select pg_temp.rc5_record_try('STORAGE', 'B cannot insert below guessed A path',
  $$insert into storage.objects(bucket_id, name, owner_id) values ('fit-private', '00000000-0000-0000-0000-00000000c50a/guessed.fit', '00000000-0000-0000-0000-00000000c50b')$$,
  false, null, '42501');
select pg_temp.rc5_record_try('STORAGE', 'Direct table deletion cannot bypass Storage API for A seed object',
  $$delete from storage.objects where name = '00000000-0000-0000-0000-00000000c50a/seed.fit'$$,
  false, null, '42501');

-- Anonymous access.
reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

select pg_temp.rc5_record_try('ANON', 'Anonymous cannot read profiles',
  $$select * from public.profiles$$, false, null, '42501');
select pg_temp.rc5_record_try('ANON', 'Anonymous cannot read raw health samples',
  $$select * from public.raw_health_samples$$, false, null, '42501');
select pg_temp.rc5_record_try('ANON', 'Anonymous cannot write check-ins',
  $$insert into public.daily_checkins(user_id, local_date) values ('00000000-0000-0000-0000-00000000c50a', '2026-08-31')$$,
  false, null, '42501');
select pg_temp.rc5_record_try('ANON', 'Anonymous cannot create devices',
  $$insert into public.devices(user_id, device_name, device_type, manufacturer, model, source_system) values ('00000000-0000-0000-0000-00000000c50a', 'Anon', 'phone', 'Synthetic', 'Anon', 'apple_shortcut')$$,
  false, null, '42501');
select pg_temp.rc5_record_try('ANON', 'Anonymous cannot read exports',
  $$select * from public.export_jobs$$, false, null, '42501');
select pg_temp.rc5_record_try('ANON', 'Anonymous cannot create exports',
  $$insert into public.export_jobs(user_id, format, date_range, status) values ('00000000-0000-0000-0000-00000000c50a', 'json', daterange('2026-08-01', '2026-08-02', '[]'), 'queued')$$,
  false, null, '42501');
select pg_temp.rc5_record_try('ANON', 'Anonymous cannot claim FIT jobs',
  $$select public.claim_fit_job('anonymous')$$, false, null, '42501');
select pg_temp.rc5_record_try('ANON', 'Anonymous cannot request reports through private job actions',
  $$select public.request_account_deletion('health_data')$$, false, null, '42501');
select pg_temp.rc5_record_try('ANON', 'Anonymous cannot issue device credentials',
  $$select public.service_issue_ingestion_credential('00000000-0000-0000-0000-00000000c50a', '20000000-0000-0000-0000-00000000c50a', 'x', 'x', null, null)$$,
  false, null, '42501');
select pg_temp.rc5_record_try('ANON', 'Anonymous cannot read private credentials',
  $$select * from private.ingestion_credentials$$, false, null, '42501');
select pg_temp.rc5_record(
  'ANON', 'Anonymous sees no private Storage rows',
  (select count(*) from storage.objects) = 0,
  'visible_rows=0'
);
select pg_temp.rc5_record_try('ANON', 'Anonymous cannot upload private Storage object',
  $$insert into storage.objects(bucket_id, name, owner_id) values ('fit-private', 'anonymous/anon.fit', null)$$,
  false, null, '42501');
select pg_temp.rc5_record_try('ANON', 'Anonymous cannot read knowledge sources',
  $$select * from public.knowledge_sources$$, false, null, '42501');

-- Static privilege, RLS, function, and view audit.
reset role;

select pg_temp.rc5_record(
  'DERIVED_PRIVILEGE',
  'Authenticated cannot ' || operation || ' public.' || table_name,
  not has_table_privilege('authenticated', 'public.' || table_name, operation),
  'role=authenticated'
)
from unnest(array[
  'ingestion_events', 'raw_health_samples', 'sleep_sessions', 'sleep_stages',
  'activities', 'activity_laps', 'activity_records', 'fit_files',
  'fit_ingestion_jobs', 'daily_metrics', 'baseline_snapshots', 'insights',
  'coach_reports', 'audit_events', 'export_jobs', 'deletion_jobs'
]) as table_name
cross join unnest(array['INSERT', 'UPDATE', 'DELETE']) as operation;

select pg_temp.rc5_record(
  'RLS_CONFIG', 'Every exposed owner table has RLS and FORCE RLS',
  count(*) = 23,
  'verified_tables=' || count(*)::text
)
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname = any(array[
    'profiles', 'user_preferences', 'provider_connections', 'devices',
    'ingestion_events', 'raw_health_samples', 'sleep_sessions', 'sleep_stages',
    'activities', 'activity_laps', 'activity_records', 'fit_files',
    'fit_ingestion_jobs', 'daily_metrics', 'daily_checkins', 'goals',
    'experiments', 'baseline_snapshots', 'insights', 'coach_reports',
    'audit_events', 'export_jobs', 'deletion_jobs'
  ])
  and c.relrowsecurity
  and c.relforcerowsecurity;

select pg_temp.rc5_record(
  'RLS_CONFIG', 'Every exposed owner table has an authenticated owner policy',
  count(distinct tablename) = 23,
  'policy_tables=' || count(distinct tablename)::text
)
from pg_policies
where schemaname = 'public'
  and 'authenticated' = any(roles)
  and tablename = any(array[
    'profiles', 'user_preferences', 'provider_connections', 'devices',
    'ingestion_events', 'raw_health_samples', 'sleep_sessions', 'sleep_stages',
    'activities', 'activity_laps', 'activity_records', 'fit_files',
    'fit_ingestion_jobs', 'daily_metrics', 'daily_checkins', 'goals',
    'experiments', 'baseline_snapshots', 'insights', 'coach_reports',
    'audit_events', 'export_jobs', 'deletion_jobs'
  ]);

select pg_temp.rc5_record(
  'RLS_CONFIG', 'FIT bucket is private',
  exists(select 1 from storage.buckets where id = 'fit-private' and public = false),
  'bucket=fit-private'
);

select pg_temp.rc5_record(
  'RLS_CONFIG', 'Device provider relationship includes user ownership',
  exists(
    select 1 from pg_constraint
    where conname = 'devices_provider_connection_owner_fkey'
      and contype = 'f'
  ),
  'constraint=devices_provider_connection_owner_fkey'
);

select pg_temp.rc5_record(
  'RLS_CONFIG', 'All three FIT Storage policies require recorded owner',
  count(*) = 3,
  'owner_bound_policies=' || count(*)::text
)
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname like 'fit_storage_owner_%'
  and (coalesce(qual, '') || coalesce(with_check, '')) like '%owner_id%';

select pg_temp.rc5_record(
  'FUNCTION_AUDIT', 'Every application SECURITY DEFINER function pins an empty search_path',
  count(*) filter (
    where p.prosecdef
      and not ('search_path=""' = any(coalesce(p.proconfig, array[]::text[])))
  ) = 0,
  'security_definer_functions=' || count(*) filter (where p.prosecdef)::text
)
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname in ('public', 'private');

select pg_temp.rc5_record(
  'FUNCTION_AUDIT', 'Application SECURITY DEFINER functions contain no dynamic EXECUTE',
  count(*) = 0,
  'dynamic_execute_functions=' || count(*)::text
)
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname in ('public', 'private')
  and p.prosecdef
  and pg_get_functiondef(p.oid) ~* '\mexecute\M';

select pg_temp.rc5_record(
  'FUNCTION_AUDIT', 'Deletion RPC validates auth.uid and allowlisted scope',
  pg_get_functiondef('public.request_account_deletion(text)'::regprocedure) like '%auth.uid()%'
    and pg_get_functiondef('public.request_account_deletion(text)'::regprocedure) like '%health_data%'
    and pg_get_functiondef('public.request_account_deletion(text)'::regprocedure) like '%invalid_deletion_scope%',
  'function=request_account_deletion'
);

select pg_temp.rc5_record(
  'FUNCTION_AUDIT', 'Credential issue RPC validates both device and user ownership',
  pg_get_functiondef('public.service_issue_ingestion_credential(uuid,uuid,text,text,timestamp with time zone,uuid)'::regprocedure) like '%d.id = p_device_id%'
    and pg_get_functiondef('public.service_issue_ingestion_credential(uuid,uuid,text,text,timestamp with time zone,uuid)'::regprocedure) like '%d.user_id = p_user_id%',
  'function=service_issue_ingestion_credential'
);

select pg_temp.rc5_record(
  'FUNCTION_AUDIT', 'Authenticated cannot execute service credential resolver',
  not has_function_privilege('authenticated', 'public.service_resolve_ingestion_credential(text,uuid)', 'EXECUTE'),
  'role=authenticated'
);
select pg_temp.rc5_record(
  'FUNCTION_AUDIT', 'Authenticated cannot execute service credential issuer',
  not has_function_privilege('authenticated', 'public.service_issue_ingestion_credential(uuid,uuid,text,text,timestamp with time zone,uuid)', 'EXECUTE'),
  'role=authenticated'
);
select pg_temp.rc5_record(
  'FUNCTION_AUDIT', 'Authenticated cannot execute FIT job claimer',
  not has_function_privilege('authenticated', 'public.claim_fit_job(text)', 'EXECUTE'),
  'role=authenticated'
);
select pg_temp.rc5_record(
  'FUNCTION_AUDIT', 'Authenticated cannot execute private credential resolver',
  not has_function_privilege('authenticated', 'private.resolve_ingestion_credential(text,uuid)', 'EXECUTE'),
  'role=authenticated'
);
select pg_temp.rc5_record(
  'FUNCTION_AUDIT', 'Authenticated has no private schema usage',
  not has_schema_privilege('authenticated', 'private', 'USAGE'),
  'role=authenticated'
);
select pg_temp.rc5_record(
  'FUNCTION_AUDIT', 'Anonymous has no private schema usage',
  not has_schema_privilege('anon', 'private', 'USAGE'),
  'role=anon'
);
select pg_temp.rc5_record(
  'FUNCTION_AUDIT', 'Only authenticated and service roles can execute deletion RPC',
  has_function_privilege('authenticated', 'public.request_account_deletion(text)', 'EXECUTE')
    and has_function_privilege('service_role', 'public.request_account_deletion(text)', 'EXECUTE')
    and not has_function_privilege('anon', 'public.request_account_deletion(text)', 'EXECUTE'),
  'function=request_account_deletion'
);

select pg_temp.rc5_record(
  'VIEW_AUDIT', 'No public views expose health tables',
  count(*) = 0,
  'public_views=' || count(*)::text
)
from pg_views
where schemaname = 'public';

select
  count(*) as total,
  count(*) filter (where passed) as passed,
  count(*) filter (where not passed) as failed,
  (
    select jsonb_object_agg(category, category_count order by category)
    from (
      select category, count(*) as category_count
      from pg_temp.rc5_results
      group by category
    ) grouped
  ) as category_counts,
  coalesce(
    jsonb_agg(
      jsonb_build_object(
        'category', category,
        'test', test_name,
        'details', details
      ) order by category, test_name
    ) filter (where not passed),
    '[]'::jsonb
  ) as failures
from pg_temp.rc5_results;

rollback;
