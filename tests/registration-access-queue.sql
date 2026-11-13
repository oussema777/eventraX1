\set ON_ERROR_STOP on
-- Run after registration-auth-integrity.sql in a disposable database only.
create table public.events(id uuid primary key,owner_id uuid,organizer_id uuid);
create table public.event_attendees(id uuid primary key,event_id uuid references events,
 profile_id uuid references auth.users,email text,name text,status text,meta jsonb);
create table public.notifications(recipient_id uuid,actor_id uuid,type text,title text,body text,action_url text,source_key text unique);
\ir ../supabase/migrations/20261113190000_registration_access_queue.sql
insert into events values('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001',null);
insert into event_attendees values
 ('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001',null,'legacy@example.test','Guest','registered','{"b2bOptIn":true}');
select test_assert((select meta->>'b2bAccessStatus'='pending' from event_attendees),'unlinked B2B admission becomes pending');
select test_assert((select count(*)=1 from registration_access_jobs),'access retry queued in registration transaction');
select test_assert(not has_function_privilege('anon','public.claim_registration_access_job()','execute'),'anonymous users cannot claim jobs');
select test_assert(not has_function_privilege('authenticated','public.link_registration_access(uuid,uuid,uuid,text)','execute'),'participants cannot relink accounts');
select public.claim_registration_access_job() is not null as claimed;
select test_assert(public.claim_registration_access_job() is null,'live lease prevents duplicate processing');
select test_assert(not public.link_registration_access('30000000-0000-4000-8000-000000000001',gen_random_uuid(),'10000000-0000-4000-8000-000000000001','legacy@example.test'),'stale worker cannot link');
select test_assert(not public.link_registration_access('30000000-0000-4000-8000-000000000001',(select token from registration_access_jobs),'10000000-0000-4000-8000-000000000001','wrong@example.test'),'changed email cannot receive access');
select test_assert(public.link_registration_access('30000000-0000-4000-8000-000000000001',(select token from registration_access_jobs),'10000000-0000-4000-8000-000000000001','legacy@example.test'),'matching verified account linked');
select test_assert((select status='registered' and profile_id='10000000-0000-4000-8000-000000000001' and meta->>'b2bAccessStatus'='ready' from event_attendees),'registration preserved while access becomes ready');
select test_assert(public.finish_registration_access_job('30000000-0000-4000-8000-000000000001',(select token from registration_access_jobs),'sent'),'successful delivery acknowledged');
select test_assert(public.claim_registration_access_job() is null,'sent access is not retried');
insert into event_attendees values
 ('30000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000001',null,'future@example.test','Guest','approved','{"b2bOptIn":true}');
select public.claim_registration_access_job() is not null as claimed;
select public.finish_registration_access_job('30000000-0000-4000-8000-000000000002',(select token from registration_access_jobs where attendee_id='30000000-0000-4000-8000-000000000002'),'retry');
select test_assert((select state='pending' and next_attempt_at>now() from registration_access_jobs where attendee_id='30000000-0000-4000-8000-000000000002'),'temporary failure receives delayed retry');
update registration_access_jobs set next_attempt_at=now()-interval '1 second' where state='pending';
select public.claim_registration_access_job() is not null as claimed;
select public.finish_registration_access_job('30000000-0000-4000-8000-000000000002',(select token from registration_access_jobs where attendee_id='30000000-0000-4000-8000-000000000002'),'review');
select test_assert((select status='approved' and meta->>'b2bAccessStatus'='review' from event_attendees where id='30000000-0000-4000-8000-000000000002'),'review never cancels admission');
select test_assert((select count(*)=1 from notifications),'organizer notified when help is needed');
select test_assert((select count(*)=2 from registration_access_jobs),'review update creates no duplicate job');
insert into event_attendees values
 ('30000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000001',null,'no@example.test','Guest','registered','{"b2bOptIn":false}');
select test_assert((select count(*)=2 from registration_access_jobs),'non-B2B registration never queues an access email');
