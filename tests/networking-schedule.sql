-- Run only against an empty disposable LOCAL database, with psql -v ON_ERROR_STOP=1.
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role; end if;
end $$;
create schema auth;
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
grant usage on schema auth to authenticated;
grant execute on function auth.uid() to authenticated;
create table public.events (id uuid primary key, timezone text);
create table public.profiles (id uuid primary key, b2b_profile jsonb);
create table public.event_attendees (id uuid primary key default gen_random_uuid(), event_id uuid, profile_id uuid, status text, meta jsonb);
create table public.event_b2b_settings (event_id uuid primary key references events, venue_config jsonb);
create table public.event_b2b_meetings (
  id uuid primary key default gen_random_uuid(), event_id uuid references events,
  profile_a_id uuid references profiles, profile_b_id uuid references profiles,
  start_at timestamptz, end_at timestamptz, status text, location text, meta jsonb
);
\ir ../supabase/migrations/20261018120000_networking_schedule_rules.sql
insert into events values ('769d7854-9bae-49e6-9db9-c88c0586a402', 'Africa/Tunis'), ('00000000-0000-0000-0000-000000000002', 'Africa/Tunis');
insert into profiles select lpad(n::text, 32, '1')::uuid, '{}' from generate_series(1, 8) n;
insert into event_attendees(event_id, profile_id, status, meta)
  select e.id, p.id, 'approved', '{"b2bOptIn":true}' from events e cross join profiles p;
insert into event_b2b_settings select id, '{"tableCount":1,"slotDuration":30,"schedules":[{"date":"2026-11-20","start":"14:00","end":"17:00"}]}' from events;

create function test_meeting(n integer, a integer, b integer, at_time timestamptz default '2026-11-20T13:00:00Z',
  event uuid default '769d7854-9bae-49e6-9db9-c88c0586a402', format text default 'in-person') returns void language sql as $$
  insert into event_b2b_meetings(id, event_id, profile_a_id, profile_b_id, start_at, end_at, status, location, meta)
  values(lpad(n::text,32,'0')::uuid, event, lpad(a::text,32,'1')::uuid, lpad(b::text,32,'1')::uuid,
    at_time, at_time + interval '30 minutes', 'pending', 'Table-01', jsonb_build_object('meeting_format',format,'meeting_type',format));
$$;
create function expect_b2b_error(statement text, expected text) returns void language plpgsql as $$
begin
  begin execute statement;
  exception when check_violation then
    if sqlerrm <> expected then raise exception 'Expected %, got %', expected, sqlerrm; end if;
    return;
  end;
  raise exception 'Expected rejection: %', expected;
end; $$;

-- Pending requests hold neither participant time nor tables.
select test_meeting(1,1,2), test_meeting(2,1,3), test_meeting(3,4,5);
select expect_b2b_error('select test_meeting(4,2,1)', 'B2B_DUPLICATE_REQUEST');
update event_b2b_meetings set status='confirmed' where id=lpad('1',32,'0')::uuid;
select expect_b2b_error($q$update event_b2b_meetings set status='confirmed' where id=lpad('2',32,'0')::uuid$q$, 'B2B_PARTICIPANT_BUSY');
select expect_b2b_error($q$update event_b2b_meetings set status='confirmed' where id=lpad('3',32,'0')::uuid$q$, 'B2B_VENUE_FULL');
-- Cancelling releases the resource, without moving the meeting first.
update event_b2b_meetings set status='cancelled' where id=lpad('1',32,'0')::uuid;
update event_b2b_meetings set status='confirmed' where id=lpad('3',32,'0')::uuid;
update event_b2b_meetings set status='cancelled';

