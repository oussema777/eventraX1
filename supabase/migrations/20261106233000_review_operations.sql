begin;
create function public.configure_event_review_policy(p_event uuid,p_enabled boolean)
returns void language plpgsql security definer set search_path='' as $$
begin
 perform 1 from public.events where id=p_event for update;
 if not public.event_can(p_event,'team') then raise exception 'Not authorized' using errcode='42501'; end if;
 if p_enabled is null then raise exception 'Invalid policy'; end if;
 if not p_enabled and (exists(select 1 from public.event_investor_designations where event_id=p_event and active)
  or exists(select 1 from public.event_investor_invitations where event_id=p_event and status='pending' and expires_at>now())
  or exists(select 1 from public.event_booking_requests where event_id=p_event and state in ('awaiting_review','needs_new_slot')))
 then raise exception 'REVIEW_ACTIVE_WORK_REMAINS' using errcode='23514'; end if;
 insert into public.event_review_policies(event_id,enabled,updated_by) values(p_event,p_enabled,auth.uid())
 on conflict(event_id) do update set enabled=excluded.enabled,version=event_review_policies.version+1,updated_at=now(),updated_by=auth.uid();
 insert into public.event_review_audit(event_id,actor_id,action,subject_id,details) values(p_event,auth.uid(),'policy_changed',p_event,jsonb_build_object('enabled',p_enabled));
end; $$;
create table public.event_review_notification_reads(job_id uuid primary key references public.event_review_outbox(id) on delete cascade,read_at timestamptz not null default now());
alter table public.event_review_notification_reads enable row level security;
revoke all on public.event_review_notification_reads from public,anon,authenticated;
grant all on public.event_review_notification_reads to service_role;

create function public.list_review_notifications(p_limit integer default 20)
returns table(id text,recipient_id uuid,actor_id uuid,type text,title text,body text,action_url text,created_at timestamptz,read_at timestamptz,kind text,requester boolean)
language sql stable security definer set search_path='' as $$
 select 'review:'||o.id,o.recipient_id,null::uuid,'action','Eventra · Meeting update',
 case o.kind when 'submitted' then case when r.requester_id=auth.uid() then 'Your request is awaiting organizer review.' else 'A meeting request needs your review.' end
 when 'forwarded' then 'A meeting invitation is ready. Recipient confirmation is still required.'
 when 'confirmed' then 'Your meeting is confirmed.' when 'cancelled' then 'Your meeting was cancelled or declined.'
 when 'rejected' then 'Your meeting request was not approved.' when 'needs_new_slot' then 'Choose a new time for your meeting request.'
 when 'expired' then 'Your meeting request has expired.' else 'Your meeting request was withdrawn.' end,
 case when o.kind='submitted' and r.requester_id is distinct from auth.uid() then '/manage-event/'||o.event_id||'?tab=b2b' else '/my-networking' end,
 o.created_at,seen.read_at,o.kind,coalesce(r.requester_id=auth.uid(),false)
 from public.event_review_outbox o left join public.event_booking_requests r on r.id=o.request_id
 left join public.event_b2b_meetings m on m.id=coalesce(o.meeting_id,r.meeting_id)
 left join public.event_review_notification_reads seen on seen.job_id=o.id
 where auth.uid() is not null and o.recipient_id=auth.uid() and public.event_review_active(o.event_id)
 and (
   (o.kind in ('confirmed','cancelled') and m.event_id=o.event_id and m.status=o.kind
     and exists(select 1 from public.event_review_meeting_permits p where p.meeting_id=m.id and auth.uid() in(p.requester_id,p.recipient_id))
     and not exists(select 1 from public.event_review_hidden_meetings h where h.meeting_id=m.id))
   or (o.request_revision=r.revision and r.event_id=o.event_id and
     ((o.kind='submitted' and r.state='awaiting_review' and r.starts_at>now() and
       (r.requester_id=auth.uid() or (r.recipient_id is distinct from auth.uid() and public.review_delivery_reviewer(o.event_id,auth.uid()))))
       or (o.kind=r.state and o.kind in ('rejected','needs_new_slot','withdrawn','expired') and r.requester_id=auth.uid())
       or (o.kind='forwarded' and r.state='forwarded' and m.status='pending' and m.start_at>now() and auth.uid() in(r.requester_id,r.recipient_id)))))
 order by o.created_at desc,o.id limit greatest(1,least(coalesce(p_limit,20),100));
$$;
create function public.mark_review_notifications_read(p_job uuid default null)
returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Not authorized' using errcode='42501'; end if;
 insert into public.event_review_notification_reads(job_id)
 select id from public.event_review_outbox where recipient_id=auth.uid() and (p_job is null or id=p_job)
 on conflict(job_id) do nothing;
