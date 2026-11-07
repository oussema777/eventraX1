\set ON_ERROR_STOP on
begin;
delete from event_review_outbox;
insert into event_booking_requests(event_id,requester_id,recipient_id,requester_attendee_id,recipient_attendee_id,
  starts_at,ends_at,format,policy_version,submission_key)
values('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000003',
  '10000000-0000-4000-8000-000000000004','30000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000004',
  now()+interval '7 days',now()+interval '7 days 30 minutes','video',1,gen_random_uuid()) returning id as request \gset
insert into event_review_outbox(event_id,request_id,request_revision,kind,recipient_id,deduplication_key)
values('20000000-0000-4000-8000-000000000001',:'request',1,'submitted','10000000-0000-4000-8000-000000000002','delivery-test') returning id as job \gset
set role authenticated;
select test_error('select claim_review_delivery()','42501','client cannot claim delivery');
select test_error(format('select prepare_review_delivery(%L,gen_random_uuid())',:'job'),'42501','client cannot read delivery payload');
select test_error(format('select finish_review_delivery(%L,gen_random_uuid(),''forged'')',:'job'),'42501','client cannot forge delivery acknowledgement');
reset role;
update event_review_release set ready=false;
select test_assert(claim_review_delivery() is null,'paused release does not claim');
update event_review_release set ready=true;
set role service_role;
select claim_review_delivery() as lease \gset
select test_assert(claim_review_delivery() is null,'leased job cannot be claimed twice');
select test_assert(prepare_review_delivery(:'job',gen_random_uuid()) is null,'wrong lease cannot prepare');
select prepare_review_delivery(:'job',(:'lease'::jsonb->>'lease_token')::uuid) as payload \gset
select test_assert(:'payload'::jsonb->>'audience'='reviewer' and :'payload'::jsonb->>'to'='person2@example.test','reviewer address derived from auth data');
select test_assert(not (:'payload'::jsonb ? 'message') and not (:'payload'::jsonb ? 'requester_reason'),'email excludes private request details');
reset role;
update event_team_members set status='revoked' where user_id='10000000-0000-4000-8000-000000000002';
select test_assert(prepare_review_delivery(:'job',(:'lease'::jsonb->>'lease_token')::uuid) is null,'revoked team role blocks queued reviewer mail');
select test_assert((select state='suppressed' from event_review_outbox where id=:'job'),'unauthorized job marked suppressed');
update event_team_members set status='active' where user_id='10000000-0000-4000-8000-000000000002';
update event_review_outbox set state='queued',recipient_id='10000000-0000-4000-8000-000000000004',delivery_payload=null where id=:'job';
select claim_review_delivery() as lease \gset
select test_assert(prepare_review_delivery(:'job',(:'lease'::jsonb->>'lease_token')::uuid) is null,'investor cannot receive submitted request even with forged queue recipient');
update event_review_outbox set state='queued',recipient_id='10000000-0000-4000-8000-000000000003' where id=:'job';
select claim_review_delivery() as lease \gset
select prepare_review_delivery(:'job',(:'lease'::jsonb->>'lease_token')::uuid) as payload \gset
select test_assert(:'payload'::jsonb->>'audience'='requester','requester receives submission receipt');
select test_assert(finish_review_delivery(:'job',(:'lease'::jsonb->>'lease_token')::uuid,null,'NETWORK_ERROR',false),'retryable failure acknowledged');
select test_assert(claim_review_delivery() is null,'backoff prevents immediate retry');
update event_review_outbox set available_at=now()-interval '1 second' where id=:'job';
select claim_review_delivery() as retry \gset
select test_assert(not finish_review_delivery(:'job',(:'lease'::jsonb->>'lease_token')::uuid,'old-worker'),'old lease cannot acknowledge newer attempt');
select test_assert(prepare_review_delivery(:'job',(:'retry'::jsonb->>'lease_token')::uuid)=:'payload'::jsonb,'retry payload remains identical');
update event_review_outbox set lease_until=now()-interval '1 second' where id=:'job';
select claim_review_delivery() as recovered \gset
select test_assert(:'recovered'::jsonb->>'lease_token'<>:'retry'::jsonb->>'lease_token','expired worker lease recovers with new token');
select test_assert(finish_review_delivery(:'job',(:'recovered'::jsonb->>'lease_token')::uuid,'provider-test-id'),'delivery success acknowledged');
select test_assert(claim_review_delivery() is null,'delivered job is not resent');
update event_review_outbox set state='queued',attempts=0,first_attempt_at=null,delivery_payload=null where id=:'job';
select claim_review_delivery() as lease \gset
select prepare_review_delivery(:'job',(:'lease'::jsonb->>'lease_token')::uuid);
update auth.users set email='changed@example.test' where id='10000000-0000-4000-8000-000000000003';
select test_assert(prepare_review_delivery(:'job',(:'lease'::jsonb->>'lease_token')::uuid) is null,'email change suppresses retry instead of changing payload');
update event_review_outbox set state='queued',delivery_payload=null where id=:'job';
select claim_review_delivery() as lease \gset
update event_booking_requests set state='withdrawn',revision=revision+1 where id=:'request';
select test_assert(prepare_review_delivery(:'job',(:'lease'::jsonb->>'lease_token')::uuid) is null,'withdrawal after claim suppresses send');
update event_review_outbox set state='sending',first_attempt_at=now()-interval '24 hours',lease_until=now()-interval '1 second' where id=:'job';
select test_assert(claim_review_delivery() is null,'uncertain delivery beyond idempotency window is not retried');
select test_assert((select last_error_code='RECONCILE_REQUIRED' and available_at='infinity'::timestamptz from event_review_outbox where id=:'job'),'uncertain delivery preserved for reconciliation');
update event_review_outbox set state='queued',available_at=now(),first_attempt_at=null,attempts=8 where id=:'job';
select test_assert(claim_review_delivery() is null,'exhausted attempts require manual reconciliation');
update event_review_outbox set state='queued',available_at=now(),first_attempt_at=null,attempts=0 where id=:'job';
select claim_review_delivery() as lease \gset
update event_review_release set ready=false;
select test_assert(prepare_review_delivery(:'job',(:'lease'::jsonb->>'lease_token')::uuid) is null,'pause after claim prevents preparation');
select test_assert((select state='queued' and lease_token is null from event_review_outbox where id=:'job'),'paused job released without suppression');
update event_review_release set ready=true;
select claim_review_delivery() as lease \gset
select test_assert(finish_review_delivery(:'job',(:'lease'::jsonb->>'lease_token')::uuid,null,'PROVIDER_401',true),'permanent provider error acknowledged');
select test_assert(claim_review_delivery() is null,'permanent provider failure is not retried automatically');
rollback;
