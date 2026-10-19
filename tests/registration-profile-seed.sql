\set ON_ERROR_STOP on
create schema auth;
do $$ begin if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if; end $$;
create table auth.users (id uuid primary key, email text, email_confirmed_at timestamptz);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
create table public.event_attendees (
  id uuid primary key,
  email text,
  name text,
  company text,
  status text,
  meta jsonb,
  created_at timestamptz
);

\ir ../supabase/migrations/20261018140000_registration_profile_seed.sql

insert into auth.users values
  ('11111111-1111-4111-8111-111111111111', 'person@example.test', now()),
  ('22222222-2222-4222-8222-222222222222', 'other@example.test', null);
insert into public.event_attendees values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'person@example.test', 'Old Name', 'Old Company', 'registered', '{"phone":"+216 11111111"}', '2026-01-01'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'PERSON@example.test', 'New Name', 'New Company', 'approved', '{"fullName":"New Name","phone":"+216 22222222","companyName":"New Company","sector":"Finance"}', '2026-10-01'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'person@example.test', 'Cancelled Name', 'Cancelled Company', 'cancelled', '{}', '2026-10-18'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4', 'other@example.test', 'Private Name', 'Private Company', 'registered', '{}', '2026-10-17');

select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', false);
do $$ declare seed jsonb; begin
  seed := public.get_my_registration_profile_seed();
  if seed <> '{"fullName":"New Name","phone":"+216 22222222","companyName":"New Company","sector":"Finance"}'::jsonb then
    raise exception 'incorrect registration seed: %', seed;
  end if;
end $$;
select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', false);
do $$ begin
  if public.get_my_registration_profile_seed() is not null then
    raise exception 'unverified account received registration data';
  end if;
end $$;
select 'registration seed checks passed' as result;
