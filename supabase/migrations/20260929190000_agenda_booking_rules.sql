-- Defaults preserve existing events: sessions open, workshop count unlimited.
alter table public.events
  add column if not exists workshop_selection_limit integer
  check (workshop_selection_limit is null or workshop_selection_limit > 0);
alter table public.event_sessions
  add column if not exists registration_open boolean not null default true;

-- Enforce every write path, including the public fallback and admin additions.
-- Existing bookings remain untouched when an organizer changes the settings.
create or replace function public.enforce_session_booking_rules()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  attendee_event uuid;
  session_event uuid;
  session_open boolean;
  session_status text;
  session_type text;
  workshop_limit integer;
  workshop_count integer;
begin
  if tg_op = 'UPDATE' then
    if new.attendee_id = old.attendee_id and new.session_id = old.session_id then
      return new;
    end if;
  end if;

  -- Serialize simultaneous choices by the same attendee.
  select event_id into attendee_event from public.event_attendees
    where id = new.attendee_id for update;
  if not found then
    raise exception 'SESSION_ATTENDEE_NOT_FOUND' using errcode = '23503';
  end if;

  select s.event_id, s.registration_open, s.status, s.type, e.workshop_selection_limit
    into session_event, session_open, session_status, session_type, workshop_limit
    from public.event_sessions s join public.events e on e.id = s.event_id
    where s.id = new.session_id for share of s, e;
  if not found or session_event <> attendee_event then
    raise exception 'SESSION_EVENT_MISMATCH' using errcode = '23514';
  end if;
  if not session_open or session_status = 'cancelled' then
    raise exception 'SESSION_REGISTRATION_CLOSED' using errcode = '23514';
  end if;

  if session_type = 'workshop' and workshop_limit is not null then
    select count(*) into workshop_count
      from public.event_attendee_sessions a
      join public.event_sessions s on s.id = a.session_id
      where a.attendee_id = new.attendee_id and s.type = 'workshop'
        and a.id is distinct from new.id;
    if workshop_count >= workshop_limit then
      raise exception 'WORKSHOP_SELECTION_LIMIT' using errcode = '23514';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_session_booking_rules on public.event_attendee_sessions;
create trigger enforce_session_booking_rules
  before insert or update on public.event_attendee_sessions
  for each row execute function public.enforce_session_booking_rules();
revoke all on function public.enforce_session_booking_rules() from public;

-- One transaction prevents a failed session booking from leaving a successful
-- event registration behind. SECURITY INVOKER preserves existing table RLS.
create or replace function public.create_event_attendee_with_sessions(
  p_attendee jsonb, p_session_ids uuid[] default '{}'
)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  payload public.event_attendees;
  attendee_id uuid;
begin
  payload := jsonb_populate_record(null::public.event_attendees, p_attendee);
  insert into public.event_attendees (
    event_id, profile_id, email, name, ticket_type, ticket_color,
    price, status, guest_expires_at, meta, checked_in, confirmation_code
  ) values (
    payload.event_id, payload.profile_id, payload.email, payload.name,
    payload.ticket_type, payload.ticket_color, payload.price,
    payload.status, payload.guest_expires_at, payload.meta, coalesce(payload.checked_in, false),
    coalesce(payload.confirmation_code, payload.meta->>'confirmation_code', payload.meta->>'confirmationCode')
  ) returning id into attendee_id;

  insert into public.event_attendee_sessions (attendee_id, session_id)
    select attendee_id, session_id from (
      select distinct unnest(coalesce(p_session_ids, '{}'::uuid[])) as session_id
    ) choices;
  return jsonb_build_object('id', attendee_id);
end;
$$;
revoke all on function public.create_event_attendee_with_sessions(jsonb, uuid[]) from public;
grant execute on function public.create_event_attendee_with_sessions(jsonb, uuid[]) to anon, authenticated, service_role;
