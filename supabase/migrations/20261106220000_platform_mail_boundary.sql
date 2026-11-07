begin;
create table public.platform_mail_deliveries(
 id uuid primary key default gen_random_uuid(), dedup_key text not null unique check(length(dedup_key)=64),
 actor_id uuid references auth.users(id) on delete set null, mail jsonb not null,
 state text not null default 'sending' check(state in ('sending','sent','failed','reconcile')),
 token uuid, lease_until timestamptz, attempts integer not null default 1,
 created_at timestamptz not null default now(), provider_id text
);
alter table public.platform_mail_deliveries enable row level security;
revoke all on public.platform_mail_deliveries from public,anon,authenticated;
grant all on public.platform_mail_deliveries to service_role;
create index platform_mail_actor_recent on public.platform_mail_deliveries(actor_id,created_at);
create table public.registration_mail_preparations(dedup_key text primary key,lease_until timestamptz not null);
alter table public.registration_mail_preparations enable row level security;
revoke all on public.registration_mail_preparations from public,anon,authenticated;
grant all on public.registration_mail_preparations to service_role;
create function public.claim_registration_preparation(p_key text)
returns boolean language plpgsql security definer set search_path='' as $$
begin
  if p_key is null or length(p_key)<>64 then raise exception 'Invalid receipt'; end if;
  insert into public.registration_mail_preparations values(p_key,now()+interval '2 minutes')
    on conflict(dedup_key) do update set lease_until=excluded.lease_until
    where registration_mail_preparations.lease_until<now();
  return found;
end; $$;
create function public.claim_platform_mail(p_key text,p_actor uuid,p_mail jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare d public.platform_mail_deliveries;
begin
  if p_key is null or length(p_key)<>64 or p_mail is null or jsonb_typeof(p_mail)<>'object' or coalesce(jsonb_array_length(p_mail->'to'),0)<>1 then raise exception 'Invalid mail'; end if;
  perform pg_advisory_xact_lock(hashtextextended(coalesce(p_actor::text,p_key),7));
  select * into d from public.platform_mail_deliveries where dedup_key=p_key for update;
  if d.id is not null then
    if d.state='sent' then return jsonb_build_object('sent',true); end if;
    if d.mail<>p_mail then raise exception 'Mail payload changed'; end if;
    if d.state='reconcile' or d.lease_until>now() then return '{}'::jsonb; end if;
    if d.created_at<now()-interval '23 hours' or d.attempts>=8 then
      update public.platform_mail_deliveries set state='reconcile' where id=d.id; return '{}'::jsonb;
    end if;
    update public.platform_mail_deliveries set state='sending',token=gen_random_uuid(),lease_until=now()+interval '2 minutes',attempts=attempts+1 where id=d.id returning * into d;
  else
    if (select count(*) from public.platform_mail_deliveries where actor_id=p_actor and created_at>now()-interval '1 hour')>=500 then raise exception 'Mail rate limit' using errcode='54000'; end if;
    perform pg_advisory_xact_lock(hashtextextended(p_mail->'to'->>0,8));
    if (select count(*) from public.platform_mail_deliveries where mail->'to'=p_mail->'to' and created_at>now()-interval '1 hour')>=20 then raise exception 'Recipient rate limit' using errcode='54000'; end if;
    insert into public.platform_mail_deliveries(dedup_key,actor_id,mail,token,lease_until)
      values(p_key,p_actor,p_mail,gen_random_uuid(),now()+interval '2 minutes') returning * into d;
  end if;
  return jsonb_build_object('id',d.id,'token',d.token,'mail',d.mail);
end; $$;
create function public.finish_platform_mail(p_id uuid,p_token uuid,p_provider text,p_permanent boolean default false)
returns boolean language plpgsql security definer set search_path='' as $$
begin
  update public.platform_mail_deliveries set state=case when p_provider is not null then 'sent' when p_permanent then 'reconcile' else 'failed' end,
    provider_id=p_provider,token=null,lease_until=now()+interval '1 minute'
    where id=p_id and token=p_token and state='sending' and lease_until>now();
  return found;
end; $$;
create function public.platform_mail_investor_protected(p_event uuid,p_attendee uuid,p_profile uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select public.investor_attendee_protected(p_event,p_attendee) or public.investor_profile_protected(p_event,p_profile);
$$;
revoke all on function public.claim_platform_mail(text,uuid,jsonb),public.finish_platform_mail(uuid,uuid,text,boolean),
 public.platform_mail_investor_protected(uuid,uuid,uuid),public.claim_registration_preparation(text) from public,anon,authenticated;
grant execute on function public.claim_platform_mail(text,uuid,jsonb),public.finish_platform_mail(uuid,uuid,text,boolean),
 public.platform_mail_investor_protected(uuid,uuid,uuid),public.claim_registration_preparation(text) to service_role;
commit;
