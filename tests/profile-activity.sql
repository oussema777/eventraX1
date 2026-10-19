\set ON_ERROR_STOP on
create schema auth;
do $$ begin if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if; end $$;
create table auth.users (id uuid primary key, email text, email_confirmed_at timestamptz);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
create table public.profiles (id uuid primary key);
create table public.event_attendees (id uuid primary key, event_id uuid, profile_id uuid, email text);
create table public.event_checkins (id uuid primary key, attendee_id uuid, type text);
create table public.event_b2b_meetings (id uuid primary key, profile_a_id uuid, profile_b_id uuid, status text);
create table public.b2b_connections (id uuid primary key, profile_a_id uuid, profile_b_id uuid);

\ir ../supabase/migrations/20261018130000_profile_activity_stats.sql

insert into auth.users values
  ('11111111-1111-4111-8111-111111111111', 'target@example.test', now()),
  ('22222222-2222-4222-8222-222222222222', 'viewer@example.test', now());
insert into public.profiles values
  ('11111111-1111-4111-8111-111111111111'),
  ('22222222-2222-4222-8222-222222222222');
insert into public.event_attendees values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', '11111111-1111-4111-8111-111111111111', 'target@example.test'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', '11111111-1111-4111-8111-111111111111', 'target@example.test'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3', null, 'TARGET@example.test'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4', null, 'other@example.test');
insert into public.event_checkins values
  ('cccccccc-cccc-4ccc-8ccc-ccccccccccc1', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'event'),
  ('cccccccc-cccc-4ccc-8ccc-ccccccccccc2', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'event'),
  ('cccccccc-cccc-4ccc-8ccc-ccccccccccc3', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'session'),
  ('cccccccc-cccc-4ccc-8ccc-ccccccccccc4', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'event'),
  ('cccccccc-cccc-4ccc-8ccc-ccccccccccc5', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4', 'event');
insert into public.event_b2b_meetings values
  ('dddddddd-dddd-4ddd-8ddd-ddddddddddd1', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'pending'),
  ('dddddddd-dddd-4ddd-8ddd-ddddddddddd2', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'confirmed'),
  ('dddddddd-dddd-4ddd-8ddd-ddddddddddd3', '22222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111', 'completed');
insert into public.b2b_connections values
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee1', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222');

do $$ declare stats jsonb; begin
  stats := public.get_profile_activity_stats('11111111-1111-4111-8111-111111111111');
  if stats <> '{"eventsAttended":2,"b2bMeetings":2,"connections":1}'::jsonb then
    raise exception 'wrong activity totals: %', stats;
  end if;
end $$;
select 'profile activity checks passed' as result;