-- Declared availability: missing row = all slots; [] = no slots.
insert into event_b2b_availability values ('769d7854-9bae-49e6-9db9-c88c0586a402',lpad('1',32,'1')::uuid,array['2026-11-20T13:30:00Z']::timestamptz[]);
select expect_b2b_error('select test_meeting(5,1,3)', 'B2B_PARTICIPANT_UNAVAILABLE');
select test_meeting(6,1,3,'2026-11-20T13:30:00Z');
insert into event_b2b_availability values ('769d7854-9bae-49e6-9db9-c88c0586a402',lpad('3',32,'1')::uuid,'{}');
select expect_b2b_error($q$update event_b2b_meetings set status='confirmed' where id=lpad('6',32,'0')::uuid$q$, 'B2B_PARTICIPANT_UNAVAILABLE');
delete from event_b2b_availability;
update event_b2b_meetings set status='cancelled';

-- Format restriction is event-specific; schedule, registration and opt-in are enforced server-side.
select expect_b2b_error($q$select test_meeting(7,1,2,'2026-11-20T13:00Z','769d7854-9bae-49e6-9db9-c88c0586a402','video')$q$, 'B2B_FORMAT_NOT_ALLOWED');
select test_meeting(8,1,2,'2026-11-20T13:00Z','00000000-0000-0000-0000-000000000002','video');
select expect_b2b_error($q$select test_meeting(9,1,3,'2026-11-20T13:15Z')$q$, 'B2B_SLOT_OUTSIDE_SCHEDULE');
select expect_b2b_error($q$select test_meeting(9,1,3,'2026-11-20T16:00Z')$q$, 'B2B_SLOT_OUTSIDE_SCHEDULE');
update profiles set b2b_profile='{"enabled":false}' where id=lpad('3',32,'1')::uuid;
select expect_b2b_error('select test_meeting(9,1,3)', 'B2B_PARTICIPANT_INELIGIBLE');
update profiles set b2b_profile='{}';
update event_attendees set meta='{"b2bOptIn":false}' where profile_id=lpad('3',32,'1')::uuid;
select expect_b2b_error('select test_meeting(9,1,3)', 'B2B_PARTICIPANT_INELIGIBLE');
update event_attendees set meta='{"b2bOptIn":true}';

-- Overlap includes meetings in other events, and intervals are half-open.
update event_b2b_meetings set status='confirmed' where id=lpad('8',32,'0')::uuid;
select expect_b2b_error('select test_meeting(10,1,3)', 'B2B_PARTICIPANT_BUSY');
select test_meeting(11,1,3,'2026-11-20T13:30Z');
update event_b2b_meetings set status='cancelled';
-- Two confirmed physical meetings receive distinct tables even if both requested Table-01.
update event_b2b_settings set venue_config=jsonb_set(venue_config,'{tableCount}','2');
select test_meeting(12,1,2), test_meeting(13,4,5);
update event_b2b_meetings set status='confirmed' where id in (lpad('12',32,'0')::uuid,lpad('13',32,'0')::uuid);
do $$ begin
  if (select count(distinct location) from event_b2b_meetings where status='confirmed') <> 2 then raise exception 'Duplicate table allocation'; end if;
end $$;
update event_b2b_meetings set status='cancelled';

-- RLS: own availability only; active B2B event participants may read availability, outsiders cannot.
set role authenticated;
select set_config('request.jwt.claim.sub',lpad('1',32,'1'),false);
insert into event_b2b_availability values ('769d7854-9bae-49e6-9db9-c88c0586a402',lpad('1',32,'1')::uuid,'{}');
do $$ begin
  begin
    insert into event_b2b_availability values ('769d7854-9bae-49e6-9db9-c88c0586a402',lpad('2',32,'1')::uuid,'{}');
    raise exception 'Wrote another participant availability';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','99999999-9999-4999-8999-999999999999',false);
do $$ begin
  if (select count(*) from event_b2b_availability) <> 0 then raise exception 'Outsider read availability'; end if;
end $$;
reset role;
delete from event_b2b_availability;
-- Leave a clean event for concurrent confirmation checks.
delete from event_b2b_meetings;
update event_b2b_settings set venue_config=jsonb_set(venue_config,'{tableCount}','1');
select test_meeting(101,1,2), test_meeting(102,1,3), test_meeting(103,4,5);
select 'NETWORKING SQL CHECKS PASSED' as result;
