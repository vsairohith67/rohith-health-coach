begin;

-- Export artifacts are private and owner-scoped. The first path component and
-- Storage's recorded owner must both agree with the authenticated user.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'exports-private',
  'exports-private',
  false,
  26214400,
  array['application/json', 'text/csv', 'application/zip', 'application/octet-stream']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists export_storage_owner_read on storage.objects;
drop policy if exists export_storage_owner_insert on storage.objects;
drop policy if exists export_storage_owner_delete on storage.objects;

create policy export_storage_owner_read on storage.objects
for select to authenticated
using (
  bucket_id = 'exports-private'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and owner_id = (select auth.uid())::text
);

create policy export_storage_owner_insert on storage.objects
for insert to authenticated
with check (
  bucket_id = 'exports-private'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and owner_id = (select auth.uid())::text
);

create policy export_storage_owner_delete on storage.objects
for delete to authenticated
using (
  bucket_id = 'exports-private'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and owner_id = (select auth.uid())::text
);

commit;
