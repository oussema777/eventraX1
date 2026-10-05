-- Run only in an empty, disposable PostgreSQL database with psql -v ON_ERROR_STOP=1.
do $$ begin
  if not exists (select from pg_roles where rolname = 'anon') then create role anon; end if;
  if not exists (select from pg_roles where rolname = 'authenticated') then create role authenticated; end if;
  if not exists (select from pg_roles where rolname = 'service_role') then create role service_role; end if;
end $$;
create table events (id uuid primary key);
create table event_sessions (id uuid primary key, event_id uuid references events, type text, status text default 'confirmed');
create table event_attendees (
  id uuid primary key default gen_random_uuid(), event_id uuid references events,
  profile_id uuid, email text, name text, ticket_type text, ticket_color text,
  price numeric, status text, guest_expires_at timestamptz, meta jsonb, checked_in boolean, confirmation_code text,
  unique(event_id, email)
);
create table event_attendee_sessions (
  id uuid primary key default gen_random_uuid(), attendee_id uuid references event_attendees,
  session_id uuid references event_sessions, unique(attendee_id, session_id)
);
\ir ../supabase/migrations/20260929190000_agenda_booking_rules.sql

insert into events values ('00000000-0000-0000-0000-000000000001', 1), ('00000000-0000-0000-0000-000000000002', null);
insert into event_sessions (id, event_id, type, registration_open) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'workshop', true),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'workshop', true),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'training', false),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'panel', true),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'workshop', true);

do $$
declare
  attendee uuid;
  payload jsonb := '{"event_id":"00000000-0000-0000-0000-000000000001", "email":"test@example.test", "name":"Test", "status":"registered"}';
  before_count integer;
begin
  select count(*) into before_count from event_attendees;
  begin
    perform create_event_attendee_with_sessions(payload, array['10000000-0000-0000-0000-000000000003']::uuid[]);
    raise exception 'Closed session was accepted';
  exception when check_violation then
    if sqlerrm <> 'SESSION_REGISTRATION_CLOSED' then raise; end if;
  end;
  if (select count(*) from event_attendees) <> before_count then raise exception 'Failed booking left an attendee behind'; end if;

  begin
    perform create_event_attendee_with_sessions(payload, array['10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002']::uuid[]);
    raise exception 'Workshop limit was bypassed in bulk insert';
  exception when check_violation then
    if sqlerrm <> 'WORKSHOP_SELECTION_LIMIT' then raise; end if;
  end;
  if (select count(*) from event_attendees) <> before_count then raise exception 'Failed bulk booking left an attendee behind'; end if;

  begin
    perform create_event_attendee_with_sessions(payload, array['10000000-0000-0000-0000-000000000005']::uuid[]);
    raise exception 'Cross-event selection was accepted';
  exception when check_violation then
    if sqlerrm <> 'SESSION_EVENT_MISMATCH' then raise; end if;
  end;

  attendee := (create_event_attendee_with_sessions(payload, array[
    '10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000004',
    '10000000-0000-0000-0000-000000000001']::uuid[]) ->> 'id')::uuid;
  if (select count(*) from event_attendee_sessions where attendee_id = attendee) <> 2 then raise exception 'Valid mixed selection failed'; end if;

  begin
    insert into event_attendee_sessions(attendee_id, session_id) values (attendee, '10000000-0000-0000-0000-000000000002');
    raise exception 'Direct insert bypassed workshop limit';
  exception when check_violation then
    if sqlerrm <> 'WORKSHOP_SELECTION_LIMIT' then raise; end if;
  end;

  begin
    update event_attendee_sessions set session_id = '10000000-0000-0000-0000-000000000002'
      where attendee_id = attendee and session_id = '10000000-0000-0000-0000-000000000004';
    raise exception 'Update bypassed workshop limit';
  exception when check_violation then
    if sqlerrm <> 'WORKSHOP_SELECTION_LIMIT' then raise; end if;
  end;

  -- Replace the selected workshop in one statement, preserving unrelated sessions.
  update event_attendee_sessions set session_id = '10000000-0000-0000-0000-000000000002'
    where attendee_id = attendee and session_id = '10000000-0000-0000-0000-000000000001';
  if (select count(*) from event_attendee_sessions where attendee_id = attendee) <> 2
    or not exists (select 1 from event_attendee_sessions where attendee_id = attendee and session_id = '10000000-0000-0000-0000-000000000002')
    or not exists (select 1 from event_attendee_sessions where attendee_id = attendee and session_id = '10000000-0000-0000-0000-000000000004')
    then raise exception 'Workshop replacement did not preserve the selection'; end if;

  update event_sessions set registration_open = false where id = '10000000-0000-0000-0000-000000000001';
  begin
    update event_attendee_sessions set session_id = '10000000-0000-0000-0000-000000000001'
      where attendee_id = attendee and session_id = '10000000-0000-0000-0000-000000000002';
    raise exception 'Replacement with a closed workshop was accepted';
  exception when check_violation then
    if sqlerrm <> 'SESSION_REGISTRATION_CLOSED' then raise; end if;
  end;
  if not exists (select 1 from event_attendee_sessions where attendee_id = attendee and session_id = '10000000-0000-0000-0000-000000000002')
    then raise exception 'Failed replacement lost the original workshop'; end if;
  update event_sessions set registration_open = true where id = '10000000-0000-0000-0000-000000000001';
  update event_attendee_sessions set session_id = '10000000-0000-0000-0000-000000000001'
    where attendee_id = attendee and session_id = '10000000-0000-0000-0000-000000000002';
  update event_sessions set registration_open = false where id = '10000000-0000-0000-0000-000000000001';
  if (select count(*) from event_attendee_sessions where attendee_id = attendee) <> 2 then raise exception 'Closing a session removed existing bookings'; end if;

  -- Remove the limit and reopen: future events can allow multiple workshops.
  update events set workshop_selection_limit = null where id = '00000000-0000-0000-0000-000000000001';
  update event_sessions set registration_open = true where id = '10000000-0000-0000-0000-000000000001';
  perform create_event_attendee_with_sessions(payload || '{"email":"unlimited@example.test"}', array['10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002']::uuid[]);
  perform create_event_attendee_with_sessions(payload || '{"email":"none@example.test"}', '{}'::uuid[]);
end;
$$;
select 'Agenda booking database checks passed' as result;
