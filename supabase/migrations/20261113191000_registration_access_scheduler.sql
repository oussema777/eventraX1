begin;
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

-- The endpoint and worker secret are provisioned in Vault, never in a cron
-- command, source code, participant response, or a browser-readable table.
create function public.dispatch_registration_access_retries() returns bigint
language plpgsql security definer set search_path='' as $$
declare endpoint text; secret text; request_id bigint;
begin
 if not exists(select 1 from public.registration_access_jobs
   where (state='pending' and next_attempt_at<=now()) or (state='processing' and lease_until<now())) then
   return null;
 end if;
 select decrypted_secret into endpoint from vault.decrypted_secrets where name='registration_retry_url';
 select decrypted_secret into secret from vault.decrypted_secrets where name='registration_retry_secret';
 if endpoint is null or secret is null then raise exception 'Registration retry configuration missing'; end if;
 select net.http_post(url:=endpoint,headers:=jsonb_build_object('Content-Type','application/json',
   'x-registration-retry-secret',secret),body:='{}'::jsonb,timeout_milliseconds:=60000) into request_id;
 return request_id;
end $$;
revoke all on function public.dispatch_registration_access_retries() from public,anon,authenticated;
grant execute on function public.dispatch_registration_access_retries() to service_role;
select cron.schedule('eventra-registration-access-retry','* * * * *','select public.dispatch_registration_access_retries()');
commit;
