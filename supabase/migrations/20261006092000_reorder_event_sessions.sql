-- Save a complete event order atomically; concurrent edits fail rather than
-- silently overwriting another organizer's changes. Session times stay intact.
create or replace function public.reorder_event_sessions(p_event_id uuid, p_session_ids uuid[], p_expected_order jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare
  current_order jsonb;
  row_count integer;
begin
  perform 1 from public.events e where e.id = p_event_id
    and auth.uid() is not null
    and (e.owner_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
    for update;
  if not found then raise exception 'Not authorized to reorder this event' using errcode = '42501'; end if;

  perform 1 from public.event_sessions where event_id = p_event_id order by id for update;
  select count(*), coalesce(jsonb_object_agg(id::text, sort_order), '{}'::jsonb)
    into row_count, current_order from public.event_sessions where event_id = p_event_id;
  if current_order is distinct from p_expected_order then
    raise exception 'Session order changed. Reload and try again.' using errcode = '40001';
  end if;
  if p_session_ids is null or cardinality(p_session_ids) <> row_count
    or (select count(distinct id) from unnest(p_session_ids) ids(id)) <> row_count
    or exists (select 1 from unnest(p_session_ids) ids(id) where not exists (
      select 1 from public.event_sessions s where s.id = ids.id and s.event_id = p_event_id
    )) then
    raise exception 'Provide every session in this event exactly once' using errcode = '22023';
  end if;
  update public.event_sessions s set sort_order = ordered.position::integer - 1
    from unnest(p_session_ids) with ordinality ordered(id, position)
    where s.id = ordered.id and s.event_id = p_event_id;
end;
$$;
revoke all on function public.reorder_event_sessions(uuid, uuid[], jsonb) from public, anon;
grant execute on function public.reorder_event_sessions(uuid, uuid[], jsonb) to authenticated;
