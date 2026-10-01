const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const validSlug = value => typeof value === 'string' && value.length >= 3 && value.length <= 80 &&
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && !uuid.test(value);

export function publicEventPath(event, section = 'landing') {
  return validSlug(event.seo_slug)
    ? `/event/${event.seo_slug}${section === 'landing' ? '' : `/${section}`}`
    : `/event/${event.id}/${section}`;
}

export async function resolveEventPreview(get, identifier, section = 'landing') {
  let id = identifier;
  if (!uuid.test(id)) {
    if (!validSlug(id)) return null;
    const aliases = await get('event_url_aliases', new URLSearchParams({ slug: `eq.${id}`, select: 'event_id' }).toString());
    id = Array.isArray(aliases) ? aliases[0]?.event_id : null;
    if (!id || !uuid.test(id)) return null;
  }
  const rows = await get('events', new URLSearchParams({
    id: `eq.${id}`,
    select: 'id,seo_slug,name,description,tagline,cover_image_url,start_date,end_date,location_address,event_format,branding_settings',
  }).toString());
  const event = Array.isArray(rows) ? rows[0] : null;
  return event ? { event, path: publicEventPath(event, section) } : null;
}
