import { supabase } from './supabase';

export type NotificationType = 'action' | 'system';

export interface NotificationItem {
  id: string;
  recipient_id: string;
  actor_id?: string | null;
  title: string;
  body: string;
  type: NotificationType;
  action_url?: string | null;
  created_at: string;
  read_at?: string | null;
}

export interface CreateNotificationInput {
  recipient_id: string;
  title: string;
  body: string;
  type: NotificationType;
  action_url?: string | null;
  actor_id?: string | null;
}

export async function createNotification(input: CreateNotificationInput) {
  const { data, error } = await supabase
    .from('notifications')
    .insert([
      {
        recipient_id: input.recipient_id,
        title: input.title,
        body: input.body,
        type: input.type,
        action_url: input.action_url || null,
        actor_id: input.actor_id || null
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data as NotificationItem;
}

