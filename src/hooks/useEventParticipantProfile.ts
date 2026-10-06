import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { UserProfile } from './useProfile';
import { resolveEventSector } from '../utils/eventNetworkingFields';

async function loadProfessionalProfile(id: string): Promise<Partial<UserProfile>> {
  const fields = ['id', 'full_name', 'avatar_url', 'job_title', 'company', 'bio', 'location', 'industry', 'department', 'years_experience', 'company_size', 'linkedin_url', 'twitter_url', 'website_url', 'b2b_profile', 'professional_data'];
  // Older installations may lack an optional professional field. Remove only
  // the explicitly missing column, never expand the query to private fields.
  while (fields.length) {
    const { data, error } = await supabase.from('profiles').select(fields.join(',')).eq('id', id).maybeSingle();
    if (!error) return (data || {}) as Partial<UserProfile>;
    const missing = error.message.match(/column (?:\w+\.)?["']?(\w+)["']? does not exist/i)?.[1]
      || error.message.match(/'([^']+)' column/i)?.[1];
    if (!['42703', 'PGRST204'].includes(error.code) || !missing || missing === 'id' || !fields.includes(missing)) throw error;
    fields.splice(fields.indexOf(missing), 1);
  }
  return {};
}

// Reuse the full profile page, but resolve membership in the requested event
// first. All reads retain existing RLS; this does not publish guest accounts.
export function useEventParticipantProfile(eventId: string | undefined, profileId: string | undefined, attendeeId: string | undefined, viewerId: string | undefined) {
  return useQuery({
    queryKey: ['event-participant-profile', eventId, profileId, attendeeId, viewerId],
    enabled: !!eventId && !!(profileId || attendeeId),
    retry: 1,
    queryFn: async () => {
      let query = supabase.from('event_attendees')
        .select('id, profile_id, name, company, avatar_url, photo_url, meta')
        .eq('event_id', eventId!);
      // Match directory visibility and RLS. Organizer-approved attendees use
      // status "approved", so status must not masquerade as profile existence.
      query = attendeeId ? query.eq('id', attendeeId) : query.eq('profile_id', profileId!);
      const { data: attendee, error } = await query.maybeSingle();
      if (error) throw error;
      if (!attendee) return null;
      const professional = attendee.profile_id ? await loadProfessionalProfile(attendee.profile_id) : {};
      const meta = attendee.meta || {};
      const interests = Array.isArray(meta.interests) ? meta.interests.filter((v: unknown) => typeof v === 'string') : [];
      const [education, certifications] = attendee.profile_id && professional.id ? await Promise.all([
        supabase.from('profile_education').select('id, degree, institution, years').eq('profile_id', attendee.profile_id),
        supabase.from('profile_certifications').select('id, name, organization, year').eq('profile_id', attendee.profile_id),
      ]) : [{ data: [] }, { data: [] }];
      return {
        ...professional,
        id: attendee.profile_id || '',
        full_name: professional.full_name || attendee.name,
        avatar_url: professional.avatar_url || attendee.avatar_url || attendee.photo_url,
        company: professional.company || attendee.company || meta.Company || meta.Organization,
        job_title: professional.job_title || meta['Job Title'] || meta.Title,
        industry: resolveEventSector(meta, professional),
        bio: professional.bio || meta.company_description,
        professional_data: { ...professional.professional_data, interests: professional.professional_data?.interests || interests },
        profile_education: education.data || [],
        profile_certifications: certifications.data || [],
      };
    },
  });
}
