-- Still release-locked. These commands do not enable an event or the release.
begin;

create table public.event_review_meeting_permits (
  meeting_id uuid primary key references public.event_b2b_meetings(id) on delete restrict deferrable initially deferred,
  event_id uuid not null references public.events(id) on delete cascade,
  requester_id uuid,
  recipient_id uuid,
  payload jsonb not null,
  source text not null check(source in ('review','direct','preserved','confirmed')),
  created_at timestamptz not null default now()
);
create table public.event_review_hidden_meetings (
  meeting_id uuid primary key references public.event_b2b_meetings(id) on delete restrict,
  event_id uuid not null references public.events(id) on delete cascade,
  requester_id uuid
);
alter table public.event_review_meeting_permits enable row level security;
alter table public.event_review_hidden_meetings enable row level security;
revoke all on public.event_review_meeting_permits,public.event_review_hidden_meetings from public,anon,authenticated;
grant all on public.event_review_meeting_permits,public.event_review_hidden_meetings to service_role;

alter table public.event_booking_requests add column metadata jsonb not null default '{}' check(jsonb_typeof(metadata)='object');
alter table public.event_booking_requests add column legacy_meeting_id uuid unique references public.event_b2b_meetings(id) on delete restrict;

create function public.investor_attendee_protected(p_event uuid,p_attendee uuid)
returns boolean language sql stable security definer set search_path='' as $$
  -- Protection survives a release pause. A pause never makes held requests direct.
  select exists(select 1 from public.event_investor_designations where event_id=p_event and attendee_id=p_attendee and active)
    or exists(select 1 from public.event_investor_invitations i join public.event_attendees a
      on a.event_id=i.event_id and lower(btrim(a.email))=i.email
      where i.event_id=p_event and a.id=p_attendee and i.status='pending' and i.expires_at>now());
$$;

create function public.review_meeting_payload(p_meeting public.event_b2b_meetings)
returns jsonb language sql immutable set search_path='' as $$
  select jsonb_build_object('event_id',p_meeting.event_id,'attendee_a_id',p_meeting.attendee_a_id,
    'attendee_b_id',p_meeting.attendee_b_id,'profile_a_id',p_meeting.profile_a_id,'profile_b_id',p_meeting.profile_b_id,
    'organizer_id',p_meeting.organizer_id,'start_at',p_meeting.start_at,'end_at',p_meeting.end_at,'meta',coalesce(p_meeting.meta,'{}'));
$$;

create function public.investor_profile_protected(p_event uuid,p_profile uuid)
returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.event_attendees a where a.event_id=p_event and a.profile_id=p_profile
    and public.investor_attendee_protected(p_event,a.id))
    or exists(select 1 from public.event_investor_invitations i join auth.users u on lower(btrim(u.email))=i.email
      where i.event_id=p_event and u.id=p_profile and i.status='pending' and i.expires_at>clock_timestamp());
$$;

create function public.investor_assignment_inventory(p_event uuid,p_attendee uuid)
returns jsonb language sql stable security definer set search_path='' as $$
  select jsonb_build_object('scheduled_pending',count(*) filter(where status='pending' and start_at is not null),
    'unscheduled_matches',count(*) filter(where status='pending' and start_at is null),'confirmed',count(*) filter(where status='confirmed'),
    'active',exists(select 1 from public.event_investor_designations where event_id=p_event and attendee_id=p_attendee and active),
    'fingerprint',encode(sha256(convert_to(coalesce(jsonb_agg(to_jsonb(m) order by id),'[]')::text,'UTF8')),'hex'))
    from public.event_b2b_meetings m where event_id=p_event and p_attendee in (attendee_a_id,attendee_b_id);
