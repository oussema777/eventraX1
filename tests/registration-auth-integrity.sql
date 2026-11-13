\set ON_ERROR_STOP on
-- Run only in an empty disposable database.
create schema auth;
do $$ begin if not exists(select 1 from pg_roles where rolname='anon') then create role anon; end if; end $$;
do $$ begin if not exists(select 1 from pg_roles where rolname='authenticated') then create role authenticated; end if; end $$;
do $$ begin if not exists(select 1 from pg_roles where rolname='service_role') then create role service_role; end if; end $$;
create table auth.users (
 id uuid primary key, email text, instance_id uuid, aud text default 'authenticated',
 role text default 'authenticated', is_sso_user boolean default false,
 email_confirmed_at timestamptz default now(), deleted_at timestamptz, banned_until timestamptz,
 raw_app_meta_data jsonb default '{"provider":"email","providers":["email"]}',
 encrypted_password text default 'preserve-hash', created_at timestamptz default now(),
 confirmation_token text default '', recovery_token text default '', email_change_token_new text default '',
 email_change text default '', email_change_token_current text default '', phone_change text default '',
 phone_change_token text default '', reauthentication_token text default ''
);
create table auth.identities (
 id uuid primary key default gen_random_uuid(), user_id uuid references auth.users,
 provider_id text not null, provider text not null, identity_data jsonb not null,
 created_at timestamptz, updated_at timestamptz, last_sign_in_at timestamptz,
 email text generated always as (lower(identity_data->>'email')) stored,
 unique(provider_id,provider)
);
create table public.test_registrations (user_id uuid references auth.users, answers jsonb);
insert into auth.users(id,email) values ('10000000-0000-4000-8000-000000000001','legacy@example.test');
insert into public.test_registrations values ('10000000-0000-4000-8000-000000000001','{"b2bOptIn":true}');
create temp table original_users as select to_jsonb(u)-'instance_id' snapshot from auth.users u;
\ir ../supabase/migrations/20261113180000_registration_auth_integrity.sql
create function public.test_assert(ok boolean, label text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'FAIL: %',label; end if; raise notice 'PASS: %',label; end $$;
select test_assert((select instance_id='00000000-0000-0000-0000-000000000000' from auth.users),'legacy login lookup repaired');
select test_assert((select count(*)=1 from auth.identities where provider='email' and identity_data->>'email_verified'='true'),'email identity repaired');
select test_assert((select snapshot=(select to_jsonb(u)-'instance_id' from auth.users u) from original_users),'password, verification, role and account data preserved');
select test_assert((select count(*)=1 from test_registrations where answers='{"b2bOptIn":true}'),'registration and ID preserved');
select test_assert(not has_function_privilege('anon','public.ensure_registration_auth_account(uuid,text)','execute') and not has_function_privilege('authenticated','public.ensure_registration_auth_account(uuid,text)','execute'),'browser cannot invoke account repair');
select test_assert(not has_table_privilege('anon','registration_auth_repairs','select'),'repair ledger private');
create temp table identities_before as select * from auth.identities;
set role service_role;
select public.ensure_registration_auth_account('10000000-0000-4000-8000-000000000001',' LEGACY@example.test ');
reset role;
select test_assert(not exists((select * from auth.identities except select * from identities_before) union all (select * from identities_before except select * from auth.identities)),'repeat repair leaves identity unchanged');
select test_assert((select count(*)=1 from registration_auth_repairs),'repeat repair creates no extra ledger rows');

insert into auth.users(id,email) values
 ('10000000-0000-4000-8000-000000000002','future@example.test'),
 ('10000000-0000-4000-8000-000000000003','unverified@example.test'),
 ('10000000-0000-4000-8000-000000000004','banned@example.test'),
 ('10000000-0000-4000-8000-000000000005','sso@example.test'),
 ('10000000-0000-4000-8000-000000000006','conflict@example.test'),
 ('10000000-0000-4000-8000-000000000007','owner@example.test'),
 ('10000000-0000-4000-8000-000000000008','google@example.test');
update auth.users set email_confirmed_at=null where email='unverified@example.test';
update auth.users set banned_until=now()+interval '1 year' where email='banned@example.test';
update auth.users set is_sso_user=true where email='sso@example.test';
insert into auth.identities(user_id,provider_id,provider,identity_data) values
 ('10000000-0000-4000-8000-000000000007','external-sub','google','{"email":"conflict@example.test"}'),
 ('10000000-0000-4000-8000-000000000008','google-sub','google','{"email":"google@example.test"}');
select public.ensure_registration_auth_account('10000000-0000-4000-8000-000000000002','future@example.test');
select test_assert((select instance_id is not null and exists(select 1 from auth.identities i where i.user_id=u.id) from auth.users u where email='future@example.test'),'future registration repairs legacy account automatically');
select public.ensure_registration_auth_account('10000000-0000-4000-8000-000000000008','google@example.test');
select test_assert((select count(*)=1 and min(provider)='google' from auth.identities where user_id='10000000-0000-4000-8000-000000000008'),'OAuth provider preserved without creating email identity');
do $$ declare attempt record; caught text; begin
 for attempt in select * from (values
 ('10000000-0000-4000-8000-000000000001','wrong@example.test','REGISTRATION_AUTH_ACCOUNT_MISMATCH'),
 ('10000000-0000-4000-8000-000000000099','missing@example.test','REGISTRATION_AUTH_ACCOUNT_MISMATCH'),
 ('10000000-0000-4000-8000-000000000003','unverified@example.test','REGISTRATION_AUTH_IDENTITY_UNAVAILABLE'),
 ('10000000-0000-4000-8000-000000000004','banned@example.test','REGISTRATION_AUTH_ACCOUNT_UNAVAILABLE'),
 ('10000000-0000-4000-8000-000000000005','sso@example.test','REGISTRATION_AUTH_ACCOUNT_UNAVAILABLE'),
 ('10000000-0000-4000-8000-000000000006','conflict@example.test','REGISTRATION_AUTH_IDENTITY_CONFLICT')
 ) v(id,email,expected) loop
   caught:=null;
   begin perform public.ensure_registration_auth_account(attempt.id::uuid,attempt.email);
   exception when others then caught:=sqlerrm; end;
   perform test_assert(caught=attempt.expected,attempt.expected);
 end loop;
end $$;
select test_assert((select count(*)=0 from auth.identities where user_id in ('10000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000006')),'rejected accounts unchanged');

-- Reproduce the live GoTrue string-scan failure and preserve active tokens.
update auth.users set confirmation_token=null,recovery_token=null,email_change_token_new=null,email_change=null,
 email_change_token_current='active-change-token',reauthentication_token='active-reauth-token'
 where email='legacy@example.test';
\ir ../supabase/migrations/20261113181000_registration_auth_string_fields.sql
select test_assert((select confirmation_token='' and recovery_token='' and email_change_token_new='' and email_change=''
 and email_change_token_current='active-change-token' and reauthentication_token='active-reauth-token'
 from auth.users where email='legacy@example.test'),'NULL strings repaired without invalidating active tokens');
select test_assert((select cardinality(normalized_null_fields)=4 from registration_auth_repairs where user_id='10000000-0000-4000-8000-000000000001'),'ledger records only fields actually repaired');
update auth.users set confirmation_token=null, recovery_token=null where email='future@example.test';
select public.ensure_registration_auth_account('10000000-0000-4000-8000-000000000002','future@example.test');
select test_assert((select confirmation_token='' and recovery_token='' from auth.users where email='future@example.test'),'future registration repairs NULL strings automatically');
select public.ensure_registration_auth_account('10000000-0000-4000-8000-000000000002','future@example.test');
select test_assert((select cardinality(normalized_null_fields)=2 from registration_auth_repairs where user_id='10000000-0000-4000-8000-000000000002'),'string repair is idempotent');
