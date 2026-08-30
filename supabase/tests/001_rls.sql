begin;
select plan(40);

insert into auth.users(id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'a@example.invalid'),
  ('00000000-0000-0000-0000-00000000000b', 'b@example.invalid');

insert into public.profiles(user_id, display_name) values
  ('00000000-0000-0000-0000-00000000000a', 'User A'),
  ('00000000-0000-0000-0000-00000000000b', 'User B');
insert into public.user_preferences(user_id) values
  ('00000000-0000-0000-0000-00000000000a'),
  ('00000000-0000-0000-0000-00000000000b');
insert into public.daily_metrics(user_id, local_date, timezone, steps) values
  ('00000000-0000-0000-0000-00000000000a', current_date, 'Asia/Kolkata', 8100),
  ('00000000-0000-0000-0000-00000000000b', current_date, 'Asia/Kolkata', 4200);
insert into public.raw_health_samples(
  user_id, metric_type, start_at, end_at, numeric_value, unit, source_name, source_hash
) values
  ('00000000-0000-0000-0000-00000000000a', 'steps', now(), now(), 8100, 'count', 'fixture', 'hash-a'),
  ('00000000-0000-0000-0000-00000000000b', 'steps', now(), now(), 4200, 'count', 'fixture', 'hash-b');
insert into public.coach_reports(
  user_id, report_type, period_start, period_end, deterministic_findings,
  narrative_text, generation_mode, data_completeness
) values
  ('00000000-0000-0000-0000-00000000000a', 'daily', current_date, current_date, '[]', 'A report', 'deterministic', 90),
  ('00000000-0000-0000-0000-00000000000b', 'daily', current_date, current_date, '[]', 'B report', 'deterministic', 90);
insert into public.fit_files(
  user_id, storage_object_path, original_filename, safe_filename, byte_size, sha256, detected_file_type
) values
  ('00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-00000000000a/a.fit', 'a.fit', 'a.fit', 16, repeat('a', 64), 'fit'),
  ('00000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-00000000000b/b.fit', 'b.fit', 'b.fit', 16, repeat('b', 64), 'fit');
insert into public.export_jobs(user_id, format, date_range, status) values
  ('00000000-0000-0000-0000-00000000000a', 'json', daterange(current_date - 7, current_date, '[]'), 'queued'),
  ('00000000-0000-0000-0000-00000000000b', 'json', daterange(current_date - 7, current_date, '[]'), 'queued');
insert into public.knowledge_sources(title, organization, official_url, topic, reviewed_at, summary)
values ('Fixture guidance', 'Fixture organization', 'https://example.invalid', 'testing', current_date, 'Synthetic fixture.');
insert into storage.objects(bucket_id, name, owner_id) values
  ('fit-private', '00000000-0000-0000-0000-00000000000a/seed.fit', '00000000-0000-0000-0000-00000000000a'),
  ('fit-private', '00000000-0000-0000-0000-00000000000b/seed.fit', '00000000-0000-0000-0000-00000000000b');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}', true);