$$;
create or replace function public.preview_event_investor_assignment(p_event uuid,p_attendee uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
  if not public.event_review_allowed(p_event,'designate') then raise exception 'Not authorized' using errcode='42501'; end if;
  if not exists(select 1 from public.event_attendees where id=p_attendee and event_id=p_event) then raise exception 'INVESTOR_EVENT_MISMATCH' using errcode='23514'; end if;
  return public.investor_assignment_inventory(p_event,p_attendee);
end; $$;

create function public.review_meeting_visible(p_meeting uuid)
returns boolean language sql stable security definer set search_path='' as $$
  select not exists(select 1 from public.event_review_hidden_meetings h where h.meeting_id=p_meeting
    and (auth.uid() is null or h.requester_id is distinct from auth.uid()) and not public.event_review_allowed(h.event_id,'review'));
$$;
create policy investor_review_visibility on public.event_b2b_meetings as restrictive for select
  using(public.review_meeting_visible(id));

create function public.guard_investor_meeting()
returns trigger language plpgsql security definer set search_path='' as $$
declare m public.event_b2b_meetings; permit public.event_review_meeting_permits; protected boolean;
begin
  if tg_op='DELETE' then m:=old; else m:=new; end if;
  -- Same lock as designation/issuance/acceptance: an in-flight legacy client
  -- cannot insert a request between assignment's inventory and its commit.
  if tg_op='UPDATE' and new.event_id is distinct from old.event_id then
    if public.investor_attendee_protected(old.event_id,old.attendee_a_id)
      or public.investor_attendee_protected(old.event_id,old.attendee_b_id)
      or public.investor_profile_protected(old.event_id,old.profile_a_id) or public.investor_profile_protected(old.event_id,old.profile_b_id)
      or exists(select 1 from public.event_review_meeting_permits where meeting_id=old.id)
      or exists(select 1 from public.event_review_hidden_meetings where meeting_id=old.id) then
      raise exception 'REVIEW_IMMUTABLE_MEETING' using errcode='42501';
    end if;
  end if;
  perform 1 from public.events where id=m.event_id for update;
  select * into permit from public.event_review_meeting_permits where meeting_id=m.id;
  protected:=permit.meeting_id is not null
    or public.investor_attendee_protected(m.event_id,m.attendee_a_id)
    or public.investor_attendee_protected(m.event_id,m.attendee_b_id)
    or public.investor_profile_protected(m.event_id,m.profile_a_id) or public.investor_profile_protected(m.event_id,m.profile_b_id)
    or exists(select 1 from public.event_review_hidden_meetings where meeting_id=m.id);
  if tg_op='UPDATE' then
    protected:=protected or public.investor_attendee_protected(old.event_id,old.attendee_a_id)
      or public.investor_attendee_protected(old.event_id,old.attendee_b_id);
    protected:=protected or public.investor_profile_protected(old.event_id,old.profile_a_id) or public.investor_profile_protected(old.event_id,old.profile_b_id);
  end if;
  if not protected then return case when tg_op='DELETE' then old else new end; end if;
  if tg_op='DELETE' then raise exception 'REVIEW_USE_CANCELLATION' using errcode='42501'; end if;
  if permit.meeting_id is null or public.review_meeting_payload(new)<>permit.payload then
    raise exception 'REVIEW_REQUIRED' using errcode='42501';
  end if;
  if tg_op='INSERT' then
    if new.status<>'pending' then raise exception 'REVIEW_INVALID_TRANSITION' using errcode='42501'; end if;
  elsif new.id<>old.id then
    raise exception 'REVIEW_IMMUTABLE_MEETING' using errcode='42501';
  elsif new.status is distinct from old.status then
    if new.status='confirmed' and old.status='pending' and auth.uid()=permit.recipient_id then null;
    elsif new.status='cancelled' and old.status in ('pending','confirmed')
      and (auth.uid() in (permit.requester_id,permit.recipient_id) or public.event_can(m.event_id,'b2b')) then null;
    elsif new.status='completed' and old.status='confirmed' and public.event_can(m.event_id,'checkin') then null;
    else raise exception 'REVIEW_INVALID_TRANSITION' using errcode='42501'; end if;
  end if;
  return new;
end; $$;
create trigger a_guard_investor_meeting before insert or update or delete on public.event_b2b_meetings
  for each row execute function public.guard_investor_meeting();

-- Stop profile relinking from changing who owns a protected designation/request.
create function public.guard_investor_registration_identity()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  -- Normal registration may link an unlinked row to its matching auth account.
  if old.profile_id is null and new.profile_id is not null and lower(btrim(new.email))=lower(btrim(old.email))
    and exists(select 1 from auth.users where id=new.profile_id and lower(btrim(email))=lower(btrim(old.email))) then return new; end if;
  if (new.profile_id is distinct from old.profile_id or lower(btrim(new.email)) is distinct from lower(btrim(old.email)))
    and (public.investor_attendee_protected(old.event_id,old.id)
      or exists(select 1 from public.event_booking_requests where requester_attendee_id=old.id or recipient_attendee_id=old.id)) then
    raise exception 'INVESTOR_IDENTITY_REPAIR_REQUIRED' using errcode='42501';
  end if;
  return new;
end; $$;
create trigger investor_registration_identity before update on public.event_attendees
  for each row execute function public.guard_investor_registration_identity();

-- Private helper: permission checks live in the two entry commands. Both use
-- exactly the same assignment transaction and prior-invitation handling.
create function public.apply_event_investor_assignment(p_event uuid,p_attendee uuid,p_source text,p_existing text,p_expected jsonb)
returns void language plpgsql security definer set search_path='' as $$
declare a public.event_attendees; m public.event_b2b_meetings; counts jsonb; requester uuid; target uuid;
begin
  perform 1 from public.events where id=p_event for update;
  if not public.event_review_active(p_event) then raise exception 'INVESTOR_REVIEW_NOT_RELEASED' using errcode='55000'; end if;
  select * into a from public.event_attendees where id=p_attendee and event_id=p_event for update;
  if a.id is null or a.profile_id is null or a.status not in ('registered','approved') then
    raise exception 'INVESTOR_REGISTRATION_REQUIRED' using errcode='23514';
  end if;
  if exists(select 1 from public.event_investor_designations where event_id=p_event and attendee_id=p_attendee and active) then return; end if;
  if p_existing is null or p_existing not in ('preserve','review') then raise exception 'INVESTOR_EXISTING_CHOICE_REQUIRED' using errcode='22023'; end if;
  counts:=public.investor_assignment_inventory(p_event,p_attendee);
  if p_expected is null or counts<>p_expected then raise exception 'INVESTOR_PREVIEW_CHANGED' using errcode='40001'; end if;

  -- Snapshot all existing scheduled records first. Pending invitations with
  -- ambiguous participants/initiator need explicit data repair, not inference.
  for m in select * from public.event_b2b_meetings where event_id=p_event
    and p_attendee in (attendee_a_id,attendee_b_id) and status in ('pending','confirmed') and start_at is not null for update loop
    if m.status='pending' and (m.profile_a_id is null or m.profile_b_id is null or m.organizer_id is null
      or m.organizer_id not in (m.profile_a_id,m.profile_b_id) or m.end_at is null) then
      raise exception 'INVESTOR_LEGACY_REPAIR_REQUIRED' using errcode='23514';
    end if;
    requester:=m.organizer_id;
    target:=case when requester=m.profile_a_id then m.profile_b_id else m.profile_a_id end;
    insert into public.event_review_meeting_permits(meeting_id,event_id,requester_id,recipient_id,payload,source)
      values(m.id,p_event,requester,target,public.review_meeting_payload(m),case when m.status='confirmed' then 'confirmed' else 'preserved' end)
      on conflict(meeting_id) do nothing;
    if m.status='pending' and p_existing='review' and target=a.profile_id then
      insert into public.event_booking_requests(event_id,requester_id,recipient_id,requester_attendee_id,recipient_attendee_id,
        starts_at,ends_at,format,message,metadata,policy_version,submission_key,legacy_meeting_id)
        values(p_event,requester,target,case when requester=m.profile_a_id then m.attendee_a_id else m.attendee_b_id end,
          p_attendee,m.start_at,m.end_at,coalesce(m.meta->>'meeting_format',m.meta->>'meeting_type','in-person'),
          coalesce(m.meta->>'message',''),coalesce(m.meta,'{}'),(select version from public.event_review_policies where event_id=p_event),gen_random_uuid(),m.id);
      update public.event_b2b_meetings set status='cancelled' where id=m.id;
      insert into public.event_review_hidden_meetings(meeting_id,event_id,requester_id) values(m.id,p_event,requester) on conflict do nothing;
    end if;
  end loop;
  insert into public.event_investor_designations(event_id,attendee_id,source,assigned_by)
    values(p_event,p_attendee,p_source,auth.uid()) on conflict(event_id,attendee_id) do update
    set active=true,source=excluded.source,assigned_by=auth.uid(),assigned_at=now(),removed_by=null,removed_at=null;
  insert into public.event_review_audit(event_id,actor_id,action,subject_id,details)
    values(p_event,auth.uid(),'investor_assigned',p_attendee,jsonb_build_object('source',p_source,'existing',p_existing,'inventory',counts));
end; $$;

create function public.set_event_investor(p_event uuid,p_attendee uuid,p_active boolean,p_existing text default null,p_expected jsonb default null)
returns void language plpgsql security definer set search_path='' as $$
declare a public.event_attendees;
begin
  perform 1 from public.events where id=p_event for update;
  if not public.event_review_allowed(p_event,'designate') then raise exception 'Not authorized' using errcode='42501'; end if;
  if p_active is null then raise exception 'Invalid designation' using errcode='22023'; end if;
  if p_active then
    perform public.apply_event_investor_assignment(p_event,p_attendee,'manual',p_existing,p_expected);
  else
    select * into a from public.event_attendees where id=p_attendee and event_id=p_event for update;
    if a.id is null then raise exception 'INVESTOR_EVENT_MISMATCH' using errcode='23514'; end if;
    update public.event_investor_designations set active=false,removed_by=auth.uid(),removed_at=now()
      where event_id=p_event and attendee_id=p_attendee and active;
    if not found then return; end if;
    -- An accepted link is also retired, so it cannot reassign a removed badge.
    update public.event_investor_invitations set status='revoked',revoked_at=now()
      where event_id=p_event and (email=lower(btrim(a.email)) or accepted_attendee_id=p_attendee) and status in ('pending','accepted');
    insert into public.event_review_audit(event_id,actor_id,action,subject_id) values(p_event,auth.uid(),'investor_removed',p_attendee);
  end if;
end; $$;

create function public.accept_event_investor_invitation(p_token text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare info jsonb; invitation public.event_investor_invitations; a public.event_attendees; matches integer; inventory jsonb;
begin
  info:=public.get_event_investor_invitation(p_token);
  perform 1 from public.events where id=(info->>'event_id')::uuid for update;
  info:=public.get_event_investor_invitation(p_token); -- Recheck revocation/expiry after lock.
  select * into invitation from public.event_investor_invitations where id=(info->>'id')::uuid for update;
  if invitation.status='accepted' then return info || jsonb_build_object('attendee_id',invitation.accepted_attendee_id); end if;
  select count(*) into matches from public.event_attendees where event_id=invitation.event_id
    and (profile_id=auth.uid() or lower(btrim(email))=invitation.email);
  if matches<>1 then raise exception 'INVESTOR_REGISTRATION_REQUIRED' using errcode='23514'; end if;
  select * into a from public.event_attendees where event_id=invitation.event_id
    and profile_id=auth.uid() and lower(btrim(email))=invitation.email and status in ('registered','approved') for update;
  if a.id is null then raise exception 'INVESTOR_REGISTRATION_REQUIRED' using errcode='23514'; end if;
  -- Do not let the recipient choose whether historical invitations bypass review.
  -- If any scheduled invitation exists, organizer assignment resolves it first.
  if not exists(select 1 from public.event_investor_designations where event_id=a.event_id and attendee_id=a.id and active)
    and exists(select 1 from public.event_b2b_meetings where event_id=a.event_id and status='pending'
      and start_at is not null and a.id in (attendee_a_id,attendee_b_id)) then
    raise exception 'INVESTOR_ORGANIZER_ACTION_REQUIRED' using errcode='23514';
  end if;
  inventory:=public.investor_assignment_inventory(a.event_id,a.id);
  perform public.apply_event_investor_assignment(a.event_id,a.id,'invitation','preserve',inventory);
  update public.event_investor_invitations set status='accepted',accepted_by=auth.uid(),accepted_attendee_id=a.id,accepted_at=now() where id=invitation.id;
  insert into public.event_review_audit(event_id,actor_id,action,subject_id) values(a.event_id,auth.uid(),'investor_invitation_accepted',invitation.id);
  return info || jsonb_build_object('status','accepted','attendee_id',a.id);
end; $$;

create function public.get_investor_booking_policy(p_event uuid,p_recipient uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare a public.event_attendees; designated boolean; invited boolean;
begin
  if auth.uid() is null then raise exception 'Sign in required' using errcode='42501'; end if;
  if not public.event_can(p_event,'b2b') and not exists(select 1 from public.event_attendees where event_id=p_event and profile_id=auth.uid() and status in ('registered','approved')) then
    raise exception 'Not authorized' using errcode='42501';
  end if;
  select * into a from public.event_attendees where event_id=p_event and profile_id=p_recipient and status in ('registered','approved') order by id limit 1;
  designated:=exists(select 1 from public.event_investor_designations where event_id=p_event and attendee_id=a.id and active);
  invited:=not designated and public.investor_attendee_protected(p_event,a.id);
  return jsonb_build_object('investor',designated,'requires_review',designated,'awaiting_acceptance',invited,
    'use_workflow',designated or invited or public.investor_profile_protected(p_event,auth.uid()),
    'available',public.event_review_active(p_event));
end; $$;

create function public.list_event_investors(p_event uuid)
returns table(attendee_id uuid,profile_id uuid) language plpgsql stable security definer set search_path='' as $$
begin
  if auth.uid() is null or (not public.event_can(p_event,'read') and not exists(select 1 from public.event_attendees a
    where a.event_id=p_event and a.profile_id=auth.uid() and a.status in ('registered','approved'))) then
    return;
  end if;
  return query select d.attendee_id,a.profile_id from public.event_investor_designations d join public.event_attendees a on a.id=d.attendee_id
    where d.event_id=p_event and d.active and a.status in ('registered','approved');
end; $$;

-- Validation before a private request exists. Final forwarding/confirmation also
-- runs the existing authoritative meeting triggers, including capacity allocation.
create function public.validate_investor_booking(p_event uuid,p_requester uuid,p_recipient uuid,p_start timestamptz,p_end timestamptz,p_format text)
returns void language plpgsql security definer set search_path='' as $$
declare venue jsonb;
begin
  perform 1 from public.events where id=p_event for update;
  perform id from public.profiles where id in (p_requester,p_recipient) order by id for update;
  if p_requester is null or p_recipient is null or p_requester=p_recipient
    or not public.b2b_event_eligible(p_event,p_requester) or not public.b2b_event_eligible(p_event,p_recipient) then
    raise exception 'B2B_PARTICIPANT_INELIGIBLE' using errcode='23514';
  end if;
  if p_start is null or p_end is null or p_start<=now() or p_end<=p_start or p_end>p_start+interval '24 hours' then
    raise exception 'B2B_INVALID_INTERVAL' using errcode='23514';
  end if;
  if not exists(select 1 from public.profiles p where p.id=p_requester and nullif(trim(p.full_name),'') is not null
    and nullif(trim(p.job_title),'') is not null and nullif(trim(p.company),'') is not null
    and coalesce(nullif(trim(p.industry),''),nullif(trim(p.sector),'')) is not null) then
    raise exception 'B2B_PROFILE_INCOMPLETE' using errcode='23514';
  end if;
  select venue_config into venue from public.event_b2b_settings where event_id=p_event;
  if p_format is null or p_format not in ('in-person','video','hybrid') or
    (jsonb_array_length(coalesce(venue->'allowedMeetingFormats','[]'))>0 and not venue->'allowedMeetingFormats' ? p_format) then
    raise exception 'B2B_FORMAT_NOT_ALLOWED' using errcode='23514';
  end if;
  if p_format<>'video' and not public.b2b_slot_valid(p_event,p_start,p_end) then raise exception 'B2B_SLOT_OUTSIDE_SCHEDULE' using errcode='23514'; end if;
  if exists(select 1 from public.event_b2b_availability where event_id=p_event and profile_id in (p_requester,p_recipient) and not p_start=any(available_slots)) then
    raise exception 'B2B_PARTICIPANT_UNAVAILABLE' using errcode='23514';
  end if;
  if exists(select 1 from public.event_b2b_meetings where status='confirmed' and start_at<p_end and end_at>p_start
    and (profile_a_id in (p_requester,p_recipient) or profile_b_id in (p_requester,p_recipient))) then
    raise exception 'B2B_PARTICIPANT_BUSY' using errcode='23514';
  end if;
end; $$;

create function public.submit_investor_booking(p_event uuid,p_recipient uuid,p_start timestamptz,p_end timestamptz,p_format text,p_message text,p_key uuid,p_video_url text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.event_attendees; b public.event_attendees; r public.event_booking_requests; needs_review boolean; m public.event_b2b_meetings;
begin
  perform 1 from public.events where id=p_event for update;
  if auth.uid() is null then raise exception 'Sign in required' using errcode='42501'; end if;
  if not public.event_review_active(p_event) then raise exception 'INVESTOR_REVIEW_NOT_RELEASED' using errcode='55000'; end if;
  if p_key is null or p_message is null or length(p_message)>4000 then raise exception 'Invalid request' using errcode='22023'; end if;
  if p_video_url is not null and (p_format='in-person' or length(p_video_url)>2000 or p_video_url !~ '^https://[^[:space:]]+$') then
    raise exception 'Invalid video URL' using errcode='22023';
  end if;
  select * into r from public.event_booking_requests where event_id=p_event and requester_id=auth.uid() and submission_key=p_key;
  if r.id is not null then
    if r.recipient_id is distinct from p_recipient or r.starts_at is distinct from p_start or r.ends_at is distinct from p_end
      or r.format is distinct from p_format or r.message is distinct from p_message
      or r.metadata->>'video_url' is distinct from p_video_url then raise exception 'REVIEW_IDEMPOTENCY_CONFLICT' using errcode='22023'; end if;
    return jsonb_build_object('id',r.id,'state',r.state);
  end if;
  select * into a from public.event_attendees where event_id=p_event and profile_id=auth.uid() and status in ('registered','approved') order by id limit 1;
  select * into b from public.event_attendees where event_id=p_event and profile_id=p_recipient and status in ('registered','approved') order by id limit 1;
  needs_review:=exists(select 1 from public.event_investor_designations where event_id=p_event and attendee_id=b.id and active);
  if not needs_review and public.investor_attendee_protected(p_event,b.id) then
    raise exception 'INVESTOR_ACCEPTANCE_PENDING' using errcode='23514';
  end if;
  if public.investor_attendee_protected(p_event,a.id) and not exists(select 1 from public.event_investor_designations where event_id=p_event and attendee_id=a.id and active) then
    raise exception 'INVESTOR_ACCEPTANCE_PENDING' using errcode='23514';
  end if;
  if not needs_review and not public.investor_attendee_protected(p_event,a.id) then
    raise exception 'INVESTOR_NOT_ASSIGNED' using errcode='23514';
  end if;
  perform public.validate_investor_booking(p_event,auth.uid(),p_recipient,p_start,p_end,p_format);
  if exists(select 1 from public.event_booking_requests where event_id=p_event and state in ('awaiting_review','needs_new_slot')
    and requester_id=auth.uid() and recipient_id=p_recipient and starts_at<p_end and ends_at>p_start)
    or exists(select 1 from public.event_b2b_meetings where event_id=p_event and status='pending' and start_at<p_end and end_at>p_start
      and ((profile_a_id=auth.uid() and profile_b_id=p_recipient) or (profile_b_id=auth.uid() and profile_a_id=p_recipient))) then
    raise exception 'B2B_DUPLICATE_REQUEST' using errcode='23514';
  end if;
  insert into public.event_booking_requests(event_id,requester_id,recipient_id,requester_attendee_id,recipient_attendee_id,
    starts_at,ends_at,format,message,metadata,policy_version,submission_key)
    values(p_event,auth.uid(),p_recipient,a.id,b.id,p_start,p_end,p_format,p_message,
      jsonb_build_object('message',p_message,'meeting_format',p_format,'meeting_type',p_format)
        || case when p_video_url is null then '{}'::jsonb else jsonb_build_object('video_url',p_video_url) end,
      (select version from public.event_review_policies where event_id=p_event),p_key) returning * into r;
  if not needs_review then
    m.id:=gen_random_uuid(); m.event_id:=p_event; m.attendee_a_id:=a.id; m.attendee_b_id:=b.id;
    m.profile_a_id:=auth.uid(); m.profile_b_id:=p_recipient; m.organizer_id:=auth.uid();
    m.start_at:=p_start; m.end_at:=p_end; m.status:='pending'; m.meta:=r.metadata;
    if p_format in ('video','hybrid') and nullif(m.meta->>'video_url','') is null then
      m.meta:=m.meta||jsonb_build_object('video_url','https://meet.jit.si/Eventra'||replace(gen_random_uuid()::text,'-',''));
    end if;
    insert into public.event_review_meeting_permits(meeting_id,event_id,requester_id,recipient_id,payload,source)
      values(m.id,p_event,auth.uid(),p_recipient,public.review_meeting_payload(m),'direct');
    insert into public.event_b2b_meetings(id,event_id,attendee_a_id,attendee_b_id,profile_a_id,profile_b_id,organizer_id,start_at,end_at,status,meta)
      values(m.id,p_event,a.id,b.id,auth.uid(),p_recipient,auth.uid(),p_start,p_end,'pending',m.meta);
    update public.event_booking_requests set state='forwarded',meeting_id=m.id where id=r.id returning * into r;
    insert into public.event_review_audit(event_id,actor_id,action,subject_id) values(p_event,auth.uid(),'request_direct',r.id);
    insert into public.event_review_outbox(event_id,request_id,request_revision,kind,recipient_id,deduplication_key)
      values(p_event,r.id,r.revision,'forwarded',p_recipient,r.id||':direct:recipient');
    return jsonb_build_object('id',r.id,'state',r.state,'meeting_id',m.id);
  end if;
  insert into public.event_review_audit(event_id,actor_id,action,subject_id) values(p_event,auth.uid(),'request_submitted',r.id);
  insert into public.event_review_outbox(event_id,request_id,request_revision,kind,recipient_id,deduplication_key)
    values(p_event,r.id,r.revision,'submitted',auth.uid(),r.id||':submitted:requester');
  -- Recipients are evaluated again at delivery so revoked reviewers never receive a queued message.
  insert into public.event_review_outbox(event_id,request_id,request_revision,kind,recipient_id,deduplication_key)
    select p_event,r.id,r.revision,'submitted',user_id,r.id||':submitted:reviewer:'||user_id from public.event_review_permissions
    where event_id=p_event and can_review and user_id<>auth.uid();
  return jsonb_build_object('id',r.id,'state',r.state);
end; $$;

create function public.decide_investor_booking(p_request uuid,p_revision integer,p_decision text,p_reason text default '')
returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.event_booking_requests; e uuid; m public.event_b2b_meetings; failure text;
begin
  select event_id into e from public.event_booking_requests where id=p_request;
  perform 1 from public.events where id=e for update;
  if not public.event_review_allowed(e,'review') then raise exception 'Not authorized' using errcode='42501'; end if;
  if not public.event_review_active(e) then raise exception 'INVESTOR_REVIEW_NOT_RELEASED' using errcode='55000'; end if;
  select * into r from public.event_booking_requests where id=p_request for update;
  if auth.uid() in (r.requester_id,r.recipient_id) then raise exception 'REVIEW_SELF_DECISION' using errcode='42501'; end if;
  if r.revision is distinct from p_revision or r.state<>'awaiting_review' then raise exception 'REVIEW_STALE_DECISION' using errcode='40001'; end if;
  if p_decision is null or p_decision not in ('approve','reject') or p_reason is null or length(p_reason)>2000 then raise exception 'Invalid decision' using errcode='22023'; end if;
  if p_decision='approve' then
    begin
      perform public.validate_investor_booking(e,r.requester_id,r.recipient_id,r.starts_at,r.ends_at,r.format);
      m.id:=gen_random_uuid(); m.event_id:=e; m.attendee_a_id:=r.requester_attendee_id; m.attendee_b_id:=r.recipient_attendee_id;
      m.profile_a_id:=r.requester_id; m.profile_b_id:=r.recipient_id; m.organizer_id:=r.requester_id;
      m.start_at:=r.starts_at; m.end_at:=r.ends_at; m.status:='pending'; m.meta:=r.metadata;
      if r.format in ('video','hybrid') and nullif(m.meta->>'video_url','') is null then
        m.meta:=m.meta||jsonb_build_object('video_url','https://meet.jit.si/Eventra'||replace(gen_random_uuid()::text,'-',''));
      end if;
      insert into public.event_review_meeting_permits(meeting_id,event_id,requester_id,recipient_id,payload,source)
        values(m.id,e,r.requester_id,r.recipient_id,public.review_meeting_payload(m),'review');
      insert into public.event_b2b_meetings(id,event_id,attendee_a_id,attendee_b_id,profile_a_id,profile_b_id,organizer_id,start_at,end_at,status,meta)
        values(m.id,e,m.attendee_a_id,m.attendee_b_id,m.profile_a_id,m.profile_b_id,m.organizer_id,m.start_at,m.end_at,m.status,m.meta);
    exception when check_violation then
      failure:=sqlerrm;
      if failure not in ('B2B_PARTICIPANT_BUSY','B2B_PARTICIPANT_UNAVAILABLE','B2B_SLOT_OUTSIDE_SCHEDULE','B2B_INVALID_INTERVAL','B2B_VENUE_FULL') then raise; end if;
    end;
  end if;
  update public.event_booking_requests set state=case when failure is not null then 'needs_new_slot'
      when p_decision='reject' then 'rejected' else 'forwarded' end,
    meeting_id=case when failure is null and p_decision='approve' then m.id else null end,
    reviewed_by=auth.uid(),reviewed_at=now(),requester_reason=p_reason,revision=revision+1,updated_at=now()
    where id=r.id returning * into r;
  insert into public.event_review_audit(event_id,actor_id,action,subject_id,details)
    values(e,auth.uid(),'request_'||r.state,r.id,jsonb_build_object('revision',r.revision,'validation_error',failure));
  insert into public.event_review_outbox(event_id,request_id,request_revision,kind,recipient_id,deduplication_key)
    values(e,r.id,r.revision,r.state,r.requester_id,r.id||':'||r.revision||':requester');
  if r.state='forwarded' then
    insert into public.event_review_outbox(event_id,request_id,request_revision,kind,recipient_id,deduplication_key)
      values(e,r.id,r.revision,'forwarded',r.recipient_id,r.id||':'||r.revision||':recipient');
  end if;
  return jsonb_build_object('id',r.id,'state',r.state,'meeting_id',r.meeting_id);
end; $$;

create function public.withdraw_investor_booking(p_request uuid,p_revision integer)
returns void language plpgsql security definer set search_path='' as $$
declare r public.event_booking_requests; e uuid;
begin
  select event_id into e from public.event_booking_requests where id=p_request;
  perform 1 from public.events where id=e for update;
  select * into r from public.event_booking_requests where id=p_request for update;
  if r.id is null or r.requester_id is distinct from auth.uid() then raise exception 'Not authorized' using errcode='42501'; end if;
  if r.state='withdrawn' then return; end if;
  if r.revision is distinct from p_revision or r.state not in ('awaiting_review','needs_new_slot') then raise exception 'REVIEW_STALE_DECISION' using errcode='40001'; end if;
  update public.event_booking_requests set state='withdrawn',revision=revision+1,updated_at=now() where id=r.id;
  update public.event_review_outbox set state='suppressed' where request_id=r.id and state in ('queued','failed');
  insert into public.event_review_audit(event_id,actor_id,action,subject_id) values(e,auth.uid(),'request_withdrawn',r.id);
end; $$;

revoke all on function public.investor_attendee_protected(uuid,uuid),public.review_meeting_payload(public.event_b2b_meetings),
  public.investor_profile_protected(uuid,uuid),public.investor_assignment_inventory(uuid,uuid),
  public.review_meeting_visible(uuid),public.guard_investor_meeting(),public.guard_investor_registration_identity(),
  public.apply_event_investor_assignment(uuid,uuid,text,text,jsonb),public.set_event_investor(uuid,uuid,boolean,text,jsonb),
  public.accept_event_investor_invitation(text),public.get_investor_booking_policy(uuid,uuid),
  public.list_event_investors(uuid),
  public.validate_investor_booking(uuid,uuid,uuid,timestamptz,timestamptz,text),
  public.submit_investor_booking(uuid,uuid,timestamptz,timestamptz,text,text,uuid,text),
  public.decide_investor_booking(uuid,integer,text,text),public.withdraw_investor_booking(uuid,integer) from public,anon,authenticated;
grant execute on function public.review_meeting_visible(uuid) to anon,authenticated;
grant execute on function public.set_event_investor(uuid,uuid,boolean,text,jsonb),public.accept_event_investor_invitation(text),
  public.list_event_investors(uuid),
  public.get_investor_booking_policy(uuid,uuid),public.submit_investor_booking(uuid,uuid,timestamptz,timestamptz,text,text,uuid,text),
  public.decide_investor_booking(uuid,integer,text,text),public.withdraw_investor_booking(uuid,integer) to authenticated;
notify pgrst,'reload schema';
commit;
