-- Run against the linked project inside a transaction; all probe records roll back.
begin;
do $$
declare
  probe_thread uuid;
  legacy_thread uuid;
  real_owner uuid := '3acc3925-2c08-5a77-94c0-262052e4d0a6';
  system_owner uuid := '5e1d401a-16a1-5b5f-b839-6692ffc3d62f';
begin
  if not exists (select 1 from public.business_profiles
    where id = 'fa4ecbc6-8a15-5e82-b62f-2e4a19fad448' and owner_profile_id = real_owner) then
    raise exception 'Riyasol must point to its original owner';
  end if;
  if (select count(*) from public.business_profiles where owner_profile_id = system_owner) <> 1 then
    raise exception 'Only the unresolved original owner should remain';
  end if;

  insert into public.message_threads(created_by) values(real_owner) returning id into probe_thread;
  insert into public.message_thread_participants(thread_id, profile_id) values(probe_thread, real_owner);
  insert into public.message_messages(thread_id, sender_id, body) values(probe_thread, real_owner, 'Rollback probe');
  begin
    insert into public.message_thread_participants(thread_id, profile_id) values(probe_thread, system_owner);
    raise exception 'System participant was allowed';
  exception when check_violation then null;
  end;
  select thread_id into legacy_thread from public.message_thread_participants where profile_id = system_owner limit 1;
  if legacy_thread is not null then
    begin
      insert into public.message_messages(thread_id, sender_id, body) values(legacy_thread, real_owner, 'Must be rejected');
      raise exception 'Message to legacy system thread was allowed';
    exception when check_violation then null;
    end;
  end if;
end $$;
rollback;
