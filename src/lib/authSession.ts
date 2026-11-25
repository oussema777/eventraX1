import type { SupportedStorage } from '@supabase/supabase-js';

// A session from an OAuth link or an older release can still have a server-clock
// deadline. If its remaining time exceeds its entire lifetime, ask the SDK to
// renew it once. Read the stored value afresh so tab changes and sign-out work.
export function browserAuthStorage(): SupportedStorage | undefined {
  let storage: Storage;
  try {
    storage = window.localStorage;
    const probe = `eventra-auth-storage-check-${Math.random()}`;
    storage.setItem(probe, '');
    storage.removeItem(probe);
  } catch {
    return undefined; // Preserve the SDK's in-memory fallback.
  }
  return {
    getItem(key) {
      const value = storage.getItem(key);
      if (!value?.startsWith('{')) return value;
      try {
        const session = JSON.parse(value);
        const now = Math.floor(Date.now() / 1000);
        if (session.refresh_token && Number.isFinite(session.expires_in) && session.expires_in > 0
          && session.expires_at > now + session.expires_in + 1) {
          return JSON.stringify({ ...session, expires_at: now });
        }
      } catch { /* Let the SDK handle malformed stored data. */ }
      return value;
    },
    setItem: storage.setItem.bind(storage),
    removeItem: storage.removeItem.bind(storage),
  };
}

function refreshDelay(response: Response) {
  const retryAfter = response.headers.get('Retry-After');
  if (retryAfter && /^\d+$/.test(retryAfter)) return Math.max(1000, Number(retryAfter) * 1000);
  const deadline = Date.parse(retryAfter || '');
  const serverTime = Date.parse(response.headers.get('Date') || '');
  if (Number.isFinite(deadline)) return Math.max(1000, deadline - (Number.isFinite(serverTime) ? serverTime : Date.now()));
  return 1000;
}

export function createAuthFetch(baseUrl: string): typeof fetch {
  const authPath = `${baseUrl.replace(/\/+$/, '')}/auth/v1/`;
  const grants = new Set([authPath + 'token', authPath + 'signup', authPath + 'verify']);
  const cooldownKey = `eventra-refresh-after:${authPath}`;
  let retryAt = 0;
  return async (input, init) => {
    const url = input instanceof Request ? input.url : String(input);
    const endpoint = url.split('?')[0];
    if (!grants.has(endpoint)) return fetch(input, init);
    const isRefresh = endpoint === authPath + 'token' && new URL(url).searchParams.get('grant_type') === 'refresh_token';
    // auth-js retries 503 with backoff but deletes the session on 429. Apply
    // that retry classification only to renewal. Preserve all sign-in errors.
    if (isRefresh) {
      // Tabs share the server limit. A monotonic timestamp also survives a
      // wall-clock adjustment while a tab is waiting.
      const now = performance.timeOrigin + performance.now();
      try {
        const cooldown = JSON.parse(localStorage.getItem(cooldownKey) || 'null');
        // A browser restarted after a clock correction can have an earlier
        // time origin. Never inherit a cooldown that appears to start in the future.
        if (cooldown && now >= cooldown.start && Number.isFinite(cooldown.end)) {
          retryAt = Math.max(retryAt, cooldown.end);
        }
      } catch { /* Storage can be unavailable in private browsing. */ }
      if (now < retryAt) return new Response(null, { status: 503 });
    }
    const requestedAt = Math.floor(Date.now() / 1000);
    const response = await fetch(input, init);
    if (isRefresh && response.status === 429) {
      const start = performance.timeOrigin + performance.now();
      retryAt = start + refreshDelay(response);
      try { localStorage.setItem(cooldownKey, JSON.stringify({ start, end: retryAt })); } catch { /* Keep the in-memory deadline. */ }
      return new Response(null, { status: 503 });
    }
    if (!response.ok) return response;
    const grant = await response.clone().json().catch(() => null);
    if (!grant?.access_token || !Number.isFinite(grant.expires_in) || grant.expires_in <= 0) return response;
    // Only the browser's refresh deadline changes. The server validates the JWT.
    grant.expires_at = requestedAt + grant.expires_in;
    const headers = new Headers(response.headers);
    headers.delete('Content-Length');
    headers.delete('Content-Encoding');
    return new Response(JSON.stringify(grant), { status: response.status, headers });
  };
}
