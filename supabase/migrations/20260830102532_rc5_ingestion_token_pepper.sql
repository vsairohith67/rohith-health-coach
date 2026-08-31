begin;

-- Keep the per-project ingestion pepper encrypted at rest. The migration never
-- returns or logs the generated value.
do $$
begin
  if not exists (
    select 1 from vault.secrets where name = 'rohith_health_ingestion_pepper'
  ) then
    perform vault.create_secret(
      encode(extensions.gen_random_bytes(32), 'hex'),
      'rohith_health_ingestion_pepper',
      'Rohith Health Coach device-token HMAC pepper'
    );
  end if;
end;
$$;

create or replace function private.hash_ingestion_token(p_token text)
returns text
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  pepper text;
begin
  if p_token is null or char_length(p_token) < 32 or char_length(p_token) > 512 then
    raise exception using errcode = '22023', message = 'invalid_ingestion_token';
  end if;

  select decrypted_secret
  into pepper
  from vault.decrypted_secrets
  where name = 'rohith_health_ingestion_pepper'
  limit 1;

  if pepper is null then
    raise exception using errcode = '55000', message = 'ingestion_pepper_unavailable';
  end if;

  return encode(extensions.hmac(p_token, pepper, 'sha256'), 'hex');
end;
$$;
revoke all on function private.hash_ingestion_token(text)
from public, anon, authenticated, service_role;

create or replace function private.resolve_ingestion_credential(
  p_token text,
  p_device_id uuid
)
returns table(credential_id uuid, user_id uuid, device_id uuid)
language sql
security definer
stable
set search_path = ''
as $$
  select c.id, c.user_id, c.device_id
  from private.ingestion_credentials c
  where c.device_id = p_device_id
    and c.token_hash = private.hash_ingestion_token(p_token)
    and c.revoked_at is null
    and (c.expires_at is null or c.expires_at > now())
    and 'health:ingest' = any(c.scopes)
  limit 1;
$$;
revoke all on function private.resolve_ingestion_credential(text, uuid)
from public, anon, authenticated, service_role;

drop function public.service_issue_ingestion_credential(
  uuid,
  uuid,
  text,
  text,
  timestamptz,
  uuid
);

create function public.service_issue_ingestion_credential(
  p_user_id uuid,
  p_device_id uuid,
  p_token text,
  p_token_hint text,
  p_expires_at timestamptz default null,
  p_rotation_parent_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_id uuid;
begin
  if not exists (
    select 1
    from public.devices d
    where d.id = p_device_id
      and d.user_id = p_user_id
      and d.revoked_at is null
  ) then
    raise exception using errcode = '22023', message = 'invalid_device';
  end if;

  if p_rotation_parent_id is not null and not exists (
    select 1
    from private.ingestion_credentials parent
    where parent.id = p_rotation_parent_id
      and parent.user_id = p_user_id
      and parent.device_id = p_device_id
  ) then
    raise exception using errcode = '22023', message = 'invalid_rotation_parent';
  end if;

  insert into private.ingestion_credentials(
    user_id,
    device_id,
    token_hash,
    token_hint,
    expires_at,
    rotation_parent_id
  )
  values (
    p_user_id,
    p_device_id,
    private.hash_ingestion_token(p_token),
    left(p_token_hint, 16),
    p_expires_at,
    p_rotation_parent_id
  )
  returning id into new_id;

  return new_id;
end;
$$;
revoke all on function public.service_issue_ingestion_credential(
  uuid,
  uuid,
  text,
  text,
  timestamptz,
  uuid
) from public, anon, authenticated;
grant execute on function public.service_issue_ingestion_credential(
  uuid,
  uuid,
  text,
  text,
  timestamptz,
  uuid
) to service_role;

commit;
