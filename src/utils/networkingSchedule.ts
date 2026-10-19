export const INVESTISSEMENT_EVENT_ID = '769d7854-9bae-49e6-9db9-c88c0586a402';
export type MeetingFormat = 'video' | 'in-person' | 'hybrid';
export interface NetworkingVenue {
  tableCount?: number;
  tablePrefix?: string;
  slotDuration?: number;
  timeZone?: string;
  allowedMeetingFormats?: MeetingFormat[];
  schedules?: { date: string; start: string; end: string }[];
}
export interface NetworkingSlot { date: string; time: string; iso: string; end: string }
export interface ScheduledMeeting {
  id: string; start_at: string; end_at?: string; status: string;
  event_id?: string;
  profile_a_id?: string; profile_b_id?: string; location?: string;
  meta?: { meeting_type?: string };
}

export function networkingTimeZone(eventId?: string, venue?: NetworkingVenue | null, eventZone?: string | null) {
  for (const zone of [venue?.timeZone, eventZone, eventId === INVESTISSEMENT_EVENT_ID ? 'Africa/Tunis' : 'UTC']) {
    if (!zone) continue;
    try { new Intl.DateTimeFormat('en', { timeZone: zone }).format(); return zone; } catch { /* try next */ }
  }
  return 'UTC';
}

export function allowedMeetingFormats(eventId?: string, venue?: NetworkingVenue | null): MeetingFormat[] {
  // Organizer-requested restriction is scoped to this event, including older settings records.
  if (eventId === INVESTISSEMENT_EVENT_ID) return ['in-person'];
  const formats = venue?.allowedMeetingFormats?.filter(f => ['video', 'in-person', 'hybrid'].includes(f));
  return formats?.length ? [...new Set(formats)] : ['video', 'in-person', 'hybrid'];
}

const minutes = (value: string) => /^\d{2}:\d{2}$/.test(value) && Number(value.slice(3)) < 60
  ? Number(value.slice(0, 2)) * 60 + Number(value.slice(3)) : NaN;

export function zonedTimeToIso(date: string, time: string, timeZone: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(minutes(time)) || minutes(time) >= 1440) return null;
  const desired = Date.parse(`${date}T${time}:00Z`);
  if (!Number.isFinite(desired)) return null;
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const parts = (instant: number) => Object.fromEntries(formatter.formatToParts(instant).map(p => [p.type, p.value]));
  let instant = desired;
  for (let i = 0; i < 4; i++) {
    const p = parts(instant);
    const wall = Date.parse(`${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:00Z`);
    if (wall === desired) break;
    instant += desired - wall;
  }
  const p = parts(instant);
  // Reject nonexistent wall times during daylight-saving transitions.
  if (`${p.year}-${p.month}-${p.day}` !== date || `${p.hour}:${p.minute}` !== time) return null;
  return new Date(instant).toISOString();
}

export function networkingSlots(venue: NetworkingVenue | null, timeZone: string): NetworkingSlot[] {
  const duration = venue?.slotDuration ?? 30;
  if (!Number.isInteger(duration) || duration < 1 || duration > 1440) return [];
  const slots = new Map<string, NetworkingSlot>();
  for (const schedule of venue?.schedules || []) {
    const start = minutes(schedule.start), end = minutes(schedule.end);
    if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end > 1440 || start >= end) continue;
    for (let m = start; m + duration <= end; m += duration) {
      const time = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
      const iso = zonedTimeToIso(schedule.date, time, timeZone);
      if (iso) slots.set(iso, { date: schedule.date, time, iso, end: new Date(Date.parse(iso) + duration * 60000).toISOString() });
    }
  }
  return [...slots.values()].sort((a, b) => a.iso.localeCompare(b.iso));
}

export function intervalsOverlap(start: string, end: string, otherStart: string, otherEnd: string) {
  return Date.parse(start) < Date.parse(otherEnd) && Date.parse(end) > Date.parse(otherStart);
}

export function slotAvailability(slot: NetworkingSlot, venue: NetworkingVenue, meetings: ScheduledMeeting[],
  participants: string[], availability: Map<string, string[]>, editId?: string | null, eventId?: string) {
  const confirmed = meetings.filter(m => m.id !== editId && m.status === 'confirmed' &&
    intervalsOverlap(slot.iso, slot.end, m.start_at, m.end_at || new Date(Date.parse(m.start_at) + (venue.slotDuration || 30) * 60000).toISOString()));
  const isConflicted = confirmed.some(m => participants.includes(m.profile_a_id || '') || participants.includes(m.profile_b_id || ''));
  const unavailable = participants.some(id => availability.has(id) && !availability.get(id)!.some(iso => Date.parse(iso) === Date.parse(slot.iso)));
  const physical = confirmed.filter(m => m.meta?.meeting_type !== 'video' && (!eventId || m.event_id === eventId));
  const tables = Math.max(1, venue.tableCount || 10);
  const occupied = new Set(physical.map(m => Number(m.location?.match(/(\d+)$/)?.[1])).filter(Number.isFinite));
  const next = Array.from({ length: tables }, (_, i) => i + 1).find(i => !occupied.has(i));
  return { ...slot, isConflicted, unavailable, total: tables,
    available: isConflicted || unavailable ? 0 : Math.max(0, tables - physical.length),
    nextTable: next ? `${venue.tablePrefix || 'Table-'}${String(next).padStart(2, '0')}` : undefined };
}
