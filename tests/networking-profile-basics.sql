-- Run on the connected project. All fixture changes roll back.
begin;
create temporary table booking_profile_probe (
  profile_a_id uuid, profile_b_id uuid, event_id uuid, start_at timestamptz, end_at timestamptz, status text
);
create trigger booking_profile_probe before insert or update on booking_profile_probe
  for each row execute function public.enforce_booking_profile_basics();
do $$
declare actor uuid; other_person uuid; rejection text; before_profile jsonb; after_profile jsonb;
begin
  select a.profile_id into actor from public.event_attendees a join public.profiles p on p.id=a.profile_id
    where a.meta->>'b2bOptIn'='true' and a.profile_id is not null limit 1;
  if actor is null then raise exception 'No profile fixture available'; end if;
  other_person := gen_random_uuid();
  perform set_config('request.jwt.claim.sub', actor::text, true);
  update public.profiles set full_name='Test name', company='Test organization', industry='Energy', job_title='' where id=actor;
  begin
    insert into booking_profile_probe values (actor, other_person, gen_random_uuid(), now(), now()+interval '30 minutes', 'pending');
  exception when check_violation then rejection := sqlerrm;
  end;
  if rejection is distinct from 'B2B_PROFILE_INCOMPLETE' then raise exception 'Incomplete profile was not rejected'; end if;
  -- Cancellation and unscheduled organizer suggestions remain possible.
  insert into booking_profile_probe values (actor, other_person, gen_random_uuid(), now(), now()+interval '30 minutes', 'cancelled');
  insert into booking_profile_probe values (actor, other_person, gen_random_uuid(), null, null, 'pending');
  update public.profiles set job_title='Director', country='User-edited country', location='User-edited city', gender='other' where id=actor;
  insert into booking_profile_probe values (actor, other_person, gen_random_uuid(), now(), now()+interval '30 minutes', 'pending');
  select to_jsonb(p) into before_profile from public.profiles p where id=actor;
  perform public.seed_networking_profile(actor);
  select to_jsonb(p) into after_profile from public.profiles p where id=actor;
  if before_profile->>'job_title' is distinct from after_profile->>'job_title'
    or before_profile->>'country' is distinct from after_profile->>'country'
    or before_profile->>'location' is distinct from after_profile->>'location'
    or before_profile->>'gender' is distinct from after_profile->>'gender' then raise exception 'Edited profile overwritten'; end if;
  if public.registration_profile_answer('{"Fonction":"Manager","Pays":"Tunisia","Genre":"Femme"}', array['poste','fonction']) <> 'Manager' then raise exception 'French field mapping failed'; end if;
end $$;
select 'Profile gate, cancellation, organizer suggestions and preservation checks passed' as result;
rollback;
