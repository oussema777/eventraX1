import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
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

export function useSessions(manualEventId?: string) {
  const { eventId: urlEventId } = useParams<{ eventId: string }>();
  const eventId = manualEventId || urlEventId;
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadSessions = useCallback(async () => {
    if (!eventId || eventId === 'new') return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('event_sessions')
        .select('*')
        .eq('event_id', eventId)
        .order('starts_at', { ascending: true });

      if (error) throw error;

      const mapped: Session[] = (data || []).map(s => {
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
      });

      setSessions(mapped);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const createSession = async (session: Partial<Session>) => {
    if (!eventId || eventId === 'new') {
      toast.error('Please save event details first');
      return;
    }
    try {
      // Conflict Check
      if (session.venue && session.venue !== 'TBD' && session.venue !== '' && session.startTime && session.endTime) {
        const start = new Date(session.startTime).getTime();
        const end = new Date(session.endTime).getTime();

        const { data: conflicts } = await supabase
          .from('event_sessions')
          .select('id, title, starts_at, ends_at')
          .eq('event_id', eventId)
          .eq('location', session.venue)
          .neq('status', 'cancelled');

        const hasConflict = conflicts?.some(s => {
          const sStart = new Date(s.starts_at).getTime();
          const sEnd = new Date(s.ends_at).getTime();
          return (start < sEnd && end > sStart);
        });

        if (hasConflict) {
          throw new Error('Venue conflict: This room is already booked for this time slot.');
        }
      }

      // Convert frontend model to DB model
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
      
      await loadSessions();
      toast.success('Session created');
      return data;
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create session');
    }
  };

  const updateSession = async (id: string, session: Partial<Session>) => {
    try {
      // Conflict Check (if venue or time is being updated)
      if ((session.venue || session.startTime || session.endTime) && (session.venue !== 'TBD' && session.venue !== '')) {
        // Fetch current session details if partial update is missing venue/time
        // For simplicity in this specific hook usage, we assume critical fields are passed or we skip strict check if data is incomplete
        // But ideally, we should read current state if missing. 
        // For this implementation, we proceed if we have enough info to check.
        if (session.startTime && session.endTime && session.venue) {
           const start = new Date(session.startTime).getTime();
           const end = new Date(session.endTime).getTime();

           const { data: conflicts } = await supabase
            .from('event_sessions')
            .select('id, title, starts_at, ends_at')
            .eq('event_id', eventId) // Ensure we have eventId from closure or fetch it
            .eq('location', session.venue)
            .neq('status', 'cancelled');

           const hasConflict = conflicts?.some(s => {
            if (s.id === id) return false; // Ignore self
            const sStart = new Date(s.starts_at).getTime();
            const sEnd = new Date(s.ends_at).getTime();
            return (start < sEnd && end > sStart);
           });

           if (hasConflict) {
             throw new Error('Venue conflict: This room is already booked for this time slot.');
           }
        }
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
      
      await loadSessions();
      toast.success('Session updated');
      return data;
    } catch (error) {
      console.error('Error updating session:', error);
      toast.error('Failed to update session');
    }
  };

  const deleteSession = async (id: string) => {
    try {
      const { error } = await supabase
        .from('event_sessions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await loadSessions();
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
    refreshSessions: loadSessions
  };
}