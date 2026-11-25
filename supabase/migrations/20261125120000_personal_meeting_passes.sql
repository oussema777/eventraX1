-- Deploy the updated worker first. Preserve previously frozen deliveries across retries.
begin;
create or replace function public.prepare_meeting_delivery(p_id uuid,p_token uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare j public.meeting_delivery_jobs; m public.event_b2b_meetings; address text; p jsonb;
begin
 select * into j from public.meeting_delivery_jobs where id=p_id for update;
 if j.id is null or j.state<>'sending' or j.lease_token is distinct from p_token or j.lease_until<=now() then return null; end if;
 select * into m from public.event_b2b_meetings where id=j.meeting_id;
 select email into address from auth.users where id=j.recipient_id;
 if m.id is null or m.notification_revision<>j.revision or m.status<>j.kind
   or not coalesce(j.recipient_id in(m.profile_a_id,m.profile_b_id),false)
   or (j.kind='pending' and m.start_at<=now()) or address is null
   or exists(select 1 from public.event_review_meeting_permits where meeting_id=m.id)
   or public.investor_profile_protected(m.event_id,m.profile_a_id) or public.investor_profile_protected(m.event_id,m.profile_b_id)
   or exists(select 1 from public.event_notification_settings where event_id=m.event_id and trigger_type='meeting_booked' and is_email_enabled=false)
   or (j.payload is not null and j.payload->>'to' is distinct from address) then
   update public.meeting_delivery_jobs set state='suppressed',error_code='STALE_OR_DISABLED',lease_token=null,lease_until=null where id=j.id;
   return null;
 end if;
 p:=coalesce(j.payload,jsonb_build_object('version',1,'participant_id',j.recipient_id,'to',address,'kind',j.kind,'meeting_id',m.id,'event_id',m.event_id,
   'start_at',m.start_at,'end_at',m.end_at,'location',case when m.status='confirmed' then m.location else null end,
   'format',coalesce(m.meta->>'meeting_format',m.meta->>'meeting_type','in-person'),
   'event_name',(select name from public.events where id=m.event_id),
   'timezone',(select timezone from public.events where id=m.event_id),
   'partner',(select full_name from public.profiles where id=case when j.recipient_id=m.profile_a_id then m.profile_b_id else m.profile_a_id end)));
 update public.meeting_delivery_jobs set payload=p where id=j.id;
 return jsonb_build_object('payload',p,'mail',j.frozen_mail);
end; $$;

create or replace function public.prepare_review_delivery(p_id uuid,p_lease uuid)
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
  payload:=coalesce(j.delivery_payload,jsonb_build_object('version',2,'to',address,'kind',j.kind,
    'participant_id',j.recipient_id,'format',coalesce(m.meta->>'meeting_format',m.meta->>'meeting_type','in-person'),
    'audience','participant','event_id',j.event_id,'meeting_id',m.id));
  update public.event_review_outbox set delivery_payload=payload where id=j.id;
  return payload;
end; $$;
commit;
