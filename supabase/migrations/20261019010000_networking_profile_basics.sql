begin;
alter table public.profiles add column if not exists country text;

-- Match only known registration labels. Never infer personal details.
create or replace function public.registration_profile_answer(answers jsonb, labels text[])
returns text language sql immutable set search_path = pg_catalog, public as $$
  select nullif(trim(value #>> '{}'), '') from jsonb_each(coalesce(answers, '{}'::jsonb))
  where lower(trim(key)) = any(labels) and jsonb_typeof(value) = 'string' and nullif(trim(value #>> '{}'), '') is not null
  order by array_position(labels, lower(trim(key))) limit 1;
$$;
revoke all on function public.registration_profile_answer(jsonb, text[]) from public;

create or replace function public.seed_networking_profile(p_profile uuid)
returns void language plpgsql security definer set search_path = pg_catalog, public as $$
declare answers jsonb; gender_answer text;
begin
  select a.meta into answers from public.event_attendees a join auth.users u on u.id = a.profile_id
  where a.profile_id = p_profile and lower(trim(a.email)) = lower(trim(u.email))
    and a.status is distinct from 'cancelled' and a.meta->>'b2bOptIn' = 'true'
  order by a.created_at desc, a.id desc limit 1;
  if answers is null then return; end if;
  gender_answer := lower(public.registration_profile_answer(answers, array['gender','genre','sexe','الجنس']));
  gender_answer := case gender_answer when 'homme' then 'male' when 'masculin' then 'male' when 'ذكر' then 'male'
    when 'femme' then 'female' when 'féminin' then 'female' when 'أنثى' then 'female' when 'autre' then 'other'
    else gender_answer end;
  if gender_answer not in ('male','female','other','prefer_not_to_say') then gender_answer := null; end if;
  update public.profiles p set
    full_name = coalesce(nullif(trim(p.full_name), ''), public.registration_profile_answer(answers, array['fullname','full name','nom complet'])),
    phone_number = coalesce(nullif(trim(p.phone_number), ''), public.registration_profile_answer(answers, array['phone','phone number','numéro de téléphone','telephone'])),
    company = coalesce(nullif(trim(p.company), ''), public.registration_profile_answer(answers, array['companyname','company','entreprise','organisation'])),
    industry = coalesce(nullif(trim(p.industry), ''), public.registration_profile_answer(answers, array['sector','secteur','industry','industrie'])),
    job_title = coalesce(nullif(trim(p.job_title), ''), public.registration_profile_answer(answers, array['job_title','jobtitle','job title','poste','fonction','position','profession','المنصب'])),
    location = coalesce(nullif(trim(p.location), ''), public.registration_profile_answer(answers, array['location','city','ville','gouvernorat','localisation','المدينة'])),
    country = coalesce(nullif(trim(p.country), ''), public.registration_profile_answer(answers, array['country','pays','البلد'])),
    gender = coalesce(nullif(trim(p.gender), ''), gender_answer)
  where p.id = p_profile;
end;
$$;
revoke all on function public.seed_networking_profile(uuid) from public, anon, authenticated;

create or replace function public.seed_networking_profile_on_registration()
returns trigger language plpgsql security definer set search_path = pg_catalog, public as $$
begin
  if new.profile_id is not null then perform public.seed_networking_profile(new.profile_id); end if;
  return new;
end;
$$;
revoke all on function public.seed_networking_profile_on_registration() from public;
drop trigger if exists seed_networking_profile_on_registration on public.event_attendees;
create trigger seed_networking_profile_on_registration after insert or update of profile_id, meta on public.event_attendees
  for each row execute function public.seed_networking_profile_on_registration();

-- Repair existing accounts while preserving every nonempty edited field.
do $$ declare participant uuid; begin
  for participant in select distinct profile_id from public.event_attendees where profile_id is not null and meta->>'b2bOptIn' = 'true'
  loop perform public.seed_networking_profile(participant); end loop;
end $$;

create or replace function public.enforce_booking_profile_basics()
returns trigger language plpgsql security definer set search_path = pg_catalog, public as $$
declare actor uuid := auth.uid();
begin
  if actor is null or actor not in (new.profile_a_id, new.profile_b_id) or new.status not in ('pending','confirmed') or new.start_at is null then return new; end if;
  if tg_op = 'UPDATE' then
    if new.status = old.status and new.start_at is not distinct from old.start_at and new.end_at is not distinct from old.end_at
      and new.profile_a_id is not distinct from old.profile_a_id and new.profile_b_id is not distinct from old.profile_b_id
      and new.event_id is not distinct from old.event_id then return new; end if;
  end if;
  if not exists (select 1 from public.profiles p where p.id = actor
    and nullif(trim(p.full_name), '') is not null and nullif(trim(p.job_title), '') is not null
    and nullif(trim(p.company), '') is not null and coalesce(nullif(trim(p.industry), ''), nullif(trim(p.sector), '')) is not null) then
    raise exception 'B2B_PROFILE_INCOMPLETE' using errcode = '23514';
  end if;
  return new;
end;
$$;
revoke all on function public.enforce_booking_profile_basics() from public;
drop trigger if exists enforce_booking_profile_basics on public.event_b2b_meetings;
create trigger enforce_booking_profile_basics before insert or update on public.event_b2b_meetings
  for each row execute function public.enforce_booking_profile_basics();
notify pgrst, 'reload schema';
commit;
