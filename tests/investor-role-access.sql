-- Synthetic fixture only. Never run against production.
begin;
reset role;
delete from public.event_review_permissions;
update public.event_review_release set ready=true;
insert into public.event_review_policies(event_id,enabled)
values('20000000-0000-4000-8000-000000000001',true)
on conflict(event_id) do update set enabled=true;
insert into auth.users(id,email,email_confirmed_at) values
 ('10000000-0000-4000-8000-000000000008','event-admin@example.test',now()),
 ('10000000-0000-4000-8000-000000000009','platform-admin@example.test',now()),
 ('10000000-0000-4000-8000-000000000010','pending-admin@example.test',now());
insert into public.profiles(id,role) values
 ('10000000-0000-4000-8000-000000000008','user'),
 ('10000000-0000-4000-8000-000000000009','admin'),
 ('10000000-0000-4000-8000-000000000010','user');
insert into public.event_team_members(event_id,user_id,role,status) values
 ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000008','administrator','active'),
 ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000010','administrator','pending');
update public.event_team_members set status='active' where user_id='10000000-0000-4000-8000-000000000002';
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
select test_assert(event_review_allowed('20000000-0000-4000-8000-000000000001','designate'),'owner manages investors without a stored grant');
select test_assert(not event_review_allowed('20000000-0000-4000-8000-000000000001','review'),'owner review still requires explicit permission');
select test_assert(not event_review_allowed('20000000-0000-4000-8000-000000000002','designate'),'owner access does not cross events');
select test_assert(not event_review_allowed('20000000-0000-4000-8000-000000000001','unexpected'),'unknown action denied');
select set_event_review_permissions('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001',false,false);
select test_assert(event_review_allowed('20000000-0000-4000-8000-000000000001','designate'),'removing an extra grant does not revoke owner role access');
select test_assert((issue_event_investor_invitation('20000000-0000-4000-8000-000000000001','role-owner@example.test',now()+interval '7 days')->>'token') is not null,'owner can actually create an investor invitation');
select set_event_review_permissions('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002',true,true);
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
select test_assert(event_review_allowed('20000000-0000-4000-8000-000000000001','designate'),'explicit coordinator designation still works');
select test_assert(event_review_allowed('20000000-0000-4000-8000-000000000001','review'),'explicit coordinator review still works');
select test_error($q$select set_event_review_permissions('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002',true,true)$q$,'42501','coordinator cannot grant their own permissions');
reset role;
update public.event_team_members set status='revoked' where user_id='10000000-0000-4000-8000-000000000002';
set local role authenticated;
select test_assert(not event_review_allowed('20000000-0000-4000-8000-000000000001','designate'),'revoked coordinator loses designation despite stored grant');
select test_assert(not event_review_allowed('20000000-0000-4000-8000-000000000001','review'),'revoked coordinator loses review despite stored grant');
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000008',true);
select test_assert(event_review_allowed('20000000-0000-4000-8000-000000000001','designate'),'active event administrator gets designation by role');
select test_assert(not event_review_allowed('20000000-0000-4000-8000-000000000001','review'),'event administrator does not automatically review');
select test_assert(not event_review_allowed('20000000-0000-4000-8000-000000000001','configure'),'event administrator cannot escalate team permissions');
select test_assert(not event_review_allowed('20000000-0000-4000-8000-000000000002','designate'),'event administrator is scoped to their event');
select test_assert((issue_event_investor_invitation('20000000-0000-4000-8000-000000000001','role-admin@example.test',now()+interval '7 days')->>'token') is not null,'event administrator can create an investor invitation');
reset role;
update public.event_team_members set status='revoked' where user_id='10000000-0000-4000-8000-000000000008';
set local role authenticated;
select test_assert(not event_review_allowed('20000000-0000-4000-8000-000000000001','designate'),'revoking administrator membership removes access immediately');
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000009',true);
select test_assert(event_review_allowed('20000000-0000-4000-8000-000000000001','designate'),'platform administrator gets designation by role');
select test_assert(not event_review_allowed('20000000-0000-4000-8000-000000000001','review'),'platform administrator review remains explicit');
select test_assert(not event_review_allowed('20000000-0000-4000-8000-000000000099','designate'),'nonexistent event grants no access');
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000010',true);
select test_assert(not event_review_allowed('20000000-0000-4000-8000-000000000001','designate'),'pending administrator invitation grants no access');
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000006',true);
select test_assert(not event_review_allowed('20000000-0000-4000-8000-000000000001','designate'),'check-in staff cannot manage investors');
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000003',true);
select test_assert(not event_review_allowed('20000000-0000-4000-8000-000000000001','designate'),'ordinary attendee cannot manage investors');
select set_config('request.jwt.claim.sub','',true);
select test_assert(not event_review_allowed('20000000-0000-4000-8000-000000000001','designate'),'anonymous identity gets no designation');
reset role;
update public.events set owner_id='10000000-0000-4000-8000-000000000007' where id='20000000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
select test_assert(not event_review_allowed('20000000-0000-4000-8000-000000000001','designate'),'former owner loses automatic access');
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000007',true);
select test_assert(event_review_allowed('20000000-0000-4000-8000-000000000001','designate'),'new owner inherits automatic access');
reset role;
update public.event_review_policies set enabled=false where event_id='20000000-0000-4000-8000-000000000001';
set local role authenticated;
select test_error($q$select issue_event_investor_invitation('20000000-0000-4000-8000-000000000001','disabled@example.test',now()+interval '7 days')$q$,'55000','automatic permission does not bypass event feature gate');
rollback;
