begin;
select plan(8);

insert into auth.users(id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'pepper-a@example.invalid'),
  ('00000000-0000-0000-0000-00000000000b', 'pepper-b@example.invalid');

insert into public.devices(
  id, user_id, device_name, device_type, manufacturer, model, source_system
) values
  ('20000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-00000000000a', 'Synthetic A', 'phone', 'Synthetic', 'A', 'apple_shortcut'),
  ('20000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-00000000000b', 'Synthetic B', 'phone', 'Synthetic', 'B', 'apple_shortcut');

set local role service_role;

select lives_ok(
  $$ select public.service_issue_ingestion_credential(
       '00000000-0000-0000-0000-00000000000a',
       '20000000-0000-0000-0000-00000000000a',
       repeat('a', 64),
       'synthetic-a',
       now() + interval '1 hour',
       null
     ) $$,
  'Service issues a peppered synthetic credential for an owned device'
);

select is(
  (select count(*)::integer from public.service_resolve_ingestion_credential(
    repeat('a', 64),
    '20000000-0000-0000-0000-00000000000a'
  )),
  1,
  'Valid token and device resolve'
);

select is(
  (select count(*)::integer from public.service_resolve_ingestion_credential(
    repeat('b', 64),
    '20000000-0000-0000-0000-00000000000a'
  )),
  0,
  'Wrong token does not resolve'
);

select is(
  (select count(*)::integer from public.service_resolve_ingestion_credential(
    repeat('a', 64),
    '20000000-0000-0000-0000-00000000000b'
  )),
  0,
  'Wrong device does not resolve'
);

select throws_ok(
  $$ select public.service_issue_ingestion_credential(
       '00000000-0000-0000-0000-00000000000a',
       '20000000-0000-0000-0000-00000000000b',
       repeat('c', 64),
       'forged',
       null,
       null
     ) $$,
  '22023',
  'invalid_device',
  'Service issue function rejects cross-user device ownership'
);

select lives_ok(
  $$ select public.service_issue_ingestion_credential(
       '00000000-0000-0000-0000-00000000000a',
       '20000000-0000-0000-0000-00000000000a',
       repeat('d', 64),
       'expired',
       now() - interval '1 minute',
       null
     ) $$,
  'Service may record an already-expired fixture for denial testing'
);

select is(
  (select count(*)::integer from public.service_resolve_ingestion_credential(
    repeat('d', 64),
    '20000000-0000-0000-0000-00000000000a'
  )),
  0,
  'Expired token does not resolve'
);

reset role;
select ok(
  not has_function_privilege(
    'authenticated',
    'private.hash_ingestion_token(text)',
    'EXECUTE'
  ),
  'Browser cannot execute the peppered token hash function'
);

select * from finish();
rollback;
