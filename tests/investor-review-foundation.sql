\set ON_ERROR_STOP on
\set event '20000000-0000-4000-8000-000000000001'
\set other_event '20000000-0000-4000-8000-000000000002'
\set owner '10000000-0000-4000-8000-000000000001'
\set coordinator '10000000-0000-4000-8000-000000000002'
\set requester '10000000-0000-4000-8000-000000000003'
\set investor '10000000-0000-4000-8000-000000000004'
\set stranger '10000000-0000-4000-8000-000000000005'
\set scanner '10000000-0000-4000-8000-000000000006'
\set request_attendee '30000000-0000-4000-8000-000000000003'
\set investor_attendee '30000000-0000-4000-8000-000000000004'

select test_assert(not ready,'release is closed after migration') from event_review_release;
select test_error($q$insert into event_review_policies(event_id,enabled) values('20000000-0000-4000-8000-000000000001',true)$q$,'55000','policy cannot activate before release');
set role authenticated;
select set_config('request.jwt.claim.sub',:'owner',false);
select test_assert((get_event_review_capabilities(:'event')->>'released')::boolean=false,'owner sees readiness');
select test_assert(not event_review_allowed(:'event','review'),'owner is not silently assigned as reviewer');
select test_assert(not event_review_allowed(:'event','unexpected'),'unknown permission denied');
select test_error('update event_review_release set ready=true','42501','organizer cannot open release lock');
select test_error(format('insert into event_review_policies(event_id,enabled) values(%L,true)',:'event'),'42501','organizer cannot bypass policy command');
select test_error(format('insert into event_review_permissions(event_id,user_id,can_review) values(%L,%L,true)',:'event',:'owner'),'42501','raw permission grant denied');
select set_event_review_permissions(:'event',:'owner',true,false);
select set_event_review_permissions(:'event',:'coordinator',false,true);
select test_assert(event_review_allowed(:'event','designate'),'owner explicitly granted designation');
select test_error(format('select set_event_review_permissions(%L,%L,true,true)',:'event',:'scanner'),'23514','scanner cannot receive review permission');
select test_error(format('select set_event_review_permissions(%L,%L,true,true)',:'event',:'requester'),'23514','attendee cannot receive staff permission');
select test_error(format('select issue_event_investor_invitation(%L,%L,now()+interval ''7 days'')',:'event','person4@example.test'),'55000','invitation issuance locked before release');
select test_error(format('select preview_event_investor_assignment(%L,%L)',:'event','30000000-0000-4000-8000-000000000007'),'23514','cross-event assignment preview denied');
select test_assert((preview_event_investor_assignment(:'event',:'investor_attendee')->>'scheduled_pending')::int=0,'assignment preview has distinct count');

select set_config('request.jwt.claim.sub',:'coordinator',false);
select test_assert(event_review_allowed(:'event','review'),'explicit reviewer can review');
select test_assert(not event_review_allowed(:'event','designate'),'review does not imply designation');
select test_error(format('select set_event_review_permissions(%L,%L,true,true)',:'event',:'coordinator'),'42501','coordinator cannot self-promote');
select test_error(format('select get_event_review_capabilities(%L)',:'other_event'),'42501','other event capabilities denied');

reset role;
-- Fixture-only release to exercise prepared primitives. NEVER a deployment step.
update event_review_release set ready=true;
insert into event_review_policies(event_id,enabled) values(:'event',true);
set role authenticated;
select set_config('request.jwt.claim.sub',:'owner',false);
select issue_event_investor_invitation(:'event',' Person4@Example.Test ',now()+interval '7 days') as invite \gset
select test_assert(length(:'invite'::jsonb->>'token')=64,'invitation has random bearer secret');
select test_error(format('select token_digest from event_investor_invitations'),'42501','client cannot retrieve stored token digest');
select test_assert((select email='person4@example.test' from event_investor_invitations limit 1),'invited email normalized');
select test_error(format('select issue_event_investor_invitation(%L,%L,now()+interval ''7 days'')',:'event','person4@example.test'),'23505','retry cannot silently rotate valid invitation');
select test_error(format('select issue_event_investor_invitation(%L,%L,now()+interval ''31 days'')',:'event','person5@example.test'),'22023','expiry bounded');
select test_error(format('select issue_event_investor_invitation(%L,%L,now()+interval ''7 days'')',:'event','bad'),'22023','invalid email rejected');
select test_error(format('select get_event_investor_invitation(%L)',:'invite'::jsonb->>'token'),'42501','issuer cannot redeem someone else invitation');

