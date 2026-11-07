-- Deploy a worker that supports payload versions 1 AND 2 before applying.
-- Frozen version-1 payloads retain their original renderer and idempotency key.
-- No job is reset, requeued or resent by this migration.
begin;
create or replace function public.prepare_review_request_delivery(p_id uuid,p_lease uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare j public.event_review_outbox; r public.event_booking_requests; target_email text; audience text; payload jsonb;
begin
  select * into j from public.event_review_outbox where id=p_id for update;
  if j.id is null or j.state<>'sending' or j.lease_token is distinct from p_lease or j.lease_until<=now() then return null; end if;
  if not public.event_review_active(j.event_id) then
    update public.event_review_outbox set state='queued',lease_until=null,lease_token=null where id=j.id;
    return null;
  end if;
  select * into r from public.event_booking_requests where id=j.request_id and event_id=j.event_id;
  select email into target_email from auth.users where id=j.recipient_id;
  if j.recipient_id=r.requester_id then audience:='requester';
  elsif j.kind='submitted' and j.recipient_id is distinct from r.recipient_id
    and public.review_delivery_reviewer(j.event_id,j.recipient_id) then audience:='reviewer';
  elsif j.kind='forwarded' and j.recipient_id=r.recipient_id then audience:='recipient';
  end if;
  if r.id is null or j.request_revision is distinct from r.revision or audience is null
    or target_email is null or target_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or not ((j.kind='submitted' and r.state='awaiting_review' and r.starts_at>now()) or (j.kind=r.state and j.kind<>'submitted'))
    or (j.kind='forwarded' and not exists(select 1 from public.event_b2b_meetings
      where id=r.meeting_id and event_id=r.event_id and status='pending' and start_at>now())) then
    update public.event_review_outbox set state='suppressed',last_error_code='STALE_OR_UNAUTHORIZED',lease_until=null,lease_token=null where id=j.id;
    return null;
  end if;
  -- Freeze exact payload across retries. No private notes, meeting topics, QR,
  -- join URLs, tokens, or personal details are included in this email payload.
  if j.delivery_payload is not null and j.delivery_payload->>'to' is distinct from target_email then
    update public.event_review_outbox set state='suppressed',last_error_code='RECIPIENT_CHANGED',lease_until=null,lease_token=null where id=j.id;
    return null;
  end if;
  payload:=coalesce(j.delivery_payload,jsonb_build_object('version',2,'to',target_email,'kind',j.kind,
    'audience',audience,'event_id',j.event_id,'request_id',r.id));
  update public.event_review_outbox set delivery_payload=payload where id=j.id;
  return payload;
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
    'audience','participant','event_id',j.event_id,'meeting_id',m.id));
  update public.event_review_outbox set delivery_payload=payload where id=j.id;
  return payload;
end; $$;
commit;
