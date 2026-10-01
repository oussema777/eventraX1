-- Run in an empty disposable PostgreSQL database only.
create role anon;
create role authenticated;
create table public.events (id uuid primary key, seo_slug text, is_public boolean default true);
insert into public.events values ('769d7854-9bae-49e6-9db9-c88c0586a402', 'old-name', true);
alter table public.events enable row level security;
grant select on public.events to anon, authenticated;
create policy visible_events on public.events for select using (is_public);
\ir ../supabase/migrations/20261001090000_event_url_aliases.sql

update public.events set seo_slug = 'new-name' where seo_slug = 'old-name';
insert into public.events values ('11111111-1111-4111-8111-111111111111', 'private-event', false);
do $$
begin
  assert (select count(*) = 2 from public.event_url_aliases where event_id = '769d7854-9bae-49e6-9db9-c88c0586a402'), 'Earlier alias was lost';
  begin
    insert into public.events values ('22222222-2222-4222-8222-222222222222', 'old-name', true);
    raise exception 'Duplicate alias was accepted';
  exception when unique_violation then null;
  end;
  begin
    update public.events set seo_slug = 'invalid/name' where seo_slug = 'new-name';
    raise exception 'Invalid name accepted';
  exception when check_violation then null;
  end;
  begin
    update public.events set seo_slug = '11111111-1111-4111-8111-111111111111' where seo_slug = 'new-name';
    raise exception 'UUID name accepted';
  exception when check_violation then null;
  end;
  assert not public.event_slug_available('old-name', null);
  assert public.event_slug_available('old-name', '769d7854-9bae-49e6-9db9-c88c0586a402');
end $$;

set role anon;
do $$ begin
  assert (select count(*) = 2 from public.event_url_aliases), 'Private alias leaked';
  begin
    insert into public.event_url_aliases values ('stolen-link', '769d7854-9bae-49e6-9db9-c88c0586a402', now());
    raise exception 'Direct alias write accepted';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
set role authenticated;
do $$ begin
  assert not public.event_slug_available('private-event', null), 'Private name shown available';
end $$;
reset role;

update public.events set seo_slug = null where seo_slug = 'new-name';
do $$ begin
  assert (select count(*) = 2 from public.event_url_aliases where event_id = '769d7854-9bae-49e6-9db9-c88c0586a402'), 'Clearing name removed aliases';
end $$;
update public.events set seo_slug = 'old-name' where id = '769d7854-9bae-49e6-9db9-c88c0586a402';
select 'Event URL alias checks passed' as result;
