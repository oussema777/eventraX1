-- Foundation only. The release lock intentionally stays closed until booking,
-- review, delivery and existing-invitation migration pass their release gates.
begin;

-- Composite references also prevent a later attendee edit moving a protected
-- registration into another event behind the designation/request records.
create unique index event_attendees_id_event_review_key on public.event_attendees(id,event_id);

create table public.event_review_release (
  singleton boolean primary key default true check (singleton),
  ready boolean not null default false
);
insert into public.event_review_release(singleton,ready) values(true,false);

create table public.event_review_policies (
  event_id uuid primary key references public.events(id) on delete cascade,
  enabled boolean not null default false,
  version integer not null default 1 check (version > 0),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table public.event_review_permissions (
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  can_designate boolean not null default false,
  can_review boolean not null default false,
  assigned_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key(event_id,user_id)
);

-- Keep the registration reference for its entire lifecycle. An attendee cannot
-- be hard-deleted while it anchors a designation; removal is an explicit action.
create table public.event_investor_designations (
  event_id uuid not null references public.events(id) on delete cascade,
  attendee_id uuid not null references public.event_attendees(id) on delete restrict,
  active boolean not null default true,
  source text not null check (source in ('manual','invitation')),
  assigned_by uuid references auth.users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  removed_by uuid references auth.users(id) on delete set null,
  removed_at timestamptz,
  primary key(event_id,attendee_id),
  foreign key(attendee_id,event_id) references public.event_attendees(id,event_id) on delete restrict,
  check (active = (removed_at is null))
);

create table public.event_investor_invitations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  email text not null check(email=lower(btrim(email)) and length(email)<=254
    and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  token_digest text not null unique,
  status text not null default 'pending' check(status in ('pending','accepted','revoked')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null check(expires_at>created_at),
  accepted_by uuid references auth.users(id) on delete set null,
  accepted_attendee_id uuid references public.event_attendees(id) on delete restrict,
  accepted_at timestamptz,
  revoked_at timestamptz,
  foreign key(accepted_attendee_id,event_id) references public.event_attendees(id,event_id) on delete restrict,
  check (status<>'accepted' or (accepted_at is not null and accepted_attendee_id is not null)),
  check (status<>'revoked' or revoked_at is not null)
);
create unique index event_investor_one_pending_email on public.event_investor_invitations(event_id,email) where status='pending';
create index event_investor_invitation_account on public.event_investor_invitations(email,event_id) where status='pending';

create table public.event_review_audit (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  subject_id uuid,
  details jsonb not null default '{}' check(jsonb_typeof(details)='object'),
  created_at timestamptz not null default now()
);
create index event_review_audit_event on public.event_review_audit(event_id,created_at desc,id);

-- Private storage: do not put awaiting-review payloads into event_b2b_meetings.
create table public.event_booking_requests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  requester_id uuid references auth.users(id) on delete set null,
  recipient_id uuid references auth.users(id) on delete set null,
  requester_attendee_id uuid not null references public.event_attendees(id) on delete restrict,
  recipient_attendee_id uuid not null references public.event_attendees(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null check(ends_at>starts_at),
  format text not null check(format in ('in-person','video','hybrid')),
  message text not null default '' check(length(message)<=4000),
  state text not null default 'awaiting_review' check(state in
    ('awaiting_review','needs_new_slot','rejected','withdrawn','expired','forwarded')),
  revision integer not null default 1 check(revision>0),
  policy_version integer not null check(policy_version>0),
  submission_key uuid not null,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  requester_reason text check(length(requester_reason)<=2000),
  meeting_id uuid unique references public.event_b2b_meetings(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check(requester_attendee_id<>recipient_attendee_id),
  check(requester_id is null or recipient_id is null or requester_id<>recipient_id),
  check(state<>'forwarded' or meeting_id is not null),
  foreign key(requester_attendee_id,event_id) references public.event_attendees(id,event_id) on delete restrict,
  foreign key(recipient_attendee_id,event_id) references public.event_attendees(id,event_id) on delete restrict,
  unique(id,event_id),
  unique(event_id,requester_id,submission_key)
);
create index event_booking_review_queue on public.event_booking_requests(event_id,state,created_at,id);
create index event_booking_requester on public.event_booking_requests(requester_id,created_at desc,id);
create unique index event_booking_one_active_pair_slot on public.event_booking_requests
  (event_id,least(requester_attendee_id,recipient_attendee_id),greatest(requester_attendee_id,recipient_attendee_id),starts_at)
  where state in ('awaiting_review','needs_new_slot');

create table public.event_booking_review_notes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.event_booking_requests(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  body text not null check(length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);

create table public.event_review_outbox (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  request_id uuid references public.event_booking_requests(id) on delete cascade,
  request_revision integer,
  kind text not null check(kind in ('submitted','forwarded','rejected','withdrawn','expired','needs_new_slot')),
  recipient_id uuid references auth.users(id) on delete set null,
  deduplication_key text not null unique,
  state text not null default 'queued' check(state in ('queued','sending','sent','failed','suppressed')),
  attempts integer not null default 0 check(attempts>=0),
  available_at timestamptz not null default now(),
  lease_until timestamptz,
  created_at timestamptz not null default now(),
  delivered_at timestamptz,
  last_error_code text,
  foreign key(request_id,event_id) references public.event_booking_requests(id,event_id) on delete cascade
);
create index event_review_outbox_pending on public.event_review_outbox(available_at,id) where state in ('queued','failed');

create function public.event_review_allowed(p_event uuid,p_action text)
returns boolean language sql stable security definer set search_path='' as $$
  select case when p_action='configure' then public.event_can(p_event,'team')
    when p_action='designate' then public.event_can(p_event,'attendees') and exists
      (select 1 from public.event_review_permissions where event_id=p_event and user_id=auth.uid() and can_designate)
    when p_action='review' then public.event_can(p_event,'b2b') and exists
      (select 1 from public.event_review_permissions where event_id=p_event and user_id=auth.uid() and can_review)
    else false end;
$$;

create function public.event_review_active(p_event uuid)
returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.event_review_policies p cross join public.event_review_release r
    where p.event_id=p_event and p.enabled and r.ready);
$$;

-- Prevent even a trusted accidental policy write from opening an unfinished
-- feature. No client/organizer RPC can change the release lock.
create function public.guard_event_review_policy()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  if new.enabled and not exists(select 1 from public.event_review_release where ready) then
    raise exception 'INVESTOR_REVIEW_NOT_RELEASED' using errcode='55000';
  end if;
  return new;
end; $$;
create trigger event_review_policy_release before insert or update on public.event_review_policies
  for each row execute function public.guard_event_review_policy();

create function public.validate_event_investor_designation()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  if not exists(select 1 from public.event_attendees a where a.id=new.attendee_id and a.event_id=new.event_id) then
    raise exception 'INVESTOR_EVENT_MISMATCH' using errcode='23514';
  end if;
  return new;
end; $$;
create trigger investor_designation_event before insert or update on public.event_investor_designations
  for each row execute function public.validate_event_investor_designation();

create function public.validate_event_booking_request()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  if not exists(select 1 from public.event_attendees a where a.id=new.requester_attendee_id
      and a.event_id=new.event_id and (new.requester_id is null or a.profile_id=new.requester_id))
    or not exists(select 1 from public.event_attendees a where a.id=new.recipient_attendee_id
      and a.event_id=new.event_id and (new.recipient_id is null or a.profile_id=new.recipient_id)) then
    raise exception 'REVIEW_PARTICIPANT_MISMATCH' using errcode='23514';
  end if;
  return new;
end; $$;
create trigger booking_request_participants before insert or update on public.event_booking_requests
  for each row execute function public.validate_event_booking_request();

do $$ declare tbl text; begin
  foreach tbl in array array['event_review_release','event_review_policies','event_review_permissions',
    'event_investor_designations','event_investor_invitations','event_review_audit','event_booking_requests',
    'event_booking_review_notes','event_review_outbox'] loop
    execute format('alter table public.%I enable row level security',tbl);
    execute format('revoke all on public.%I from public,anon,authenticated',tbl);
    execute format('grant all on public.%I to service_role',tbl);
  end loop;
end; $$;
grant select on public.event_review_policies,public.event_review_permissions,public.event_investor_designations,
  public.event_review_audit,public.event_booking_requests,public.event_booking_review_notes to authenticated;
-- Digest and private invitation email are not part of public badge responses.
grant select(id,event_id,email,status,created_by,created_at,expires_at,accepted_by,accepted_attendee_id,accepted_at,revoked_at)
  on public.event_investor_invitations to authenticated;

create policy review_policy_staff on public.event_review_policies for select to authenticated
  using(public.event_can(event_id,'b2b') or public.event_can(event_id,'attendees'));
create policy review_permissions_staff on public.event_review_permissions for select to authenticated
  using(user_id=auth.uid() or public.event_review_allowed(event_id,'configure'));
create policy investor_designation_read on public.event_investor_designations for select to authenticated
  using(public.event_can(event_id,'read') or (active and public.event_review_active(event_id) and exists
    (select 1 from public.event_attendees a where a.event_id=event_investor_designations.event_id
      and a.profile_id=auth.uid() and a.status in ('registered','approved'))));
create policy investor_invitation_staff on public.event_investor_invitations for select to authenticated
  using(public.event_review_allowed(event_id,'designate') or public.event_review_allowed(event_id,'configure'));
create policy review_audit_staff on public.event_review_audit for select to authenticated
  using(public.event_review_allowed(event_id,'configure'));
create policy booking_request_private on public.event_booking_requests for select to authenticated
  using(requester_id=auth.uid() or public.event_review_allowed(event_id,'review'));
create policy booking_notes_private on public.event_booking_review_notes for select to authenticated
  using(exists(select 1 from public.event_booking_requests r where r.id=request_id and public.event_review_allowed(r.event_id,'review')));

create function public.get_event_review_capabilities(p_event uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
  if not (public.event_can(p_event,'b2b') or public.event_can(p_event,'attendees')) then
    raise exception 'Not authorized' using errcode='42501';
  end if;
  return jsonb_build_object('released',exists(select 1 from public.event_review_release where ready),
    'enabled',public.event_review_active(p_event),'can_configure',public.event_review_allowed(p_event,'configure'),
    'can_designate',public.event_review_allowed(p_event,'designate'),'can_review',public.event_review_allowed(p_event,'review'));
end; $$;

-- Permissions can be prepared while the feature is locked, with no automatic
-- coordinator/reviewer grant. Revoked event membership is checked on every use.
create function public.set_event_review_permissions(p_event uuid,p_user uuid,p_designate boolean,p_review boolean)
returns void language plpgsql security definer set search_path='' as $$
declare target_role text;
begin
  perform 1 from public.events where id=p_event for update;
  if not public.event_review_allowed(p_event,'configure') then raise exception 'Not authorized' using errcode='42501'; end if;
  if p_designate is null or p_review is null then raise exception 'Invalid permission' using errcode='22023'; end if;
  select case when coalesce(e.owner_id,e.organizer_id)=p_user then 'owner'
    when exists(select 1 from public.profiles where id=p_user and role='admin') then 'platform_admin'
    else (select role from public.event_team_members where event_id=p_event and user_id=p_user and status='active') end
    into target_role from public.events e where e.id=p_event;
  if (p_designate or p_review) and (target_role is null or target_role not in ('owner','platform_admin','administrator','coordinator')) then
    raise exception 'REVIEW_STAFF_REQUIRED' using errcode='23514';
  end if;
  insert into public.event_review_permissions(event_id,user_id,can_designate,can_review,assigned_by)
    values(p_event,p_user,p_designate,p_review,auth.uid()) on conflict(event_id,user_id) do update
    set can_designate=excluded.can_designate,can_review=excluded.can_review,assigned_by=auth.uid(),updated_at=now();
  insert into public.event_review_audit(event_id,actor_id,action,subject_id,details)
    values(p_event,auth.uid(),'permissions_changed',p_user,jsonb_build_object('can_designate',p_designate,'can_review',p_review));
end; $$;

-- No side effects: use this both for assignment UI counts and a later atomic
-- designation command. Counts deliberately separate matches from invitations.
create function public.preview_event_investor_assignment(p_event uuid,p_attendee uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
  if not public.event_review_allowed(p_event,'designate') then raise exception 'Not authorized' using errcode='42501'; end if;
  if not exists(select 1 from public.event_attendees where id=p_attendee and event_id=p_event) then
    raise exception 'INVESTOR_EVENT_MISMATCH' using errcode='23514';
  end if;
  select jsonb_build_object('scheduled_pending',count(*) filter(where status='pending' and start_at is not null),
    'unscheduled_matches',count(*) filter(where status='pending' and start_at is null),
    'confirmed',count(*) filter(where status='confirmed')) into result
    from public.event_b2b_meetings where event_id=p_event and p_attendee in (attendee_a_id,attendee_b_id);
  return result || jsonb_build_object('active',exists(select 1 from public.event_investor_designations
    where event_id=p_event and attendee_id=p_attendee and active));
end; $$;

-- Invitation lifecycle is prepared here, but issuance/acceptance is locked until
-- review and assignment migration commands ship. There is no public enable RPC.
create function public.issue_event_investor_invitation(p_event uuid,p_email text,p_expires_at timestamptz,p_replace boolean default false)
returns jsonb language plpgsql security definer set search_path='' as $$
declare normalized text:=lower(btrim(p_email)); secret text; invitation public.event_investor_invitations;
begin
  perform 1 from public.events where id=p_event for update;
  if not public.event_review_allowed(p_event,'designate') then raise exception 'Not authorized' using errcode='42501'; end if;
  if not public.event_review_active(p_event) then raise exception 'INVESTOR_REVIEW_NOT_RELEASED' using errcode='55000'; end if;
  if normalized is null or length(normalized)>254 or normalized !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or p_expires_at is null or p_expires_at<=now() or p_expires_at>now()+interval '30 days' then
    raise exception 'Invalid invitation' using errcode='22023';
  end if;
  if exists(select 1 from public.event_investor_invitations where event_id=p_event and email=normalized and status='pending' and expires_at>now())
    and p_replace is not true then raise exception 'INVESTOR_INVITATION_EXISTS' using errcode='23505'; end if;
  update public.event_investor_invitations set status='revoked',revoked_at=now()
    where event_id=p_event and email=normalized and status='pending';
  -- Two UUIDs supply independent random entropy without depending on a specific
  -- pgcrypto extension schema. Only a SHA-256 digest is persisted.
  secret:=replace(gen_random_uuid()::text||gen_random_uuid()::text,'-','');
  insert into public.event_investor_invitations(event_id,email,token_digest,expires_at,created_by)
    values(p_event,normalized,encode(sha256(convert_to(secret,'UTF8')),'hex'),p_expires_at,auth.uid()) returning * into invitation;
  insert into public.event_review_audit(event_id,actor_id,action,subject_id)
    values(p_event,auth.uid(),'investor_invitation_issued',invitation.id);
  return jsonb_build_object('id',invitation.id,'token',secret,'expires_at',invitation.expires_at);
end; $$;

create function public.revoke_event_investor_invitation(p_invitation uuid)
returns void language plpgsql security definer set search_path='' as $$
declare event_uuid uuid; invitation public.event_investor_invitations;
begin
  select event_id into event_uuid from public.event_investor_invitations where id=p_invitation;
  perform 1 from public.events where id=event_uuid for update;
  select * into invitation from public.event_investor_invitations where id=p_invitation for update;
  if invitation.id is null or not public.event_review_allowed(invitation.event_id,'designate') then
    raise exception 'Not authorized' using errcode='42501';
  end if;
  if invitation.status='accepted' then raise exception 'INVESTOR_ALREADY_ACCEPTED' using errcode='22023'; end if;
  if invitation.status='revoked' then return; end if;
  update public.event_investor_invitations set status='revoked',revoked_at=now() where id=invitation.id;
  insert into public.event_review_audit(event_id,actor_id,action,subject_id)
    values(invitation.event_id,auth.uid(),'investor_invitation_revoked',invitation.id);
end; $$;

-- Preview is read-only and requires BOTH invitation-secret possession and the
-- matching authenticated identity. It does not trust the confirmed-email flag.
create function public.get_event_investor_invitation(p_token text)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare invitation public.event_investor_invitations;
begin
  if p_token is null or length(p_token)<>64 then raise exception 'Invitation unavailable' using errcode='42501'; end if;
  select i.* into invitation from public.event_investor_invitations i join auth.users u
    on u.id=auth.uid() and lower(btrim(u.email))=i.email
    where i.token_digest=encode(sha256(convert_to(p_token,'UTF8')),'hex')
      and (i.status='pending' and i.expires_at>now() or i.status='accepted' and i.accepted_by=auth.uid());
  if invitation.id is null or not public.event_review_active(invitation.event_id) then
    raise exception 'Invitation unavailable' using errcode='42501';
  end if;
  return jsonb_build_object('id',invitation.id,'event_id',invitation.event_id,'event_name',
    (select name from public.events where id=invitation.event_id),'status',invitation.status,'expires_at',invitation.expires_at);
end; $$;

-- Explicit ACLs: PostgreSQL otherwise grants new functions to PUBLIC.
revoke all on function public.event_review_allowed(uuid,text),public.event_review_active(uuid),
  public.guard_event_review_policy(),public.validate_event_investor_designation(),public.validate_event_booking_request(),
  public.get_event_review_capabilities(uuid),public.set_event_review_permissions(uuid,uuid,boolean,boolean),
  public.preview_event_investor_assignment(uuid,uuid),public.issue_event_investor_invitation(uuid,text,timestamptz,boolean),
  public.revoke_event_investor_invitation(uuid),public.get_event_investor_invitation(text) from public,anon,authenticated;
grant execute on function public.event_review_allowed(uuid,text),public.event_review_active(uuid),
  public.get_event_review_capabilities(uuid),public.set_event_review_permissions(uuid,uuid,boolean,boolean),
  public.preview_event_investor_assignment(uuid,uuid),public.issue_event_investor_invitation(uuid,text,timestamptz,boolean),
  public.revoke_event_investor_invitation(uuid),public.get_event_investor_invitation(text) to authenticated;

comment on table public.event_review_release is 'Deployment-only release lock. Keep false until all investor booking/review/delivery paths and migration gates pass. Never expose a browser enable action.';
comment on table public.event_booking_requests is 'Private review queue. Investor reads are intentionally excluded, including after forwarding; investors use the linked meeting.';
commit;
