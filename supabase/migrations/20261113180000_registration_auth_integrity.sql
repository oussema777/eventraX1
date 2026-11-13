begin;

-- Keep existing user IDs and all participant relationships. This ledger contains
-- no credentials and is inaccessible to browser roles.
create table public.registration_auth_repairs (
  user_id uuid primary key,
  previous_instance_id uuid,
  created_identity_id uuid,
  repaired_at timestamptz not null default now()
);
alter table public.registration_auth_repairs enable row level security;
revoke all on public.registration_auth_repairs from public, anon, authenticated;

-- Registration may only repair the account whose AUTH email matches the
-- supplied address. A matching editable public profile is not proof of identity.
create or replace function public.ensure_registration_auth_account(p_user_id uuid, p_email text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  account auth.users%rowtype;
  identity_id uuid;
  repaired boolean := false;
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
  if repaired then
    insert into public.registration_auth_repairs(user_id, previous_instance_id, created_identity_id)
      values(account.id, account.instance_id, identity_id)
      on conflict(user_id) do nothing;
  end if;
  return account.id;
end;
$$;
revoke all on function public.ensure_registration_auth_account(uuid,text) from public, anon, authenticated;
grant execute on function public.ensure_registration_auth_account(uuid,text) to service_role;

-- Repair the verified email-account defect across the platform, not just the
-- currently reported event. Exceptions abort the transaction, never half-repair.
do $$ declare account record; begin
  for account in
    select u.id, u.email from auth.users u
    where u.instance_id is null and u.aud = 'authenticated' and u.role = 'authenticated'
      and u.is_sso_user = false and u.deleted_at is null
      and (u.banned_until is null or u.banned_until <= now())
      and u.email_confirmed_at is not null and btrim(u.email) <> ''
      and u.raw_app_meta_data->>'provider' = 'email'
      and not exists(select 1 from auth.identities i where i.user_id = u.id)
    order by u.id
  loop
    perform public.ensure_registration_auth_account(account.id, account.email);
  end loop;
end $$;
commit;
