import { supabase } from './supabase';

export type AttendanceStatus = 'absent' | 'event' | 'session' | 'unknown';
export type SessionRosterPerson = {
  attendance: AttendanceStatus;
  id: string; name: string; company: string; email: string; job: string;
  sector: string; phone: string; ticket: string; avatar_url: string; photo_url: string;
};
const text = (...values: unknown[]) => values.find((v): v is string => typeof v === 'string' && !!v.trim())?.trim() || '';
const key = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
export function resolveRosterPerson(a: Record<string, unknown>, profile: Record<string, unknown> = {}): SessionRosterPerson {
  const meta = a.meta && typeof a.meta === 'object' ? a.meta as Record<string, unknown> : {};
  const fields = new Map(Object.entries(meta).map(([k, v]) => [key(k), v]));
  const answer = (...names: string[]) => text(...names.map(n => fields.get(key(n))));
  return {
    attendance: a.checked_in === true ? 'event' : 'absent',
    id: text(a.id), name: text(a.name, meta.fullName, profile.full_name),
    email: text(a.email, meta.email),
    company: text(answer('companyName', 'company', 'organization', 'organisation', 'entreprise', "Nom de l'entreprise", 'societe'), a.company, profile.company),
    job: text(answer('jobTitle', 'title', 'poste', 'fonction', 'profession'), a.job_title, profile.job_title),
    sector: text(answer('sector', 'secteur', 'industry', "Secteur d'activite"), a.sector, profile.sector),
    phone: text(answer('phone', 'telephone', 'phoneNumber', 'numero de telephone'), a.phone, a.phone_number, profile.phone_number),
    ticket: text(a.ticket_type), avatar_url: text(a.avatar_url), photo_url: text(a.photo_url),
  };
}

export async function loadDashboardSessionRoster(eventId: string, sessionId: string) {
  const attendees = new Map<string, Record<string, unknown>>();
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await supabase.from('event_attendee_sessions')
      .select('attendee_id, event_attendees!inner(*)').eq('session_id', sessionId)
      .eq('event_attendees.event_id', eventId).in('event_attendees.status', ['registered', 'approved'])
      .order('attendee_id').range(offset, offset + 499);
    if (error) throw error;
    for (const row of data || []) {
      const a = row.event_attendees as unknown as Record<string, unknown>;
      if (typeof a?.id === 'string') attendees.set(a.id, a);
    }
    if (!data || data.length < 500) break;
  }
  const ids = [...new Set([...attendees.values()].map(a => a.profile_id).filter((id): id is string => typeof id === 'string' && !!id))];
  const profiles = new Map<string, Record<string, unknown>>();
  for (let offset = 0; offset < ids.length; offset += 100) {
    const { data, error } = await supabase.from('profiles').select('id, company, job_title, sector, phone_number')
      .in('id', ids.slice(offset, offset + 100));
    if (error) throw error;
    for (const profile of data || []) profiles.set(profile.id, profile);
  }
  const atEvent = new Set<string>();
  const atSession = new Set<string>();
  let checkinsAvailable = true;
  const attendeeIds = [...attendees.keys()];
  try {
    for (let batch = 0; batch < attendeeIds.length; batch += 100) {
      for (let offset = 0; ; offset += 500) {
        const { data, error } = await supabase.from('event_checkins')
          .select('id, attendee_id, type, session_id').eq('event_id', eventId)
          .in('attendee_id', attendeeIds.slice(batch, batch + 100)).in('type', ['event', 'session'])
          .order('id').range(offset, offset + 499);
        if (error) throw error;
        for (const checkin of data || []) {
          if (checkin.type === 'event' || checkin.type === 'session') atEvent.add(checkin.attendee_id);
          if (checkin.type === 'session' && checkin.session_id === sessionId) atSession.add(checkin.attendee_id);
        }
        if (!data || data.length < 500) break;
      }
    }
  } catch { checkinsAvailable = false; }
  return [...attendees.values()].map(a => {
    const person = resolveRosterPerson(a, profiles.get(text(a.profile_id)));
    person.attendance = !checkinsAvailable ? 'unknown' : atSession.has(person.id) ? 'session'
      : atEvent.has(person.id) || a.checked_in === true ? 'event' : 'absent';
    return person;
  }).sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
}
