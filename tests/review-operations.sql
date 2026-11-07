\set ON_ERROR_STOP on
begin;
\set e '20000000-0000-4000-8000-000000000001'
\set owner '10000000-0000-4000-8000-000000000001'
\set reviewer '10000000-0000-4000-8000-000000000002'
\set requester '10000000-0000-4000-8000-000000000003'
\set investor '10000000-0000-4000-8000-000000000004'
\set ordinary '10000000-0000-4000-8000-000000000005'
delete from event_review_outbox;
insert into b2b_connections values('70000000-0000-4000-8000-000000000001',:'requester',:'investor');
update event_investor_invitations set status='revoked',revoked_at=now() where email='person3@example.test' and status='pending';
set role authenticated;
select set_config('request.jwt.claim.sub',:'owner',false);
select set_event_review_permissions(:'e',:'owner',true,true);
select test_error('select remove_networking_connection(''70000000-0000-4000-8000-000000000001'')','42501','unrelated organizer cannot remove a personal connection');
select jsonb_build_array(jsonb_build_object('attendee_a_id','30000000-0000-4000-8000-000000000003','attendee_b_id','30000000-0000-4000-8000-000000000005','submission_key',gen_random_uuid())) as ordinary_batch \gset
select create_event_meeting_batch(:'e',:'ordinary_batch'::jsonb) as ordinary_result \gset
select test_assert(create_event_meeting_batch(:'e',:'ordinary_batch'::jsonb)=:'ordinary_result'::jsonb,'retry of ordinary organizer batch returns the same meeting');
select test_error(format('select create_event_meeting_batch(%L,%L::jsonb)',:'e',jsonb_set(:'ordinary_batch'::jsonb,'{0,location}','"changed"')),'40001','batch key cannot be reused with another payload');
select create_event_meeting_batch(:'e',jsonb_build_array(jsonb_build_object('attendee_a_id','30000000-0000-4000-8000-000000000004','attendee_b_id','30000000-0000-4000-8000-000000000003'))) as unscheduled \gset
select test_assert(:'unscheduled'::jsonb->0->>'state'='needs_schedule','unscheduled investor pair stays a suggestion');
select create_event_meeting_batch(:'e',jsonb_build_array(jsonb_build_object('attendee_a_id','30000000-0000-4000-8000-000000000004','attendee_b_id','30000000-0000-4000-8000-000000000003','start_at',current_date+1+time '14:00','end_at',current_date+1+time '14:30','submission_key',gen_random_uuid()))) as scheduled \gset
select (:'scheduled'::jsonb->0->>'id') as request \gset
select test_assert(:'scheduled'::jsonb->0->>'state'='awaiting_review','staff scheduled request enters review regardless of pair order');
select test_assert((select requester_id=:'requester' and recipient_id=:'investor' and created_by=:'owner' from event_booking_requests where id=:'request'),'staff actor and participant identities are retained separately');
select test_error(format('select decide_investor_booking(%L,1,''approve'')',:'request'),'42501','staff cannot approve their own submission');
select test_error(format('select configure_event_review_policy(%L,false)',:'e'),'23514','active investor work cannot be disabled into a bypass');
select set_config('request.jwt.claim.sub',:'investor',false);
select test_assert(not exists(select 1 from list_review_notifications() where body like '%review%'),'investor receives no in-app submission notice');
select set_config('request.jwt.claim.sub',:'requester',false);
select test_error(format('insert into notifications(recipient_id,title,body,type) values(%L,''Meeting approved'',''forged'',''action'')',:'investor'),'42501','raw bell insertion cannot notify an investor');
select remove_networking_connection('70000000-0000-4000-8000-000000000001');
select test_assert(exists(select 1 from notifications where recipient_id=:'investor' and source_key='connection-removed:70000000-0000-4000-8000-000000000001'),'authorized personal connection removal can notify investor without arbitrary bell access');
select set_config('request.jwt.claim.sub',:'reviewer',false);
select test_assert(exists(select 1 from list_review_notifications() where body like '%needs your review%'),'authorized reviewer sees in-app request');
select add_review_note(:'request','Confidential qualification note') as note \gset
select test_assert((select count(*)=1 from event_booking_review_notes where id=:'note'),'reviewer can read private note');
select decide_investor_booking(:'request',1,'approve') as approved \gset
select (:'approved'::jsonb->>'meeting_id') as original \gset
select set_config('request.jwt.claim.sub',:'investor',false);
select test_assert((select count(*)=0 from event_booking_review_notes where id=:'note'),'investor cannot read internal notes after forwarding');
select test_assert(exists(select 1 from list_review_notifications() where body like '%invitation is ready%'),'investor gets in-app invitation after review');
select respond_protected_meeting(:'original','pending','confirmed');
select set_config('request.jwt.claim.sub',:'requester',false);
select propose_investor_reschedule(:'original',current_date+1+time '14:00',current_date+1+time '14:30','in-person','Updated purpose',gen_random_uuid()) as replacement \gset
select test_assert((select status='confirmed' from event_b2b_meetings where id=:'original'),'original stays confirmed during replacement review');
select set_config('request.jwt.claim.sub',:'reviewer',false);
select decide_investor_booking((:'replacement'::jsonb->>'id')::uuid,1,'approve') as forwarded \gset
select (:'forwarded'::jsonb->>'meeting_id') as new_meeting \gset
select test_assert((select status='confirmed' from event_b2b_meetings where id=:'original'),'approval does not release the original reservation');
select set_config('request.jwt.claim.sub',:'requester',false);
select test_error(format('select respond_protected_meeting(%L,''pending'',''confirmed'')',:'new_meeting'),'42501','requester cannot accept a replacement');
select test_assert((select status='confirmed' from event_b2b_meetings where id=:'original'),'failed replacement acceptance rolls original cancellation back');
select set_config('request.jwt.claim.sub',:'investor',false);
select respond_protected_meeting(:'new_meeting','pending','confirmed');
select test_assert((select status='cancelled' from event_b2b_meetings where id=:'original') and (select status='confirmed' from event_b2b_meetings where id=:'new_meeting'),'recipient acceptance atomically swaps reservations');
reset role;
select test_assert(not exists(select 1 from event_review_outbox where meeting_id=:'original' and kind='cancelled'),'swap does not send a misleading independent cancellation');
select test_assert((select count(*)=2 from event_review_outbox where meeting_id=:'new_meeting' and kind='confirmed'),'replacement confirmation queues exactly two participant notices');
set role authenticated;
select set_config('request.jwt.claim.sub',:'requester',false);
select submit_investor_booking(:'e',:'investor',current_date+1+time '15:00',current_date+1+time '15:30','in-person','Revision test',gen_random_uuid()) as revision_request \gset
select revise_investor_request((:'revision_request'::jsonb->>'id')::uuid,1,current_date+1+time '15:30',current_date+1+time '16:00','in-person','Revised purpose');
select set_config('request.jwt.claim.sub',:'reviewer',false);
select test_error(format('select decide_investor_booking(%L,1,''approve'')',:'revision_request'::jsonb->>'id'),'40001','stale reviewer cannot approve pre-edit request');
select test_assert((get_event_review_report(:'e')->'requests'->>'awaiting_review')::integer>0,'staff report includes requests not yet in meetings');
select test_assert(position('Confidential' in get_event_review_report(:'e')::text)=0,'report excludes private notes');
select set_config('request.jwt.claim.sub',:'investor',false);
select test_error(format('select get_event_review_report(%L)',:'e'),'42501','participant cannot export review report');
reset role;
select test_assert(review_guest_retained(:'requester'),'cleanup retains guests referenced by review history');
update event_booking_requests set starts_at=now()-interval '2 hours',ends_at=now()-interval '1 hour' where id=(:'revision_request'::jsonb->>'id')::uuid;
select test_assert(expire_review_requests()>=1,'past pending requests expire without delivery to investor');
select test_assert((select state='expired' from event_booking_requests where id=(:'revision_request'::jsonb->>'id')::uuid),'expired request cannot remain in review queue');
select test_error('select purge_review_delivery_payloads(now())','P0001','payload cleanup cannot truncate the retry window');
rollback;
