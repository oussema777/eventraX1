import { useQuery } from '@tanstack/react-query';
import { loadEventNetworkingParticipants } from '../lib/eventNetworkingParticipants';
import { rankEventParticipants } from '../utils/eventRecommendations';
import { supabase } from '../lib/supabase';

export type RecommendationState = 'notRegistered' | 'registrationPending' | 'b2bDisabled' | 'profileUnavailable' | 'missingPreferences' | 'ready';

export function useEventRecommendations(eventId: string | undefined, userId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ['event-recommendations', eventId, userId],
    enabled: enabled && !!eventId && !!userId,
    queryFn: async (): Promise<{ matches: ReturnType<typeof rankEventParticipants>; state: RecommendationState }> => {
      const { data: registration, error } = await supabase.from('event_attendees')
        .select('id,status,b2b_opt_in:meta->b2bOptIn').eq('event_id', eventId!).eq('profile_id', userId!).maybeSingle();
      if (error) throw error;
      if (!registration) return { matches: [], state: 'notRegistered' };
      if (!['registered', 'approved'].includes(registration.status)) return { matches: [], state: 'registrationPending' };
      if (registration.b2b_opt_in !== true && registration.b2b_opt_in !== 'true') return { matches: [], state: 'b2bDisabled' };
      const people = await loadEventNetworkingParticipants(eventId!);
      const viewer = people.find(p => p.id === userId);
      if (!viewer) return { matches: [], state: 'profileUnavailable' };
      if (!viewer.sector?.trim() && !viewer.interests.some(value => value.trim())) return { matches: [], state: 'missingPreferences' };
      return { matches: rankEventParticipants(people, userId!), state: 'ready' };
    },
    staleTime: 60_000,
    retry: 1,
  });
}
