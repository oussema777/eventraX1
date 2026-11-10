-- Forward-only: no historical invitation replay. Deploy queue-aware API/worker first.
begin;
alter table public.event_b2b_meetings add column notification_revision bigint not null default 0;
create table public.meeting_delivery_jobs (
 id uuid primary key default gen_random_uuid(),
 meeting_id uuid not null references public.event_b2b_meetings(id) on delete restrict,
 event_id uuid not null references public.events(id) on delete cascade,
 recipient_id uuid not null references auth.users(id),
 actor_id uuid references auth.users(id),
 revision bigint not null, kind text not null check(kind in ('pending','confirmed','cancelled')),
 state text not null default 'queued' check(state in ('queued','sending','sent','failed','suppressed','reconcile')),
 attempts integer not null default 0, available_at timestamptz not null default now(),
 lease_token uuid, lease_until timestamptz, first_attempt_at timestamptz,
 created_at timestamptz not null default now(), accepted_at timestamptz,
 provider_id text, error_code text, payload jsonb, frozen_mail jsonb,
 unique(meeting_id,revision,recipient_id)
);
alter table public.meeting_delivery_jobs enable row level security;
revoke all on public.meeting_delivery_jobs from public,anon,authenticated;
grant all on public.meeting_delivery_jobs to service_role;
create index meeting_delivery_ready on public.meeting_delivery_jobs(available_at,id) where state in ('queued','failed','sending');
create index meeting_delivery_event on public.meeting_delivery_jobs(event_id,created_at desc);
create index meeting_delivery_actor on public.meeting_delivery_jobs(actor_id,created_at desc);
create table public.meeting_delivery_health(id boolean primary key default true check(id),checked_at timestamptz not null);
alter table public.meeting_delivery_health enable row level security;
revoke all on public.meeting_delivery_health from public,anon,authenticated;
grant all on public.meeting_delivery_health to service_role;
create function public.record_meeting_delivery_heartbeat() returns void language sql security definer set search_path='' as $$
 insert into public.meeting_delivery_health values(true,now()) on conflict(id) do update set checked_at=excluded.checked_at;
$$;

create function public.guard_ordinary_meeting() returns trigger language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); admin boolean; requester uuid; recipient uuid; changed boolean;
begin
 if tg_op='DELETE' then
   if actor is not null then raise exception 'Use meeting cancellation' using errcode='42501'; end if;
   return old;
 end if;
 if exists(select 1 from public.event_review_meeting_permits where meeting_id=new.id)
   or public.investor_attendee_protected(new.event_id,new.attendee_a_id)
   or public.investor_attendee_protected(new.event_id,new.attendee_b_id)
   or public.investor_profile_protected(new.event_id,new.profile_a_id)
   or public.investor_profile_protected(new.event_id,new.profile_b_id) then return new; end if;
 admin:=coalesce(public.event_can(new.event_id,'b2b'),false);
 if new.status in ('pending','confirmed') and new.start_at<=now()
   and (tg_op='INSERT' or new.start_at is distinct from old.start_at or new.status is distinct from old.status) then
   raise exception 'B2B_SLOT_EXPIRED' using errcode='23514';
 end if;
 requester:=case when new.organizer_id in(new.profile_a_id,new.profile_b_id) then new.organizer_id else new.profile_a_id end;
 recipient:=case when requester=new.profile_a_id then new.profile_b_id else new.profile_a_id end;
 if tg_op='INSERT' then
   if actor is not null and (new.status<>'pending' or (not admin and actor is distinct from requester)) then
     raise exception 'Only the requester can create a pending invitation' using errcode='42501';
   end if;
   new.notification_revision:=case when new.start_at is not null and new.profile_a_id is not null and new.profile_b_id is not null then 1 else 0 end;
 else
   if actor is not null and (new.id is distinct from old.id or new.event_id is distinct from old.event_id
     or new.attendee_a_id is distinct from old.attendee_a_id or new.attendee_b_id is distinct from old.attendee_b_id
     or new.profile_a_id is distinct from old.profile_a_id or new.profile_b_id is distinct from old.profile_b_id
     or new.organizer_id is distinct from old.organizer_id) then
     raise exception 'Meeting participants are immutable' using errcode='42501';
   end if;
   if actor is not null and new.status is distinct from old.status then
     if old.status='pending' and new.status='confirmed' and actor=recipient then null;
     elsif old.status in ('pending','confirmed') and new.status='cancelled'
       and (actor in(new.profile_a_id,new.profile_b_id) or admin) then null;
     elsif old.status='confirmed' and new.status='completed' and public.event_can(new.event_id,'checkin') then null;
     elsif old.status='confirmed' and new.status='pending' and (actor=requester or admin)
       and (new.start_at is distinct from old.start_at or new.end_at is distinct from old.end_at) then null;
     else raise exception 'Meeting response is not authorized' using errcode='42501'; end if;
   end if;
   changed:=new.start_at is distinct from old.start_at or new.end_at is distinct from old.end_at
     or new.location is distinct from old.location
     or coalesce(new.meta->>'meeting_format',new.meta->>'meeting_type','in-person') is distinct from coalesce(old.meta->>'meeting_format',old.meta->>'meeting_type','in-person');
   if actor is not null and changed and new.status=old.status
     and (new.status<>'pending' or (actor is distinct from requester and not admin)) then
     raise exception 'Rescheduling requires a new acceptance' using errcode='42501';
   end if;
   new.notification_revision:=old.notification_revision;
   if new.status in ('pending','confirmed','cancelled') and new.start_at is not null
     and (new.status is distinct from old.status or changed) then new.notification_revision:=old.notification_revision+1; end if;
 end if;
 -- Limit creation of invitations, never confirmations, cancellations or retries.
 if actor is not null and new.status='pending' and new.notification_revision>0
   and (tg_op='INSERT' or new.notification_revision is distinct from old.notification_revision)
   and (select count(*) from public.meeting_delivery_jobs where actor_id=actor and kind='pending' and created_at>now()-interval '1 hour')
     >= (case when admin then 2000 else 240 end) then
   raise exception 'B2B_REQUEST_RATE_LIMIT' using errcode='54000';
 end if;
 return new;
