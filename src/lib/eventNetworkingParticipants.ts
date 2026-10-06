import { supabase } from './supabase';
import { resolveEventSector } from '../utils/eventNetworkingFields';

// Registration interests belong to the event registration, not profiles.
// Select only networking fields; meta also contains private contact details.
export async function loadEventNetworkingParticipants(eventId: string) {
  const registrations = new Map<string, { interests: string[]; sector: string | null }>();
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await supabase.from('event_attendees')
      .select('profile_id, interests:meta->interests, sector:meta->>sector')
      .eq('event_id', eventId)
      .in('status', ['registered', 'approved'])
      .eq('meta->>b2bOptIn', 'true')
      .order('id')
      .range(offset, offset + 499);
    if (error) throw error;
    for (const row of data || []) {
      if (!row.profile_id) continue;
      const interests = Array.isArray(row.interests)
        ? row.interests.filter((value): value is string => typeof value === 'string')
        : typeof row.interests === 'string' ? row.interests.split(',').map(value => value.trim()).filter(Boolean) : [];
      registrations.set(row.profile_id, { interests, sector: row.sector });
    }
    if (!data || data.length < 500) break;
  }
  const participants = [];
  const ids = [...registrations.keys()];
  for (let offset = 0; offset < ids.length; offset += 100) {
    const { data, error } = await supabase.from('profiles')
      .select('id, full_name, job_title, company, avatar_url, sector, industry, b2b_enabled:b2b_profile->enabled')
      .in('id', ids.slice(offset, offset + 100));
    if (error) throw error;
    for (const profile of data || []) {
      if (profile.b2b_enabled === false) continue;
      const registration = registrations.get(profile.id)!;
      participants.push({ id: profile.id, full_name: profile.full_name, job_title: profile.job_title,
        company: profile.company, avatar_url: profile.avatar_url,
        sector: resolveEventSector({ sector: registration.sector }, profile), interests: registration.interests });
    }
  }
  return participants;
}
