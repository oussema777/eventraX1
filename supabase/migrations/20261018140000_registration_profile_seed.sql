-- Return only profile fields from this verified account's latest event registration.
-- The browser cannot choose an email address or read another person's registration.
create or replace function public.get_my_registration_profile_seed()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'fullName', coalesce(nullif(attendee.meta->>'fullName', ''), attendee.name, ''),
    'phone', coalesce(attendee.meta->>'phone', ''),
    'companyName', coalesce(nullif(attendee.meta->>'companyName', ''), attendee.company, ''),
    'sector', coalesce(attendee.meta->>'sector', '')
  )
  from auth.users account
  join public.event_attendees attendee on lower(trim(attendee.email)) = lower(trim(account.email))
  where account.id = auth.uid()
    and account.email_confirmed_at is not null
    and attendee.status is distinct from 'cancelled'
  order by attendee.created_at desc, attendee.id desc
  limit 1;
$$;

revoke all on function public.get_my_registration_profile_seed() from public, anon;
grant execute on function public.get_my_registration_profile_seed() to authenticated;
