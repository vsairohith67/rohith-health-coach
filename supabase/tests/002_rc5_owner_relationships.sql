begin;
select plan(7);

insert into auth.users(id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'rc5-a@example.invalid'),
  ('00000000-0000-0000-0000-00000000000b', 'rc5-b@example.invalid');

insert into public.provider_connections(id, user_id, provider_type, display_name) values
  ('10000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-00000000000a', 'apple_shortcut', 'Synthetic A'),
  ('10000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-00000000000b', 'apple_shortcut', 'Synthetic B');

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}',
  true
);

select lives_ok(
  $$ insert into public.devices(
       id, user_id, provider_connection_id, device_name, device_type,
       manufacturer, model, source_system
     ) values (
       '20000000-0000-0000-0000-00000000000a',
       '00000000-0000-0000-0000-00000000000a',
       '10000000-0000-0000-0000-00000000000a',
       'Synthetic A Device', 'phone', 'Synthetic', 'A', 'apple_shortcut'
     ) $$,
  'User A can link a device to User A provider connection'
);

select throws_ok(
  $$ insert into public.devices(
       user_id, provider_connection_id, device_name, device_type,
       manufacturer, model, source_system
     ) values (
       '00000000-0000-0000-0000-00000000000a',
       '10000000-0000-0000-0000-00000000000b',
       'Forged Device', 'phone', 'Synthetic', 'Forged', 'apple_shortcut'
     ) $$,
  '23503', null,
  'User A cannot link a device to User B provider connection'
);

select throws_ok(
  $$ update public.devices
     set provider_connection_id = '10000000-0000-0000-0000-00000000000b'
     where id = '20000000-0000-0000-0000-00000000000a' $$,
  '23503', null,
  'User A cannot relink a device to User B provider connection'
);

select lives_ok(
  $$ insert into storage.objects(bucket_id, name, owner_id)
     values (
       'fit-private',
       '00000000-0000-0000-0000-00000000000a/owned.fit',
       '00000000-0000-0000-0000-00000000000a'
     ) $$,
  'User A can create an object with matching path and owner'
);

select throws_ok(
  $$ insert into storage.objects(bucket_id, name, owner_id)
     values (
       'fit-private',
       '00000000-0000-0000-0000-00000000000a/forged-owner.fit',
       '00000000-0000-0000-0000-00000000000b'
     ) $$,
  '42501', null,
  'User A cannot forge User B as Storage owner under User A path'
);

select throws_ok(
  $$ insert into storage.objects(bucket_id, name, owner_id)
     values (
       'fit-private',
       '00000000-0000-0000-0000-00000000000b/guessed.fit',
       '00000000-0000-0000-0000-00000000000a'
     ) $$,
  '42501', null,
  'User A cannot create an object under User B path'
);

reset role;
select ok(
  not has_function_privilege(
    'authenticated',
    'private.resolve_ingestion_credential(text,uuid)',
    'EXECUTE'
  ),
  'Authenticated clients cannot execute the private credential resolver'
);

select * from finish();
rollback;
