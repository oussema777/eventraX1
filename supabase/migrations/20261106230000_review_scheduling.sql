begin;
alter table public.event_booking_requests add column created_by uuid references auth.users(id) on delete set null default auth.uid();
update public.event_booking_requests set created_by=requester_id where created_by is null;
alter table public.event_booking_requests add column replaces_meeting_id uuid references public.event_b2b_meetings(id) on delete restrict;
create table public.event_review_replacements(new_meeting_id uuid primary key references public.event_b2b_meetings(id) deferrable initially deferred, old_meeting_id uuid not null references public.event_b2b_meetings(id));
create table public.event_review_swaps(old_meeting_id uuid primary key references public.event_b2b_meetings(id),new_meeting_id uuid not null references public.event_b2b_meetings(id));
alter table public.event_review_replacements enable row level security;
alter table public.event_review_swaps enable row level security;
revoke all on public.event_review_replacements,public.event_review_swaps from public,anon,authenticated;
grant all on public.event_review_replacements,public.event_review_swaps to service_role;
create function public.validate_investor_booking(p_event uuid,p_requester uuid,p_recipient uuid,p_start timestamptz,p_end timestamptz,p_format text,p_ignore uuid)
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
  if exists(select 1 from public.event_b2b_meetings where id is distinct from p_ignore and status='confirmed' and start_at<p_end and end_at>p_start
    and (profile_a_id in (p_requester,p_recipient) or profile_b_id in (p_requester,p_recipient))) then
    raise exception 'B2B_PARTICIPANT_BUSY' using errcode='23514';
  end if;
