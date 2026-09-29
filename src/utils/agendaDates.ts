export interface DatedSession {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
}

export function resolveAgendaTimeZone(value?: string, fallback = Intl.DateTimeFormat().resolvedOptions().timeZone): string {
  try {
    if (value) { new Intl.DateTimeFormat('en', { timeZone: value }).format(); return value; }
  } catch { /* Legacy event records may contain shorthand rather than an IANA zone. */ }
  return fallback;
}

export function groupAgendaSessions<T extends DatedSession>(sessions: T[], timeZone: string, locale: string) {
  const dateFormatter = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' });
  const start = (s: T) => Number.isFinite(Date.parse(s.starts_at)) ? Date.parse(s.starts_at) : Infinity;
  const sorted = [...sessions].sort((a, b) => {
    const aTime = start(a), bTime = start(b);
    return (aTime === bTime ? 0 : aTime < bTime ? -1 : 1)
      || a.title.trim().localeCompare(b.title.trim(), locale, { numeric: true }) || a.id.localeCompare(b.id);
  });
  const groups = new Map<string, { key: string; date: Date | null; sessions: T[] }>();
  for (const session of sorted) {
    const date = Number.isFinite(start(session)) ? new Date(session.starts_at) : null;
    const key = date ? dateFormatter.format(date) : 'undated';
    if (!groups.has(key)) groups.set(key, { key, date, sessions: [] });
    groups.get(key)!.sessions.push(session);
  }
  return [...groups.values()];
}
