import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useEventInvestors(eventId?: string, viewerId?: string) {
  return useQuery({ queryKey: ['event-investors', eventId, viewerId], enabled: !!eventId && !!viewerId, retry: false,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('list_event_investors', { p_event: eventId });
      if (error?.code === 'PGRST202') return [] as { attendee_id: string; profile_id: string | null }[];
      if (error) throw error;
      return (data || []) as { attendee_id: string; profile_id: string | null }[];
    },
  });
}
