begin;
alter table public.event_review_outbox drop constraint event_review_outbox_kind_check;
alter table public.event_review_outbox add constraint event_review_outbox_kind_check
  check(kind in ('submitted','forwarded','rejected','withdrawn','expired','needs_new_slot','confirmed','cancelled'));
alter table public.event_review_outbox add column meeting_id uuid references public.event_b2b_meetings(id) on delete restrict;

-- Runs inside the same transaction as the existing authoritative meeting guard
-- and scheduling trigger. Covers legacy clients too, not only the new RPC.
create function public.queue_protected_meeting_response()
returns trigger language plpgsql security definer set search_path='' as $$
declare p public.event_review_meeting_permits;
begin
  if new.status is not distinct from old.status or new.status not in ('confirmed','cancelled') then return new; end if;
  select * into p from public.event_review_meeting_permits where meeting_id=new.id;
  if p.meeting_id is null then return new; end if;
  -- Assignment migration is a quarantine operation, not a decline. Its imported
  -- private request is inserted before the original meeting is cancelled.
  if exists(select 1 from public.event_booking_requests where legacy_meeting_id=new.id)
    or exists(select 1 from public.event_review_hidden_meetings where meeting_id=new.id) then return new; end if;
  insert into public.event_review_outbox(event_id,meeting_id,kind,recipient_id,deduplication_key)
    select new.event_id,new.id,new.status,u,new.id||':'||new.status||':'||u
    from (select distinct unnest(array[p.requester_id,p.recipient_id]) as u) recipients
    where u is not null on conflict(deduplication_key) do nothing;
  return new;
end; $$;
create trigger protected_meeting_response after update of status on public.event_b2b_meetings
  for each row execute function public.queue_protected_meeting_response();

create function public.respond_protected_meeting(p_meeting uuid,p_expected text,p_status text)
returns boolean language plpgsql security definer set search_path='' as $$
declare m public.event_b2b_meetings; p public.event_review_meeting_permits; e uuid;
begin
  select event_id into e from public.event_b2b_meetings where id=p_meeting;
  -- Match the guard's event-first lock order.
  perform 1 from public.events where id=e for update;
  select * into m from public.event_b2b_meetings where id=p_meeting for update;
  if auth.uid() is null then raise exception 'Not authorized' using errcode='42501'; end if;
  select * into p from public.event_review_meeting_permits where meeting_id=m.id;
  -- Ordinary/legacy meetings keep their existing RLS and attendee-ID handling.
  -- This command performs no write and discloses no meeting data for that path.
  if p.meeting_id is null then return false; end if;
  if auth.uid() is null or m.id is null or not public.review_meeting_visible(m.id)
    or not coalesce(auth.uid() in (m.profile_a_id,m.profile_b_id) or public.event_can(e,'b2b'),false) then
    raise exception 'Not authorized' using errcode='42501';
  end if;
  if p_status is null or p_status not in ('confirmed','cancelled') or p_expected is null
    or p_expected not in ('pending','confirmed') then raise exception 'Invalid response' using errcode='22023'; end if;
  if m.status is distinct from p_expected then raise exception 'REVIEW_STALE_DECISION' using errcode='40001'; end if;
  -- Existing BEFORE triggers enforce recipient-only acceptance and scheduling.
  update public.event_b2b_meetings set status=p_status where id=m.id;
  return true;
end; $$;

-- Retain the already-tested private request delivery path unchanged.
alter function public.prepare_review_delivery(uuid,uuid) rename to prepare_review_request_delivery;
revoke all on function public.prepare_review_request_delivery(uuid,uuid) from service_role;
create function public.prepare_review_delivery(p_id uuid,p_lease uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare j public.event_review_outbox; m public.event_b2b_meetings; p public.event_review_meeting_permits; address text; payload jsonb;
begin
  select * into j from public.event_review_outbox where id=p_id for update;
  if j.id is null or j.state<>'sending' or j.lease_token is distinct from p_lease or j.lease_until<=now() then return null; end if;
  if j.kind not in ('confirmed','cancelled') then return public.prepare_review_request_delivery(p_id,p_lease); end if;
  if not public.event_review_active(j.event_id) then
    update public.event_review_outbox set state='queued',lease_token=null,lease_until=null where id=j.id; return null;
  end if;
  select * into m from public.event_b2b_meetings where id=j.meeting_id and event_id=j.event_id;
  select * into p from public.event_review_meeting_permits where meeting_id=m.id and event_id=j.event_id;
  select email into address from auth.users where id=j.recipient_id;
  if m.id is null or p.meeting_id is null or m.status is distinct from j.kind
    or not coalesce(j.recipient_id in (p.requester_id,p.recipient_id),false)
    or address is null or address !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or exists(select 1 from public.event_review_hidden_meetings where meeting_id=m.id)
    or exists(select 1 from public.event_booking_requests where legacy_meeting_id=m.id)
    or (j.delivery_payload is not null and j.delivery_payload->>'to' is distinct from address) then
    update public.event_review_outbox set state='suppressed',last_error_code='STALE_OR_UNAUTHORIZED',lease_token=null,lease_until=null where id=j.id; return null;
  end if;
  payload:=coalesce(j.delivery_payload,jsonb_build_object('version',1,'to',address,'kind',j.kind,
    'audience','participant','event_id',j.event_id,'meeting_id',m.id));
  update public.event_review_outbox set delivery_payload=payload where id=j.id;
  return payload;
end; $$;
revoke all on function public.queue_protected_meeting_response(),public.respond_protected_meeting(uuid,text,text),
  public.prepare_review_delivery(uuid,uuid) from public,anon,authenticated;
grant execute on function public.respond_protected_meeting(uuid,text,text) to authenticated;
grant execute on function public.prepare_review_delivery(uuid,uuid) to service_role;
commit;
