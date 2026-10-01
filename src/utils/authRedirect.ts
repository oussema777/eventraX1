/** Only return a local path; auth return URLs must never navigate off-site. */
export function safeAuthPath(value: string | null | undefined, origin: string): string | null {
  if (!value || /[\\\u0000-\u0020]/.test(value)) return null;
  if (!value.startsWith('/') && !value.startsWith(`${origin}/`)) return null;
  if (value.startsWith('//')) return null;
  try {
    const url = new URL(value, origin);
    if (url.origin !== origin) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch { return null; }
}

export function eventAuthPath(destination: string): string {
  return `/event-auth?redirect=${encodeURIComponent(destination)}`;
}

export function eventAuthReturnUrl(destination: string, origin: string): string {
  const path = safeAuthPath(destination, origin);
  if (!path) throw new Error('Invalid event destination');
  return new URL(eventAuthPath(path), origin).href;
}
