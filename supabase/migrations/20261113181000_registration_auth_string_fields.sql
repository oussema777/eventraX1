begin;
-- Follow-up to the legacy instance/identity repair: actual GoTrue lookup also
-- requires non-null strings for token and pending-change fields.
alter table public.registration_auth_repairs add column normalized_null_fields text[] not null default '{}';

create or replace function public.ensure_registration_auth_account(p_user_id uuid, p_email text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  account auth.users%rowtype;
  identity_id uuid;
  repaired boolean := false;
  null_fields text[];
begin
  select * into account from auth.users where id = p_user_id for update;
  if not found or p_email is null or btrim(p_email) = ''
     or lower(btrim(account.email)) is distinct from lower(btrim(p_email)) then
    raise exception 'REGISTRATION_AUTH_ACCOUNT_MISMATCH';
  end if;
  if account.deleted_at is not null or account.banned_until > now()
     or account.is_sso_user is distinct from false
     or account.aud is distinct from 'authenticated'
     or account.role is distinct from 'authenticated'
     or (account.instance_id is not null and account.instance_id <> '00000000-0000-0000-0000-000000000000'::uuid) then
    raise exception 'REGISTRATION_AUTH_ACCOUNT_UNAVAILABLE';
  end if;

  if not exists(select 1 from auth.identities where user_id = account.id) then
    -- Only rebuild a verified legacy email identity. Never manufacture consent,
    -- confirm an email, convert an SSO account, or alter a password/provider.
    if account.email_confirmed_at is null
       or account.raw_app_meta_data->>'provider' is distinct from 'email' then
      raise exception 'REGISTRATION_AUTH_IDENTITY_UNAVAILABLE';
    end if;
    if exists(select 1 from auth.users u where u.id <> account.id
        and lower(btrim(u.email)) = lower(btrim(account.email)))
       or exists(select 1 from auth.identities i where i.user_id <> account.id
        and (lower(i.identity_data->>'email') = lower(btrim(account.email))
          or (i.provider = 'email' and i.provider_id = account.id::text))) then
      raise exception 'REGISTRATION_AUTH_IDENTITY_CONFLICT';
    end if;
    insert into auth.identities (user_id, provider_id, provider, identity_data, created_at, updated_at)
    values (account.id, account.id::text, 'email',
      jsonb_build_object('sub', account.id::text, 'email', account.email,
        'email_verified', true, 'phone_verified', false), now(), now())
    returning id into identity_id;
    repaired := true;
  end if;

  if account.instance_id is null then
    update auth.users set instance_id = '00000000-0000-0000-0000-000000000000'
      where id = account.id;
    repaired := true;
  end if;
  -- GoTrue reads these token/change fields as strings, not nullable strings.
  -- Fill missing values only; existing tokens and pending changes stay intact.
  select coalesce(array_agg(k), '{}'::text[]) into null_fields
    from unnest(array['confirmation_token','recovery_token','email_change_token_new',
      'email_change','email_change_token_current','phone_change','phone_change_token',
      'reauthentication_token']) k where to_jsonb(account)->k = 'null'::jsonb;
  if cardinality(null_fields) > 0 then
    update auth.users set
      confirmation_token = coalesce(confirmation_token, ''),
      recovery_token = coalesce(recovery_token, ''),
      email_change_token_new = coalesce(email_change_token_new, ''),
      email_change = coalesce(email_change, ''),
      email_change_token_current = coalesce(email_change_token_current, ''),
      phone_change = coalesce(phone_change, ''),
      phone_change_token = coalesce(phone_change_token, ''),
      reauthentication_token = coalesce(reauthentication_token, '')
    where id = account.id;
    repaired := true;
  end if;
  if repaired then
    insert into public.registration_auth_repairs(user_id, previous_instance_id, created_identity_id, normalized_null_fields)
      values(account.id, account.instance_id, identity_id, null_fields)
      on conflict(user_id) do update set normalized_null_fields = (
        select coalesce(array_agg(distinct field), '{}'::text[]) from unnest(
          public.registration_auth_repairs.normalized_null_fields || excluded.normalized_null_fields
        ) field
      );
  end if;
  return account.id;
end;
$$;
revoke all on function public.ensure_registration_auth_account(uuid,text) from public, anon, authenticated;
grant execute on function public.ensure_registration_auth_account(uuid,text) to service_role;

do $$ declare account record; begin
  for account in select u.id, u.email from auth.users u
    join public.registration_auth_repairs r on r.user_id=u.id
    where u.confirmation_token is null or u.recovery_token is null
      or u.email_change_token_new is null or u.email_change is null
      or u.email_change_token_current is null or u.phone_change is null
      or u.phone_change_token is null or u.reauthentication_token is null
    order by u.id
  loop
    perform public.ensure_registration_auth_account(account.id, account.email);
  end loop;
end $$;
commit;
