import { useEventRouteParams } from '../navigation/EventPublicRoute';
import { ReactNode, useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { eventAuthPath } from '../../utils/authRedirect';
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
 *   row) for the current `:eventId`; otherwise show an account-recovery screen.
 */
export function GuestAllowedEventRoute({ children }: { children: ReactNode }) {
  const { user, accountType, signOut } = useAuth();
  const navigate = useNavigate();
  const { eventId } = useEventRouteParams();
  // Key the result to the current identity/event so stale access is never reused.
  const key = `${user?.id || ''}:${eventId || ''}`;
  const [check, setCheck] = useState<{ key: string; allowed: boolean; error?: boolean } | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    // Members are always allowed — no lookup needed.
    if (accountType !== 'event_guest') {
      return;
    }

    let active = true;
    if (!user || !eventId) {
      setCheck({ key, allowed: false });
      return;
    }

    (async () => {
      const { data, error } = await supabase
        .from('event_attendees')
        .select('event_id')
        .eq('profile_id', user.id)
        .eq('event_id', eventId)
        .maybeSingle();
      if (active) setCheck({ key, allowed: !!data, error: !!error });
    })().catch(() => { if (active) setCheck({ key, allowed: false, error: true }); });

    return () => {
      active = false;
    };
  }, [accountType, user, eventId, key, retry]);

  if (accountType !== 'event_guest') {
    return <>{children}</>;
  }

  if (!check || check.key !== key) {
    return null;
  }

  if (check.allowed) return <>{children}</>;
  return <div className="min-h-screen flex items-center justify-center bg-[#0B2641] text-white p-6">
    <div style={{ maxWidth: 460 }}>
      <h1 className="text-xl font-semibold mb-3">{check.error ? 'Unable to check event access' : 'Use your registration account'}</h1>
      <p className="mb-5">{check.error ? 'Please try again. Your registration has not changed.' : 'This account is not registered for this event. Sign in with the email address used for your registration.'}</p>
      {check.error ? <button onClick={() => setRetry(value => value + 1)}>Try again</button>
        : <button onClick={async () => {
          await signOut();
          navigate(eventAuthPath(`/event/${eventId}/networking`), { replace: true });
        }}>Sign in with another account</button>}
      <p className="mt-5"><Link to={`/event/${eventId}/landing`}>Back to event</Link></p>
    </div>
  </div>;
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