end; $$;
create function public.submit_investor_booking_as(p_requester uuid,p_event uuid,p_recipient uuid,p_start timestamptz,p_end timestamptz,p_format text,p_message text,p_key uuid,p_video_url text default null,p_replace uuid default null,p_staff boolean default false)
returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.event_attendees; b public.event_attendees; r public.event_booking_requests; needs_review boolean; m public.event_b2b_meetings;
begin
  perform 1 from public.events where id=p_event for update;
  if auth.uid() is null or p_requester is null then raise exception 'Sign in required' using errcode='42501'; end if;
  if (p_staff or p_requester<>auth.uid()) and not public.event_can(p_event,'b2b') then raise exception 'Not authorized' using errcode='42501'; end if;
  if p_replace is not null and not exists(select 1 from public.event_b2b_meetings old join public.event_review_meeting_permits pm on pm.meeting_id=old.id where old.id=p_replace and old.event_id=p_event and old.status in ('pending','confirmed') and p_requester in (old.profile_a_id,old.profile_b_id) and p_recipient in (old.profile_a_id,old.profile_b_id)) then raise exception 'REVIEW_STALE_DECISION' using errcode='40001'; end if;
  if not public.event_review_active(p_event) then raise exception 'INVESTOR_REVIEW_NOT_RELEASED' using errcode='55000'; end if;
  if p_key is null or p_message is null or length(p_message)>4000 then raise exception 'Invalid request' using errcode='22023'; end if;
  if p_video_url is not null and (p_format='in-person' or length(p_video_url)>2000 or p_video_url !~ '^https://[^[:space:]]+$') then
    raise exception 'Invalid video URL' using errcode='22023';
  end if;
  select * into r from public.event_booking_requests where event_id=p_event and requester_id=p_requester and submission_key=p_key;
  if r.id is not null then
    if r.recipient_id is distinct from p_recipient or r.starts_at is distinct from p_start or r.ends_at is distinct from p_end
      or r.replaces_meeting_id is distinct from p_replace or r.created_by is distinct from auth.uid() or r.format is distinct from p_format or r.message is distinct from p_message
      or r.metadata->>'video_url' is distinct from p_video_url then raise exception 'REVIEW_IDEMPOTENCY_CONFLICT' using errcode='22023'; end if;
    return jsonb_build_object('id',r.id,'state',r.state);
  end if;
  select * into a from public.event_attendees where event_id=p_event and profile_id=p_requester and status in ('registered','approved') order by id limit 1;
  select * into b from public.event_attendees where event_id=p_event and profile_id=p_recipient and status in ('registered','approved') order by id limit 1;
  needs_review:=p_staff or p_requester<>auth.uid() or exists(select 1 from public.event_investor_designations where event_id=p_event and attendee_id=b.id and active);
  if not needs_review and public.investor_attendee_protected(p_event,b.id) then
    raise exception 'INVESTOR_ACCEPTANCE_PENDING' using errcode='23514';
  end if;
  if public.investor_attendee_protected(p_event,a.id) and not exists(select 1 from public.event_investor_designations where event_id=p_event and attendee_id=a.id and active) then
    raise exception 'INVESTOR_ACCEPTANCE_PENDING' using errcode='23514';
  end if;
  if not needs_review and not public.investor_attendee_protected(p_event,a.id) and p_replace is null then
    raise exception 'INVESTOR_NOT_ASSIGNED' using errcode='23514';
  end if;
  perform public.validate_investor_booking(p_event,p_requester,p_recipient,p_start,p_end,p_format,p_replace);
  if exists(select 1 from public.event_booking_requests where event_id=p_event and state in ('awaiting_review','needs_new_slot')
    and requester_id=p_requester and recipient_id=p_recipient and starts_at<p_end and ends_at>p_start)
    or exists(select 1 from public.event_b2b_meetings where id is distinct from p_replace and event_id=p_event and status='pending' and start_at<p_end and end_at>p_start
      and ((profile_a_id=p_requester and profile_b_id=p_recipient) or (profile_b_id=p_requester and profile_a_id=p_recipient))) then
    raise exception 'B2B_DUPLICATE_REQUEST' using errcode='23514';
  end if;
  insert into public.event_booking_requests(event_id,requester_id,recipient_id,requester_attendee_id,recipient_attendee_id,
    starts_at,ends_at,format,message,metadata,policy_version,submission_key,replaces_meeting_id)
    values(p_event,p_requester,p_recipient,a.id,b.id,p_start,p_end,p_format,p_message,
      jsonb_build_object('message',p_message,'meeting_format',p_format,'meeting_type',p_format)
        || case when p_video_url is null then '{}'::jsonb else jsonb_build_object('video_url',p_video_url) end,
      (select version from public.event_review_policies where event_id=p_event),p_key,p_replace) returning * into r;
  if not needs_review then
    m.id:=gen_random_uuid(); m.event_id:=p_event; m.attendee_a_id:=a.id; m.attendee_b_id:=b.id;
    m.profile_a_id:=p_requester; m.profile_b_id:=p_recipient; m.organizer_id:=p_requester;
    m.start_at:=p_start; m.end_at:=p_end; m.status:='pending'; m.meta:=r.metadata;
    if p_format in ('video','hybrid') and nullif(m.meta->>'video_url','') is null then
      m.meta:=m.meta||jsonb_build_object('video_url','https://meet.jit.si/Eventra'||replace(gen_random_uuid()::text,'-',''));
    end if;
    insert into public.event_review_meeting_permits(meeting_id,event_id,requester_id,recipient_id,payload,source)
      values(m.id,p_event,p_requester,p_recipient,public.review_meeting_payload(m),'direct');
    if p_replace is not null then insert into public.event_review_replacements values(m.id,p_replace); end if;
    insert into public.event_b2b_meetings(id,event_id,attendee_a_id,attendee_b_id,profile_a_id,profile_b_id,organizer_id,start_at,end_at,status,meta)
      values(m.id,p_event,a.id,b.id,p_requester,p_recipient,p_requester,p_start,p_end,'pending',m.meta);
    update public.event_booking_requests set state='forwarded',meeting_id=m.id where id=r.id returning * into r;
    insert into public.event_review_audit(event_id,actor_id,action,subject_id) values(p_event,auth.uid(),'request_direct',r.id);
    insert into public.event_review_outbox(event_id,request_id,request_revision,kind,recipient_id,deduplication_key)
      values(p_event,r.id,r.revision,'forwarded',p_recipient,r.id||':direct:recipient');
    return jsonb_build_object('id',r.id,'state',r.state,'meeting_id',m.id);
  end if;
  insert into public.event_review_audit(event_id,actor_id,action,subject_id) values(p_event,auth.uid(),'request_submitted',r.id);
  insert into public.event_review_outbox(event_id,request_id,request_revision,kind,recipient_id,deduplication_key)
    values(p_event,r.id,r.revision,'submitted',p_requester,r.id||':submitted:requester');
  -- Recipients are evaluated again at delivery so revoked reviewers never receive a queued message.
  insert into public.event_review_outbox(event_id,request_id,request_revision,kind,recipient_id,deduplication_key)
    select p_event,r.id,r.revision,'submitted',user_id,r.id||':submitted:reviewer:'||user_id from public.event_review_permissions
    where event_id=p_event and can_review and user_id<>p_requester;
  return jsonb_build_object('id',r.id,'state',r.state);
