\set ON_ERROR_STOP on
\set event '20000000-0000-4000-8000-000000000001'
\set owner '10000000-0000-4000-8000-000000000001'
\set reviewer '10000000-0000-4000-8000-000000000002'
\set requester '10000000-0000-4000-8000-000000000003'
\set investor '10000000-0000-4000-8000-000000000004'
\set ordinary '10000000-0000-4000-8000-000000000005'
\set investor_attendee '30000000-0000-4000-8000-000000000004'
\set ordinary_attendee '30000000-0000-4000-8000-000000000005'
select ((current_date+1)::timestamp+interval '10 hours')::timestamptz as slot \gset
select (:'slot'::timestamptz+interval '30 minutes') as slot_end \gset
-- Clear first-suite synthetic queue only; retain roles/permissions.
delete from event_review_outbox;
delete from event_booking_review_notes;
delete from event_booking_requests;
delete from event_investor_designations;
update event_team_members set status='active' where user_id=:'reviewer';
set role authenticated;
select set_config('request.jwt.claim.sub',:'owner',false);
select set_event_review_permissions(:'event',:'reviewer',false,true);
select test_error(format('select set_event_investor(%L,%L,true,''preserve'',null)',:'event',:'investor_attendee'),'40001','assignment requires current inventory');
select preview_event_investor_assignment(:'event',:'investor_attendee') as inventory \gset
select set_event_investor(:'event',:'investor_attendee',true,'preserve',:'inventory');
select test_assert((select active from event_investor_designations where attendee_id=:'investor_attendee'),'manual designation saved');
select set_event_investor(:'event',:'investor_attendee',true,'preserve',:'inventory');
select test_assert((select count(*) from event_investor_designations where attendee_id=:'investor_attendee')=1,'manual assignment idempotent');
select test_error(format('select apply_event_investor_assignment(%L,%L,''manual'',''preserve'',%L)',:'event',:'ordinary_attendee',:'inventory'),'42501','private shared helper not callable');

select set_config('request.jwt.claim.sub',:'requester',false);
select test_assert((get_investor_booking_policy(:'event',:'investor')->>'requires_review')::boolean,'recipient badge and policy agree');
select test_error(format('insert into event_b2b_meetings(event_id,attendee_a_id,attendee_b_id,profile_a_id,profile_b_id,organizer_id,start_at,end_at,status,meta) values(%L,%L,%L,%L,%L,%L,%L,%L,''pending'',''{"meeting_format":"in-person"}'')',
  :'event','30000000-0000-4000-8000-000000000003',:'investor_attendee',:'requester',:'investor',:'requester',:'slot',:'slot_end'),'42501','legacy direct meeting insert cannot bypass review');
select gen_random_uuid() as submission_key \gset
select submit_investor_booking(:'event',:'investor',:'slot',:'slot_end','in-person','Discuss investment',:'submission_key') as booking \gset
select test_assert(:'booking'::jsonb->>'state'='awaiting_review','booking enters private queue');
select test_assert((select count(*) from event_b2b_meetings)=0,'unapproved request creates no investor-facing meeting');
select test_assert(submit_investor_booking(:'event',:'investor',:'slot',:'slot_end','in-person','Discuss investment',:'submission_key')->>'id'=:'booking'::jsonb->>'id','retry returns original request');
select test_error(format('select submit_investor_booking(%L,%L,%L,%L,''in-person'',''Changed purpose'',%L)',:'event',:'investor',:'slot',:'slot_end',:'submission_key'),'22023','same idempotency key cannot replace reviewed content');
select test_error(format('select submit_investor_booking(%L,%L,%L,%L,''in-person'',''Duplicate'',gen_random_uuid())',:'event',:'investor',:'slot',:'slot_end'),'23514','overlapping duplicate request rejected');
select set_config('request.jwt.claim.sub',:'investor',false);
select test_assert((select count(*) from event_booking_requests)=0,'investor has no incoming queue access');
select test_error(format('select decide_investor_booking(%L,1,''approve'')',:'booking'::jsonb->>'id'),'42501','recipient cannot review own incoming request');
select set_config('request.jwt.claim.sub',:'reviewer',false);
select decide_investor_booking((:'booking'::jsonb->>'id')::uuid,1,'approve') as approved \gset
select test_assert(:'approved'::jsonb->>'state'='forwarded','approval forwards exactly one invitation');
select test_error(format('select decide_investor_booking(%L,1,''approve'')',:'booking'::jsonb->>'id'),'40001','repeat approval cannot create another meeting');
select test_assert((select count(*) from event_b2b_meetings)=1,'one meeting after approval');
select set_config('request.jwt.claim.sub',:'requester',false);
select test_error(format('update event_b2b_meetings set status=''confirmed'' where id=%L',:'approved'::jsonb->>'meeting_id'),'42501','requester cannot accept on behalf of investor');
select test_error(format('update event_b2b_meetings set meta=''{"message":"Changed"}'' where id=%L',:'approved'::jsonb->>'meeting_id'),'42501','approved content cannot be replaced');
select set_config('request.jwt.claim.sub',:'investor',false);
update event_b2b_meetings set status='confirmed' where id=(:'approved'::jsonb->>'meeting_id')::uuid;
select test_assert((select status='confirmed' and location is not null from event_b2b_meetings where id=(:'approved'::jsonb->>'meeting_id')::uuid),'investor accepts and authoritative trigger allocates a table');
update event_b2b_meetings set status='cancelled' where id=(:'approved'::jsonb->>'meeting_id')::uuid;
select test_error(format('update event_b2b_meetings set status=''pending'' where id=%L',:'approved'::jsonb->>'meeting_id'),'42501','cancelled invitation cannot be reopened through raw API');

