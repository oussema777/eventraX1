import { createContext, useContext, lazy, type ReactNode } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { EVENT_ID_PATTERN, isEventSlug } from '../../utils/eventLinks';
const NotFound = lazy(() => import('../../pages/NotFound'));

const EventIdContext = createContext<string | undefined>(undefined);

// Resolve only at the public route boundary. Database queries, auth guards,
// registration writes and storage keys always receive the immutable UUID.
export function useEventRouteParams() {
  const params = useParams();
  const resolvedId = useContext(EventIdContext);
  return { ...params, eventId: resolvedId || params.eventId };
}

export default function EventPublicRoute({ children }: { children?: ReactNode }) {
  const { eventId: identifier = '' } = useParams();
  const isId = EVENT_ID_PATTERN.test(identifier);
  const validSlug = isEventSlug(identifier);
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['event-public-alias', identifier],
    enabled: !isId && validSlug,
    queryFn: async () => {
      const { data, error } = await supabase.from('event_url_aliases')
        .select('event_id').eq('slug', identifier).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (!isId) {
    if (!validSlug) return <NotFound />;
    if (isPending) return <div role="status" className="p-12 text-center">Loading event…</div>;
    if (isError) return <div role="alert" className="p-12 text-center">
      <p>We couldn’t load this event link.</p>
      <button onClick={() => refetch()}>Try again</button>
    </div>;
    if (!data?.event_id) return <NotFound />;
  }

  return <EventIdContext.Provider value={isId ? identifier : data!.event_id}>
    {children || <Outlet />}
  </EventIdContext.Provider>;
}
