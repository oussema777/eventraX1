-- Prepared for deployment; validate locally before applying to a hosted project.
begin;

create table if not exists public.event_b2b_availability (
  event_id uuid not null references public.events(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  -- No row means all organizer slots; an empty array explicitly means unavailable.
  available_slots timestamptz[] not null default '{}',
  primary key (event_id, profile_id),
  check (array_position(available_slots, null) is null),
  check (cardinality(available_slots) <= 10000)
);

create or replace function public.b2b_event_eligible(p_event uuid, p_profile uuid)
returns boolean language sql stable security definer set search_path = pg_catalog, public as $$
  select exists (
    select 1 from public.event_attendees a join public.profiles p on p.id = a.profile_id
    where a.event_id = p_event and a.profile_id = p_profile
      and a.status in ('registered', 'approved') and a.meta->>'b2bOptIn' = 'true'
      and coalesce(p.b2b_profile->>'enabled', 'true') <> 'false'
  );
$$;
revoke all on function public.b2b_event_eligible(uuid, uuid) from public;
grant execute on function public.b2b_event_eligible(uuid, uuid) to authenticated;

alter table public.event_b2b_availability enable row level security;
create policy b2b_availability_read on public.event_b2b_availability for select to authenticated
  using (public.b2b_event_eligible(event_id, auth.uid()));
create policy b2b_availability_insert on public.event_b2b_availability for insert to authenticated
  with check (profile_id = auth.uid() and public.b2b_event_eligible(event_id, auth.uid()));
create policy b2b_availability_update on public.event_b2b_availability for update to authenticated
  using (profile_id = auth.uid() and public.b2b_event_eligible(event_id, auth.uid()))
  with check (profile_id = auth.uid() and public.b2b_event_eligible(event_id, auth.uid()));
create policy b2b_availability_delete on public.event_b2b_availability for delete to authenticated
  using (profile_id = auth.uid());
grant select, insert, update, delete on public.event_b2b_availability to authenticated;
grant all on public.event_b2b_availability to service_role;

create or replace function public.b2b_slot_valid(p_event uuid, p_start timestamptz, p_end timestamptz)
returns boolean language plpgsql stable security definer set search_path = pg_catalog, public as $$
declare
  venue jsonb;
  zone text;
  local_start timestamp;
  block jsonb;
  block_start timestamp;
  block_end timestamp;
  duration integer;
begin
  select s.venue_config, coalesce(s.venue_config->>'timeZone', e.timezone,
    case when e.id = '769d7854-9bae-49e6-9db9-c88c0586a402' then 'Africa/Tunis' else 'UTC' end)
    into venue, zone from public.events e left join public.event_b2b_settings s on s.event_id = e.id
    where e.id = p_event;
  if not exists (select 1 from pg_timezone_names where name = zone) then
    zone := case when p_event = '769d7854-9bae-49e6-9db9-c88c0586a402' then 'Africa/Tunis' else 'UTC' end;
  end if;
  duration := coalesce((venue->>'slotDuration')::integer, 30);
  if duration < 1 or duration > 1440 or p_end <> p_start + make_interval(mins => duration) then return false; end if;
  local_start := p_start at time zone zone;
  for block in select value from jsonb_array_elements(coalesce(venue->'schedules', '[]')) loop
    block_start := (block->>'date')::date + (block->>'start')::time;
    block_end := (block->>'date')::date + (block->>'end')::time;
    if local_start >= block_start and local_start + make_interval(mins => duration) <= block_end
      and mod(extract(epoch from local_start - block_start)::numeric, duration * 60) = 0 then
      return true;
    end if;
  end loop;
  return false;
exception when invalid_text_representation or datetime_field_overflow then return false;
end;
$$;
revoke all on function public.b2b_slot_valid(uuid, timestamptz, timestamptz) from public;

create or replace function public.validate_b2b_availability()
returns trigger language plpgsql security definer set search_path = pg_catalog, public as $$
declare slot timestamptz; duration integer;
begin
  perform 1 from public.events where id = new.event_id for update;
  select coalesce((venue_config->>'slotDuration')::integer, 30) into duration
    from public.event_b2b_settings where event_id = new.event_id;
  duration := coalesce(duration, 30);
  new.available_slots := array(select distinct v from unnest(new.available_slots) v order by v);
  foreach slot in array new.available_slots loop
    if not public.b2b_slot_valid(new.event_id, slot, slot + make_interval(mins => duration)) then
      raise exception 'B2B_SLOT_OUTSIDE_SCHEDULE' using errcode = '23514';
    end if;
  end loop;
  return new;
end;
$$;
create trigger validate_b2b_availability before insert or update on public.event_b2b_availability
  for each row execute function public.validate_b2b_availability();

create or replace function public.enforce_b2b_meeting_schedule()
returns trigger language plpgsql security definer set search_path = pg_catalog, public as $$
declare
  venue jsonb;
  format text;
  table_count integer;
  table_number integer;
  prefix text;
begin
  -- Cancellations and unscheduled organizer matches reserve no resources.
  if new.status not in ('pending', 'confirmed') then return new; end if;
  if new.start_at is null then
    if new.status = 'confirmed' then raise exception 'B2B_INVALID_INTERVAL' using errcode = '23514'; end if;
    return new;
  end if;
  if new.end_at is null or new.end_at <= new.start_at then
    raise exception 'B2B_INVALID_INTERVAL' using errcode = '23514';
  end if;
  if tg_op = 'UPDATE' and new.status = old.status
    and new.event_id is not distinct from old.event_id
    and new.start_at is not distinct from old.start_at and new.end_at is not distinct from old.end_at
    and new.profile_a_id is not distinct from old.profile_a_id and new.profile_b_id is not distinct from old.profile_b_id
    and new.location is not distinct from old.location
    and new.meta->>'meeting_format' is not distinct from old.meta->>'meeting_format'
    and new.meta->>'meeting_type' is not distinct from old.meta->>'meeting_type' then return new; end if;

  -- Serialize capacity per event and participant conflicts across events.
  perform 1 from public.events where id = new.event_id for update;
  perform id from public.profiles where id in (new.profile_a_id, new.profile_b_id) order by id for update;
  if new.profile_a_id is null or new.profile_b_id is null or new.profile_a_id = new.profile_b_id
    or not public.b2b_event_eligible(new.event_id, new.profile_a_id)
    or not public.b2b_event_eligible(new.event_id, new.profile_b_id) then
    raise exception 'B2B_PARTICIPANT_INELIGIBLE' using errcode = '23514';
  end if;
  select venue_config into venue from public.event_b2b_settings where event_id = new.event_id;
  format := coalesce(new.meta->>'meeting_format', new.meta->>'meeting_type', 'in-person');
  if format not in ('video', 'in-person', 'hybrid')
    or (new.event_id = '769d7854-9bae-49e6-9db9-c88c0586a402' and format <> 'in-person')
    or (jsonb_array_length(coalesce(venue->'allowedMeetingFormats', '[]')) > 0
        and not venue->'allowedMeetingFormats' ? format) then
    raise exception 'B2B_FORMAT_NOT_ALLOWED' using errcode = '23514';
  end if;
  if format <> 'video' and not public.b2b_slot_valid(new.event_id, new.start_at, new.end_at) then
    raise exception 'B2B_SLOT_OUTSIDE_SCHEDULE' using errcode = '23514';
  end if;
  if exists (select 1 from public.event_b2b_availability a where a.event_id = new.event_id
    and a.profile_id in (new.profile_a_id, new.profile_b_id) and not new.start_at = any(a.available_slots)) then
    raise exception 'B2B_PARTICIPANT_UNAVAILABLE' using errcode = '23514';
  end if;
  if exists (select 1 from public.event_b2b_meetings m where m.id is distinct from new.id
    and m.status = 'confirmed' and m.start_at < new.end_at and m.end_at > new.start_at
    and (m.profile_a_id in (new.profile_a_id, new.profile_b_id) or m.profile_b_id in (new.profile_a_id, new.profile_b_id))) then
    raise exception 'B2B_PARTICIPANT_BUSY' using errcode = '23514';
  end if;
  if exists (select 1 from public.event_b2b_meetings m where m.id is distinct from new.id
    and m.event_id = new.event_id and m.status = 'pending' and m.start_at < new.end_at and m.end_at > new.start_at
    and ((m.profile_a_id = new.profile_a_id and m.profile_b_id = new.profile_b_id)
      or (m.profile_a_id = new.profile_b_id and m.profile_b_id = new.profile_a_id))) then
    raise exception 'B2B_DUPLICATE_REQUEST' using errcode = '23514';
  end if;
  if new.status = 'confirmed' and format <> 'video' then
    table_count := greatest(1, coalesce((venue->>'tableCount')::integer, 10));
    prefix := coalesce(venue->>'tablePrefix', 'Table-');
    if (select count(*) from public.event_b2b_meetings m where m.id is distinct from new.id
      and m.event_id = new.event_id and m.status = 'confirmed'
      and coalesce(m.meta->>'meeting_format', m.meta->>'meeting_type', 'in-person') <> 'video'
      and m.start_at < new.end_at and m.end_at > new.start_at) >= table_count then
      raise exception 'B2B_VENUE_FULL' using errcode = '23514';
    end if;
    select n into table_number from generate_series(1, table_count) n where not exists (
      select 1 from public.event_b2b_meetings m where m.id is distinct from new.id
        and m.event_id = new.event_id and m.status = 'confirmed'
        and coalesce(m.meta->>'meeting_format', m.meta->>'meeting_type', 'in-person') <> 'video'
        and m.start_at < new.end_at and m.end_at > new.start_at
        and substring(m.location from '([0-9]+)$')::integer = n
    ) order by n limit 1;
    if table_number is null then raise exception 'B2B_VENUE_FULL' using errcode = '23514'; end if;
    -- Pending requests do not own a table. Allocate one atomically on confirmation.
    new.location := prefix || lpad(table_number::text, greatest(2, length(table_number::text)), '0');
  end if;
  return new;
end;
$$;
create trigger enforce_b2b_meeting_schedule before insert or update on public.event_b2b_meetings
  for each row execute function public.enforce_b2b_meeting_schedule();

-- Scope the organizer's requested restriction without changing other events.
update public.event_b2b_settings set venue_config = coalesce(venue_config, '{}'::jsonb)
  || '{"allowedMeetingFormats":["in-person"]}'::jsonb
  where event_id = '769d7854-9bae-49e6-9db9-c88c0586a402';
commit;
