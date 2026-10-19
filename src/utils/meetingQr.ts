const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type UuidString = string & { readonly __uuid: unique symbol };
export const isUuid = (value: unknown): value is UuidString => typeof value === 'string' && UUID.test(value);

export function meetingLink(origin: string, meetingId: string, eventId?: string | null, profileId?: string | null) {
  const url = new URL(eventId ? `/event/${eventId}/networking` : '/my-networking', origin);
  url.searchParams.set('meetingId', meetingId);
  if (profileId) url.searchParams.set('participant', profileId);
  return url.href;
}

export function qrImageUrl(value: string, size = 300) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=16&data=${encodeURIComponent(value)}`;
}

export type ScanIdentity = { meetingId?: string; eventId?: string; profileId?: string; attendeeId?: string; identifier?: string };

/** Decode only recognized Eventra formats. Never treat an arbitrary URL's first UUID as a person. */
export function parseScanCode(input: string): ScanIdentity {
  const raw = input.trim();
  if (!raw || raw.length > 4096) throw new Error('invalidCode');
  if (raw.startsWith('{')) {
    let value: any;
    try { value = JSON.parse(raw); } catch { throw new Error('invalidCode'); }
    if (!value || Array.isArray(value)) throw new Error('invalidCode');
    const result: ScanIdentity = {};
    for (const [key, alias] of [['meetingId', 'meeting_id'], ['eventId', 'event_id'], ['profileId', 'profile_id'], ['attendeeId', 'attendee_id']] as const) {
      const id = value[key] ?? value[alias];
      if (id != null) {
        if (!isUuid(id)) throw new Error('invalidCode');
        result[key] = id;
      }
    }
    if (!result.meetingId && !result.profileId && !result.attendeeId) throw new Error('invalidCode');
    return result;
  }
  if (/^https?:\/\//i.test(raw) || raw.startsWith('/')) {
    let url: URL;
    try { url = new URL(raw, 'https://eventra.cloud'); } catch { throw new Error('invalidCode'); }
    const path = url.pathname.split('/').filter(Boolean);
    const result: ScanIdentity = {};
    const meetingId = url.searchParams.get('meetingId') || (path[0] === 'meeting' ? path[1] : null);
    if (meetingId) {
      const knownPath = (path[0] === 'my-networking' && path.length === 1)
        || (path[0] === 'meeting' && path.length === 2 && isUuid(path[1]))
        || (path[0] === 'event' && path.length === 3 && isUuid(path[1]) && path[2] === 'networking');
      if (!isUuid(meetingId) || !knownPath) throw new Error('invalidCode');
      result.meetingId = meetingId;
      if (path[0] === 'event' && isUuid(path[1])) result.eventId = path[1];
      const participant = url.searchParams.get('participant');
      if (participant) {
        if (!isUuid(participant)) throw new Error('invalidCode');
        result.profileId = participant;
      }
      return result;
    }
    if (path.length === 2 && isUuid(path[1])) {
      if (path[0] === 'checkin') return { attendeeId: path[1] };
      if (['profile', 'public-profile'].includes(path[0])) return { profileId: path[1] };
    }
    throw new Error('invalidCode');
  }
  if (isUuid(raw) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw) || /^[a-z0-9_-]{4,128}$/i.test(raw)) return { identifier: raw };
  throw new Error('invalidCode');
}
