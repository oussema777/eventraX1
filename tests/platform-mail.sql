begin;
set role authenticated;
select test_error('select claim_platform_mail(repeat(''a'',64),auth.uid(),''{"to":["x@example.test"]}'')','42501','client cannot reserve arbitrary mail');
select test_error('select finish_platform_mail(gen_random_uuid(),gen_random_uuid(),''forged'')','42501','client cannot acknowledge arbitrary mail');
reset role;
set role service_role;
select claim_platform_mail(repeat('a',64),null,'{"to":["registration@example.test"],"html":"trusted"}') as lease \gset
select test_assert(:'lease'::jsonb ? 'token','trusted registration can reserve a delivery without a signed-in actor');
select test_assert(claim_platform_mail(repeat('a',64),null,'{"to":["registration@example.test"],"html":"trusted"}')='{}'::jsonb,'active generic mail lease blocks duplicate send');
select test_assert(not finish_platform_mail((:'lease'::jsonb->>'id')::uuid,gen_random_uuid(),'fake'),'wrong generic mail lease cannot acknowledge');
select test_assert(finish_platform_mail((:'lease'::jsonb->>'id')::uuid,(:'lease'::jsonb->>'token')::uuid,'provider-id'),'generic mail acknowledgement succeeds');
select test_assert((claim_platform_mail(repeat('a',64),null,'{"to":["registration@example.test"],"html":"trusted"}')->>'sent')::boolean,'accepted generic mail is deduplicated');
reset role;
update platform_mail_deliveries set state='failed',lease_until=now()-interval '1 minute',created_at=now()-interval '24 hours';
select test_assert(claim_platform_mail(repeat('a',64),null,'{"to":["registration@example.test"],"html":"trusted"}')='{}'::jsonb,'generic mail is not retried beyond provider window');
select test_assert((select state='reconcile' from platform_mail_deliveries where dedup_key=repeat('a',64)),'ambiguous generic mail requires reconciliation');
rollback;
