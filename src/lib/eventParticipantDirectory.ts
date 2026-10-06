import { supabase } from './supabase';
import { resolveEventSector } from '../utils/eventNetworkingFields';

export async function loadEventParticipantDirectory(eventId: string) {
  const attendees = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await supabase.from('event_attendees')
      .select('id, profile_id, name, company, avatar_url, photo_url, meta')
      .eq('event_id', eventId).order('name').order('id').range(offset, offset + 499);
    if (error) throw error;
    attendees.push(...(data || []));
    if (!data || data.length < 500) break;
  }
  const ids = [...new Set(attendees.map(a => a.profile_id).filter(Boolean))];
  const profiles = new Map<string, { sector?: string; industry?: string; company?: string; job_title?: string; avatar_url?: string }>();
  for (let offset = 0; offset < ids.length; offset += 100) {
    const { data, error } = await supabase.from('profiles')
      .select('id, avatar_url, sector, industry, company, job_title').in('id', ids.slice(offset, offset + 100));
    if (error) throw error;
    for (const profile of data || []) profiles.set(profile.id, profile);
  }
  return attendees.map(a => {
    const profile = profiles.get(a.profile_id) || {};
    const meta = a.meta || {};
    const sector = resolveEventSector(meta, profile);
    return {
      id: a.id, profile_id: a.profile_id, name: a.name,
      company: a.company || meta.Company || meta.Organization || profile.company,
      final_avatar: profile.avatar_url || a.avatar_url || a.photo_url,
      sector,
      profile_industries: sector ? [sector] : [],
      meta: { 'Job Title': meta['Job Title'] || meta.Title || profile.job_title || '', Industry: sector || '' },
    };
  });
}