end; $$;
-- Run after the table allocator, so revision and queued details describe the saved assignment.
create trigger zy_guard_ordinary_meeting before insert or update or delete on public.event_b2b_meetings
 for each row execute function public.guard_ordinary_meeting();

create function public.queue_ordinary_meeting() returns trigger language plpgsql security definer set search_path='' as $$
declare target uuid; email_on boolean; bell_on boolean; title text;
begin
 if new.notification_revision=0 or (tg_op='UPDATE' and new.notification_revision=old.notification_revision)
   or new.status not in ('pending','confirmed','cancelled') then return new; end if;
 if exists(select 1 from public.event_review_meeting_permits where meeting_id=new.id) then return new; end if;
 select coalesce(is_email_enabled,true),coalesce(is_bell_enabled,true) into email_on,bell_on
   from public.event_notification_settings where event_id=new.event_id and trigger_type='meeting_booked';
 title:=case new.status when 'pending' then 'Meeting invitation' when 'confirmed' then 'Meeting confirmed' else 'Meeting cancelled' end;
 for target in select distinct unnest(array[new.profile_a_id,new.profile_b_id]) loop
   if target is null then continue; end if;
   insert into public.meeting_delivery_jobs(meeting_id,event_id,recipient_id,actor_id,revision,kind,state,error_code)
     values(new.id,new.event_id,target,auth.uid(),new.notification_revision,new.status,
       case when coalesce(email_on,true) then 'queued' else 'suppressed' end,
       case when coalesce(email_on,true) then null else 'EMAIL_DISABLED' end) on conflict do nothing;
   if coalesce(bell_on,true) then
     insert into public.notifications(recipient_id,actor_id,type,title,body,action_url,source_key)
       values(target,auth.uid(),'action',title,'Open Eventra for the current meeting details.',
         '/event/'||new.event_id||'/networking?tab=schedule&meetingId='||new.id,
         'meeting:'||new.id||':'||new.notification_revision||':'||target) on conflict(source_key) do nothing;
   end if;
 end loop;
 return new;
end; $$;
create trigger queue_ordinary_meeting after insert or update on public.event_b2b_meetings
 for each row execute function public.queue_ordinary_meeting();

create function public.meeting_delivery_managed(p_meeting uuid) returns boolean language sql stable security definer set search_path='' as $$
 select coalesce((select notification_revision>0 from public.event_b2b_meetings where id=p_meeting),false);
$$;

create function public.claim_meeting_delivery() returns jsonb language plpgsql security definer set search_path='' as $$
declare j public.meeting_delivery_jobs;
begin
 update public.meeting_delivery_jobs set state='reconcile',error_code='RECONCILE_REQUIRED',lease_token=null,lease_until=null
   where state in ('queued','sending','failed') and (lease_until is null or lease_until<now())
   and (attempts>=8 or first_attempt_at<now()-interval '23 hours');
 select * into j from public.meeting_delivery_jobs
   where ((state in ('queued','failed') and available_at<=now()) or (state='sending' and lease_until<now()))
   order by available_at,id for update skip locked limit 1;
 if j.id is null then return null; end if;
 update public.meeting_delivery_jobs set state='sending',attempts=attempts+1,lease_token=gen_random_uuid(),
   first_attempt_at=coalesce(first_attempt_at,now()),lease_until=now()+interval '2 minutes'
   where id=j.id returning * into j;
 return jsonb_build_object('id',j.id,'token',j.lease_token);
end; $$;

