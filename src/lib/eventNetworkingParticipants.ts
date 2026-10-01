import { supabase } from './supabase';

// Registration interests belong to the event registration, not profiles.
// Select only networking fields; meta also contains private contact details.
export async function loadEventNetworkingParticipants(eventId: string) {
  const registrations = new Map<string, { interests: string[]; sector: string | null }>();
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await supabase.from('event_attendees')
      .select('profile_id, interests:meta->interests, sector:meta->>sector')
      .eq('event_id', eventId)
      .eq('status', 'registered')
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
      .select('id, full_name, job_title, company, avatar_url, sector')
      .in('id', ids.slice(offset, offset + 100));
    if (error) throw error;
    for (const profile of data || []) {
      const registration = registrations.get(profile.id)!;
      participants.push({ ...profile, sector: registration.sector || profile.sector, interests: registration.interests });
    }
  }
  return participants;
}
