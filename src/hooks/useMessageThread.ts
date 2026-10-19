import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { isSystemProfile } from '../utils/profileIdentity';
import { useI18n } from '../i18n/I18nContext';

export function useMessageThread() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const inFlight = useRef(new Map<string, Promise<string | null>>());

  const openThread = async (otherUserId: string) => {
    if (!user?.id) {
      toast.error('You must be logged in to send messages');
      return null;
    }

    try {
      setLoading(true);

      if (!otherUserId || otherUserId === user.id || isSystemProfile({ id: otherUserId })) {
        toast.error(t('businessIdentity.contactUnavailable'));
        return null;
      }
      const { data: recipient, error: recipientError } = await supabase.from('profiles')
        .select('id, account_type').eq('id', otherUserId).maybeSingle();
      if (recipientError) throw recipientError;
      if (!recipient || recipient.id !== otherUserId || isSystemProfile(recipient)) {
        toast.error(t('businessIdentity.contactUnavailable'));
        return null;
      }

      // 1. Get my threads
      const { data: myThreads, error: myThreadsError } = await supabase
        .from('message_thread_participants')
        .select('thread_id')
        .eq('profile_id', user.id);
      if (myThreadsError) throw myThreadsError;
        
      const myThreadIds = (myThreads || []).map((row: any) => row.thread_id);
      
      let targetThreadId: string | null = null;

      // 2. Check if shared thread exists
      if (myThreadIds.length > 0) {
        const { data: shared, error: sharedError } = await supabase
          .from('message_thread_participants')
          .select('thread_id')
          .eq('profile_id', otherUserId)
          .in('thread_id', myThreadIds)
          .limit(1);
        if (sharedError) throw sharedError;
          
        if (shared && shared.length > 0) {
          targetThreadId = shared[0].thread_id;
        }
      }

      // 3. Create if not exists
      if (!targetThreadId) {
        const { data: newThread, error: createError } = await supabase
          .from('message_threads')
          .insert([{ created_by: user.id }])
          .select('id')
          .single();

        if (createError) throw createError;
        targetThreadId = newThread.id;

        const { error: partError } = await supabase.from('message_thread_participants').insert([
          { thread_id: targetThreadId, profile_id: user.id },
          { thread_id: targetThreadId, profile_id: otherUserId }
        ]);
        
        if (partError) throw partError;
      }

      return targetThreadId;

    } catch (error: any) {
      console.error('Error getting thread:', error);
      toast.error('Failed to start conversation');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getOrCreateThread = (otherUserId: string) => {
    const key = `${user?.id}:${otherUserId}`;
    const pending = inFlight.current.get(key);
    if (pending) return pending;
    const operation = openThread(otherUserId).finally(() => inFlight.current.delete(key));
    inFlight.current.set(key, operation);
    return operation;
  };

  return { getOrCreateThread, loading };
}
