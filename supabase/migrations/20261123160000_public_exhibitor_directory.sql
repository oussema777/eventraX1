begin;

alter table public.event_exhibitors
  add column if not exists directory_listed boolean not null default false;

-- A company can be listed by its organizer before commercial confirmation.
-- The directory only returns card fields and only for a published event.
create or replace function public.list_public_event_exhibitors(p_event_id uuid)
returns table (
  id uuid, company_name text, logo_url text, sector text, description text,
  website_url text, booth_number text, booth_location text, contact_email text, contact_phone text
)
language sql stable security definer set search_path = ''
as $$
  select x.id, x.company_name::text, x.logo_url::text,
         coalesce(nullif(trim(x.category), ''), x.industry)::text,
         x.description::text, x.website_url::text, x.booth_number::text,
         coalesce(nullif(trim(x.booth_hall), ''), x.booth_location)::text,
         case when x.status = 'confirmed' then x.contact_email::text end,
         case when x.status = 'confirmed' then x.contact_phone::text end
  from public.event_exhibitors x
  join public.events e on e.id = x.event_id
  where e.id = p_event_id and e.status = 'published'
    and (e.visibility in ('public', 'link_only') or (e.visibility is null and e.is_public))
    and (x.status = 'confirmed' or
         (x.directory_listed and x.status in ('pending', 'contract-sent') and x.profile_status is distinct from 'pending'))
    and nullif(trim(x.company_name), '') is not null
  order by lower(x.company_name), x.id;
$$;

revoke all on function public.list_public_event_exhibitors(uuid) from public;
grant execute on function public.list_public_event_exhibitors(uuid) to anon, authenticated;

commit;
