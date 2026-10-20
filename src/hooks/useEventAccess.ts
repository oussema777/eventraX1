import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getEventRole, type EventRole } from '../lib/eventAccess';

export function useEventAccess(eventId?: string) {
  const { user, isLoading } = useAuth();
  const userId = user?.id;
  const key = `${userId}:${eventId}`;
  const [state, setState] = useState<{ key: string; role: EventRole | null; error: boolean } | null>(null);
  useEffect(() => {
    if (isLoading || !userId || !eventId || eventId === 'new') return;
    let active = true;
    const refresh = async () => {
      try {
        const role = await getEventRole(eventId);
        if (active) setState({ key, role, error: false });
      } catch {
        if (active) setState({ key, role: null, error: true });
      }
    };
    void refresh();
    // Database checks apply on every write. Refresh visible controls after role
    // changes/revocation even if this user has kept the dashboard open.
    const interval = window.setInterval(() => void refresh(), 30000);
    window.addEventListener('focus', refresh);
    return () => { active = false; clearInterval(interval); window.removeEventListener('focus', refresh); };
  }, [eventId, userId, isLoading, key]);
  return {
    role: state?.key === key ? state.role : null,
    error: state?.key === key && state.error,
    loading: isLoading || (!!user && eventId !== 'new' && state?.key !== key),
  };
}
