import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { sanitizeError } from '../utils/errorHandler';
import { useParams } from 'react-router-dom';

export interface Session {
  id: string;
  event_id: string;
  title: string;
  description: string;
  startTime: string; // ISO string (from starts_at)
  endTime: string;   // ISO string (from ends_at)
  duration: number;  // calculated in minutes
  venue: string;     // mapped from location
  capacity: number;
  registered: number;
  speakers: string[]; // array of UUIDs
  tags: string[];
  type: string;      // keynote, workshop, etc.
  status: 'confirmed' | 'tentative';

  // Pro features
  enableCheckIn: boolean;
  showInPublicSchedule: boolean;
  customFormId?: string;
}

const SESSIONS_COLUMNS = 'id, event_id, title, description, starts_at, ends_at, location, capacity, registered_count, speaker_ids, tags, type, status, enable_check_in, is_public, custom_form_id';

// Shared conflict check helper — DB-level date range filtering
async function checkVenueConflict(
  eventId: string,
  venue: string,
  startTime: string,
  endTime: string,
  excludeSessionId?: string
): Promise<string | null> {
  if (!venue || venue === 'TBD' || venue === '') return null;

  const { data: conflicts } = await supabase
    .from('event_sessions')
    .select('id, title, starts_at, ends_at')
    .eq('event_id', eventId)
    .eq('location', venue)
    .neq('status', 'cancelled')
    .lt('starts_at', endTime)   // DB-level: starts before our end
    .gt('ends_at', startTime);  // DB-level: ends after our start

  if (!conflicts || conflicts.length === 0) return null;

  const conflict = conflicts.find(s => excludeSessionId ? s.id !== excludeSessionId : true);
  if (!conflict) return null;

  return `Schedule Conflict: The session "${conflict.title}" is already booked in "${venue}" during this time slot.`;
}

function mapSession(s: any): Session {
  const start = new Date(s.starts_at);
  const end = new Date(s.ends_at);
  const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));

  return {
    id: s.id,
    event_id: s.event_id,
    title: s.title,
    description: s.description || '',
    startTime: s.starts_at,
    endTime: s.ends_at,
    duration: isNaN(duration) ? 0 : duration,
    venue: s.location || '',
    capacity: s.capacity || 0,
    registered: s.registered_count || 0,
    speakers: s.speaker_ids || [],
    tags: s.tags || [],
    type: s.type || 'presentation',
    status: s.status || 'confirmed',
    enableCheckIn: s.enable_check_in || false,
    showInPublicSchedule: s.is_public !== false, // default true
    customFormId: s.custom_form_id
  };
}

async function fetchSessions(eventId: string): Promise<Session[]> {
  const { data, error } = await supabase
    .from('event_sessions')
    .select(SESSIONS_COLUMNS)
    .eq('event_id', eventId)
    .order('starts_at', { ascending: true });

  if (error) {
    if (error.code === 'PGRST204' || error.code === '42P01') return [];
    throw error;
  }
  return (data || []).map(mapSession);
}

export function useSessions(manualEventId?: string) {
  const { eventId: urlEventId } = useParams<{ eventId: string }>();
  const eventId = manualEventId || urlEventId;
  const queryClient = useQueryClient();
  const queryKey = ['sessions', eventId];

  const { data: sessions = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchSessions(eventId!),
    enabled: !!eventId && eventId !== 'new',
  });

  const createSession = async (session: Partial<Session>) => {
    if (!eventId || eventId === 'new') {
      toast.error('Please save event details first');
      return;
    }
    try {
      // Conflict Check — uses DB-level date filtering
      if (session.venue && session.startTime && session.endTime) {
        const conflictMsg = await checkVenueConflict(eventId, session.venue, session.startTime, session.endTime);
        if (conflictMsg) throw new Error(conflictMsg);
      }

      const dbPayload: any = {
        event_id: eventId,
        title: session.title,
        description: session.description,
        starts_at: session.startTime,
        ends_at: session.endTime,
        location: session.venue,
        capacity: session.capacity,
        type: session.type,
        tags: session.tags,
        speaker_ids: session.speakers,
        status: session.status || 'confirmed'
      };

      const { data, error } = await supabase
        .from('event_sessions')
        .insert(dbPayload)
        .select()
        .single();

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey });
      toast.success('Session created');
      return data;
    } catch (error: any) {
      console.error('Error creating session:', error);
      toast.error(sanitizeError(error, 'Failed to create session'));
    }
  };

  const updateSession = async (id: string, session: Partial<Session>) => {
    try {
      // Conflict Check — uses shared helper with DB-level filtering, excludes self
      if (session.startTime && session.endTime && session.venue) {
        const conflictMsg = await checkVenueConflict(eventId!, session.venue, session.startTime, session.endTime, id);
        if (conflictMsg) throw new Error(conflictMsg);
      }

      const dbPayload: any = {};
      if (session.title !== undefined) dbPayload.title = session.title;
      if (session.description !== undefined) dbPayload.description = session.description;
      if (session.startTime !== undefined) dbPayload.starts_at = session.startTime;
      if (session.endTime !== undefined) dbPayload.ends_at = session.endTime;
      if (session.venue !== undefined) dbPayload.location = session.venue;
      if (session.capacity !== undefined) dbPayload.capacity = session.capacity;
      if (session.type !== undefined) dbPayload.type = session.type;
      if (session.tags !== undefined) dbPayload.tags = session.tags;
      if (session.speakers !== undefined) dbPayload.speaker_ids = session.speakers;
      if (session.status !== undefined) dbPayload.status = session.status;

      const { data, error } = await supabase
        .from('event_sessions')
        .update(dbPayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey });
      toast.success('Session updated');
      return data;
    } catch (error: any) {
      console.error('Error updating session:', error);
      toast.error(sanitizeError(error, 'Failed to update session'));
    }
  };

  const deleteSession = async (id: string) => {
    try {
      const { error } = await supabase
        .from('event_sessions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey });
      toast.success('Session deleted');
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete session');
    }
  };

  return {
    sessions,
    isLoading,
    createSession,
    updateSession,
    deleteSession,
    refreshSessions: () => queryClient.invalidateQueries({ queryKey })
  };
}
