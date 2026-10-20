-- Event-scoped staff roles. No platform roles or ownership are granted by an invitation.
begin;

create table public.event_team_members (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  email text not null check (email = lower(btrim(email)) and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  user_id uuid references auth.users(id) on delete set null,
  role text not null check (role in ('administrator', 'coordinator', 'checkin')),
  status text not null default 'pending' check (status in ('pending', 'active', 'revoked')),
  invited_by uuid references auth.users(id) on delete set null,
  invited_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  accepted_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(event_id, email)
);
create unique index event_team_active_user on public.event_team_members(event_id, user_id)
  where status = 'active' and user_id is not null;
create index event_team_user_lookup on public.event_team_members(user_id, event_id) where status = 'active';

create table public.event_team_audit (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  member_id uuid not null,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null check (action in ('invited','accepted','role_changed','revoked')),
  email text not null,
  old_role text,
  new_role text,
  created_at timestamptz not null default now()
);
create index event_team_audit_event on public.event_team_audit(event_id, created_at desc);
alter table public.event_team_members enable row level security;
alter table public.event_team_audit enable row level security;
revoke all on public.event_team_members, public.event_team_audit from anon, authenticated;
grant select on public.event_team_members, public.event_team_audit to authenticated;

create or replace function public.event_access_role(p_event_id uuid)
returns text language sql stable security definer set search_path = '' as $$
  select case
    when coalesce(e.owner_id, e.organizer_id) = auth.uid() then 'owner'
    when exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') then 'platform_admin'
    else (select m.role from public.event_team_members m
      where m.event_id = e.id and m.user_id = auth.uid() and m.status = 'active')
  end from public.events e where e.id = p_event_id and auth.uid() is not null;
$$;

create or replace function public.event_can(p_event_id uuid, p_permission text)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(case
    when p_permission not in ('read','manage','team','attendees','b2b','checkin') then false
    when public.event_access_role(p_event_id) in ('owner','platform_admin') then true
    when p_permission = 'team' then false
    when public.event_access_role(p_event_id) = 'administrator' then true
    when public.event_access_role(p_event_id) = 'coordinator' then p_permission in ('read','attendees','b2b','checkin')
    when public.event_access_role(p_event_id) = 'checkin' then p_permission in ('read','checkin')
    else false end, false);
$$;
revoke all on function public.event_access_role(uuid), public.event_can(uuid,text) from public;
grant execute on function public.event_access_role(uuid), public.event_can(uuid,text) to authenticated, anon;

create policy event_team_read on public.event_team_members for select to authenticated
  using (public.event_can(event_id, 'team') or user_id = auth.uid());
create policy event_team_audit_read on public.event_team_audit for select to authenticated
  using (public.event_can(event_id, 'team'));

-- Invitation IDs are not bearer credentials: acceptance requires the current,
-- verified auth.users email, never an editable profile email or a stale JWT claim.
create or replace function public.invite_event_member(p_event_id uuid, p_email text, p_role text)
returns public.event_team_members language plpgsql security definer set search_path = '' as $$
declare member public.event_team_members; normalized text := lower(btrim(p_email));
begin
  perform 1 from public.events where id = p_event_id for update;
  if not public.event_can(p_event_id, 'team') then raise exception 'Not authorized' using errcode='42501'; end if;
  if p_role is null or p_role not in ('administrator','coordinator','checkin') or normalized is null
    or length(normalized) > 254 or normalized !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'Invalid invitation' using errcode='22023';
  end if;
  if exists (select 1 from auth.users u join public.events e on u.id = coalesce(e.owner_id,e.organizer_id)
    where e.id = p_event_id and lower(u.email) = normalized) then
    raise exception 'The owner already has access' using errcode='22023';
  end if;
  select * into member from public.event_team_members where event_id=p_event_id and email=normalized for update;
  if member.status = 'active' then raise exception 'This member already has access' using errcode='23505'; end if;
  -- An accidental retry returns the same pending invitation without extending it.
  if member.status = 'pending' and member.expires_at > now() and member.role = p_role then return member; end if;
  if member.id is null then
    insert into public.event_team_members(event_id,email,role,invited_by)
      values(p_event_id,normalized,p_role,auth.uid()) returning * into member;
  else
    -- Rotate the ID so a revoked or replaced invitation can never be replayed.
    update public.event_team_members set id=gen_random_uuid(), role=p_role, status='pending', user_id=null,
      invited_by=auth.uid(), invited_at=now(), expires_at=now()+interval '7 days', accepted_at=null, updated_at=now()
      where id=member.id returning * into member;
  end if;
  insert into public.event_team_audit(event_id,member_id,actor_id,action,email,new_role)
    values(p_event_id,member.id,auth.uid(),'invited',member.email,member.role);
  return member;
end; $$;

create or replace function public.update_event_member(p_member_id uuid, p_role text default null, p_revoke boolean default false)
returns void language plpgsql security definer set search_path = '' as $$
declare member public.event_team_members;
begin
  select * into member from public.event_team_members where id=p_member_id for update;
  if member.id is null or not public.event_can(member.event_id,'team') then raise exception 'Not authorized' using errcode='42501'; end if;
  if p_revoke then
    if member.status='revoked' then return; end if;
    update public.event_team_members set status='revoked', updated_at=now() where id=member.id;
  else
    if member.status <> 'active' or p_role is null or p_role not in ('administrator','coordinator','checkin') then
      raise exception 'Invalid role change' using errcode='22023';
    end if;
    if member.role=p_role then return; end if;
    update public.event_team_members set role=p_role, updated_at=now() where id=member.id;
  end if;
  insert into public.event_team_audit(event_id,member_id,actor_id,action,email,old_role,new_role)
    values(member.event_id,member.id,auth.uid(),case when p_revoke then 'revoked' else 'role_changed' end,
      member.email,member.role,case when p_revoke then null else p_role end);
end; $$;

create or replace function public.get_event_invitation(p_invitation_id uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare member public.event_team_members;
begin
  select m.* into member from public.event_team_members m join auth.users u
    on u.id=auth.uid() and u.email_confirmed_at is not null and lower(u.email)=m.email
    where m.id=p_invitation_id and m.status in ('pending','active');
  if member.id is null or (member.status='pending' and member.expires_at <= now()) then
    raise exception 'Invitation unavailable for this account' using errcode='42501';
  end if;
  return jsonb_build_object('id',member.id,'event_id',member.event_id,'event_name',
    (select name from public.events where id=member.event_id),'role',member.role,
    'email',member.email,'status',member.status,'expires_at',member.expires_at);
end; $$;

create or replace function public.accept_event_invitation(p_invitation_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare member public.event_team_members;
begin
  select * into member from public.event_team_members where id=p_invitation_id for update;
  perform public.get_event_invitation(p_invitation_id);
  if member.status='active' then
    if member.user_id=auth.uid() then return member.event_id; end if;
    raise exception 'Invitation already accepted' using errcode='42501';
  end if;
  update public.event_team_members set status='active',user_id=auth.uid(),accepted_at=now(),updated_at=now() where id=member.id;
  -- A registration-created account can also become staff, but only after the
  -- owner invited its verified email and the recipient explicitly accepted.
  update auth.users set raw_app_meta_data=coalesce(raw_app_meta_data,'{}'::jsonb)||'{"account_type":"user"}'::jsonb
    where id=auth.uid() and raw_app_meta_data->>'account_type'='event_guest';
  insert into public.event_team_audit(event_id,member_id,actor_id,action,email,new_role)
    values(member.event_id,member.id,auth.uid(),'accepted',member.email,member.role);
  return member.event_id;
end; $$;
revoke all on function public.invite_event_member(uuid,text,text), public.update_event_member(uuid,text,boolean),
  public.get_event_invitation(uuid), public.accept_event_invitation(uuid) from public, anon;
grant execute on function public.invite_event_member(uuid,text,text), public.update_event_member(uuid,text,boolean),
  public.get_event_invitation(uuid), public.accept_event_invitation(uuid) to authenticated;

-- Protect the platform role used by legacy admin policies. A self-editable
-- profile must not be able to turn event staff into platform administrators.
create or replace function public.protect_profile_platform_role()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if auth.role() in ('anon','authenticated') and
    ((tg_op='INSERT' and new.role='admin') or (tg_op='UPDATE' and new.role is distinct from old.role))
    and not exists(select 1 from public.profiles where id=auth.uid() and role='admin') then
    raise exception 'Platform role changes require an administrator' using errcode='42501';
  end if;
  return new;
end; $$;
create trigger protect_profile_platform_role before insert or update on public.profiles
  for each row execute function public.protect_profile_platform_role();

create or replace function public.protect_event_ownership()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if auth.role()='authenticated' and (new.owner_id is distinct from old.owner_id or new.organizer_id is distinct from old.organizer_id)
    and not public.event_can(old.id,'team') then
    raise exception 'Only the owner can change event ownership' using errcode='42501';
  end if;
  return new;
end; $$;
create trigger protect_event_ownership before update on public.events for each row execute function public.protect_event_ownership();

create policy event_team_event_read on public.events for select to authenticated using(public.event_can(id,'read'));
create policy event_team_event_update on public.events for update to authenticated
  using(public.event_can(id,'manage')) with check(public.event_can(id,'manage'));
-- Team members never receive DELETE on events.
create policy event_delete_owner_boundary on public.events as restrictive for delete
  using(public.event_can(id,'team'));

-- Remove permissive legacy write rules before adding role-based policies.
drop policy if exists "Managers can update B2B settings" on public.event_b2b_settings;
drop policy if exists "allow_all_authenticated" on public.event_notification_settings;
create policy event_b2b_settings_public_read on public.event_b2b_settings for select
  using(exists(select 1 from public.events e where e.id=event_id));

do $$
declare tbl text; permission text;
begin
  foreach tbl in array array['event_sessions','event_speakers','event_exhibitors','event_sponsors','event_tickets',
    'event_forms','event_form_submissions','event_sponsorship_inquiries','event_feedback_responses',
    'event_email_templates','event_tracking_links','event_notification_settings','event_b2b_settings',
    'event_b2b_suggestions','event_b2b_meetings','event_attendees','event_attendee_categories','event_registrations']
  loop
    permission := case when tbl in ('event_b2b_settings','event_b2b_suggestions','event_b2b_meetings') then 'b2b'
      when tbl in ('event_attendees','event_attendee_categories','event_registrations') then 'attendees' else 'manage' end;
    execute format('create policy event_team_manage on public.%I for all to authenticated using(public.event_can(event_id,%L)) with check(public.event_can(event_id,%L))',tbl,permission,permission);
  end loop;
end; $$;
create policy event_team_activity_read on public.event_activity_log for select to authenticated using(public.event_can(event_id,'manage'));
create policy event_team_notification_logs_read on public.notification_logs for select to authenticated using(public.event_can(event_id,'manage'));
drop policy if exists "Authenticated users can insert notification logs" on public.notification_logs;
create policy event_team_notification_logs_insert on public.notification_logs for insert to authenticated with check(public.event_can(event_id,'manage'));
create policy event_team_communications on public.event_communications for all to authenticated
  using(public.event_can(event_id,'manage')) with check(public.event_can(event_id,'manage') and (actor_id is null or actor_id=auth.uid()));
create policy event_team_sessions on public.event_attendee_sessions for all to authenticated
  using(exists(select 1 from public.event_attendees a where a.id=attendee_id and public.event_can(a.event_id,'attendees')))
  with check(exists(select 1 from public.event_attendees a join public.event_sessions s on s.id=session_id and s.event_id=a.event_id
    where a.id=attendee_id and public.event_can(a.event_id,'attendees')));

-- Scanner staff can read the information needed for event/session/B2B check-in.
create policy event_team_checkins_read on public.event_checkins for select to authenticated using(public.event_can(event_id,'checkin'));
create policy event_team_checkins_insert on public.event_checkins for insert to authenticated with check(public.event_can(event_id,'checkin'));
create policy event_team_scanner_meetings on public.event_b2b_meetings for select to authenticated using(public.event_can(event_id,'checkin'));
create policy event_team_scanner_attendees on public.event_attendees for select to authenticated using(public.event_can(event_id,'checkin'));
create policy event_team_scanner_attendee_update on public.event_attendees for update to authenticated
  using(public.event_can(event_id,'checkin')) with check(public.event_can(event_id,'checkin'));
create policy event_team_scanner_meeting_update on public.event_b2b_meetings for update to authenticated
  using(public.event_can(event_id,'checkin')) with check(public.event_can(event_id,'checkin'));

create or replace function public.guard_scanner_changes()
returns trigger language plpgsql security definer set search_path = '' as $$
declare allowed boolean;
begin
  if auth.role() <> 'authenticated' then return new; end if;
  if new.event_id is distinct from old.event_id then
    raise exception 'Cannot move attendance or meetings to another event' using errcode='42501';
  end if;
  if tg_table_name='event_attendees' and public.event_access_role(old.event_id)='checkin' then
    if (to_jsonb(new)-array['checked_in','check_in_at','updated_at']) is distinct from
       (to_jsonb(old)-array['checked_in','check_in_at','updated_at']) or new.checked_in is not true then
      raise exception 'Scanner staff can only record attendance' using errcode='42501';
    end if;
  elsif tg_table_name='event_b2b_meetings' and public.event_access_role(old.event_id)='checkin' then
    if (to_jsonb(new)-array['status','updated_at']) is distinct from (to_jsonb(old)-array['status','updated_at'])
      or old.status not in ('confirmed','completed') or new.status <> 'completed' then
      raise exception 'Scanner staff can only complete attended meetings' using errcode='42501';
    end if;
    select exists(select 1 from public.event_checkins c join public.event_attendees a on a.id=c.attendee_id and a.event_id=c.event_id
      where c.event_id=old.event_id and c.meeting_id=old.id and c.type='b2b'
      and (a.id=old.attendee_a_id or a.profile_id=old.profile_a_id))
      and exists(select 1 from public.event_checkins c join public.event_attendees a on a.id=c.attendee_id and a.event_id=c.event_id
      where c.event_id=old.event_id and c.meeting_id=old.id and c.type='b2b'
      and (a.id=old.attendee_b_id or a.profile_id=old.profile_b_id)) into allowed;
    if not allowed then raise exception 'Both participants must be checked in' using errcode='42501'; end if;
  end if;
  return new;
end; $$;
create trigger guard_scanner_attendees before update on public.event_attendees for each row execute function public.guard_scanner_changes();
create trigger guard_scanner_meetings before update on public.event_b2b_meetings for each row execute function public.guard_scanner_changes();

create or replace function public.validate_staff_checkin()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if auth.role() <> 'authenticated' then return new; end if;
  if not public.event_can(new.event_id,'checkin') or not exists(select 1 from public.event_attendees a
    where a.id=new.attendee_id and a.event_id=new.event_id and a.status not in ('cancelled','rejected','waitlisted')) then
    raise exception 'Invalid attendee check-in' using errcode='42501';
  end if;
  if (new.type='event' and (new.session_id is not null or new.meeting_id is not null))
    or (new.type='session' and new.meeting_id is not null)
    or (new.type='b2b' and new.session_id is not null) then
    raise exception 'Check-in references do not match its type' using errcode='42501';
  end if;
  if new.type='session' and not exists(select 1 from public.event_sessions s where s.id=new.session_id and s.event_id=new.event_id) then
    raise exception 'Session belongs to another event' using errcode='42501';
  elsif new.type='b2b' and not exists(select 1 from public.event_b2b_meetings m join public.event_attendees a on a.id=new.attendee_id
    where m.id=new.meeting_id and m.event_id=new.event_id and m.status in ('confirmed','completed')
    and (a.id in (m.attendee_a_id,m.attendee_b_id) or a.profile_id in (m.profile_a_id,m.profile_b_id))) then
    raise exception 'Participant is not assigned to this meeting' using errcode='42501';
  elsif new.type is null or new.type not in ('event','session','b2b') then
    raise exception 'Invalid check-in type' using errcode='22023';
  end if;
  new.actor_id := auth.uid(); new.checked_in_by := auth.uid();
  new.actor_role := public.event_access_role(new.event_id);
  return new;
end; $$;
create trigger validate_staff_checkin before insert on public.event_checkins for each row execute function public.validate_staff_checkin();

-- Old meeting policies allowed any event attendee to edit any other meeting, or
-- to claim organizer_id. Retain attendee reads but require actual participation
-- (or delegated B2B access) for writes. Restrictive policies close all old OR paths.
create or replace function public.event_meeting_participant(p_event uuid, p_a uuid, p_b uuid, p_profile_a uuid, p_profile_b uuid)
returns boolean language sql stable security definer set search_path='' as $$
  select auth.uid() is not null and (auth.uid() in (p_profile_a,p_profile_b) or exists(
    select 1 from public.event_attendees a where a.event_id=p_event and a.id in (p_a,p_b) and a.profile_id=auth.uid()));
$$;
revoke all on function public.event_meeting_participant(uuid,uuid,uuid,uuid,uuid) from public;
grant execute on function public.event_meeting_participant(uuid,uuid,uuid,uuid,uuid) to authenticated, anon;
create policy event_meeting_insert_boundary on public.event_b2b_meetings as restrictive for insert
  with check(public.event_can(event_id,'b2b') or public.event_meeting_participant(event_id,attendee_a_id,attendee_b_id,profile_a_id,profile_b_id));
create policy event_meeting_update_boundary on public.event_b2b_meetings as restrictive for update
  using(public.event_can(event_id,'checkin') or public.event_meeting_participant(event_id,attendee_a_id,attendee_b_id,profile_a_id,profile_b_id))
  with check(public.event_can(event_id,'checkin') or public.event_meeting_participant(event_id,attendee_a_id,attendee_b_id,profile_a_id,profile_b_id));
create policy event_meeting_delete_boundary on public.event_b2b_meetings as restrictive for delete
  using(public.event_can(event_id,'b2b') or public.event_meeting_participant(event_id,attendee_a_id,attendee_b_id,profile_a_id,profile_b_id));

-- Protect previously unguarded legacy event configuration tables too. These
-- tables are not used by current public registration flows. Service jobs retain
-- their existing access; ordinary clients gain event-scoped administrator writes.
do $$
declare tbl text;
begin
  foreach tbl in array array['event_gallery_items','event_publish_actions','event_payment_settings','event_program_rooms',
    'event_badge_designs','event_designs','event_features','event_impacts','event_polls','event_hybrid_meeting_slots',
    'event_organizers','event_promos','event_integrations','event_launch_settings','event_ticket_settings','event_bills',
    'event_form_fields','event_feedback_prompts','event_comments','event_audits','event_meeting_attendance',
    'event_meeting_table_counters','event_session_attendance','event_meeting_reminder_logs','event_meeting_blacklists',
    'event_meeting_requests','event_meeting_slots','event_meeting_slot_indexes','event_meeting_whitelists',
    'event_session_registrations','event_actor_checkins']
  loop
    if to_regclass('public.'||tbl) is not null then
      execute format('alter table public.%I enable row level security',tbl);
      execute format('create policy event_team_legacy_manage on public.%I for all to authenticated using(public.event_can(event_id,''manage'')) with check(public.event_can(event_id,''manage''))',tbl);
    end if;
  end loop;
end; $$;

-- Reuse the existing session reorder implementation with delegated management.
do $$
declare body text;
begin
  select pg_get_functiondef('public.reorder_event_sessions(uuid,uuid[],jsonb)'::regprocedure) into body;
  body := replace(body,
    '(e.owner_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = ''admin''))',
    'public.event_can(e.id, ''manage'')');
  if position('public.event_can(e.id' in body)=0 then raise exception 'Unexpected reorder function; review migration'; end if;
  execute body;
end; $$;
revoke all on function public.protect_profile_platform_role(), public.protect_event_ownership(), public.guard_scanner_changes(), public.validate_staff_checkin() from public, anon, authenticated;
commit;