select is((select count(*)::integer from public.profiles), 1, 'User A sees one profile');
select is((select display_name from public.profiles), 'User A', 'User A reads own profile');
select is((select steps from public.daily_metrics), 8100, 'User A reads own daily metrics');
select is((select numeric_value::integer from public.raw_health_samples), 8100, 'User A reads own raw sample');
select is((select narrative_text from public.coach_reports), 'A report', 'User A reads own report');
select is((select original_filename from public.fit_files), 'a.fit', 'User A reads own FIT metadata');
select lives_ok(
  $$ update public.user_preferences set coaching_tone = 'direct' where user_id = '00000000-0000-0000-0000-00000000000a' $$,
  'User A updates own preferences'
);
select is((select coaching_tone from public.user_preferences), 'direct', 'User A preference update persisted');
select is_empty(
  $$ update public.user_preferences set coaching_tone = 'forged'
     where user_id = '00000000-0000-0000-0000-00000000000b' returning 1 $$,
  'User A cannot update User B preferences'
);
select is_empty(
  $$ delete from public.profiles
     where user_id = '00000000-0000-0000-0000-00000000000b' returning 1 $$,
  'User A cannot delete User B profile'
);
select throws_ok(
  $$ insert into public.daily_checkins(user_id, local_date) values ('00000000-0000-0000-0000-00000000000b', current_date) $$,
  '42501', null, 'User A cannot insert User B check-in'
);
select lives_ok(
  $$ insert into public.daily_checkins(user_id, local_date) values ('00000000-0000-0000-0000-00000000000a', current_date) $$,
  'User A inserts own check-in'
);
select is((select count(*)::integer from public.export_jobs), 1, 'User A sees only own export');
select is((select count(*)::integer from public.fit_files where original_filename = 'b.fit'), 0, 'User A cannot see User B FIT file');
select throws_ok($$ select * from private.ingestion_credentials $$, '42501', null, 'Browser cannot read ingestion credentials');
select throws_ok($$ select * from private.agent_access_tokens $$, '42501', null, 'Browser cannot read agent tokens');
select ok(not has_table_privilege('authenticated', 'public.daily_metrics', 'INSERT'), 'Authenticated client cannot forge daily metrics');
select ok(not has_table_privilege('authenticated', 'public.audit_events', 'INSERT'), 'Authenticated client cannot forge audit events');
select ok(not has_table_privilege('authenticated', 'public.fit_files', 'INSERT'), 'Authenticated client cannot forge FIT metadata');
select lives_ok($$ select public.request_account_deletion('health_data') $$, 'User A may request scoped deletion through RPC');
select is((select count(*)::integer from public.deletion_jobs), 1, 'User A sees only own deletion job');
select throws_ok($$ select public.claim_fit_job('browser') $$, '42501', null, 'Browser cannot claim FIT jobs');
select is((select count(*)::integer from storage.objects), 1, 'User A sees only own Storage object');
select lives_ok(
  $$ insert into storage.objects(bucket_id, name, owner_id) values ('fit-private', '00000000-0000-0000-0000-00000000000a/upload.fit', '00000000-0000-0000-0000-00000000000a') $$,
  'User A uploads only below own private prefix'
);
select throws_ok(
  $$ insert into storage.objects(bucket_id, name, owner_id) values ('fit-private', '00000000-0000-0000-0000-00000000000b/forged.fit', '00000000-0000-0000-0000-00000000000a') $$,
  '42501', null, 'User A cannot upload below User B prefix'
);
select is((select count(*)::integer from public.knowledge_sources), 1, 'Authenticated user reads active knowledge sources');
select ok(not has_function_privilege('authenticated', 'public.service_resolve_ingestion_credential(text,uuid)', 'EXECUTE'), 'Browser cannot resolve ingestion credentials');

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}', true);
select is((select display_name from public.profiles), 'User B', 'User B reads own profile');
select is((select steps from public.daily_metrics), 4200, 'User B reads own daily metrics');
select is((select numeric_value::integer from public.raw_health_samples), 4200, 'User B reads own raw sample');
select is((select count(*)::integer from public.export_jobs), 1, 'User B sees only own export');
select is_empty(
  $$ delete from public.profiles
     where user_id = '00000000-0000-0000-0000-00000000000a' returning 1 $$,
  'User B cannot delete User A profile'
);

reset role;
set local role anon;
select throws_ok($$ select * from public.profiles $$, '42501', null, 'Anonymous cannot read profiles');
select throws_ok($$ select * from public.daily_metrics $$, '42501', null, 'Anonymous cannot read health metrics');
select ok(not has_table_privilege('anon', 'public.daily_checkins', 'INSERT'), 'Anonymous cannot write health data');
select is((select count(*)::integer from storage.objects), 0, 'Anonymous cannot read private Storage');
select throws_ok($$ select * from public.export_jobs $$, '42501', null, 'Anonymous cannot read exports');
select ok(not has_function_privilege('anon', 'public.request_account_deletion(text)', 'EXECUTE'), 'Anonymous cannot request deletion jobs');
select ok(not has_function_privilege('anon', 'public.service_issue_ingestion_credential(uuid,uuid,text,text,timestamptz,uuid)', 'EXECUTE'), 'Anonymous cannot request device tokens');
select throws_ok($$ select * from public.knowledge_sources $$, '42501', null, 'Anonymous cannot read knowledge sources');

select * from finish();
rollback;
