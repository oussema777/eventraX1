-- Run AFTER the URL-alias migration and app/OG deployment.
-- Changes only the public URL, without republishing or altering registration.
begin;
update public.events
set seo_slug = 'l-investissement'
where id = '769d7854-9bae-49e6-9db9-c88c0586a402';

do $$
begin
  if not exists (
    select 1 from public.events e
    join public.event_url_aliases a on a.event_id = e.id and a.slug = e.seo_slug
    where e.id = '769d7854-9bae-49e6-9db9-c88c0586a402' and a.slug = 'l-investissement'
  ) then
    raise exception 'Event URL activation failed; transaction rolled back';
  end if;
end $$;
commit;

select id, name, seo_slug, status
from public.events where id = '769d7854-9bae-49e6-9db9-c88c0586a402';
