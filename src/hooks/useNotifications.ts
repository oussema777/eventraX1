import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { NotificationItem } from '../lib/notifications';

const POLL_INTERVAL_MS = 10000;

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([]);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (fetchError) throw fetchError;
      setNotifications((data || []) as NotificationItem[]);
    } catch (err: any) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!user?.id) return;
      const now = new Date().toISOString();
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read_at: now })
        .eq('id', notificationId)
        .eq('recipient_id', user.id);
      if (updateError) throw updateError;
      setNotifications((prev) =>
        prev.map((item) => (item.id === notificationId ? { ...item, read_at: now } : item))
      );
    },
    [user?.id]
  );

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('notifications')
      .update({ read_at: now })
      .eq('recipient_id', user.id)
      .is('read_at', null);
    if (updateError) throw updateError;
    setNotifications((prev) => prev.map((item) => ({ ...item, read_at: now })));
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!user?.id) return;
    pollRef.current = window.setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
      }
    };
  }, [fetchNotifications, user?.id]);

  const unreadCount = notifications.filter((item) => !item.read_at).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  };
}

