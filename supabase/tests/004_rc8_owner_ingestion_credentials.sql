begin;
select plan(36);

insert into auth.users(id, email) values
  ('00000000-0000-0000-0000-00000000008a', 'rc8-owner-a@example.invalid'),
  ('00000000-0000-0000-0000-00000000008b', 'rc8-owner-b@example.invalid');

create temporary table rc8_issued(
  device_id uuid,
  token text,
  token_hint text,
  expires_at timestamptz
) on commit drop;
grant select, insert, delete on rc8_issued to authenticated, service_role;

select ok(
  has_function_privilege('authenticated', 'public.create_ingestion_credential(text)', 'EXECUTE'),
  'Authenticated owner may create an ingestion credential'
);
select ok(
  not has_function_privilege('anon', 'public.create_ingestion_credential(text)', 'EXECUTE'),
  'Anonymous may not create an ingestion credential'
);
select ok(
  not has_function_privilege('anon', 'public.rotate_ingestion_credential(uuid)', 'EXECUTE'),
  'Anonymous may not rotate an ingestion credential'
);
select ok(
  not has_function_privilege('anon', 'public.revoke_ingestion_device(uuid)', 'EXECUTE'),
  'Anonymous may not revoke an ingestion device'
);
select ok(
  not has_function_privilege('anon', 'public.list_ingestion_devices()', 'EXECUTE'),
  'Anonymous may not list ingestion devices'
);
select ok(
  exists(
    select 1
    from pg_indexes i
    where i.schemaname = 'private'
      and i.tablename = 'ingestion_credentials'
      and i.indexname = 'ingestion_credentials_one_unrevoked_per_device_idx'
      and i.indexdef like '%UNIQUE INDEX%'
      and i.indexdef like '%WHERE (revoked_at IS NULL)%'
  ),
  'Database enforces one unrevoked credential per device'
);
select ok(
  not has_function_privilege('authenticated', 'private.hash_ingestion_token(text)', 'EXECUTE'),
  'Browser cannot execute the token hash function'
);
select ok(
  not has_table_privilege('authenticated', 'private.ingestion_credentials', 'SELECT'),
  'Browser cannot read stored ingestion credential rows'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000008a', true);

insert into rc8_issued
select * from public.create_ingestion_credential('  Synthetic RC8 iPhone  ');

select is((select length(token) from rc8_issued), 64, 'Token has 256 bits encoded as 64 hex characters');
select ok((select token ~ '^[0-9a-f]{64}$' from rc8_issued), 'Token is header-safe lowercase hex');
select ok((select token_hint ~ '^\.\.\.[0-9a-f]{6}$' from rc8_issued), 'Only a six-character safe hint is retained');
select is(
  (select d.device_name from public.devices d join rc8_issued i on i.device_id = d.id),
  'Synthetic RC8 iPhone',
  'Device name is trimmed server-side'
);
select is(
  (select d.external_device_id from public.devices d join rc8_issued i on i.device_id = d.id),
  (select device_id::text from rc8_issued),
  'One device ID is used by both the header and envelope'
);
select is(
  (select d.user_id from public.devices d join rc8_issued i on i.device_id = d.id),
  '00000000-0000-0000-0000-00000000008a'::uuid,
  'Device ownership is derived from auth.uid()'
);

reset role;
select is(
  (select scopes from private.ingestion_credentials c join rc8_issued i on i.device_id = c.device_id),
  array['health:ingest']::text[],
  'Credential has ingestion-only scope'
);
select isnt(
  (select c.token_hash from private.ingestion_credentials c join rc8_issued i on i.device_id = c.device_id),
  (select token from rc8_issued),
  'Plaintext is never stored as token_hash'
);
select is(
  (select length(c.token_hash) from private.ingestion_credentials c join rc8_issued i on i.device_id = c.device_id),
  64,
  'Stored HMAC-SHA-256 digest has the expected length'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000008a', true);
select ok(
  (select expires_at > now() + interval '6 days 23 hours' and expires_at <= now() + interval '7 days 1 minute' from rc8_issued),
  'Credential expires after the bounded seven-day pilot window'
);
select is(
  (select count(*)::integer from public.list_ingestion_devices()),
  1,
  'Owner sees one safe device summary'
);
select is(
  (select token_hint from public.list_ingestion_devices()),
  (select token_hint from rc8_issued),
  'Device list returns only the safe token hint'
);

reset role;
set local role service_role;
select is(
  (select count(*)::integer from public.service_resolve_ingestion_credential(
    (select token from rc8_issued),
    (select device_id from rc8_issued)
  )),
  1,
  'Issued token resolves only through the trusted ingestion service'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000008a', true);
create temporary table rc8_rotated on commit drop as
select * from public.rotate_ingestion_credential((select device_id from rc8_issued));
grant select on rc8_rotated to service_role;

select isnt((select token from rc8_rotated), (select token from rc8_issued), 'Rotation generates a different credential');
select is((select length(token) from rc8_rotated), 64, 'Rotated token retains 256-bit strength');

reset role;
select is(
  (select count(*)::integer from private.ingestion_credentials c join rc8_issued i on i.device_id = c.device_id where c.revoked_at is null),
  1,
  'Rotation leaves exactly one active credential'
);

set local role service_role;
select is(
  (select count(*)::integer from public.service_resolve_ingestion_credential(
    (select token from rc8_issued),
    (select device_id from rc8_issued)
  )),
  0,
  'Rotated-out token no longer resolves'
);
select is(
  (select count(*)::integer from public.service_resolve_ingestion_credential(
    (select token from rc8_rotated),
    (select device_id from rc8_rotated)
  )),
  1,
  'Rotated token resolves for the same device'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000008b', true);
select throws_ok(
  format(
    'select * from public.rotate_ingestion_credential(%L::uuid)',
    (select device_id from rc8_issued)
  ),
  '22023',
  'invalid_device',
  'A different user cannot rotate the device credential'
);
select is(
  public.revoke_ingestion_device((select device_id from rc8_issued)),
  false,
  'A different user cannot revoke the device'
);
select is((select count(*)::integer from public.list_ingestion_devices()), 0, 'A different user cannot list the device');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000008a', true);
select is(
  public.revoke_ingestion_device((select device_id from rc8_issued)),
  true,
  'Owner can revoke the device'
);
select ok(
  (select d.revoked_at is not null from public.devices d join rc8_issued i on i.device_id = d.id),
  'Device is marked revoked'
);

reset role;
select is(
  (select count(*)::integer from private.ingestion_credentials c join rc8_issued i on i.device_id = c.device_id where c.revoked_at is null),
  0,
  'Revocation disables every device credential'
);

set local role service_role;
select is(
  (select count(*)::integer from public.service_resolve_ingestion_credential(
    (select token from rc8_rotated),
    (select device_id from rc8_rotated)
  )),
  0,
  'Revoked token no longer resolves'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000008a', true);
select throws_ok(
  $$ select * from public.create_ingestion_credential('') $$,
  '22023',
  'invalid_device_name',
  'Empty device names fail closed'
);
select throws_ok(
  $sql$ select * from public.create_ingestion_credential(E'unsafe\nname') $sql$,
  '22023',
  'invalid_device_name',
  'Control characters in device names fail closed'
);
reset role;
select ok(
  (select bool_and(p.proconfig @> array['search_path=""'])
   from pg_proc p
   join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public'
     and p.proname in (
       'create_ingestion_credential',
       'rotate_ingestion_credential',
       'revoke_ingestion_device',
       'list_ingestion_devices'
     )),
  'Every owner credential function has an empty search_path'
);

select * from finish();
rollback;
