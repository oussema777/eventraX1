-- Extend the synthetic schema with the columns consumed by real scheduling.
alter table public.events add column timezone text default 'UTC';
alter table public.profiles add column b2b_profile jsonb default '{}';
alter table public.profiles add column full_name text default 'Test Person';
alter table public.profiles add column job_title text default 'Founder';
alter table public.profiles add column company text default 'Test Company';
alter table public.profiles add column industry text default 'Technology';
alter table public.profiles add column sector text;
alter table public.event_attendees add column meta jsonb default '{"b2bOptIn":true}';
alter table public.event_b2b_meetings add column profile_a_id uuid references public.profiles(id);
alter table public.event_b2b_meetings add column profile_b_id uuid references public.profiles(id);
alter table public.event_b2b_meetings add column organizer_id uuid;
alter table public.event_b2b_meetings add column end_at timestamptz;
alter table public.event_b2b_meetings add column location text;
alter table public.event_b2b_meetings add column meta jsonb;
alter table public.event_b2b_meetings alter column id set default gen_random_uuid();
create table public.event_b2b_settings(event_id uuid primary key references public.events(id),venue_config jsonb);
alter table public.event_b2b_meetings enable row level security;
grant select,insert,update,delete on public.event_b2b_meetings to authenticated;
-- Reproduce permissive legacy reads/writes to verify the new boundary independently.
create policy legacy_meetings on public.event_b2b_meetings to authenticated using(true) with check(true);
insert into public.event_b2b_settings(event_id,venue_config) select id,
  jsonb_build_object('timeZone','UTC','slotDuration',30,'tableCount',2,'allowedMeetingFormats',jsonb_build_array('in-person','video'),
  'schedules',jsonb_build_array(jsonb_build_object('date',(current_date+1)::text,'start','09:00','end','18:00'))) from public.events;
