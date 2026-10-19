-- Exercises deployed policies and slot validation; leaves no changes behind.
begin;
do $$ declare actor uuid; chosen_event uuid; begin
  select a.profile_id, a.event_id into actor, chosen_event from public.event_attendees a
    join public.event_b2b_settings s on s.event_id=a.event_id
    where public.b2b_event_eligible(a.event_id, a.profile_id)
      and jsonb_array_length(coalesce(s.venue_config->'schedules','[]')) > 0 limit 1;
  if actor is null then raise exception 'No eligible availability fixture'; end if;
  perform set_config('request.jwt.claim.sub', actor::text, true);
  perform set_config('eventra.test_event', chosen_event::text, true);
end $$;
set local role authenticated;
do $$ declare chosen_event uuid := current_setting('eventra.test_event')::uuid; begin
  -- Explicitly choosing no slots is valid and distinct from the all-slots default.
  insert into public.event_b2b_availability(event_id,profile_id,available_slots)
    values(chosen_event,auth.uid(),'{}')
    on conflict(event_id,profile_id) do update set available_slots='{}';
  if not exists(select 1 from public.event_b2b_availability where event_id=chosen_event and profile_id=auth.uid() and cardinality(available_slots)=0) then
    raise exception 'Availability not readable after save'; end if;
  delete from public.event_b2b_availability where event_id=chosen_event and profile_id=auth.uid();
  if exists(select 1 from public.event_b2b_availability where event_id=chosen_event and profile_id=auth.uid()) then raise exception 'Reset did not restore default'; end if;
end $$;
select 'Authenticated availability save, read and reset passed' as result;
rollback;
