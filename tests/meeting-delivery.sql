-- Run only in the disposable fixture database, after the reliability migration.
\set ON_ERROR_STOP on
begin;
select test_assert((select count(*)=0 from meeting_delivery_jobs),'migration does not replay historical mail');
set role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000003',true);
insert into event_b2b_meetings(id,event_id,attendee_a_id,attendee_b_id,profile_a_id,profile_b_id,organizer_id,status,start_at,end_at,location,meta)
values('50000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000003','pending',current_date+1+time '10:00',current_date+1+time '10:30','Networking Area','{}');
select test_error('update event_b2b_meetings set status=''confirmed'' where id=''50000000-0000-4000-8000-000000000001''','42501','requester cannot accept own invitation');
select test_error('delete from event_b2b_meetings where id=''50000000-0000-4000-8000-000000000001''','42501','participant cannot bypass cancellation notifications by deleting');
select test_error('select * from meeting_delivery_jobs','42501','participant cannot read delivery addresses');
select test_error('select get_meeting_delivery_status(''20000000-0000-4000-8000-000000000001'')','42501','delivery monitor is restricted to event admins');
reset role;
select record_meeting_delivery_heartbeat();
select test_assert((select checked_at is not null from meeting_delivery_health),'worker heartbeat is recorded');
select test_assert((select count(*)=2 from meeting_delivery_jobs),'both recipients queued without a browser email call');
select test_assert((select count(*)=2 from notifications where source_key like 'meeting:%'),'both in-app notices saved');
select claim_meeting_delivery() as first_job \gset
select prepare_meeting_delivery((:'first_job'::jsonb->>'id')::uuid,(:'first_job'::jsonb->>'token')::uuid) as prepared \gset
select test_assert(:'prepared'::jsonb->'payload'->>'location' is null,'pending email has no table allocation');
select freeze_meeting_mail((:'first_job'::jsonb->>'id')::uuid,(:'first_job'::jsonb->>'token')::uuid,jsonb_build_object('to',jsonb_build_array(:'prepared'::jsonb->'payload'->>'to'),'subject','fixture')) as mail \gset
select finish_meeting_delivery((:'first_job'::jsonb->>'id')::uuid,(:'first_job'::jsonb->>'token')::uuid,null,'PROVIDER_429',false);
select test_assert((select state='failed' and available_at>now() from meeting_delivery_jobs where id=(:'first_job'::jsonb->>'id')::uuid),'provider throttle defers instead of dropping');
set role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
select test_assert(retry_meeting_delivery((:'first_job'::jsonb->>'id')::uuid),'organizer can safely retry transient failure');
reset role;
update meeting_delivery_jobs set available_at=now()-interval '1 minute' where id=(:'first_job'::jsonb->>'id')::uuid;
select claim_meeting_delivery() as retry_job \gset
select test_assert(:'retry_job'::jsonb->>'id'=:'first_job'::jsonb->>'id','retry retains provider idempotency identity');
select test_assert(not finish_meeting_delivery((:'first_job'::jsonb->>'id')::uuid,(:'first_job'::jsonb->>'token')::uuid,'stale-worker'),'stale worker cannot acknowledge new lease');
select prepare_meeting_delivery((:'retry_job'::jsonb->>'id')::uuid,(:'retry_job'::jsonb->>'token')::uuid) as retry_payload \gset
select test_assert(:'retry_payload'::jsonb->'mail'=:'mail'::jsonb,'retry preserves frozen provider request');
select finish_meeting_delivery((:'retry_job'::jsonb->>'id')::uuid,(:'retry_job'::jsonb->>'token')::uuid,'provider-fixture');
insert into meeting_delivery_jobs(meeting_id,event_id,recipient_id,actor_id,revision,kind,state)
select '50000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001',
 '10000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000003',1000+n,'pending','sent' from generate_series(1,240)n;
set role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000003',true);
select test_error('update event_b2b_meetings set start_at=start_at+interval ''1 hour'',end_at=end_at+interval ''1 hour'' where id=''50000000-0000-4000-8000-000000000001''','54000','invitation creation throttles abusive bursts');
reset role;
delete from meeting_delivery_jobs where revision>1000;
set role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000005',true);
update event_b2b_meetings set status='confirmed' where id='50000000-0000-4000-8000-000000000001';
select test_assert((select location='Table-01' from event_b2b_meetings where id='50000000-0000-4000-8000-000000000001'),'recipient confirmation assigns actual table');
update event_b2b_meetings set status='confirmed' where id='50000000-0000-4000-8000-000000000001';
reset role;
select test_assert((select count(*)=2 from meeting_delivery_jobs where kind='confirmed'),'repeated confirmation does not duplicate jobs');
update meeting_delivery_jobs set available_at=now()-interval '2 minutes' where kind='pending' and state='queued';
select claim_meeting_delivery() as stale_job \gset
select test_assert(prepare_meeting_delivery((:'stale_job'::jsonb->>'id')::uuid,(:'stale_job'::jsonb->>'token')::uuid) is null,'obsolete pending invitation suppressed after acceptance');
set role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
update event_b2b_meetings set status='cancelled' where id='50000000-0000-4000-8000-000000000001';
reset role;
select test_assert((select count(*)=2 from meeting_delivery_jobs where kind='cancelled'),'admin cancellation queues both notifications');
select test_assert((select count(*)=0 from event_b2b_meetings where status='confirmed'),'cancellation releases confirmed capacity');
select test_assert((select count(*)=6 from notifications where source_key like 'meeting:%'),'each transition has exactly two notices');
-- No misleading successful retry after the provider idempotency window.
update meeting_delivery_jobs set state='failed',first_attempt_at=now()-interval '24 hours',lease_until=null where kind='cancelled';
select claim_meeting_delivery();
select test_assert((select count(*)=2 from meeting_delivery_jobs where kind='cancelled' and state='reconcile'),'ambiguous old deliveries require review instead of duplicate resend');
rollback;