end; $$;
create function public.add_review_note(p_request uuid,p_body text)
returns uuid language plpgsql security definer set search_path='' as $$
declare e uuid; n uuid;
begin
 select event_id into e from public.event_booking_requests where id=p_request;
 if not public.event_review_allowed(e,'review') then raise exception 'Not authorized' using errcode='42501'; end if;
 if p_body is null or length(trim(p_body))=0 or length(p_body)>4000 then raise exception 'Invalid note'; end if;
 insert into public.event_booking_review_notes(request_id,author_id,body) values(p_request,auth.uid(),trim(p_body)) returning id into n;
 insert into public.event_review_audit(event_id,actor_id,action,subject_id) values(e,auth.uid(),'private_note_added',p_request);
 return n;
end; $$;
create function public.get_event_review_report(p_event uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if not public.event_can(p_event,'manage') and not public.event_review_allowed(p_event,'review') then raise exception 'Not authorized' using errcode='42501'; end if;
 return jsonb_build_object('event_id',p_event,'generated_at',now(),
 'requests',(select coalesce(jsonb_object_agg(state,total),'{}') from(select state,count(*) total from public.event_booking_requests where event_id=p_event group by state)s),
 'meetings',(select coalesce(jsonb_object_agg(status,total),'{}') from(select m.status,count(*) total from public.event_review_meeting_permits p join public.event_b2b_meetings m on m.id=p.meeting_id where p.event_id=p_event group by m.status)s),
 'delivery',(select coalesce(jsonb_object_agg(state,total),'{}') from(select state,count(*) total from public.event_review_outbox where event_id=p_event group by state)s));
end; $$;

-- Read visibility is also applied to old unscheduled matches. Their existing
-- acceptance links remain blocked by the protected-write guard.
create function public.hide_unscheduled_investor_matches() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.active then
  insert into public.event_review_hidden_meetings(meeting_id,event_id,requester_id)
  select m.id,m.event_id,case when m.attendee_a_id=new.attendee_id then m.profile_b_id else m.profile_a_id end
   from public.event_b2b_meetings m where m.event_id=new.event_id and new.attendee_id in(m.attendee_a_id,m.attendee_b_id)
    and m.status='pending' and m.start_at is null on conflict(meeting_id) do nothing;
 end if;
 return new;
end; $$;
create trigger hide_unscheduled_investor_matches after insert or update on public.event_investor_designations
 for each row execute function public.hide_unscheduled_investor_matches();

-- A completed swap supersedes the old meeting; it is not a separate cancellation.
create or replace function public.queue_protected_meeting_response()
returns trigger language plpgsql security definer set search_path='' as $$
declare p public.event_review_meeting_permits;
begin
 if new.status is not distinct from old.status or new.status not in ('confirmed','cancelled') then return new; end if;
 select * into p from public.event_review_meeting_permits where meeting_id=new.id;
 if p.meeting_id is null or exists(select 1 from public.event_review_swaps where old_meeting_id=new.id)
  or exists(select 1 from public.event_booking_requests where legacy_meeting_id=new.id)
  or exists(select 1 from public.event_review_hidden_meetings where meeting_id=new.id) then return new; end if;
 insert into public.event_review_outbox(event_id,meeting_id,kind,recipient_id,deduplication_key)
 select new.event_id,new.id,new.status,u,new.id||':'||new.status||':'||u from(select distinct unnest(array[p.requester_id,p.recipient_id])u)s where u is not null on conflict(deduplication_key) do nothing;
 return new;
end; $$;
create function public.invalidate_review_replacements() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.status<>'cancelled' or old.status='cancelled' or exists(select 1 from public.event_review_swaps where old_meeting_id=new.id) then return new; end if;
 update public.event_b2b_meetings set status='cancelled' where status='pending' and id in(select new_meeting_id from public.event_review_replacements where old_meeting_id=new.id);
 with changed as (update public.event_booking_requests set state='expired',revision=revision+1,updated_at=now()
  where replaces_meeting_id=new.id and state in ('awaiting_review','needs_new_slot') returning *)
 insert into public.event_review_outbox(event_id,request_id,request_revision,kind,recipient_id,deduplication_key)
 select event_id,id,revision,'expired',requester_id,id||':'||revision||':original_cancelled' from changed;
 return new;
end; $$;
create trigger zz_invalidate_review_replacements after update of status on public.event_b2b_meetings for each row execute function public.invalidate_review_replacements();
revoke all on function public.list_review_notifications(integer),public.mark_review_notifications_read(uuid),public.add_review_note(uuid,text),
 public.get_event_review_report(uuid),public.hide_unscheduled_investor_matches(),public.invalidate_review_replacements(),public.configure_event_review_policy(uuid,boolean) from public,anon,authenticated;
grant execute on function public.list_review_notifications(integer),public.mark_review_notifications_read(uuid),public.add_review_note(uuid,text),public.get_event_review_report(uuid),public.configure_event_review_policy(uuid,boolean) to authenticated;
commit;