select set_config('request.jwt.claim.sub',:'stranger',false);
select test_error(format('select get_event_investor_invitation(%L)',:'invite'::jsonb->>'token'),'42501','forwarded token wrong account denied');
select test_assert((select count(*) from event_investor_invitations)=0,'invitation email list private');
select test_error(format('select get_event_review_capabilities(%L)',:'event'),'42501','participant cannot inspect management capabilities');
select test_error(format('select issue_event_investor_invitation(%L,%L,now()+interval ''7 days'')',:'event','person4@example.test'),'42501','participant cannot issue investor links');

select set_config('request.jwt.claim.sub',:'investor',false);
select test_error('select get_event_investor_invitation(''wrong'')','42501','malformed token generic denial');
select test_error(format('select get_event_investor_invitation(%L)',repeat('0',64)),'42501','confirmed email alone does not identify invitation');
select test_assert(get_event_investor_invitation(:'invite'::jsonb->>'token')->>'status'='pending','matching account and token can preview');
select test_assert(get_event_investor_invitation(:'invite'::jsonb->>'token')->>'status'='pending','repeat GET never consumes invitation');

select set_config('request.jwt.claim.sub',:'owner',false);
select issue_event_investor_invitation(:'event','person4@example.test',now()+interval '7 days',true) as replacement \gset
select test_assert(:'replacement'::jsonb->>'token'<>:'invite'::jsonb->>'token','reissue rotates token');
select set_config('request.jwt.claim.sub',:'investor',false);
select test_error(format('select get_event_investor_invitation(%L)',:'invite'::jsonb->>'token'),'42501','reissued old token no longer works');
select test_assert(get_event_investor_invitation(:'replacement'::jsonb->>'token')->>'status'='pending','replacement preview succeeds');
select set_config('request.jwt.claim.sub',:'owner',false);
select revoke_event_investor_invitation((:'replacement'::jsonb->>'id')::uuid);
select revoke_event_investor_invitation((:'replacement'::jsonb->>'id')::uuid);
select set_config('request.jwt.claim.sub',:'investor',false);
select test_error(format('select get_event_investor_invitation(%L)',:'replacement'::jsonb->>'token'),'42501','revoked token cannot preview');
select test_error(format('insert into event_investor_designations(event_id,attendee_id,source) values(%L,%L,''manual'')',:'event',:'investor_attendee'),'42501','attendee cannot grant own badge');

reset role;
select test_error(format('insert into event_investor_designations(event_id,attendee_id,source) values(%L,%L,''manual'')',:'event','30000000-0000-4000-8000-000000000007'),'23514','trusted write still rejects cross-event designation');
insert into event_investor_designations(event_id,attendee_id,source,assigned_by) values(:'event',:'investor_attendee','manual',:'owner');
insert into event_booking_requests(event_id,requester_id,recipient_id,requester_attendee_id,recipient_attendee_id,starts_at,ends_at,format,message,policy_version,submission_key)
  values(:'event',:'requester',:'investor',:'request_attendee',:'investor_attendee',now()+interval '1 day',now()+interval '1 day 30 minutes','in-person','Private proposal',1,gen_random_uuid()) returning id as request_id \gset
insert into event_booking_review_notes(request_id,author_id,body) values(:'request_id',:'coordinator','Private reviewer note');
insert into event_review_outbox(event_id,request_id,recipient_id,kind,deduplication_key) values(:'event',:'request_id',:'coordinator','submitted','test-submission');
select test_error(format('update event_booking_requests set recipient_attendee_id=%L where id=%L','30000000-0000-4000-8000-000000000007',:'request_id'),'23514','request cross-event participants rejected');
select test_error(format('update event_booking_requests set recipient_id=%L where id=%L',:'stranger',:'request_id'),'23514','request profile and attendee mismatch rejected');
select test_error(format('update event_attendees set event_id=%L where id=%L',:'other_event',:'investor_attendee'),'23503','cannot move protected registration into another event');
select test_error(format('insert into event_review_outbox(event_id,request_id,kind,deduplication_key) values(%L,%L,''submitted'',''wrong-event'')',:'other_event',:'request_id'),'23503','notification job cannot claim a different event');

