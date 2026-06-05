import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

/**
 * Guards for the event-guest account type.
 *
 * Event guests authenticate via magic link but must be LOCKED to the
 * networking surface of the event(s) they registered in. Members
 * ('user') are unaffected by both guards.
 */

/**
 * Wraps the per-event networking page.
 *
 * - Members ('user') always see the page.
 * - Guests only see it if they are registered (have an `event_attendees`
 *   row) for the current `:eventId`; otherwise they are sent home.
 */
export function GuestAllowedEventRoute({ children }: { children: ReactNode }) {
  const { user, accountType } = useAuth();
  const { eventId } = useParams();
  // null = still checking, true/false = decision made
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    // Members are always allowed — no lookup needed.
    if (accountType !== 'event_guest') {
      setAllowed(true);
      return;
    }

    let active = true;
    if (!user || !eventId) {
      setAllowed(false);
      return;
    }

    (async () => {
      const { data } = await supabase
        .from('event_attendees')
        .select('event_id')
        .eq('profile_id', user.id)
        .eq('event_id', eventId)
        .maybeSingle();
      if (active) setAllowed(!!data);
    })();

    return () => {
      active = false;
    };
  }, [accountType, user, eventId]);

  if (accountType !== 'event_guest') {
    return <>{children}</>;
  }

  if (allowed === null) {
    return null;
  }

  return allowed ? <>{children}</> : <Navigate to="/" replace />;
}

/**
 * Wraps the rest of the authenticated app.
 *
 * - Members ('user') pass through unchanged.
 * - Guests are bounced out to their event networking surface so they can
 *   never reach the normal app chrome.
 */
export function GuestLockout({ children }: { children: ReactNode }) {
  const { user, accountType } = useAuth();
  // undefined = still checking, null = no event found, string = target event id
  const [eventId, setEventId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    // Members are not locked out — no lookup needed.
    if (accountType !== 'event_guest') {
      return;
    }

    let active = true;
    if (!user) {
      setEventId(null);
      return;
    }

    (async () => {
      const { data } = await supabase
        .from('event_attendees')
        .select('event_id')
        .eq('profile_id', user.id)
        .limit(1);
      const row = data?.[0];
      if (active) setEventId(row ? row.event_id : null);
    })();

    return () => {
      active = false;
    };
  }, [accountType, user]);

  if (accountType !== 'event_guest') {
    return <>{children}</>;
  }

  if (eventId === undefined) {
    return null;
  }

  if (eventId) {
    return <Navigate to={`/event/${eventId}/networking`} replace />;
  }

  return <Navigate to="/" replace />;
}
