export interface DatedSession {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  sort_order?: number | null;
}

// Use one deterministic order across admin, registration, and public agendas.
// Fixed collation keeps simultaneous workshops stable when changing UI language.
export function compareAgendaSessions(a: DatedSession, b: DatedSession): number {
  const time = (value: string) => Number.isFinite(Date.parse(value)) ? Date.parse(value) : Infinity;
  const aTime = time(a.starts_at), bTime = time(b.starts_at);
  const order = (value?: number | null) => typeof value === 'number' && Number.isFinite(value) ? value : Infinity;
  const aOrder = order(a.sort_order), bOrder = order(b.sort_order);
  return (aTime === bTime ? 0 : aTime < bTime ? -1 : 1)
    || (aOrder === bOrder ? 0 : aOrder < bOrder ? -1 : 1)
    || a.title.trim().localeCompare(b.title.trim(), 'en', { numeric: true })
    || a.id.localeCompare(b.id);
}

export function resolveAgendaTimeZone(value?: string, fallback = Intl.DateTimeFormat().resolvedOptions().timeZone): string {
  try {
    if (value) { new Intl.DateTimeFormat('en', { timeZone: value }).format(); return value; }
  } catch { /* Legacy event records may contain shorthand rather than an IANA zone. */ }
  return fallback;
}

export function groupAgendaSessions<T extends DatedSession>(sessions: T[], timeZone: string, _locale: string) {
  const dateFormatter = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' });
  const start = (s: T) => Number.isFinite(Date.parse(s.starts_at)) ? Date.parse(s.starts_at) : Infinity;
  const sorted = [...sessions].sort(compareAgendaSessions);
  const groups = new Map<string, { key: string; date: Date | null; sessions: T[] }>();
  for (const session of sorted) {
    const date = Number.isFinite(start(session)) ? new Date(session.starts_at) : null;
    const key = date ? dateFormatter.format(date) : 'undated';
    if (!groups.has(key)) groups.set(key, { key, date, sessions: [] });
    groups.get(key)!.sessions.push(session);
  }
  return [...groups.values()];
}
