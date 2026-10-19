-- Source-of-truth activity counters for public and private profiles.
-- Profile visit tracking is intentionally excluded.

create or replace function public.get_profile_activity_stats(p_profile_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'eventsAttended', (
      select count(distinct attendee.event_id)
      from public.event_attendees attendee
      join public.event_checkins checkin on checkin.attendee_id = attendee.id
      where checkin.type = 'event'
        and (
          attendee.profile_id = p_profile_id
          or (
            attendee.profile_id is null
            and exists (
              select 1 from auth.users account
              where account.id = p_profile_id
                and account.email_confirmed_at is not null
                and lower(trim(attendee.email)) = lower(trim(account.email))
            )
          )
        )
    ),
    'b2bMeetings', (
      select count(*) from public.event_b2b_meetings meeting
      where (meeting.profile_a_id = p_profile_id or meeting.profile_b_id = p_profile_id)
        and meeting.status in ('confirmed', 'completed')
    ),
    'connections', (
      select count(*) from public.b2b_connections connection
      where connection.profile_a_id = p_profile_id or connection.profile_b_id = p_profile_id
    )
  );
$$;

revoke all on function public.get_profile_activity_stats(uuid) from public;
grant execute on function public.get_profile_activity_stats(uuid) to anon, authenticated;
