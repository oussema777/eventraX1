drop function if exists public.create_notification(uuid, text, text, text, text);

create function public.create_notification(
  p_recipient_id uuid,
  p_title text,
  p_body text,
  p_type text,
  p_action_url text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (
    recipient_id,
    actor_id,
    title,
    body,
    type,
    action_url
  )
  values (
    p_recipient_id,
    auth.uid(),
    p_title,
    p_body,
    p_type,
    p_action_url
  );
end;
$$;

grant execute on function public.create_notification(uuid, text, text, text, text) to authenticated;

notify pgrst, 'reload schema';
