-- RC8.1 hosted-only synthetic owner credential matrix.
--
-- This intentionally uses only standard PostgreSQL features because the
-- hosted project does not install the optional pgTAP extension. Every
-- identity, device, credential, helper, and result is enclosed by the final
-- rollback.

begin;

create temporary table rc81_results (
  assertion_number integer generated always as identity,
  test_name text not null,
  passed boolean not null,
  details text not null
) on commit drop;

create or replace function pg_temp.rc81_record(
  p_test_name text,
  p_passed boolean,
  p_details text default ''
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into pg_temp.rc81_results(test_name, passed, details)
  values (p_test_name, p_passed, p_details);
end;
$$;

create or replace function pg_temp.rc81_try(p_sql text)
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

create or replace function pg_temp.rc81_record_try(
  p_test_name text,
  p_sql text,
  p_expected_accepted boolean,
  p_expected_sqlstate text default null,
  p_expected_error text default null
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  outcome jsonb := pg_temp.rc81_try(p_sql);
  actual_accepted boolean := (outcome ->> 'accepted')::boolean;
  actual_sqlstate text := outcome ->> 'sqlstate';
  actual_error text := outcome ->> 'error';
  passed boolean;
begin
  passed := actual_accepted = p_expected_accepted
    and (p_expected_sqlstate is null or actual_sqlstate = p_expected_sqlstate)
    and (p_expected_error is null or actual_error = p_expected_error);

  perform pg_temp.rc81_record(
    p_test_name,
    passed,
    pg_catalog.jsonb_build_object(
      'accepted', actual_accepted,
      'sqlstate', actual_sqlstate,
      'error', actual_error
    )::text
  );
end;
$$;

insert into auth.users(id, email) values
  ('00000000-0000-0000-0000-00000000008a', 'rc8-owner-a@example.invalid'),
  ('00000000-0000-0000-0000-00000000008b', 'rc8-owner-b@example.invalid');

create temporary table rc81_issued(
  device_id uuid,
  token text,
  token_hint text,
  expires_at timestamptz
) on commit drop;
grant select, insert, delete on rc81_issued to authenticated, service_role;

select pg_temp.rc81_record(
  'Authenticated owner may create an ingestion credential',
  has_function_privilege('authenticated', 'public.create_ingestion_credential(text)', 'EXECUTE')
);
select pg_temp.rc81_record(
  'Anonymous may not create an ingestion credential',
  not has_function_privilege('anon', 'public.create_ingestion_credential(text)', 'EXECUTE')
);
select pg_temp.rc81_record(
  'Anonymous may not rotate an ingestion credential',
  not has_function_privilege('anon', 'public.rotate_ingestion_credential(uuid)', 'EXECUTE')
);
select pg_temp.rc81_record(
  'Anonymous may not revoke an ingestion device',
  not has_function_privilege('anon', 'public.revoke_ingestion_device(uuid)', 'EXECUTE')
);
select pg_temp.rc81_record(
  'Anonymous may not list ingestion devices',
  not has_function_privilege('anon', 'public.list_ingestion_devices()', 'EXECUTE')
);
select pg_temp.rc81_record(
  'Database enforces one unrevoked credential per device',
  exists(
    select 1
    from pg_indexes i
    where i.schemaname = 'private'
      and i.tablename = 'ingestion_credentials'
      and i.indexname = 'ingestion_credentials_one_unrevoked_per_device_idx'
      and i.indexdef like '%UNIQUE INDEX%'
      and i.indexdef like '%WHERE (revoked_at IS NULL)%'
  )
);
select pg_temp.rc81_record(
  'Browser cannot execute the token hash function',
  not has_function_privilege('authenticated', 'private.hash_ingestion_token(text)', 'EXECUTE')
);
select pg_temp.rc81_record(
  'Browser cannot read stored ingestion credential rows',
  not has_table_privilege('authenticated', 'private.ingestion_credentials', 'SELECT')
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000008a', true);

insert into rc81_issued
select * from public.create_ingestion_credential('  Synthetic RC8 iPhone  ');

select pg_temp.rc81_record(
  'Token has 256 bits encoded as 64 hex characters',
  (select length(token) = 64 from rc81_issued)
);
select pg_temp.rc81_record(
  'Token is header-safe lowercase hex',
  (select token ~ '^[0-9a-f]{64}$' from rc81_issued)
);
select pg_temp.rc81_record(
  'Only a six-character safe hint is retained',
  (select token_hint ~ '^\.\.\.[0-9a-f]{6}$' from rc81_issued)
);
select pg_temp.rc81_record(
  'Device name is trimmed server-side',
  (select d.device_name = 'Synthetic RC8 iPhone'
   from public.devices d
   join rc81_issued i on i.device_id = d.id)
);
select pg_temp.rc81_record(
  'One device ID is used by both the header and envelope',
  (select d.external_device_id = i.device_id::text
   from public.devices d
   join rc81_issued i on i.device_id = d.id)
);
select pg_temp.rc81_record(
  'Device ownership is derived from auth.uid()',
  (select d.user_id = '00000000-0000-0000-0000-00000000008a'::uuid
   from public.devices d
   join rc81_issued i on i.device_id = d.id)
);

reset role;
select pg_temp.rc81_record(
  'Credential has ingestion-only scope',
  (select c.scopes = array['health:ingest']::text[]
   from private.ingestion_credentials c
   join rc81_issued i on i.device_id = c.device_id)
);
select pg_temp.rc81_record(
  'Plaintext is never stored as token_hash',
  (select c.token_hash <> i.token
   from private.ingestion_credentials c
   join rc81_issued i on i.device_id = c.device_id)
);
select pg_temp.rc81_record(
  'Stored HMAC-SHA-256 digest has the expected length',
  (select length(c.token_hash) = 64
   from private.ingestion_credentials c
   join rc81_issued i on i.device_id = c.device_id)
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000008a', true);
select pg_temp.rc81_record(
  'Credential expires after the bounded seven-day pilot window',
  (select expires_at > now() + interval '6 days 23 hours'
      and expires_at <= now() + interval '7 days 1 minute'
   from rc81_issued)
);
select pg_temp.rc81_record(
  'Owner sees one safe device summary',
  (select count(*) = 1 from public.list_ingestion_devices())
);
select pg_temp.rc81_record(
  'Device list returns only the safe token hint',
  (select token_hint from public.list_ingestion_devices()) =
    (select token_hint from rc81_issued)
);

reset role;
set local role service_role;
select pg_temp.rc81_record(
  'Issued token resolves only through the trusted ingestion service',
  (select count(*) = 1
   from public.service_resolve_ingestion_credential(
     (select token from rc81_issued),
     (select device_id from rc81_issued)
   ))
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000008a', true);
create temporary table rc81_rotated on commit drop as
select * from public.rotate_ingestion_credential((select device_id from rc81_issued));
grant select on rc81_rotated to service_role;

select pg_temp.rc81_record(
  'Rotation generates a different credential',
  (select r.token <> i.token from rc81_rotated r cross join rc81_issued i)
);
select pg_temp.rc81_record(
  'Rotated token retains 256-bit strength',
  (select length(token) = 64 from rc81_rotated)
);

reset role;
select pg_temp.rc81_record(
  'Rotation leaves exactly one active credential',
  (select count(*) = 1
   from private.ingestion_credentials c
   join rc81_issued i on i.device_id = c.device_id
   where c.revoked_at is null)
);

set local role service_role;
select pg_temp.rc81_record(
  'Rotated-out token no longer resolves',
  (select count(*) = 0
   from public.service_resolve_ingestion_credential(
     (select token from rc81_issued),
     (select device_id from rc81_issued)
   ))
);
select pg_temp.rc81_record(
  'Rotated token resolves for the same device',
  (select count(*) = 1
   from public.service_resolve_ingestion_credential(
     (select token from rc81_rotated),
     (select device_id from rc81_rotated)
   ))
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000008b', true);
select pg_temp.rc81_record_try(
  'A different user cannot rotate the device credential',
  $$select * from public.rotate_ingestion_credential(
    (select device_id from pg_temp.rc81_issued)
  )$$,
  false,
  '22023',
  'invalid_device'
);
select pg_temp.rc81_record(
  'A different user cannot revoke the device',
  not public.revoke_ingestion_device((select device_id from rc81_issued))
);
select pg_temp.rc81_record(
  'A different user cannot list the device',
  (select count(*) = 0 from public.list_ingestion_devices())
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000008a', true);
select pg_temp.rc81_record(
  'Owner can revoke the device',
  public.revoke_ingestion_device((select device_id from rc81_issued))
);
select pg_temp.rc81_record(
  'Device is marked revoked',
  (select d.revoked_at is not null
   from public.devices d
   join rc81_issued i on i.device_id = d.id)
);

reset role;
select pg_temp.rc81_record(
  'Revocation disables every device credential',
  (select count(*) = 0
   from private.ingestion_credentials c
   join rc81_issued i on i.device_id = c.device_id
   where c.revoked_at is null)
);

set local role service_role;
select pg_temp.rc81_record(
  'Revoked token no longer resolves',
  (select count(*) = 0
   from public.service_resolve_ingestion_credential(
     (select token from rc81_rotated),
     (select device_id from rc81_rotated)
   ))
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000008a', true);
select pg_temp.rc81_record_try(
  'Empty device names fail closed',
  $$select * from public.create_ingestion_credential('')$$,
  false,
  '22023',
  'invalid_device_name'
);
select pg_temp.rc81_record_try(
  'Control characters in device names fail closed',
  $sql$select * from public.create_ingestion_credential(E'unsafe\nname')$sql$,
  false,
  '22023',
  'invalid_device_name'
);
reset role;

select pg_temp.rc81_record(
  'Every owner credential function has an empty search_path',
  (select bool_and(p.proconfig @> array['search_path=""'])
   from pg_proc p
   join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public'
     and p.proname in (
       'create_ingestion_credential',
       'rotate_ingestion_credential',
       'revoke_ingestion_device',
       'list_ingestion_devices'
     ))
);

select jsonb_build_object(
  'total', count(*),
  'passed', count(*) filter (where passed),
  'failed', count(*) filter (where not passed),
  'failures', coalesce(
    jsonb_agg(
      jsonb_build_object(
        'number', assertion_number,
        'test', test_name,
        'details', details
      ) order by assertion_number
    ) filter (where not passed),
    '[]'::jsonb
  )
) as rc81_hosted_credential_matrix
from pg_temp.rc81_results;

rollback;
