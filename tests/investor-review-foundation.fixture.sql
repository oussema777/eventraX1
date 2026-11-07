-- Synthetic schema ONLY for the disposable database created by the test runner.
-- This is not a production bootstrap or a replacement for a full migration rehearsal.
do $$ begin
  if not exists(select 1 from pg_roles where rolname='anon') then create role anon; end if;
  if not exists(select 1 from pg_roles where rolname='authenticated') then create role authenticated; end if;
  if not exists(select 1 from pg_roles where rolname='service_role') then create role service_role bypassrls; end if;
end; $$;
create schema auth;
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid;
$$;
grant usage on schema auth to authenticated,anon;
grant execute on function auth.uid() to authenticated,anon;
create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);
create table public.profiles(id uuid primary key,role text);
create table public.events(id uuid primary key,name text,owner_id uuid,organizer_id uuid);
create table public.event_attendees(id uuid primary key,event_id uuid,profile_id uuid,status text,email text);
create table public.event_team_members(event_id uuid,user_id uuid,role text,status text);
create table public.event_b2b_meetings(id uuid primary key,event_id uuid,attendee_a_id uuid,attendee_b_id uuid,status text,start_at timestamptz);

-- Same authorization semantics as 20261020120000_event_team_access.sql.
create function public.event_access_role(p_event_id uuid)
returns text language sql stable security definer set search_path='' as $$
  select case when coalesce(e.owner_id,e.organizer_id)=auth.uid() then 'owner'
    when exists(select 1 from public.profiles where id=auth.uid() and role='admin') then 'platform_admin'
    else(select m.role from public.event_team_members m where m.event_id=e.id and m.user_id=auth.uid() and m.status='active') end
  from public.events e where e.id=p_event_id and auth.uid() is not null;
$$;
create function public.event_can(p_event_id uuid,p_permission text)
returns boolean language sql stable security definer set search_path='' as $$
  select coalesce(case when p_permission not in ('read','manage','team','attendees','b2b','checkin') then false
    when public.event_access_role(p_event_id) in ('owner','platform_admin') then true
    when p_permission='team' then false
    when public.event_access_role(p_event_id)='administrator' then true
    when public.event_access_role(p_event_id)='coordinator' then p_permission in ('read','attendees','b2b','checkin')
    when public.event_access_role(p_event_id)='checkin' then p_permission in ('read','checkin') else false end,false);
$$;
alter table public.event_attendees enable row level security;
grant select on public.event_attendees to authenticated;
create policy attendee_self on public.event_attendees for select to authenticated using(profile_id=auth.uid());

insert into auth.users(id,email,email_confirmed_at) select ('10000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,
  'person'||n||'@example.test',now() from generate_series(1,7)n;
insert into profiles select id,'user' from auth.users;
insert into events values('20000000-0000-4000-8000-000000000001','Test event','10000000-0000-4000-8000-000000000001',null),
  ('20000000-0000-4000-8000-000000000002','Other event','10000000-0000-4000-8000-000000000007',null);
insert into event_team_members values
  ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002','coordinator','active'),
  ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000006','checkin','active');
insert into event_attendees select ('30000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,
  '20000000-0000-4000-8000-000000000001',('10000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'approved','person'||n||'@example.test'
  from generate_series(3,5)n;
insert into event_attendees values('30000000-0000-4000-8000-000000000007','20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000007','approved','person7@example.test');

create function public.test_assert(ok boolean,label text) returns void language plpgsql as $$
begin if ok is not true then raise exception 'FAIL: %',label; end if; raise notice 'PASS: %',label; end; $$;
create function public.test_error(statement text,expected_state text,label text) returns void language plpgsql as $$
begin
  begin execute statement;
  exception when others then
    if sqlstate<>expected_state then raise exception 'FAIL: % expected %, got % (%)',label,expected_state,sqlstate,sqlerrm; end if;
    raise notice 'PASS: %',label; return;
  end;
  raise exception 'FAIL: % was allowed',label;
end; $$;