select set_config('request.jwt.claim.sub',:'requester',false);
select submit_investor_booking(:'event',:'investor',:'slot',:'slot_end','in-person','Second request',gen_random_uuid()) as withdrawn \gset
select withdraw_investor_booking((:'withdrawn'::jsonb->>'id')::uuid,1);
select withdraw_investor_booking((:'withdrawn'::jsonb->>'id')::uuid,1);
select set_config('request.jwt.claim.sub',:'reviewer',false);
select test_error(format('select decide_investor_booking(%L,1,''approve'')',:'withdrawn'::jsonb->>'id'),'40001','withdrawn request cannot be approved');
reset role;
select test_assert(not exists(select 1 from event_review_outbox where request_id=(:'withdrawn'::jsonb->>'id')::uuid and state='queued'),'withdrawal suppresses queued notifications');

set role authenticated;
select set_config('request.jwt.claim.sub',:'owner',false);
select issue_event_investor_invitation(:'event','person5@example.test',now()+interval '7 days') as invitation \gset
select set_config('request.jwt.claim.sub',:'ordinary',false);
select accept_event_investor_invitation(:'invitation'::jsonb->>'token') as accepted \gset
select test_assert(:'accepted'::jsonb->>'attendee_id'=:'ordinary_attendee','acceptance reuses existing registration');
select test_assert(accept_event_investor_invitation(:'invitation'::jsonb->>'token')->>'status'='accepted','acceptance retry is idempotent');
select test_assert((select count(*) from event_attendees where profile_id=:'ordinary')=1,'no duplicate event registration');
select set_config('request.jwt.claim.sub',:'owner',false);
select set_event_investor(:'event',:'ordinary_attendee',false);
select set_config('request.jwt.claim.sub',:'ordinary',false);
select test_error(format('select accept_event_investor_invitation(%L)',:'invitation'::jsonb->>'token'),'42501','old accepted link cannot restore removed badge');
reset role;
select test_assert(not exists(select 1 from event_review_outbox where kind='submitted' and recipient_id=:'investor'),'investor never receives submission notifications');

-- Legacy conversions and stale previews, including a same-count change.
set role authenticated;
select set_config('request.jwt.claim.sub',:'requester',false);
insert into event_b2b_meetings(event_id,attendee_a_id,attendee_b_id,profile_a_id,profile_b_id,organizer_id,start_at,end_at,status,meta)
  values(:'event','30000000-0000-4000-8000-000000000003',:'ordinary_attendee',:'requester',:'ordinary',:'requester',:'slot',:'slot_end','pending','{"meeting_format":"in-person","message":"Original proposal"}') returning id as legacy \gset
select set_config('request.jwt.claim.sub',:'owner',false);
select preview_event_investor_assignment(:'event',:'ordinary_attendee') as before_edit \gset
select set_config('request.jwt.claim.sub',:'requester',false);
update event_b2b_meetings set meta='{"meeting_format":"in-person","message":"Changed proposal"}' where id=:'legacy';
select set_config('request.jwt.claim.sub',:'owner',false);
select test_error(format('select set_event_investor(%L,%L,true,''review'',%L)',:'event',:'ordinary_attendee',:'before_edit'),'40001','same-count changed content invalidates assignment preview');
select preview_event_investor_assignment(:'event',:'ordinary_attendee') as fresh \gset
select set_event_investor(:'event',:'ordinary_attendee',true,'review',:'fresh');
select set_config('request.jwt.claim.sub',:'ordinary',false);
select test_assert((select count(*) from event_b2b_meetings where id=:'legacy')=0,'migrated invitation hidden from investor even with permissive legacy reads');
with changed as (update event_b2b_meetings set status='confirmed' where id=:'legacy' returning id)
select test_assert((select count(*) from changed)=0,'old acceptance cannot confirm a quarantined invitation');
select set_config('request.jwt.claim.sub',:'requester',false);
select test_assert((select count(*) from event_booking_requests where legacy_meeting_id=:'legacy' and state='awaiting_review')=1,'existing invitation becomes private request with provenance');
select test_error(format('insert into event_b2b_meetings(event_id,attendee_a_id,attendee_b_id,profile_a_id,profile_b_id,organizer_id,start_at,end_at,status,meta) values(%L,%L,%L,%L,%L,%L,%L,%L,''pending'',''{"meeting_format":"in-person"}'')',
  :'event','30000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000007',:'requester',:'investor',:'requester',:'slot',:'slot_end'),'42501','forged attendee ID cannot hide investor profile from gate');
