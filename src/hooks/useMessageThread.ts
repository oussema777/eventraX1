import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';

export function useMessageThread() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const getOrCreateThread = async (otherUserId: string) => {
    if (!user?.id) {
      toast.error('You must be logged in to send messages');
      return null;
    }

    try {
      setLoading(true);

      // 1. Get my threads
      const { data: myThreads } = await supabase
        .from('message_thread_participants')
        .select('thread_id')
        .eq('profile_id', user.id);
        
      const myThreadIds = (myThreads || []).map((row: any) => row.thread_id);
      
      let targetThreadId: string | null = null;

      // 2. Check if shared thread exists
      if (myThreadIds.length > 0) {
        const { data: shared } = await supabase
          .from('message_thread_participants')
          .select('thread_id')
          .eq('profile_id', otherUserId)
          .in('thread_id', myThreadIds)
          .limit(1);
          
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

  return { getOrCreateThread, loading };
}
