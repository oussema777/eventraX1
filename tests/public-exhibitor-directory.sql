-- Run with psql in a disposable empty local database with anon and authenticated roles.
\set ON_ERROR_STOP on
create table public.events (id uuid primary key, status text, visibility text, is_public boolean);
create table public.event_exhibitors (
  id uuid primary key default gen_random_uuid(), event_id uuid references public.events,
  company_name text, logo_url text, category text, industry text, description text, website_url text,
  booth_number text, booth_hall text, booth_location text, contact_email text, contact_phone text,
  status text default 'pending', profile_status text default 'incomplete', notes text
);
\ir ../supabase/migrations/20261123160000_public_exhibitor_directory.sql

insert into public.events values
  ('00000000-0000-4000-8000-000000000001', 'published', 'public', true),
  ('00000000-0000-4000-8000-000000000002', 'draft', 'public', true),
  ('00000000-0000-4000-8000-000000000003', 'published', 'private', false),
  ('00000000-0000-4000-8000-000000000004', 'published', 'link_only', true);
insert into public.event_exhibitors (event_id,company_name,status,profile_status,directory_listed,contact_email,notes)
select e.id, x.name, x.status, x.profile_status, x.listed, 'team@example.test', 'internal'
from public.events e cross join (values
  ('Unlisted', 'pending', 'incomplete', false), ('Listed', 'pending', 'incomplete', true),
  ('Confirmed', 'confirmed', 'complete', false), ('Declined', 'declined', 'complete', true),
  ('Draft profile', 'pending', 'pending', true)
) as x(name,status,profile_status,listed);

set role anon;
do $$
declare rows text[]; result jsonb;
begin
  select array_agg(company_name order by company_name) into rows
  from public.list_public_event_exhibitors('00000000-0000-4000-8000-000000000001');
  if rows is distinct from array['Confirmed','Listed'] then raise exception 'Unexpected public roster %',rows; end if;
  select to_jsonb(x) into result from public.list_public_event_exhibitors('00000000-0000-4000-8000-000000000001') x where company_name='Listed';
  if result ? 'notes' or result->>'contact_email' is not null then raise exception 'Private field in directory'; end if;
  if exists (select from public.list_public_event_exhibitors('00000000-0000-4000-8000-000000000002'))
    or exists (select from public.list_public_event_exhibitors('00000000-0000-4000-8000-000000000003'))
    then raise exception 'Nonpublic event in directory'; end if;
  if (select count(*) from public.list_public_event_exhibitors('00000000-0000-4000-8000-000000000004')) <> 2
    then raise exception 'Published link-only event missing'; end if;
  if has_table_privilege('anon','public.event_exhibitors','select') then raise exception 'Unexpected base table grant'; end if;
end $$;
set role authenticated;
do $$ begin
  if (select count(*) from public.list_public_event_exhibitors('00000000-0000-4000-8000-000000000001')) <> 2
    then raise exception 'Signed-in public directory differs'; end if;
end $$;
reset role;
