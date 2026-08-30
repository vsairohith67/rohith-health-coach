begin;

-- A device and its optional provider connection must belong to the same user.
-- Keep the existing "provider deleted => detach device" behavior while making
-- ownership part of the database relationship instead of trusting callers.
alter table public.provider_connections
  add constraint provider_connections_id_user_id_key unique (id, user_id);

alter table public.devices
  drop constraint devices_provider_connection_id_fkey;

alter table public.devices
  add constraint devices_provider_connection_owner_fkey
  foreign key (provider_connection_id, user_id)
  references public.provider_connections (id, user_id)
  on delete set null (provider_connection_id);

create index devices_provider_connection_owner_idx
  on public.devices (provider_connection_id, user_id)
  where provider_connection_id is not null;

-- Storage object paths and Storage's recorded owner must both agree with the
-- authenticated user. A user-controlled path alone is not sufficient proof of
-- ownership when rows are exercised directly through the Data API.
drop policy if exists fit_storage_owner_read on storage.objects;
drop policy if exists fit_storage_owner_insert on storage.objects;
drop policy if exists fit_storage_owner_delete on storage.objects;

create policy fit_storage_owner_read on storage.objects
for select to authenticated
using (
  bucket_id = 'fit-private'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and owner_id = (select auth.uid())::text
);

create policy fit_storage_owner_insert on storage.objects
for insert to authenticated
with check (
  bucket_id = 'fit-private'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and owner_id = (select auth.uid())::text
);

create policy fit_storage_owner_delete on storage.objects
for delete to authenticated
using (
  bucket_id = 'fit-private'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and owner_id = (select auth.uid())::text
);

-- The public service wrapper is the only supported credential resolver.
-- Triggering a public-schema RPC must never make the private helper directly
-- callable by a browser role.
revoke all on function private.resolve_ingestion_credential(text, uuid)
from public, anon, authenticated;

-- Foreign-key indexes keep account/device cleanup bounded as hosted data grows.
create index ingestion_credentials_user_idx
  on private.ingestion_credentials (user_id);
create index ingestion_credentials_device_idx
  on private.ingestion_credentials (device_id);
create index ingestion_credentials_rotation_parent_idx
  on private.ingestion_credentials (rotation_parent_id)
  where rotation_parent_id is not null;

commit;
