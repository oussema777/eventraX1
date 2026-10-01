-- Additive: event IDs and all existing foreign keys/URLs stay unchanged.
-- Rollout: apply this migration first, then deploy the app plus og-server.js
-- and scripts/event-preview.js, restart the OG service, and regenerate sitemap.
-- Configure names through Launch > Branded event link after deployment.
-- No published event is renamed automatically. Do not drop the alias table
-- on an app rollback: shared names must remain reserved for their original event.
begin;

alter table public.events add column if not exists seo_slug text;

-- Fail before making changes if legacy custom values need manual review.
-- The old UI accepted arbitrary text, even though it never routed those links.
do $$
begin
  if exists (
    select 1 from public.events where seo_slug is not null and btrim(seo_slug) <> ''
    and (seo_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or length(seo_slug) not between 3 and 80
      or seo_slug ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
  ) then
    raise exception 'Review invalid events.seo_slug values before installing event URL aliases';
  end if;
end $$;

update public.events set seo_slug = null where btrim(seo_slug) = '';
create unique index if not exists idx_events_seo_slug on public.events(seo_slug) where seo_slug is not null;

create table public.event_url_aliases (
  slug text primary key,
  event_id uuid not null references public.events(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index event_url_aliases_event_id_idx on public.event_url_aliases(event_id);
alter table public.event_url_aliases enable row level security;
revoke all on public.event_url_aliases from anon, authenticated;
grant select on public.event_url_aliases to anon, authenticated;
create policy "Aliases follow event visibility" on public.event_url_aliases
  for select to anon, authenticated using (
    exists (select 1 from public.events e where e.id = event_id)
  );

insert into public.event_url_aliases(slug, event_id)
select seo_slug, id from public.events where seo_slug is not null;

create function public.reserve_event_url_alias() returns trigger
language plpgsql security definer set search_path = '' as $$
declare reserved_id uuid;
begin
  if new.seo_slug is null then return new; end if;
  if new.seo_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or length(new.seo_slug) not between 3 and 80
    or new.seo_slug ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    raise exception using errcode = '23514', message = 'Use 3–80 lowercase letters, numbers and single hyphens for the event URL';
  end if;
  insert into public.event_url_aliases(slug, event_id) values (new.seo_slug, new.id)
    on conflict (slug) do update set event_id = excluded.event_id
      where public.event_url_aliases.event_id = excluded.event_id
    returning event_id into reserved_id;
  if reserved_id is null then
    raise exception using errcode = '23505', message = 'This event URL is already reserved';
  end if;
  -- Never delete earlier aliases: printed links and shared messages keep working.
  return new;
end $$;
revoke all on function public.reserve_event_url_alias() from public;
create trigger reserve_event_url_alias after insert or update of seo_slug on public.events
  for each row execute function public.reserve_event_url_alias();

-- Availability includes private events without exposing their details.
create function public.event_slug_available(candidate text, current_event_id uuid default null)
returns boolean language sql stable security definer set search_path = '' as $$
  select candidate ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(candidate) between 3 and 80
    and candidate !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and not exists (select 1 from public.event_url_aliases
      where slug = candidate and event_id is distinct from current_event_id);
$$;
revoke all on function public.event_slug_available(text, uuid) from public;
grant execute on function public.event_slug_available(text, uuid) to authenticated;

commit;
