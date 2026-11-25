import { isUuid, parseScanCode } from '../utils/meetingQr';

export type CheckinKind = 'event' | 'session' | 'b2b';
type Client = any;
export type MeetingOption = {
  id: string; start_at?: string; end_at?: string; location?: string; partner?: string; checkedIn: boolean;
};
export type MeetingReview = { attendeeName: string; attendeeId: string; options: MeetingOption[] };
export type ResolvedScan = { attendee?: any; meeting?: any; candidates?: any[]; review?: MeetingReview; sessionId?: string };

async function rows(query: any): Promise<any[]> {
  const { data, error } = await query;
  if (error) throw new Error('lookupFailed');
  return Array.isArray(data) ? data : data ? [data] : [];
}
function single(matches: any[]) {
  if (matches.length > 1) throw new Error('ambiguousAttendee');
  return matches[0];
}
const attendeeQuery = (client: Client, eventId: string) => client.from('event_attendees').select('*').eq('event_id', eventId);

// Query this participant directly. The dashboard's event-wide preview is capped.
async function reviewMeetings(client: Client, eventId: string, attendee: any, exactMeeting?: any): Promise<MeetingReview> {
  const filters = ['attendee_a_id', 'attendee_b_id'].map(column => `${column}.eq.${attendee.id}`);
  if (attendee.profile_id) {
    filters.push(...['profile_a_id', 'profile_b_id'].map(column => `${column}.eq.${attendee.profile_id}`));
  }
  const options: MeetingOption[] = [];
  for (let offset = 0; ; offset += 100) {
    const page = exactMeeting ? [exactMeeting] : await rows(client.from('event_b2b_meetings').select('*')
      .eq('event_id', eventId).in('status', ['confirmed', 'completed']).or(filters.join(','))
      .order('id').range(offset, offset + 99));
    if (!page.length) break;
    const partners = page.map(m => {
      const side = m.attendee_a_id === attendee.id || (attendee.profile_id && m.profile_a_id === attendee.profile_id) ? 'b' : 'a';
      return { attendeeId: m['attendee_' + side + '_id'], profileId: m['profile_' + side + '_id'] };
    });
    const ids = [...new Set(partners.map(p => p.attendeeId).filter(isUuid))];
    const profiles = [...new Set(partners.map(p => p.profileId).filter(isUuid))];
    const [people, names, arrivals] = await Promise.all([
      ids.length ? rows(client.from('event_attendees').select('id,name').eq('event_id', eventId).in('id', ids)) : [],
      profiles.length ? rows(client.from('profiles').select('id,full_name').in('id', profiles)) : [],
      rows(client.from('event_checkins').select('meeting_id').eq('event_id', eventId).eq('type','b2b')
        .eq('attendee_id', attendee.id).in('meeting_id', page.map(m => m.id)))
    ]);
    const arrived = new Set(arrivals.map(row => row.meeting_id));
    page.forEach((m, i) => options.push({
      id: m.id, start_at: m.start_at, end_at: m.end_at, location: m.location,
      partner: people.find(p => p.id === partners[i].attendeeId)?.name || names.find(p => p.id === partners[i].profileId)?.full_name,
      // An interrupted attendance write may still need to repair the registration flag.
      checkedIn: Boolean(attendee.checked_in && arrived.has(m.id))
    }));
    if (exactMeeting || page.length < 100) break;
  }
  return { attendeeName: attendee.name || attendee.email, attendeeId: attendee.id, options };
}

