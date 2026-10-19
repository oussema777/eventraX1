import { isUuid, parseScanCode } from '../utils/meetingQr';

export type CheckinKind = 'event' | 'session' | 'b2b';
type Client = any;
export type ResolvedScan = { attendee?: any; meeting?: any; candidates?: any[]; sessionId?: string };

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

export async function resolveCheckin(client: Client, input: { eventId: string; kind: CheckinKind; code: string; meetingId?: string; sessionId?: string; chosenAttendeeId?: string }): Promise<ResolvedScan> {
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
  let meeting: any;
  if (input.kind === 'b2b') {
    const id = identity.meetingId || input.meetingId;
    if (!isUuid(id)) throw new Error('selectMeeting');
    meeting = single(await rows(client.from('event_b2b_meetings').select('*').eq('event_id', input.eventId).eq('id', id)));
    if (!meeting) throw new Error('meetingNotFound');
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
  if (input.kind === 'session') {
    if (!isUuid(input.sessionId)) throw new Error('selectSession');
    const session = single(await rows(client.from('event_sessions').select('id').eq('event_id', input.eventId).eq('id', input.sessionId)));
    if (!session) throw new Error('sessionNotFound');
  }
  return { attendee, meeting, sessionId: input.sessionId };
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
}