select set_config('request.jwt.claim.sub',:'reviewer',false);
select id as migrated_request from event_booking_requests where legacy_meeting_id=:'legacy' \gset
select decide_investor_booking(:'migrated_request',1,'reject','Not suitable for this event');
select test_assert((select requester_reason='Not suitable for this event' and state='rejected' from event_booking_requests where id=:'migrated_request'),'rejection keeps requester explanation');

-- Badge removal does not prevent the investor sending ordinary outgoing invitations.
select set_config('request.jwt.claim.sub',:'owner',false);
select set_event_investor(:'event',:'ordinary_attendee',false);
select set_config('request.jwt.claim.sub',:'investor',false);
select submit_investor_booking(:'event',:'ordinary',:'slot',:'slot_end','in-person','Investor initiates',gen_random_uuid()) as outgoing \gset
select test_assert(:'outgoing'::jsonb->>'state'='forwarded','investor outgoing request to ordinary attendee is direct');
select set_config('request.jwt.claim.sub',:'ordinary',false);
update event_b2b_meetings set status='cancelled' where id=(:'outgoing'::jsonb->>'meeting_id')::uuid;

-- A requested slot may be taken while review is pending.
select set_config('request.jwt.claim.sub',:'requester',false);
select submit_investor_booking(:'event',:'investor',:'slot',:'slot_end','in-person','Potential conflict',gen_random_uuid()) as conflict_request \gset
select set_config('request.jwt.claim.sub',:'investor',false);
select submit_investor_booking(:'event',:'ordinary',:'slot',:'slot_end','in-person','Confirmed elsewhere',gen_random_uuid()) as competing \gset
select set_config('request.jwt.claim.sub',:'ordinary',false);
update event_b2b_meetings set status='confirmed' where id=(:'competing'::jsonb->>'meeting_id')::uuid;
select set_config('request.jwt.claim.sub',:'reviewer',false);
select test_assert(decide_investor_booking((:'conflict_request'::jsonb->>'id')::uuid,1,'approve')->>'state'='needs_new_slot','stale slot returns to requester without forwarding');
select test_assert((select meeting_id is null from event_booking_requests where id=(:'conflict_request'::jsonb->>'id')::uuid),'failed scheduling leaves no linked invitation');
reset role;
select test_assert(not exists(select 1 from event_review_outbox where request_id=(:'conflict_request'::jsonb->>'id')::uuid and recipient_id=:'investor'),'stale slot generates no investor notification');

-- A pending investor invitation protects normal registration before acceptance.
set role authenticated;
select set_config('request.jwt.claim.sub',:'owner',false);
select issue_event_investor_invitation(:'event','person3@example.test',now()+interval '7 days') as unaccepted \gset
select set_config('request.jwt.claim.sub',:'ordinary',false);
select test_assert((get_investor_booking_policy(:'event',:'requester')->>'awaiting_acceptance')::boolean,'invited registration is protected before accepting badge');
select test_error(format('insert into event_b2b_meetings(event_id,attendee_a_id,attendee_b_id,profile_a_id,profile_b_id,organizer_id,status) values(%L,%L,%L,%L,%L,%L,''pending'')',
  :'event',:'ordinary_attendee','30000000-0000-4000-8000-000000000003',:'ordinary',:'requester',:'ordinary'),'42501','unscheduled bulk insertion cannot bypass pending invitation protection');
reset role;
update event_review_release set ready=false;
set role authenticated;
select set_config('request.jwt.claim.sub',:'requester',false);
select test_assert((get_investor_booking_policy(:'event',:'investor')->>'use_workflow')::boolean and not (get_investor_booking_policy(:'event',:'investor')->>'available')::boolean,'pause never converts investor booking to direct');
select test_error(format('select submit_investor_booking(%L,%L,%L,%L,''in-person'',''Paused'',gen_random_uuid())',:'event',:'investor',:'slot',:'slot_end'),'55000','new protected submission paused');
reset role;
update event_review_release set ready=true;
