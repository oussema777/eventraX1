import { toast } from 'sonner';
import { useI18n } from '../i18n/I18nContext';
import { useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { NotificationItem } from '../lib/notifications';
import { investorReviewCopy } from '../components/networking/investorReviewCopy';

const NOTIFICATIONS_COLUMNS = 'id, recipient_id, actor_id, type, title, body, action_url, read_at, created_at';

async function fetchNotifications(userId: string, locale: string): Promise<NotificationItem[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select(NOTIFICATIONS_COLUMNS)
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  const review = await supabase.rpc('list_review_notifications', { p_limit: 20 });
  if (review.error && review.error.code !== 'PGRST202') throw review.error;
  const c=investorReviewCopy[locale as keyof typeof investorReviewCopy] || investorReviewCopy.en;
  const items=(review.data || []).map((item: NotificationItem & {kind:string;requester:boolean})=>({...item,
    title:c.title,
    body:item.kind==='submitted' ? (item.requester?c.submitted:c.queue) : item.kind==='confirmed'?c.meetingConfirmed:item.kind==='cancelled'?c.meetingCancelled:c[item.kind as keyof typeof c]||item.body,
  }));
  return [...(data || []),...items].sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at)).slice(0,40) as NotificationItem[];
}

export function useNotifications() {
  const { user } = useAuth();
  const { t, locale } = useI18n();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const queryKey = ['notifications', userId, locale];

  const { data: notifications = [], isLoading, error: queryError } = useQuery({
    queryKey,
    queryFn: () => fetchNotifications(userId!, locale),
    enabled: !!userId,
    refetchInterval: 30000,
  });

  // Realtime subscription for new notifications
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${user.id}`
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  const error = queryError ? (queryError as Error).message : null;

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!userId) return;
      const now = new Date().toISOString();
      const { error: updateError } = notificationId.startsWith('review:')
        ? await supabase.rpc('mark_review_notifications_read',{p_job:notificationId.slice(7)})
        : await supabase
        .from('notifications')
        .update({ read_at: now })
        .eq('id', notificationId)
        .eq('recipient_id', userId);
      if (updateError) { toast.error(t('flowRecovery.notificationSaveError')); return; }
      // Optimistic update
      queryClient.setQueryData(queryKey, (old: NotificationItem[] | undefined) =>
        (old || []).map((item) => (item.id === notificationId ? { ...item, read_at: now } : item))
      );
    },
    [userId, queryClient, queryKey, t]
  );

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    const now = new Date().toISOString();
    const review=await supabase.rpc('mark_review_notifications_read',{p_job:null});
    if(review.error && review.error.code!=='PGRST202'){toast.error(t('flowRecovery.notificationSaveError'));return;}
    const { error: updateError } = await supabase
      .from('notifications')
      .update({ read_at: now })
      .eq('recipient_id', userId)
      .is('read_at', null);
    if (updateError) { toast.error(t('flowRecovery.notificationSaveError')); return; }
    // Optimistic update
    queryClient.setQueryData(queryKey, (old: NotificationItem[] | undefined) =>
      (old || []).map((item) => ({ ...item, read_at: now }))
    );
  }, [userId, queryClient, queryKey, t]);

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
