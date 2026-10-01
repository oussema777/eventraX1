export const EVENT_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isEventSlug(value: string): boolean {
  return value.length >= 3 && value.length <= 80 &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && !EVENT_ID_PATTERN.test(value);
}

export function suggestEventSlug(name: string): string {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80).replace(/-$/, '');
}

export function eventPublicPath(event: { id: string; seo_slug?: string | null }, section = 'landing'): string {
  const slug = event.seo_slug;
  if (slug && isEventSlug(slug)) return `/event/${slug}${section === 'landing' ? '' : `/${section}`}`;
  return `/event/${event.id}/${section}`;
}
