begin;

-- Exactly one unrevoked credential may exist for a device. This invariant also
-- closes concurrent rotation races in the trusted service issuer.
create unique index ingestion_credentials_one_unrevoked_per_device_idx
  on private.ingestion_credentials (device_id)
  where revoked_at is null;

-- Harden the existing service-only issuer so it follows the same one-active-
-- credential invariant. The signature is retained for compatibility; the hint
-- is derived from the token instead of trusting caller-provided text.
create or replace function public.service_issue_ingestion_credential(
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
  current_credential_id uuid;
  effective_rotation_parent uuid;
begin
  perform 1
  from public.devices d
  where d.id = p_device_id
    and d.user_id = p_user_id
    and d.revoked_at is null
  for update;

  if not found then
    raise exception using errcode = '22023', message = 'invalid_device';
  end if;

  if p_token is null or p_token !~ '^[0-9a-f]{64}$' then
    raise exception using errcode = '22023', message = 'invalid_token';
  end if;

  p_token_hint := '...' || right(p_token, 6);

  if p_rotation_parent_id is not null and not exists (
    select 1
    from private.ingestion_credentials parent
    where parent.id = p_rotation_parent_id
      and parent.user_id = p_user_id
      and parent.device_id = p_device_id
  ) then
    raise exception using errcode = '22023', message = 'invalid_rotation_parent';
  end if;

  select c.id
  into current_credential_id
  from private.ingestion_credentials c
  where c.user_id = p_user_id
    and c.device_id = p_device_id
    and c.revoked_at is null
  order by c.created_at desc, c.id desc
  limit 1
  for update;

  effective_rotation_parent := coalesce(
    p_rotation_parent_id,
    current_credential_id
  );

  update private.ingestion_credentials c
  set revoked_at = coalesce(c.revoked_at, now())
  where c.user_id = p_user_id
    and c.device_id = p_device_id
    and c.revoked_at is null;

  insert into private.ingestion_credentials(
    user_id,
    device_id,
    token_hash,
    token_hint,
    scopes,
    expires_at,
    rotation_parent_id
  )
  values (
    p_user_id,
    p_device_id,
    private.hash_ingestion_token(p_token),
    p_token_hint,
    array['health:ingest'],
    p_expires_at,
    effective_rotation_parent
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

-- Owner-facing device credentials are generated inside Postgres so neither the
-- browser nor Vercel needs a service-role key or the ingestion-token pepper.
-- Plaintext is returned exactly once and is never stored.
create function public.create_ingestion_credential(
  p_device_name text default 'Rohith iPhone'
)
returns table(
  device_id uuid,
  token text,
  token_hint text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  requesting_user uuid := auth.uid();
  normalized_name text := btrim(p_device_name);
  new_device_id uuid := extensions.gen_random_uuid();
  plaintext_token text := encode(extensions.gen_random_bytes(32), 'hex');
  safe_hint text := '...' || right(plaintext_token, 6);
  credential_expiry timestamptz := now() + interval '7 days';
begin
  if requesting_user is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;

  if normalized_name is null or char_length(normalized_name) < 1
     or char_length(normalized_name) > 80
     or normalized_name ~ '[[:cntrl:]]' then
    raise exception using errcode = '22023', message = 'invalid_device_name';
  end if;

  -- Serialize per-owner creation so the three-device limit cannot be bypassed
  -- by concurrent requests.
  perform 1
  from auth.users u
  where u.id = requesting_user
  for update;

  if not found then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;

  if (
    select count(*)
    from public.devices d
    where d.user_id = requesting_user
      and d.source_system = 'apple_shortcut'
      and d.revoked_at is null
  ) >= 3 then
    raise exception using errcode = '54000', message = 'active_device_limit_reached';
  end if;

  insert into public.devices(
    id,
    user_id,
    device_name,
    device_type,
    manufacturer,
    model,
    external_device_id,
    source_system
  )
  values (
    new_device_id,
    requesting_user,
    normalized_name,
    'phone',
    'Apple',
    'iPhone',
    new_device_id::text,
    'apple_shortcut'
  );

  insert into private.ingestion_credentials(
    user_id,
    device_id,
    token_hash,
    token_hint,
    scopes,
    expires_at
  )
  values (
    requesting_user,
    new_device_id,
    private.hash_ingestion_token(plaintext_token),
    safe_hint,
    array['health:ingest'],
    credential_expiry
  );

  return query
  select new_device_id, plaintext_token, safe_hint, credential_expiry;
end;
$$;

revoke all on function public.create_ingestion_credential(text)
from public, anon, authenticated;
grant execute on function public.create_ingestion_credential(text)
to authenticated;

create function public.rotate_ingestion_credential(p_device_id uuid)
returns table(
  device_id uuid,
  token text,
  token_hint text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  requesting_user uuid := auth.uid();
  rotation_parent uuid;
  plaintext_token text := encode(extensions.gen_random_bytes(32), 'hex');
  safe_hint text := '...' || right(plaintext_token, 6);
  credential_expiry timestamptz := now() + interval '7 days';
begin
  if requesting_user is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;

  perform 1
  from public.devices d
  where d.id = p_device_id
    and d.user_id = requesting_user
    and d.source_system = 'apple_shortcut'
    and d.revoked_at is null
  for update;

  if not found then
    raise exception using errcode = '22023', message = 'invalid_device';
  end if;

  select c.id
  into rotation_parent
  from private.ingestion_credentials c
  where c.user_id = requesting_user
    and c.device_id = p_device_id
  order by c.created_at desc, c.id desc
  limit 1;

  update private.ingestion_credentials c
  set revoked_at = coalesce(c.revoked_at, now())
  where c.user_id = requesting_user
    and c.device_id = p_device_id
    and c.revoked_at is null;

  insert into private.ingestion_credentials(
    user_id,
    device_id,
    token_hash,
    token_hint,
    scopes,
    expires_at,
    rotation_parent_id
  )
  values (
    requesting_user,
    p_device_id,
    private.hash_ingestion_token(plaintext_token),
    safe_hint,
    array['health:ingest'],
    credential_expiry,
    rotation_parent
  );

  return query
  select p_device_id, plaintext_token, safe_hint, credential_expiry;
end;
$$;

revoke all on function public.rotate_ingestion_credential(uuid)
from public, anon, authenticated;
grant execute on function public.rotate_ingestion_credential(uuid)
to authenticated;

create function public.revoke_ingestion_device(p_device_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  requesting_user uuid := auth.uid();
begin
  if requesting_user is null then
    raise exception using errcode = '42501', message = 'authentication_required';
  end if;

  perform 1
  from public.devices d
  where d.id = p_device_id
    and d.user_id = requesting_user
    and d.source_system = 'apple_shortcut'
  for update;

  if not found then
    return false;
  end if;

  update public.devices d
  set revoked_at = coalesce(d.revoked_at, now())
  where d.id = p_device_id
    and d.user_id = requesting_user
    and d.source_system = 'apple_shortcut';

  update private.ingestion_credentials c
  set revoked_at = coalesce(c.revoked_at, now())
  where c.user_id = requesting_user
    and c.device_id = p_device_id
    and c.revoked_at is null;

  return true;
end;
$$;

revoke all on function public.revoke_ingestion_device(uuid)
from public, anon, authenticated;
grant execute on function public.revoke_ingestion_device(uuid)
to authenticated;

create function public.list_ingestion_devices()
returns table(
  device_id uuid,
  device_name text,
  token_hint text,
  credential_created_at timestamptz,
  expires_at timestamptz,
  last_used_at timestamptz,
  revoked_at timestamptz
)
language sql
security definer
stable
set search_path = ''
as $$
  select
    d.id,
    d.device_name,
    latest.token_hint,
    latest.created_at,
    latest.expires_at,
    latest.last_used_at,
    d.revoked_at
  from public.devices d
  left join lateral (
    select
      c.token_hint,
      c.created_at,
      c.expires_at,
      c.last_used_at
    from private.ingestion_credentials c
    where c.user_id = d.user_id
      and c.device_id = d.id
    order by c.created_at desc, c.id desc
    limit 1
  ) latest on true
  where d.user_id = auth.uid()
    and d.source_system = 'apple_shortcut'
  order by d.created_at desc, d.id desc;
$$;

revoke all on function public.list_ingestion_devices()
from public, anon, authenticated;
grant execute on function public.list_ingestion_devices()
to authenticated;

commit;
