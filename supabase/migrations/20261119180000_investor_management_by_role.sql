-- Owners and active administrators manage investors by role. Review stays explicit.
begin;
create or replace function public.event_review_allowed(p_event uuid,p_action text)
returns boolean language sql stable security definer set search_path='' as $$
  select case
    when p_action='configure' then public.event_can(p_event,'team')
    when p_action='designate' then public.event_can(p_event,'attendees') and (
      public.event_access_role(p_event) in ('owner','platform_admin','administrator')
      or exists(select 1 from public.event_review_permissions
        where event_id=p_event and user_id=auth.uid() and can_designate)
    )
    when p_action='review' then public.event_can(p_event,'b2b') and exists
      (select 1 from public.event_review_permissions
        where event_id=p_event and user_id=auth.uid() and can_review)
    else false end;
$$;
commit;
