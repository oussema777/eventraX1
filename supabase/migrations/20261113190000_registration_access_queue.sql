begin;
create table public.registration_access_jobs (
 attendee_id uuid primary key references public.event_attendees(id) on delete cascade,
 state text not null default 'pending' check(state in ('pending','processing','done','review','cancelled')),
 attempts integer not null default 0,
 token uuid, lease_until timestamptz, next_attempt_at timestamptz not null default now(),
 created_at timestamptz not null default now(), finished_at timestamptz
);
alter table public.registration_access_jobs enable row level security;
revoke all on public.registration_access_jobs from public,anon,authenticated;
grant select on public.registration_access_jobs to service_role;

create function public.queue_registration_access() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if new.meta->>'b2bOptIn'='true' and new.status in ('registered','approved','checked_in')
    and (new.profile_id is null or new.meta->>'b2bAccessStatus' in ('pending','review')) then
   new.meta:=jsonb_set(coalesce(new.meta,'{}'),'{b2bAccessStatus}',
     to_jsonb(case when new.meta->>'b2bAccessStatus'='review' then 'review' else 'pending' end));
 end if;
 return new;
end $$;
create trigger registration_access_status before insert or update of meta,profile_id on public.event_attendees
 for each row execute function public.queue_registration_access();

create function public.enqueue_registration_access_job() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if new.meta->>'b2bOptIn'='true' and new.meta->>'b2bAccessStatus' in ('pending','review')
    and new.status in ('registered','approved','checked_in') then
   insert into public.registration_access_jobs(attendee_id) values(new.id) on conflict do nothing;
 end if;
 return new;
end $$;
create trigger registration_access_enqueue after insert or update of meta,profile_id on public.event_attendees
 for each row execute function public.enqueue_registration_access_job();

create function public.claim_registration_access_job() returns jsonb
language plpgsql security definer set search_path='' as $$
declare job public.registration_access_jobs; attendee public.event_attendees; event public.events;
begin
 select * into job from public.registration_access_jobs
 where (state='pending' and next_attempt_at<=now()) or (state='processing' and lease_until<now())
 order by next_attempt_at,attendee_id for update skip locked limit 1;
 if not found then return null; end if;
 update public.registration_access_jobs set state='processing',token=gen_random_uuid(),
   lease_until=now()+interval '5 minutes',attempts=attempts+1 where attendee_id=job.attendee_id returning * into job;
 select * into attendee from public.event_attendees where id=job.attendee_id;
 select * into event from public.events where id=attendee.event_id;
 return jsonb_build_object('attendee',to_jsonb(attendee),'event',to_jsonb(event),'token',job.token);
end $$;

create function public.link_registration_access(p_attendee uuid,p_token uuid,p_user uuid,p_email text) returns boolean
language plpgsql security definer set search_path='' as $$
declare attendee public.event_attendees;
begin
 perform 1 from public.registration_access_jobs where attendee_id=p_attendee and token=p_token
   and state='processing' and lease_until>now() for update;
 if not found then return false; end if;
 select * into attendee from public.event_attendees where id=p_attendee for update;
 if attendee.status not in ('registered','approved','checked_in') or attendee.meta->>'b2bOptIn' is distinct from 'true'
   or lower(btrim(attendee.email)) is distinct from lower(btrim(p_email))
   or (attendee.profile_id is not null and attendee.profile_id<>p_user) then return false; end if;
 perform public.ensure_registration_auth_account(p_user,p_email);
 update public.event_attendees set profile_id=p_user,
   meta=jsonb_set(coalesce(meta,'{}'),'{b2bAccessStatus}','"ready"') where id=p_attendee;
 return true;
end $$;

create function public.finish_registration_access_job(p_attendee uuid,p_token uuid,p_outcome text) returns boolean
language plpgsql security definer set search_path='' as $$
declare job public.registration_access_jobs; attendee public.event_attendees; owner_id uuid; final_state text;
begin
 if p_outcome not in ('sent','retry','review','cancelled') then raise exception 'Invalid access outcome'; end if;
 select * into job from public.registration_access_jobs where attendee_id=p_attendee and token=p_token
   and state='processing' and lease_until>now() for update;
 if not found then return false; end if;
 final_state:=case when p_outcome='sent' then 'done' when p_outcome='cancelled' then 'cancelled'
   when p_outcome='review' or job.attempts>=6 then 'review' else 'pending' end;
 update public.registration_access_jobs set state=final_state,token=null,lease_until=null,
   next_attempt_at=now()+make_interval(secs=>least(3600,60*power(2,job.attempts)::integer)),
   finished_at=case when final_state in ('done','cancelled','review') then now() end where attendee_id=p_attendee;
 if final_state='review' then
   select * into attendee from public.event_attendees where id=p_attendee;
   update public.event_attendees set meta=jsonb_set(coalesce(meta,'{}'),'{b2bAccessStatus}','"review"') where id=p_attendee;
   select coalesce(e.owner_id,e.organizer_id) into owner_id from public.events e where e.id=attendee.event_id;
   if owner_id is not null then
     insert into public.notifications(recipient_id,actor_id,type,title,body,action_url,source_key)
     values(owner_id,null,'system','Networking access needs help',
       'A participant is registered, but networking access needs attention. Check their registration email in attendee management.',
       '/manage-event/'||attendee.event_id||'?tab=attendees','registration-access:'||p_attendee)
     on conflict(source_key) do nothing;
   end if;
 end if;
 return true;
end $$;
revoke all on function public.queue_registration_access(),public.enqueue_registration_access_job(),
 public.claim_registration_access_job(),public.link_registration_access(uuid,uuid,uuid,text),
 public.finish_registration_access_job(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.claim_registration_access_job(),public.link_registration_access(uuid,uuid,uuid,text),
 public.finish_registration_access_job(uuid,uuid,text) to service_role;
commit;