create function public.prepare_meeting_delivery(p_id uuid,p_token uuid) returns jsonb language plpgsql security definer set search_path='' as $$
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
 p:=coalesce(j.payload,jsonb_build_object('version',1,'to',address,'kind',j.kind,'meeting_id',m.id,'event_id',m.event_id,
   'start_at',m.start_at,'end_at',m.end_at,'location',case when m.status='confirmed' then m.location else null end,
   'format',coalesce(m.meta->>'meeting_format',m.meta->>'meeting_type','in-person'),
   'event_name',(select name from public.events where id=m.event_id),
   'timezone',(select timezone from public.events where id=m.event_id),
   'partner',(select full_name from public.profiles where id=case when j.recipient_id=m.profile_a_id then m.profile_b_id else m.profile_a_id end)));
 update public.meeting_delivery_jobs set payload=p where id=j.id;
 return jsonb_build_object('payload',p,'mail',j.frozen_mail);
end; $$;

create function public.freeze_meeting_mail(p_id uuid,p_token uuid,p_mail jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare j public.meeting_delivery_jobs;
begin
 select * into j from public.meeting_delivery_jobs where id=p_id for update;
 if j.id is null or j.state<>'sending' or j.lease_token is distinct from p_token or j.lease_until<=now() then return null; end if;
 if j.payload is null or p_mail->'to' is distinct from jsonb_build_array(j.payload->>'to') then raise exception 'Invalid mail'; end if;
 update public.meeting_delivery_jobs set frozen_mail=coalesce(frozen_mail,p_mail) where id=j.id returning * into j;
 return j.frozen_mail;
end; $$;

create function public.finish_meeting_delivery(p_id uuid,p_token uuid,p_provider text default null,p_error text default null,p_permanent boolean default false)
returns boolean language plpgsql security definer set search_path='' as $$
declare j public.meeting_delivery_jobs;
begin
 select * into j from public.meeting_delivery_jobs where id=p_id for update;
 if j.id is null or j.state<>'sending' or j.lease_token is distinct from p_token or j.lease_until<=now() then return false; end if;
 if p_provider is not null and (length(p_provider) not between 1 and 200 or j.frozen_mail is null) then raise exception 'Invalid provider acknowledgement'; end if;
 if p_provider is null and (p_error is null or p_error !~ '^[A-Z0-9_]{1,64}$') then raise exception 'Invalid error'; end if;
 update public.meeting_delivery_jobs set state=case when p_provider is not null then 'sent' when p_permanent then 'reconcile' else 'failed' end,
   accepted_at=case when p_provider is not null then now() else null end,provider_id=p_provider,error_code=p_error,
   lease_token=null,lease_until=null,available_at=now()+make_interval(secs=>least(3600,30*power(2,attempts)::integer)) where id=j.id;
 return true;
end; $$;

create function public.get_meeting_delivery_status(p_event uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not public.event_can(p_event,'b2b') then raise exception 'Not authorized' using errcode='42501'; end if;
 return jsonb_build_object('worker_checked_at',(select checked_at from public.meeting_delivery_health where id),
   'counts',(select coalesce(jsonb_object_agg(state,n),'{}') from
   (select state,count(*) n from public.meeting_delivery_jobs where event_id=p_event group by state) s),
   'oldest_waiting',(select min(created_at) from public.meeting_delivery_jobs where event_id=p_event and state in ('queued','sending','failed')),
   'recent',(select coalesce(jsonb_agg(x),'[]') from (select id,meeting_id,kind,state,attempts,error_code,created_at,accepted_at,
      state='failed' and attempts<8 and first_attempt_at>now()-interval '23 hours' as can_retry
      from public.meeting_delivery_jobs where event_id=p_event order by (state in ('failed','reconcile')) desc,created_at desc limit 20) x));
end; $$;
create function public.retry_meeting_delivery(p_job uuid) returns boolean language plpgsql security definer set search_path='' as $$
declare j public.meeting_delivery_jobs;
begin
 select * into j from public.meeting_delivery_jobs where id=p_job for update;
 if j.id is null or not public.event_can(j.event_id,'b2b') then raise exception 'Not authorized' using errcode='42501'; end if;
 update public.meeting_delivery_jobs set state='queued',available_at=now() where id=j.id and state='failed'
   and attempts<8 and first_attempt_at>now()-interval '23 hours';
 return found;
end; $$;

revoke all on function public.record_meeting_delivery_heartbeat(),public.guard_ordinary_meeting(),public.queue_ordinary_meeting(),public.meeting_delivery_managed(uuid),
 public.claim_meeting_delivery(),public.prepare_meeting_delivery(uuid,uuid),public.freeze_meeting_mail(uuid,uuid,jsonb),
 public.finish_meeting_delivery(uuid,uuid,text,text,boolean),public.get_meeting_delivery_status(uuid),public.retry_meeting_delivery(uuid) from public,anon,authenticated;
grant execute on function public.record_meeting_delivery_heartbeat(),public.meeting_delivery_managed(uuid),public.claim_meeting_delivery(),public.prepare_meeting_delivery(uuid,uuid),
 public.freeze_meeting_mail(uuid,uuid,jsonb),public.finish_meeting_delivery(uuid,uuid,text,text,boolean) to service_role;
grant execute on function public.get_meeting_delivery_status(uuid),public.retry_meeting_delivery(uuid) to authenticated;
commit;
