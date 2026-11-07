\set ON_ERROR_STOP on
begin;
select test_assert(not exists(select 1 from event_review_outbox o join event_booking_requests r on r.legacy_meeting_id=o.meeting_id),
  'quarantining an invitation never queues cancellation mail');
delete from event_review_outbox;
insert into event_b2b_meetings(event_id,status) values('20000000-0000-4000-8000-000000000002','pending') returning id as ordinary_meeting \gset
set role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000007',false);
select test_assert(not respond_protected_meeting(:'ordinary_meeting','pending','confirmed'),'ordinary attendee-only legacy meeting retains existing response path');
select test_assert((select status='pending' from event_b2b_meetings where id=:'ordinary_meeting'),'ordinary fallback performs no status write');
reset role;
update event_investor_invitations set status='revoked',revoked_at=now() where email='person3@example.test' and status='pending';
set role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000003',false);
select submit_investor_booking('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000004',
  current_date+1+time '17:00',current_date+1+time '17:30','in-person','Response test',gen_random_uuid()) as request \gset
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',false);
select decide_investor_booking((:'request'::jsonb->>'id')::uuid,1,'approve') as approved \gset
select (:'approved'::jsonb->>'meeting_id') as meeting \gset
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000003',false);
select test_error(format('select respond_protected_meeting(%L,''pending'',''confirmed'')',:'meeting'),'42501','requester cannot confirm using response RPC');
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000007',false);
select test_error(format('select respond_protected_meeting(%L,''pending'',''cancelled'')',:'meeting'),'42501','other-event user cannot respond');
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000004',false);
select test_assert(respond_protected_meeting(:'meeting','pending','confirmed'),'recipient confirms through protected response');
select test_error(format('select respond_protected_meeting(%L,''pending'',''confirmed'')',:'meeting'),'40001','duplicate stale confirmation cannot create a second response');
reset role;
select test_assert((select count(*)=2 from event_review_outbox where meeting_id=:'meeting' and kind='confirmed'),'confirmation atomically queues both participant notices');
select test_assert((select location is not null from event_b2b_meetings where id=:'meeting'),'confirmation retains authoritative table assignment');
delete from event_review_outbox where meeting_id is null;
select claim_review_delivery() as lease \gset
select prepare_review_delivery((:'lease'::jsonb->>'id')::uuid,(:'lease'::jsonb->>'lease_token')::uuid) as payload \gset
select test_assert(:'payload'::jsonb->>'kind'='confirmed' and :'payload'::jsonb->>'audience'='participant','confirmation prepares participant-only payload');
set role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000003',false);
select test_assert(respond_protected_meeting(:'meeting','confirmed','cancelled'),'requester can cancel confirmed meeting');
reset role;
select test_assert(prepare_review_delivery((:'lease'::jsonb->>'id')::uuid,(:'lease'::jsonb->>'lease_token')::uuid) is null,'cancellation suppresses an unsent confirmation');
select test_assert((select count(*)=2 from event_review_outbox where meeting_id=:'meeting' and kind='cancelled'),'cancellation queues both participant notices once');
select id as cancel_job from event_review_outbox where meeting_id=:'meeting' and kind='cancelled' limit 1 \gset
update event_review_outbox set state='sending',lease_token=gen_random_uuid(),lease_until=now()+interval '2 minutes'
 where id=:'cancel_job' returning lease_token as cancel_lease \gset
select test_assert(prepare_review_delivery(:'cancel_job',:'cancel_lease')->>'kind'='cancelled','cancellation payload remains available');
update event_review_outbox set recipient_id='10000000-0000-4000-8000-000000000007' where id=:'cancel_job';
select test_assert(prepare_review_delivery(:'cancel_job',:'cancel_lease') is null,'forged cancellation audience is suppressed');
set role authenticated;
select test_error('select queue_protected_meeting_response()','42501','client cannot call private response trigger');
select test_error(format('select prepare_review_request_delivery(%L,gen_random_uuid())',:'cancel_job'),'42501','renamed preparation helper stays private');
reset role;
rollback;