end; $$;
create or replace function public.submit_investor_booking(p_event uuid,p_recipient uuid,p_start timestamptz,p_end timestamptz,p_format text,p_message text,p_key uuid,p_video_url text default null)
returns jsonb language sql security definer set search_path='' as $$ select public.submit_investor_booking_as(auth.uid(),p_event,p_recipient,p_start,p_end,p_format,p_message,p_key,p_video_url,null); $$;
create function public.propose_investor_reschedule(p_meeting uuid,p_start timestamptz,p_end timestamptz,p_format text,p_message text,p_key uuid,p_video_url text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare m public.event_b2b_meetings; partner uuid;
begin
 select * into m from public.event_b2b_meetings where id=p_meeting;
 if auth.uid() is null or not coalesce(auth.uid() in(m.profile_a_id,m.profile_b_id),false) then raise exception 'Not authorized' using errcode='42501'; end if;
 perform 1 from public.events where id=m.event_id for update;
 if exists(select 1 from public.event_booking_requests r left join public.event_b2b_meetings n on n.id=r.meeting_id where r.replaces_meeting_id=m.id and (r.state in ('awaiting_review','needs_new_slot') or n.status='pending') and r.submission_key<>p_key) then raise exception 'B2B_DUPLICATE_REQUEST' using errcode='23514'; end if;
 partner:=case when m.profile_a_id=auth.uid() then m.profile_b_id else m.profile_a_id end;
 return public.submit_investor_booking_as(auth.uid(),m.event_id,partner,p_start,p_end,p_format,p_message,p_key,p_video_url,p_meeting);
end; $$;
create or replace function public.decide_investor_booking(p_request uuid,p_revision integer,p_decision text,p_reason text default '')
returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.event_booking_requests; e uuid; m public.event_b2b_meetings; failure text;
begin
  select event_id into e from public.event_booking_requests where id=p_request;
  perform 1 from public.events where id=e for update;
  if not public.event_review_allowed(e,'review') then raise exception 'Not authorized' using errcode='42501'; end if;
  if not public.event_review_active(e) then raise exception 'INVESTOR_REVIEW_NOT_RELEASED' using errcode='55000'; end if;
  select * into r from public.event_booking_requests where id=p_request for update;
  if auth.uid() in (r.requester_id,r.recipient_id,r.created_by) then raise exception 'REVIEW_SELF_DECISION' using errcode='42501'; end if;
  if r.revision is distinct from p_revision or r.state<>'awaiting_review' then raise exception 'REVIEW_STALE_DECISION' using errcode='40001'; end if;
  if p_decision is null or p_decision not in ('approve','reject') or p_reason is null or length(p_reason)>2000 then raise exception 'Invalid decision' using errcode='22023'; end if;
  if p_decision='approve' then
    begin
      if r.replaces_meeting_id is not null and not exists(select 1 from public.event_b2b_meetings where id=r.replaces_meeting_id and status in ('pending','confirmed')) then raise exception 'B2B_INVALID_INTERVAL' using errcode='23514'; end if;
      perform public.validate_investor_booking(e,r.requester_id,r.recipient_id,r.starts_at,r.ends_at,r.format,r.replaces_meeting_id);
      m.id:=gen_random_uuid(); m.event_id:=e; m.attendee_a_id:=r.requester_attendee_id; m.attendee_b_id:=r.recipient_attendee_id;
      m.profile_a_id:=r.requester_id; m.profile_b_id:=r.recipient_id; m.organizer_id:=r.requester_id;
      m.start_at:=r.starts_at; m.end_at:=r.ends_at; m.status:='pending'; m.meta:=r.metadata;
      if r.format in ('video','hybrid') and nullif(m.meta->>'video_url','') is null then
        m.meta:=m.meta||jsonb_build_object('video_url','https://meet.jit.si/Eventra'||replace(gen_random_uuid()::text,'-',''));
      end if;
      insert into public.event_review_meeting_permits(meeting_id,event_id,requester_id,recipient_id,payload,source)
        values(m.id,e,r.requester_id,r.recipient_id,public.review_meeting_payload(m),'review');
      if r.replaces_meeting_id is not null then insert into public.event_review_replacements values(m.id,r.replaces_meeting_id); end if;
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
  if exists (select 1 from public.event_b2b_meetings m where m.id is distinct from new.id and not exists(select 1 from public.event_review_replacements x where x.new_meeting_id=new.id and x.old_meeting_id=m.id)
    and m.status = 'confirmed' and m.start_at < new.end_at and m.end_at > new.start_at
    and (m.profile_a_id in (new.profile_a_id, new.profile_b_id) or m.profile_b_id in (new.profile_a_id, new.profile_b_id))) then
    raise exception 'B2B_PARTICIPANT_BUSY' using errcode = '23514';
  end if;
  if exists (select 1 from public.event_b2b_meetings m where m.id is distinct from new.id and not exists(select 1 from public.event_review_replacements x where x.new_meeting_id=new.id and x.old_meeting_id=m.id)
    and m.event_id = new.event_id and m.status = 'pending' and m.start_at < new.end_at and m.end_at > new.start_at
    and ((m.profile_a_id = new.profile_a_id and m.profile_b_id = new.profile_b_id)
      or (m.profile_a_id = new.profile_b_id and m.profile_b_id = new.profile_a_id))) then
    raise exception 'B2B_DUPLICATE_REQUEST' using errcode = '23514';
  end if;
  if new.status = 'confirmed' and format <> 'video' then
    table_count := greatest(1, coalesce((venue->>'tableCount')::integer, 10));
    prefix := coalesce(venue->>'tablePrefix', 'Table-');
    if (select count(*) from public.event_b2b_meetings m where m.id is distinct from new.id and not exists(select 1 from public.event_review_replacements x where x.new_meeting_id=new.id and x.old_meeting_id=m.id)
      and m.event_id = new.event_id and m.status = 'confirmed'
      and coalesce(m.meta->>'meeting_format', m.meta->>'meeting_type', 'in-person') <> 'video'
      and m.start_at < new.end_at and m.end_at > new.start_at) >= table_count then
      raise exception 'B2B_VENUE_FULL' using errcode = '23514';
    end if;
    select n into table_number from generate_series(1, table_count) n where not exists (
      select 1 from public.event_b2b_meetings m where m.id is distinct from new.id and not exists(select 1 from public.event_review_replacements x where x.new_meeting_id=new.id and x.old_meeting_id=m.id)
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
create function public.apply_investor_reschedule_swap() returns trigger language plpgsql security definer set search_path='' as $$
declare old_id uuid; m public.event_b2b_meetings;
begin
 if new.status<>'confirmed' or old.status<>'pending' then return new; end if;
 select old_meeting_id into old_id from public.event_review_replacements where new_meeting_id=new.id;
 if old_id is null then return new; end if;
 perform 1 from public.events where id=new.event_id for update;
 select * into m from public.event_b2b_meetings where id=old_id for update;
 if m.status not in ('pending','confirmed') then raise exception 'REVIEW_STALE_DECISION' using errcode='40001'; end if;
 insert into public.event_review_swaps values(old_id,new.id);
 update public.event_b2b_meetings set status='cancelled' where id=old_id;
 insert into public.event_review_audit(event_id,actor_id,action,subject_id,details) values(new.event_id,auth.uid(),'meeting_replaced',new.id,jsonb_build_object('previous_meeting',old_id));
 return new;
end; $$;
create trigger a0_review_swap before update of status on public.event_b2b_meetings for each row execute function public.apply_investor_reschedule_swap();
revoke all on function public.submit_investor_booking_as(uuid,uuid,uuid,timestamptz,timestamptz,text,text,uuid,text,uuid,boolean),public.validate_investor_booking(uuid,uuid,uuid,timestamptz,timestamptz,text,uuid),public.apply_investor_reschedule_swap(),public.propose_investor_reschedule(uuid,timestamptz,timestamptz,text,text,uuid,text) from public,anon,authenticated;
grant execute on function public.propose_investor_reschedule(uuid,timestamptz,timestamptz,text,text,uuid,text) to authenticated;
create table public.event_meeting_batch_receipts (
 event_id uuid not null references public.events(id), actor_id uuid not null references auth.users(id),
 submission_key uuid not null, payload jsonb not null, result jsonb not null,
 primary key(event_id,actor_id,submission_key)
);
alter table public.event_meeting_batch_receipts enable row level security;
revoke all on public.event_meeting_batch_receipts from public,anon,authenticated;
grant all on public.event_meeting_batch_receipts to service_role;
create function public.create_event_meeting_batch(p_event uuid,p_items jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare item jsonb; results jsonb:='[]'; a public.event_attendees; b public.event_attendees; protected boolean; result jsonb; m public.event_b2b_meetings; n integer:=0; k uuid; replacement uuid; receipt public.event_meeting_batch_receipts;
begin
 perform 1 from public.events where id=p_event for update;
 if not public.event_can(p_event,'b2b') then raise exception 'Not authorized' using errcode='42501'; end if;
 if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)>100 then raise exception 'Invalid batch'; end if;
 for item in select value from jsonb_array_elements(p_items) loop
  k:=nullif(item->>'submission_key','')::uuid;
  if k is not null then
   select * into receipt from public.event_meeting_batch_receipts where event_id=p_event and actor_id=auth.uid() and submission_key=k;
   if found then
    if receipt.payload<>item then raise exception 'REVIEW_STALE_DECISION' using errcode='40001'; end if;
    results:=results||jsonb_build_array(receipt.result||jsonb_build_object('index',n)); n:=n+1; continue;
   end if;
  end if;
  select * into a from public.event_attendees where id=(item->>'attendee_a_id')::uuid and event_id=p_event;
  select * into b from public.event_attendees where id=(item->>'attendee_b_id')::uuid and event_id=p_event;
  if a.id is null or b.id is null or a.id=b.id then raise exception 'REVIEW_PARTICIPANT_MISMATCH' using errcode='23514'; end if;
  protected:=public.investor_attendee_protected(p_event,a.id) or public.investor_attendee_protected(p_event,b.id)
    or public.investor_profile_protected(p_event,a.profile_id) or public.investor_profile_protected(p_event,b.profile_id);
  if protected then
   replacement:=null;
   if item->>'meeting_id' is not null then
    select * into m from public.event_b2b_meetings where id=(item->>'meeting_id')::uuid and event_id=p_event
      and attendee_a_id in(a.id,b.id) and attendee_b_id in(a.id,b.id) and status in('pending','confirmed');
    if m.id is null then raise exception 'REVIEW_STALE_DECISION' using errcode='40001'; end if;
    if exists(select 1 from public.event_review_meeting_permits where meeting_id=m.id) then replacement:=m.id;
    elsif m.start_at is not null then raise exception 'REVIEW_STALE_DECISION' using errcode='40001'; end if;
   end if;
   if nullif(item->>'start_at','') is null or nullif(item->>'end_at','') is null then result:=jsonb_build_object('state','needs_schedule');
   else
    if a.profile_id is null or b.profile_id is null then raise exception 'INVESTOR_REGISTRATION_REQUIRED' using errcode='23514'; end if;
    -- The protected recipient is always the investor, regardless of AI pair order.
    if not public.investor_attendee_protected(p_event,b.id) and public.investor_attendee_protected(p_event,a.id) then
      result:=public.submit_investor_booking_as(b.profile_id,p_event,a.profile_id,(item->>'start_at')::timestamptz,(item->>'end_at')::timestamptz,coalesce(item->'meta'->>'meeting_format','in-person'),coalesce(item->'meta'->>'message',''),k,null,replacement,true);
    else result:=public.submit_investor_booking_as(a.profile_id,p_event,b.profile_id,(item->>'start_at')::timestamptz,(item->>'end_at')::timestamptz,coalesce(item->'meta'->>'meeting_format','in-person'),coalesce(item->'meta'->>'message',''),k,null,replacement,true); end if;
   end if;
  else
   if k is null then raise exception 'Submission key required' using errcode='23514'; end if;
   if item->>'meeting_id' is not null then
    update public.event_b2b_meetings set start_at=nullif(item->>'start_at','')::timestamptz,end_at=nullif(item->>'end_at','')::timestamptz,location=item->>'location'
      where id=(item->>'meeting_id')::uuid and event_id=p_event and attendee_a_id=a.id and attendee_b_id=b.id and status='pending' returning * into m;
    if m.id is null then raise exception 'REVIEW_STALE_DECISION' using errcode='40001'; end if;
   else
    insert into public.event_b2b_meetings(event_id,attendee_a_id,attendee_b_id,profile_a_id,profile_b_id,organizer_id,start_at,end_at,location,status,meta)
     values(p_event,a.id,b.id,a.profile_id,b.profile_id,a.profile_id,nullif(item->>'start_at','')::timestamptz,nullif(item->>'end_at','')::timestamptz,item->>'location','pending',coalesce(item->'meta','{}')) returning * into m;
   end if;
   result:=jsonb_build_object('state','pending','meeting_id',m.id);
  end if;
  if k is not null and result->>'state'<>'needs_schedule' then
   insert into public.event_meeting_batch_receipts values(p_event,auth.uid(),k,item,result);
  end if;
  results:=results||jsonb_build_array(result||jsonb_build_object('index',n)); n:=n+1;
 end loop;
 return results;
end; $$;

create function public.revise_investor_request(p_request uuid,p_revision integer,p_start timestamptz,p_end timestamptz,p_format text,p_message text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.event_booking_requests; e uuid;
begin
 select event_id into e from public.event_booking_requests where id=p_request;
 perform 1 from public.events where id=e for update;
 select * into r from public.event_booking_requests where id=p_request for update;
 if auth.uid() is null or r.requester_id is distinct from auth.uid() then raise exception 'Not authorized' using errcode='42501'; end if;
 if not public.event_review_active(e) then raise exception 'INVESTOR_REVIEW_NOT_RELEASED' using errcode='55000'; end if;
 if r.revision<>p_revision or r.state not in ('awaiting_review','needs_new_slot') then raise exception 'REVIEW_STALE_DECISION' using errcode='40001'; end if;
 if p_message is null or length(p_message)>4000 then raise exception 'Invalid message'; end if;
 perform public.validate_investor_booking(e,r.requester_id,r.recipient_id,p_start,p_end,p_format,r.replaces_meeting_id);
 if exists(select 1 from public.event_booking_requests q where q.id<>r.id and q.event_id=e and q.state in ('awaiting_review','needs_new_slot')
   and q.requester_id=r.requester_id and q.recipient_id=r.recipient_id and q.starts_at<p_end and q.ends_at>p_start)
   or exists(select 1 from public.event_b2b_meetings m where m.id is distinct from r.replaces_meeting_id and m.event_id=e and m.status='pending' and m.start_at<p_end and m.end_at>p_start
     and ((m.profile_a_id=r.requester_id and m.profile_b_id=r.recipient_id) or (m.profile_b_id=r.requester_id and m.profile_a_id=r.recipient_id))) then
   raise exception 'B2B_DUPLICATE_REQUEST' using errcode='23514';
 end if;
 update public.event_booking_requests set starts_at=p_start,ends_at=p_end,format=p_format,message=p_message,
   metadata=jsonb_build_object('message',p_message,'meeting_format',p_format,'meeting_type',p_format),state='awaiting_review',
   revision=revision+1,reviewed_by=null,reviewed_at=null,requester_reason=null,updated_at=now()
   where id=r.id returning * into r;
 insert into public.event_review_audit(event_id,actor_id,action,subject_id,details) values(e,auth.uid(),'request_revised',r.id,jsonb_build_object('revision',r.revision));
 insert into public.event_review_outbox(event_id,request_id,request_revision,kind,recipient_id,deduplication_key)
 values(e,r.id,r.revision,'submitted',auth.uid(),r.id||':'||r.revision||':revised:requester');
 insert into public.event_review_outbox(event_id,request_id,request_revision,kind,recipient_id,deduplication_key)
 select e,r.id,r.revision,'submitted',user_id,r.id||':'||r.revision||':revised:reviewer:'||user_id from public.event_review_permissions where event_id=e and can_review and user_id<>auth.uid();
 return jsonb_build_object('id',r.id,'state',r.state);
end; $$;
create function public.protected_meeting_context(p_meeting uuid) returns boolean language plpgsql security definer set search_path='' as $$
declare m public.event_b2b_meetings;
begin
 if auth.uid() is null then raise exception 'Not authorized' using errcode='42501'; end if;
 select * into m from public.event_b2b_meetings where id=p_meeting;
 if not exists(select 1 from public.event_review_meeting_permits where meeting_id=p_meeting) then return false; end if;
 if not coalesce(auth.uid() in(m.profile_a_id,m.profile_b_id) or public.event_can(m.event_id,'b2b'),false) or not public.review_meeting_visible(p_meeting) then raise exception 'Not authorized' using errcode='42501'; end if;
 return true;
end; $$;
revoke all on function public.create_event_meeting_batch(uuid,jsonb),public.revise_investor_request(uuid,integer,timestamptz,timestamptz,text,text),public.protected_meeting_context(uuid) from public,anon,authenticated;
grant execute on function public.create_event_meeting_batch(uuid,jsonb),public.revise_investor_request(uuid,integer,timestamptz,timestamptz,text,text),public.protected_meeting_context(uuid) to authenticated;
commit;
