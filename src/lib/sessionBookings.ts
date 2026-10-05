import { supabase } from './supabase';

/** A single UPDATE preserves the original booking if any booking rule fails. */
export async function replaceWorkshopBooking(attendeeId: string, previousSessionId: string, nextSessionId: string) {
  const { data, error } = await supabase.from('event_attendee_sessions')
    .update({ session_id: nextSessionId })
    .eq('attendee_id', attendeeId)
    .eq('session_id', previousSessionId)
    .select('session_id')
    .single();
  if (error) throw error;
  if (data?.session_id !== nextSessionId) throw new Error('Workshop booking changed. Please try again.');
}
