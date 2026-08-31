begin;

create or replace function private.resolve_ingestion_credential(p_token text, p_device_id uuid)
returns table(credential_id uuid, user_id uuid, device_id uuid)
language sql security definer stable set search_path = '' as $$
  select c.id, c.user_id, c.device_id
  from private.ingestion_credentials c
  where c.device_id = p_device_id
    and c.token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
    and c.revoked_at is null
    and (c.expires_at is null or c.expires_at > now())
    and 'health:ingest' = any(c.scopes)
  limit 1;
$$;

create or replace function public.service_resolve_ingestion_credential(p_token text, p_device_id uuid)
returns table(credential_id uuid, user_id uuid, device_id uuid)
language sql security definer stable set search_path = '' as $$
  select * from private.resolve_ingestion_credential(p_token, p_device_id);
$$;
revoke all on function public.service_resolve_ingestion_credential(text, uuid) from public, anon, authenticated;
grant execute on function public.service_resolve_ingestion_credential(text, uuid) to service_role;

create or replace function public.service_mark_credential_used(p_credential_id uuid)
returns void language sql security definer set search_path = '' as $$
  update private.ingestion_credentials set last_used_at = now() where id = p_credential_id and revoked_at is null;
$$;
revoke all on function public.service_mark_credential_used(uuid) from public, anon, authenticated;
grant execute on function public.service_mark_credential_used(uuid) to service_role;

create or replace function public.service_issue_ingestion_credential(
  p_user_id uuid, p_device_id uuid, p_token_hash text, p_token_hint text, p_expires_at timestamptz default null,
  p_rotation_parent_id uuid default null
) returns uuid language plpgsql security definer set search_path = '' as $$
declare new_id uuid;
begin
  if not exists(select 1 from public.devices d where d.id = p_device_id and d.user_id = p_user_id and d.revoked_at is null) then
    raise exception using errcode = '22023', message = 'invalid_device';
  end if;
  insert into private.ingestion_credentials(user_id, device_id, token_hash, token_hint, expires_at, rotation_parent_id)
  values (p_user_id, p_device_id, p_token_hash, p_token_hint, p_expires_at, p_rotation_parent_id)
  returning id into new_id;
  return new_id;
end;
$$;
revoke all on function public.service_issue_ingestion_credential(uuid, uuid, text, text, timestamptz, uuid) from public, anon, authenticated;
grant execute on function public.service_issue_ingestion_credential(uuid, uuid, text, text, timestamptz, uuid) to service_role;

create or replace function public.claim_fit_job(p_worker_id text)
returns public.fit_ingestion_jobs
language plpgsql security definer set search_path = '' as $$
declare claimed public.fit_ingestion_jobs;
begin
  update public.fit_ingestion_jobs
    set status='claimed', claimed_at=now(), worker_id=p_worker_id, attempt_count=attempt_count+1
  where id = (
    select id from public.fit_ingestion_jobs
    where status='queued' and attempt_count < 3
    order by created_at for update skip locked limit 1
  )
  returning * into claimed;
  return claimed;
end;
$$;
revoke all on function public.claim_fit_job(text) from public, anon, authenticated;
grant execute on function public.claim_fit_job(text) to service_role;

create or replace function public.request_account_deletion(p_scope text default 'all')
returns uuid language plpgsql security invoker set search_path = '' as $$
declare job_id uuid;
begin
  if auth.uid() is null then raise exception using errcode='42501', message='authentication_required'; end if;
  insert into public.deletion_jobs(user_id, scope, status) values (auth.uid(), p_scope, 'queued') returning id into job_id;
  return job_id;
end;
$$;
grant execute on function public.request_account_deletion(text) to authenticated;

commit;
