import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { NotificationItem } from '../lib/notifications';

const NOTIFICATIONS_COLUMNS = 'id, recipient_id, type, title, message, read_at, created_at, metadata';

async function fetchNotifications(userId: string): Promise<NotificationItem[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select(NOTIFICATIONS_COLUMNS)
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    if (error.code === 'PGRST204' || error.code === '42P01') return [];
    throw error;
  }
  return (data || []) as NotificationItem[];
}

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['notifications', user?.id];

  const { data: notifications = [], isLoading, error: queryError } = useQuery({
    queryKey,
    queryFn: () => fetchNotifications(user!.id),
    enabled: !!user?.id,
    refetchInterval: 10000, // Poll every 10 seconds (replaces manual setInterval)
  });

  const error = queryError ? (queryError as Error).message : null;

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
      // Optimistic update
      queryClient.setQueryData(queryKey, (old: NotificationItem[] | undefined) =>
        (old || []).map((item) => (item.id === notificationId ? { ...item, read_at: now } : item))
      );
    },
    [user?.id, queryClient, queryKey]
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
    // Optimistic update
    queryClient.setQueryData(queryKey, (old: NotificationItem[] | undefined) =>
      (old || []).map((item) => ({ ...item, read_at: now }))
    );
  }, [user?.id, queryClient, queryKey]);

  const unreadCount = notifications.filter((item) => !item.read_at).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications: () => queryClient.invalidateQueries({ queryKey }),
    markAsRead,
    markAllAsRead
  };
}
