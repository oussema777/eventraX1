-- Service-only delivery commands. Does not enable the feature or schedule a worker.
begin;
alter table public.event_review_outbox
  add column lease_token uuid,
  add column first_attempt_at timestamptz,
  add column delivery_payload jsonb,
  add column provider_id text;
create index event_review_outbox_leases on public.event_review_outbox(lease_until) where state='sending';

-- Explicit target-user equivalent of current event_can(event,'b2b'). Never trust
-- a queued permission bit alone: team access may have been removed meanwhile.
create function public.review_delivery_reviewer(p_event uuid,p_user uuid)
returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.event_review_permissions p join public.events e on e.id=p.event_id
    where p.event_id=p_event and p.user_id=p_user and p.can_review and (
      coalesce(e.owner_id,e.organizer_id)=p_user
      or exists(select 1 from public.profiles where id=p_user and role='admin')
      or exists(select 1 from public.event_team_members where event_id=p_event and user_id=p_user
        and status='active' and role in ('administrator','coordinator'))));
$$;

create function public.claim_review_delivery()
returns jsonb language plpgsql security definer set search_path='' as $$
declare j public.event_review_outbox;
begin
  -- A provider may have accepted an unacknowledged attempt. Never retry beyond
  -- the provider's 24-hour idempotency window; leave an actionable failure.
  update public.event_review_outbox set state='failed',last_error_code='RECONCILE_REQUIRED',
    lease_until=null,lease_token=null,available_at='infinity'
    where state in ('queued','failed','sending') and available_at<>'infinity'::timestamptz
      and (lease_until is null or lease_until<now())
      and (attempts>=8 or first_attempt_at<now()-interval '23 hours');
  select o.* into j from public.event_review_outbox o
    where public.event_review_active(o.event_id) and o.attempts<8
      and (o.first_attempt_at is null or o.first_attempt_at>now()-interval '23 hours')
      and ((o.state in ('queued','failed') and o.available_at<=now())
        or (o.state='sending' and o.lease_until<now()))
    order by o.available_at,o.id for update skip locked limit 1;
  if j.id is null then return null; end if;
  update public.event_review_outbox set state='sending',attempts=attempts+1,
    first_attempt_at=coalesce(first_attempt_at,now()),lease_token=gen_random_uuid(),lease_until=now()+interval '2 minutes'
    where id=j.id returning * into j;
  return jsonb_build_object('id',j.id,'lease_token',j.lease_token);
end; $$;

create function public.prepare_review_delivery(p_id uuid,p_lease uuid)
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
  payload:=coalesce(j.delivery_payload,jsonb_build_object('version',1,'to',target_email,'kind',j.kind,
    'audience',audience,'event_id',j.event_id,'request_id',r.id));
  update public.event_review_outbox set delivery_payload=payload where id=j.id;
  return payload;
end; $$;

create function public.finish_review_delivery(p_id uuid,p_lease uuid,p_provider_id text default null,p_error text default null,p_permanent boolean default false)
returns boolean language plpgsql security definer set search_path='' as $$
declare j public.event_review_outbox;
begin
  select * into j from public.event_review_outbox where id=p_id for update;
  if j.id is null or j.state<>'sending' or j.lease_token is distinct from p_lease or j.lease_until<=now() then return false; end if;
  if p_provider_id is not null and length(p_provider_id) between 1 and 200 and p_error is null then
    if j.delivery_payload is null then raise exception 'Delivery was not prepared'; end if;
    update public.event_review_outbox set state='sent',provider_id=p_provider_id,delivered_at=now(),
      lease_token=null,lease_until=null,last_error_code=null where id=j.id;
  else
    if p_error is null or p_error !~ '^[A-Z0-9_]{1,64}$' then raise exception 'Invalid error code'; end if;
    update public.event_review_outbox set state='failed',last_error_code=p_error,lease_token=null,lease_until=null,
      available_at=case when p_permanent or attempts>=8 then 'infinity'::timestamptz
        else now()+make_interval(secs=>least(3600,30*power(2,attempts)::integer)) end where id=j.id;
  end if;
  return true;
end; $$;

revoke all on function public.review_delivery_reviewer(uuid,uuid),public.claim_review_delivery(),
  public.prepare_review_delivery(uuid,uuid),public.finish_review_delivery(uuid,uuid,text,text,boolean) from public,anon,authenticated;
grant execute on function public.claim_review_delivery(),public.prepare_review_delivery(uuid,uuid),
  public.finish_review_delivery(uuid,uuid,text,text,boolean) to service_role;
commit;