export async function resolveCheckin(client: Client, input: { eventId: string; kind: CheckinKind; code: string; meetingId?: string; sessionId?: string; chosenAttendeeId?: string; preview?: boolean }): Promise<ResolvedScan> {
  const identity = parseScanCode(input.code);
  if (identity.eventId && identity.eventId !== input.eventId) throw new Error('wrongEvent');
  if (identity.meetingId && input.kind !== 'b2b') throw new Error('useB2bScanner');
  let attendee: any;
  if (identity.attendeeId) attendee = single(await rows(attendeeQuery(client, input.eventId).eq('id', identity.attendeeId)));
  if (identity.profileId) attendee = single(await rows(attendeeQuery(client, input.eventId).eq('profile_id', identity.profileId)));
  const raw = identity.identifier;
  if (raw) {
    if (isUuid(raw)) {
      attendee = single(await rows(attendeeQuery(client, input.eventId).eq('id', raw)));
      if (!attendee) attendee = single(await rows(attendeeQuery(client, input.eventId).eq('profile_id', raw)));
      if (!attendee && input.kind === 'b2b') identity.meetingId = raw;
    } else if (raw.includes('@')) {
      // Exact matching: no SQL/ILIKE wildcard interpretation of pasted text.
      attendee = single(await rows(attendeeQuery(client, input.eventId).eq('email', raw.toLowerCase())));
      if (!attendee) {
        // Older imports can retain uppercase emails. PostgREST also treats '*'
        // as a wildcard, so enforce literal equality on the returned candidates.
        const candidates = await rows(attendeeQuery(client, input.eventId).ilike('email', raw.replace(/[\\%_]/g, '\\$&')));
        attendee = single(candidates.filter(person => String(person.email).toLowerCase() === raw.toLowerCase()));
      }
    } else {
      attendee = single(await rows(attendeeQuery(client, input.eventId).eq('meta->>confirmation_code', raw.toUpperCase())));
      if (!attendee) {
        // Older deployments used optional top-level ticket columns.
        for (const column of ['confirmation_code', 'ticket_code', 'qr_token']) {
          const { data, error } = await attendeeQuery(client, input.eventId).eq(column, raw.toUpperCase()).limit(2);
          if (error && !['42703', 'PGRST204'].includes(error.code)) throw new Error('lookupFailed');
          if (!error) attendee = single(data || []);
          if (attendee) break;
        }
      }
    }
  }
  if (attendee && ['cancelled', 'rejected', 'waitlisted'].includes(attendee.status)) throw new Error('registrationInactive');
  if (input.kind === 'b2b' && input.preview && !identity.meetingId) {
    if (!attendee) throw new Error('attendeeNotFound');
    return { review: await reviewMeetings(client, input.eventId, attendee) };
  }
  let meeting: any;
  if (input.kind === 'b2b') {
    const id = identity.meetingId || input.meetingId;
    if (!isUuid(id)) throw new Error('selectMeeting');
    meeting = single(await rows(client.from('event_b2b_meetings').select('*').eq('event_id', input.eventId).eq('id', id)));
    if (!meeting) throw new Error(isUuid(raw) && !attendee ? 'attendeeNotFound' : 'meetingNotFound');
    if (!['confirmed', 'completed'].includes(meeting.status)) throw new Error('meetingNotConfirmed');
    const belongs = (person: any) => [meeting.attendee_a_id, meeting.attendee_b_id].includes(person.id)
      || (!!person.profile_id && [meeting.profile_a_id, meeting.profile_b_id].includes(person.profile_id));
    if (!attendee && identity.meetingId && !identity.profileId && !identity.attendeeId) {
      const candidates = new Map<string, any>();
      for (const [column, ids] of [['id', [meeting.attendee_a_id, meeting.attendee_b_id]], ['profile_id', [meeting.profile_a_id, meeting.profile_b_id]]] as const) {
        const valid = ids.filter(isUuid);
        if (valid.length) for (const person of await rows(attendeeQuery(client, input.eventId).in(column, valid))) candidates.set(person.id, person);
      }
      const eligible = [...candidates.values()].filter(person => belongs(person) && !['cancelled', 'rejected', 'waitlisted'].includes(person.status));
      if (input.chosenAttendeeId) attendee = eligible.find(person => person.id === input.chosenAttendeeId);
      else if (eligible.length) return { meeting, candidates: eligible };
    }
    if (attendee && !belongs(attendee)) throw new Error('notAssigned');
  }
  if (!attendee) throw new Error('attendeeNotFound');
  if (['cancelled', 'rejected', 'waitlisted'].includes(attendee.status)) throw new Error('registrationInactive');
  if (input.chosenAttendeeId && input.chosenAttendeeId !== attendee.id) throw new Error('notAssigned');
  if (input.preview && meeting) return { review: await reviewMeetings(client, input.eventId, attendee, meeting) };
  if (input.kind === 'session') {
    if (!isUuid(input.sessionId)) throw new Error('selectSession');
    const session = single(await rows(client.from('event_sessions').select('id').eq('event_id', input.eventId).eq('id', input.sessionId)));
    if (!session) throw new Error('sessionNotFound');
  }
  return { attendee, meeting, sessionId: input.kind === 'session' ? input.sessionId : undefined };
}

// Every desk uses the same UUID for a person's first arrival at this meeting.
export async function b2bArrivalId(key: string) {
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key))).slice(0, 16);
  hash[6] = (hash[6] & 15) | 0x80;
  hash[8] = (hash[8] & 63) | 0x80;
  const hex = Array.from(hash, byte => byte.toString(16).padStart(2, '0')).join('');
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join('-');
}

/** Never show success when a write was rejected. Stable attempt IDs make retries idempotent. */
export async function saveCheckin(client: Client, payload: any, attendee: any, checkedInAt: string) {
  const { data, error } = await client.from('event_checkins').insert([payload]).select('id').maybeSingle();
  if (error) {
    if (error.code !== '23505') throw new Error('saveFailed');
    const saved = single(await rows(client.from('event_checkins').select('id').eq('event_id', payload.event_id).eq('id', payload.id)));
    if (!saved) throw new Error('saveFailed');
  } else if (!data?.id) throw new Error('saveFailed');
  if (!attendee.checked_in) {
    const { data: updated, error: updateError } = await client.from('event_attendees')
      .update({ checked_in: true, check_in_at: checkedInAt }).eq('event_id', payload.event_id).eq('id', attendee.id).select('id').maybeSingle();
    if (updateError || !updated?.id) throw new Error('saveFailed');
  }
  return !error;
}
