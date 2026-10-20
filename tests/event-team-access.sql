-- Run ONLY against an isolated test database with the application schema and
-- 20261020120000_event_team_access applied. Synthetic fixtures; always rolled back.
\set ON_ERROR_STOP on
begin;
create function pg_temp.assert_ok(ok boolean, label text) returns void language plpgsql as $$
begin if ok is not true then raise exception 'FAIL: %',label; end if; raise notice 'PASS: %',label; end $$;
create function pg_temp.denied(statement text, label text) returns void language plpgsql as $$
begin
  begin execute statement;
  exception when insufficient_privilege then raise notice 'PASS: %',label; return; end;
  raise exception 'FAIL: % was allowed',label;
end $$;

insert into auth.users(id,email,email_confirmed_at,raw_app_meta_data)
select ('10000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,
  case when n=1 then 'owner@test.invalid' when n=2 then 'admin@test.invalid'
    when n=3 then 'coordinator@test.invalid' when n=4 then 'scanner@test.invalid'
    when n=5 then 'pending@test.invalid' when n=6 then 'wrong@test.invalid'
    when n=7 then 'guest@test.invalid' when n=8 then 'platform@test.invalid'
    else 'other-owner@test.invalid' end,
  now(),case when n=7 then '{"account_type":"event_guest"}'::jsonb else '{}'::jsonb end
from generate_series(1,9) n;
insert into public.profiles(id,email,role)
  select id,email,case when email='platform@test.invalid' then 'admin' else 'user' end from auth.users where email like '%@test.invalid';
insert into public.events(id,owner_id,organizer_id,name,status,is_public)
values('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Team test','published',true),
 ('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000009','10000000-0000-4000-8000-000000000009','Other event','published',true);
insert into public.event_attendees(id,event_id,profile_id,name,status,checked_in)
values('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000005','Attendee A','registered',false),
 ('30000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000006','Attendee B','registered',false),
 ('30000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000009','Other attendee','registered',false);
insert into public.event_b2b_settings(event_id) values('20000000-0000-4000-8000-000000000001');
insert into public.event_notification_settings(event_id,trigger_type,is_email_enabled)
values('20000000-0000-4000-8000-000000000001','test',true);
insert into public.event_b2b_meetings(id,event_id,attendee_a_id,attendee_b_id,profile_a_id,profile_b_id,status,start_at,end_at)
values('40000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001',
 '30000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000002',
 '10000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000006','confirmed',now()+interval '1 day',now()+interval '1 day 30 minutes');

set local role authenticated;
select set_config('request.jwt.claim.role','authenticated',true);
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
select pg_temp.assert_ok(public.event_access_role('20000000-0000-4000-8000-000000000001')='owner','existing owner retains access');
select (public.invite_event_member('20000000-0000-4000-8000-000000000001',' ADMIN@test.invalid ','administrator')).id as admin_invite \gset
select (public.invite_event_member('20000000-0000-4000-8000-000000000001','coordinator@test.invalid','coordinator')).id as coordinator_invite \gset
select (public.invite_event_member('20000000-0000-4000-8000-000000000001','scanner@test.invalid','checkin')).id as scanner_invite \gset
select (public.invite_event_member('20000000-0000-4000-8000-000000000001','pending@test.invalid','coordinator')).id as pending_invite \gset
select (public.invite_event_member('20000000-0000-4000-8000-000000000001','guest@test.invalid','checkin')).id as guest_invite \gset
select pg_temp.assert_ok((public.invite_event_member('20000000-0000-4000-8000-000000000001','admin@test.invalid','administrator')).id=:'admin_invite','retries reuse pending invitation');
select pg_temp.assert_ok(not public.event_can('20000000-0000-4000-8000-000000000001','invented_permission'),'unknown permission denied');

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000005',true);
select pg_temp.assert_ok(public.event_access_role('20000000-0000-4000-8000-000000000001') is null,'pending invitation grants no access');
select pg_temp.denied(format('select public.accept_event_invitation(%L)',:'admin_invite'),'forwarded invitation cannot be accepted by another email');
select pg_temp.denied($s$update public.profiles set role='admin' where id=auth.uid()$s$,'cannot self-promote through profile');
select pg_temp.denied($s$insert into public.event_team_members(event_id,email,role,status,user_id) values('20000000-0000-4000-8000-000000000001','fake@test.invalid','administrator','active',auth.uid())$s$,'direct membership insert denied');
with changed as (update public.event_b2b_settings set event_id=event_id returning 1)
select pg_temp.assert_ok((select count(*) from changed)=0,'legacy permissive B2B write removed');
with changed as (update public.event_notification_settings set is_email_enabled=false returning 1)
select pg_temp.assert_ok((select count(*) from changed)=0,'legacy permissive notification write removed');

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
select public.accept_event_invitation(:'admin_invite');
select pg_temp.assert_ok(public.event_access_role('20000000-0000-4000-8000-000000000001')='administrator','verified invited administrator accepts');
select pg_temp.assert_ok(public.accept_event_invitation(:'admin_invite')='20000000-0000-4000-8000-000000000001','acceptance is idempotent');
select pg_temp.assert_ok(public.event_access_role('20000000-0000-4000-8000-000000000002') is null,'role does not leak into another event');
select pg_temp.denied($s$select public.invite_event_member('20000000-0000-4000-8000-000000000001','new@test.invalid','administrator')$s$,'administrator cannot invite other staff');
select pg_temp.denied(format('select public.update_event_member(%L,''administrator'',false)',:'scanner_invite'),'administrator cannot promote staff');
select pg_temp.denied($s$update public.events set owner_id=auth.uid() where id='20000000-0000-4000-8000-000000000001'$s$,'administrator cannot take ownership');
with changed as (delete from public.events where id='20000000-0000-4000-8000-000000000001' returning 1)
select pg_temp.assert_ok((select count(*) from changed)=0,'administrator cannot delete event');
with changed as (update public.events set name='Admin edit' where id='20000000-0000-4000-8000-000000000001' returning 1)
select pg_temp.assert_ok((select count(*) from changed)=1,'administrator can edit event');
with changed as (update public.events set name='Unauthorized' where id='20000000-0000-4000-8000-000000000002' returning 1)
select pg_temp.assert_ok((select count(*) from changed)=0,'cross-event writes denied');
with changed as (update public.event_notification_settings set is_email_enabled=false where event_id='20000000-0000-4000-8000-000000000001' returning 1)
select pg_temp.assert_ok((select count(*) from changed)=1,'administrator can manage notifications');
insert into public.notification_logs(event_id,trigger_type,channel,status)
values('20000000-0000-4000-8000-000000000001','test','email','sent');
select pg_temp.assert_ok((select count(*) from public.notification_logs)=1,'administrator can read notification history');

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000003',true);
select public.accept_event_invitation(:'coordinator_invite');
select pg_temp.assert_ok(public.event_can('20000000-0000-4000-8000-000000000001','attendees') and public.event_can('20000000-0000-4000-8000-000000000001','b2b'),'coordinator has attendees and B2B access');
with changed as (update public.events set name='Coordinator edit' where id='20000000-0000-4000-8000-000000000001' returning 1)
select pg_temp.assert_ok((select count(*) from changed)=0,'coordinator cannot edit event settings');
with changed as (update public.event_attendees set name='Coordinator attendee edit' where id='30000000-0000-4000-8000-000000000001' returning 1)
select pg_temp.assert_ok((select count(*) from changed)=1,'coordinator can edit attendees');
with changed as (update public.event_b2b_settings set event_id=event_id returning 1)
select pg_temp.assert_ok((select count(*) from changed)=1,'coordinator can manage B2B settings');
with changed as (update public.event_notification_settings set is_email_enabled=true returning 1)
select pg_temp.assert_ok((select count(*) from changed)=0,'coordinator cannot edit notifications');
select pg_temp.denied($s$insert into public.notification_logs(event_id,trigger_type,channel,status) values('20000000-0000-4000-8000-000000000001','test','email','sent')$s$,'coordinator cannot forge notification history');
select pg_temp.assert_ok((select count(*) from public.event_team_audit)=0,'staff cannot read owner access history');

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000004',true);
select public.accept_event_invitation(:'scanner_invite');
select pg_temp.assert_ok(public.event_can('20000000-0000-4000-8000-000000000001','checkin') and not public.event_can('20000000-0000-4000-8000-000000000001','attendees'),'scanner has only check-in permission');
select pg_temp.denied($s$update public.event_attendees set name='Scanner edit' where id='30000000-0000-4000-8000-000000000001'$s$,'scanner cannot edit attendee identity');
select pg_temp.denied($s$update public.event_b2b_meetings set status='cancelled' where id='40000000-0000-4000-8000-000000000001'$s$,'scanner cannot cancel a meeting');
select pg_temp.denied($s$update public.event_b2b_meetings set status='completed' where id='40000000-0000-4000-8000-000000000001'$s$,'scanner cannot complete meeting before both arrive');
select pg_temp.denied($s$insert into public.event_checkins(event_id,attendee_id,type) values('20000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000003','event')$s$,'scanner cannot check in an attendee from another event');
insert into public.event_checkins(event_id,attendee_id,type,meeting_id,actor_id)
values('20000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','b2b','40000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001'),
 ('20000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000002','b2b','40000000-0000-4000-8000-000000000001',null);
select pg_temp.assert_ok((select bool_and(actor_id=auth.uid() and checked_in_by=auth.uid() and actor_role='checkin') from public.event_checkins),'check-in audit records actual staff identity');
with changed as (update public.event_attendees set checked_in=true,check_in_at=now() where id='30000000-0000-4000-8000-000000000001' returning 1)
select pg_temp.assert_ok((select count(*) from changed)=1,'scanner can record arrival');
with changed as (update public.event_b2b_meetings set status='completed' where id='40000000-0000-4000-8000-000000000001' returning 1)
select pg_temp.assert_ok((select count(*) from changed)=1,'scanner can complete meeting after both arrive');

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000007',true);
select public.accept_event_invitation(:'guest_invite');
reset role;
select pg_temp.assert_ok((select raw_app_meta_data->>'account_type'='user' from auth.users where id='10000000-0000-4000-8000-000000000007'),'invited registration-created guest becomes a member');
update public.event_team_members set expires_at=now()-interval '1 day' where id=:'pending_invite';
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000005',true);
select pg_temp.denied(format('select public.accept_event_invitation(%L)',:'pending_invite'),'expired invitation cannot be accepted');
reset role;
update public.event_team_members set expires_at=now()+interval '1 day' where id=:'pending_invite';
update auth.users set email_confirmed_at=null where id='10000000-0000-4000-8000-000000000005';
set local role authenticated;
select pg_temp.denied(format('select public.accept_event_invitation(%L)',:'pending_invite'),'unverified email cannot accept even when account exists');
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
select public.update_event_member(:'coordinator_invite','checkin',false);
select public.update_event_member(:'admin_invite',null,true);
select pg_temp.assert_ok((select count(*) from public.event_team_audit where action='accepted')=4,'acceptance audit is written once per member');
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000003',true);
select pg_temp.assert_ok(not public.event_can('20000000-0000-4000-8000-000000000001','b2b'),'downgrade takes effect immediately');
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
select pg_temp.assert_ok(public.event_access_role('20000000-0000-4000-8000-000000000001') is null,'revocation takes effect without a new JWT');
select pg_temp.denied(format('select public.accept_event_invitation(%L)',:'admin_invite'),'revoked invitation cannot be replayed');
with changed as (update public.events set name='Revoked edit' where id='20000000-0000-4000-8000-000000000001' returning 1)
select pg_temp.assert_ok((select count(*) from changed)=0,'revoked staff cannot continue writing');
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
select (public.invite_event_member('20000000-0000-4000-8000-000000000001','admin@test.invalid','checkin')).id as reinvite \gset
select pg_temp.assert_ok(:'reinvite'::uuid <> :'admin_invite'::uuid,'reinviting rotates the invitation ID');
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000008',true);
select pg_temp.assert_ok(public.event_access_role('20000000-0000-4000-8000-000000000001')='platform_admin','existing platform admin access retained');

reset role;
set local role anon;
select set_config('request.jwt.claim.role','anon',true);
select set_config('request.jwt.claim.sub','',true);
select pg_temp.assert_ok((select count(*) from public.events where id='20000000-0000-4000-8000-000000000001')=1,'public event stays visible');
select pg_temp.assert_ok((select count(*) from public.event_attendees where event_id='20000000-0000-4000-8000-000000000001')=2,'public attendee directory stays visible');
select pg_temp.denied(format('select public.accept_event_invitation(%L)',:'scanner_invite'),'anonymous invitation acceptance denied');
rollback;