set role authenticated;
select set_config('request.jwt.claim.sub',:'requester',false);
select test_assert((select count(*) from event_booking_requests)=1,'requester can track own private request');
select test_assert((select count(*) from event_booking_review_notes)=0,'requester cannot read internal notes');
select test_assert((select count(*) from event_investor_designations)=1,'registered participant sees active badge');
select test_error(format('update event_booking_requests set state=''forwarded'' where id=%L',:'request_id'),'42501','requester cannot self-forward');
select test_error('select * from event_review_outbox','42501','outbox not exposed to participant');
select set_config('request.jwt.claim.sub',:'investor',false);
select test_assert((select count(*) from event_booking_requests)=0,'investor cannot read unapproved incoming request');
select test_assert((select count(*) from event_booking_review_notes)=0,'investor cannot read reviewer notes');
select set_config('request.jwt.claim.sub',:'stranger',false);
select test_assert((select count(*) from event_booking_requests)=0,'unrelated attendee cannot read request');
select set_config('request.jwt.claim.sub',:'scanner',false);
select test_assert((select count(*) from event_booking_requests)=0,'scanner cannot read review queue');
select set_config('request.jwt.claim.sub',:'coordinator',false);
select test_assert((select count(*) from event_booking_requests)=1,'designated reviewer can read queue');
select test_assert((select count(*) from event_booking_review_notes)=1,'designated reviewer can read notes');
select test_error(format('update event_booking_requests set state=''forwarded'' where id=%L',:'request_id'),'42501','reviewer cannot bypass transition commands');
select test_error('delete from event_review_audit','42501','client cannot delete audit history');

reset role;
update event_team_members set status='revoked' where user_id=:'coordinator';
set role authenticated;
select set_config('request.jwt.claim.sub',:'coordinator',false);
select test_assert(not event_review_allowed(:'event','review'),'revoking team membership removes review access immediately');
select test_assert((select count(*) from event_booking_requests)=0,'revoked reviewer cannot read old queue');
select test_assert((select count(*) from event_booking_review_notes)=0,'revoked reviewer cannot read notes');
reset role;
set role anon;
select test_error('select * from event_booking_requests','42501','anonymous cannot read requests');
select test_error('select * from event_investor_designations','42501','anonymous cannot enumerate event investor assignments');
select test_error('select get_event_investor_invitation(''anything'')','42501','anonymous cannot invoke invitation preview');
reset role;
select test_assert((select count(*) from event_review_audit where action='investor_invitation_issued')=2,'issuance audit recorded without duplicate retry');
select test_assert(not exists(select 1 from event_review_audit where details::text like '%'||(:'replacement'::jsonb->>'token')||'%'),'raw token absent from audit');
select test_assert(not exists(select 1 from event_investor_invitations where token_digest=(:'replacement'::jsonb->>'token')),'raw token not persisted');

set role authenticated;
select set_config('request.jwt.claim.sub',:'owner',false);
select issue_event_investor_invitation(:'event','person4@example.test',now()+interval '1 hour') as expiring \gset
reset role;
update event_investor_invitations set created_at=now()-interval '2 hours',expires_at=now()-interval '1 hour' where id=(:'expiring'::jsonb->>'id')::uuid;
set role authenticated;
select set_config('request.jwt.claim.sub',:'investor',false);
select test_error(format('select get_event_investor_invitation(%L)',:'expiring'::jsonb->>'token'),'42501','expired invitation cannot preview');
select set_config('request.jwt.claim.sub',:'owner',false);
select issue_event_investor_invitation(:'event','person4@example.test',now()+interval '7 days') as renewed \gset
select test_assert(:'renewed'::jsonb->>'id'<>:'expiring'::jsonb->>'id','expired invitation may be renewed without replacement confirmation');
reset role;
update event_investor_invitations set status='accepted',accepted_by=:'investor',accepted_attendee_id=:'investor_attendee',accepted_at=now()
  where id=(:'renewed'::jsonb->>'id')::uuid;
set role authenticated;
select set_config('request.jwt.claim.sub',:'owner',false);
select test_error(format('select revoke_event_investor_invitation(%L)',:'renewed'::jsonb->>'id'),'22023','revoking accepted link cannot silently remove badge');
select set_event_review_permissions(:'event',:'coordinator',false,false);
select test_assert((select not can_review from event_review_permissions where user_id=:'coordinator'),'permission revocation allowed for inactive member');
select set_event_review_permissions(:'event',:'owner',false,false);
select test_assert(not event_review_allowed(:'event','designate'),'explicit designation permission removal takes effect');
select set_event_review_permissions(:'event',:'owner',true,false);
reset role;
