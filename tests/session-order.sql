-- Run after session-management.sql in the same disposable database.
\set ON_ERROR_STOP on
\ir ../supabase/migrations/20261006092000_reorder_event_sessions.sql
set role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', false);
do $$
declare
  expected jsonb := '{"20000000-0000-0000-0000-000000000001": null, "20000000-0000-0000-0000-000000000002": null}';
begin
  begin
    perform public.reorder_event_sessions('00000000-0000-0000-0000-000000000001', array['20000000-0000-0000-0000-000000000001']::uuid[], expected);
    raise exception 'Partial order accepted';
  exception when invalid_parameter_value then null; end;
  begin
    perform public.reorder_event_sessions('00000000-0000-0000-0000-000000000001', array['20000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001']::uuid[], expected);
    raise exception 'Duplicate order accepted';
  exception when invalid_parameter_value then null; end;
  begin
    perform public.reorder_event_sessions('00000000-0000-0000-0000-000000000001', array['20000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000003']::uuid[], expected);
    raise exception 'Foreign session accepted';
  exception when invalid_parameter_value then null; end;
  perform public.reorder_event_sessions('00000000-0000-0000-0000-000000000001', array['20000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001']::uuid[], expected);
  begin
    perform public.reorder_event_sessions('00000000-0000-0000-0000-000000000001', array['20000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002']::uuid[], expected);
    raise exception 'Stale order accepted';
  exception when serialization_failure then null; end;
end $$;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', false);
do $$ begin
  begin
    perform public.reorder_event_sessions('00000000-0000-0000-0000-000000000001', '{}'::uuid[], '{}'::jsonb);
    raise exception 'Other owner accepted';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
do $$ begin
  if (select sort_order from event_sessions where id = '20000000-0000-0000-0000-000000000002') <> 0 then raise exception 'Saved order changed after rejected write'; end if;
  if exists (select 1 from event_sessions where starts_at <> '2026-11-25T10:00:00Z') then raise exception 'Times changed'; end if;
end $$;
