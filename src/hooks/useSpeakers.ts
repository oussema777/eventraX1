import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';

export interface Speaker {
  id: string;
  full_name: string;
  title: string;
  company: string;
  bio: string;
  shortBio: string;
  email: string;
  photo?: string;
  type: 'trainer' | 'coach' | 'expert' | 'lecture';
  status: 'confirmed' | 'pending' | 'declined';
  tags: string[];
  sessions: number;
  expectedAttendees: string;
  sessionDuration?: string;
  event_id?: string;
  linkedin_url?: string;
  twitter_url?: string;
  website_url?: string;
  sort_order?: number;
}

function mapSpeaker(s: any): Speaker {
  return {
    id: s.id,
    full_name: s.full_name || s.name || '',
    title: s.title || '',
    company: s.company || '',
    bio: s.bio || '',
    shortBio: (s.bio || '').substring(0, 100) + '...',
    email: s.email || '',
    photo: s.avatar_url || s.photo_url || '',
    type: (s.type as any) || 'regular',
    status: (s.status as any) || 'confirmed',
    tags: s.tags || [],
    sessions: 0,
    expectedAttendees: s.expected_attendance || '',
    linkedin_url: s.linkedin_url || '',
    twitter_url: s.twitter_url || '',
    website_url: s.website_url || '',
    phone: s.phone || '',
    event_id: s.event_id,
    sort_order: s.sort_order ?? 999
  };
}

async function fetchSpeakers(eventId: string): Promise<Speaker[]> {
  const { data, error } = await supabase
    .from('event_speakers')
    .select('*')
    .eq('event_id', eventId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch speakers:', error);
    return [];
  }
  return (data || []).map(mapSpeaker);
}

export function useSpeakers(manualEventId?: string) {
  const { eventId: urlEventId } = useParams<{ eventId: string }>();
  const eventId = manualEventId || urlEventId;
  const queryClient = useQueryClient();
  const queryKey = ['speakers', eventId];

  const { data: speakers = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchSpeakers(eventId!),
    enabled: !!eventId && eventId !== 'new',
  });

  const createSpeaker = async (speaker: Partial<Speaker>) => {
    if (!eventId || eventId === 'new') return;
    try {
      const { data, error } = await supabase
        .from('event_speakers')
        .insert({
          event_id: eventId,
          full_name: speaker.full_name,
          title: speaker.title,
          company: speaker.company,
          bio: speaker.bio,
          avatar_url: speaker.photo,
          linkedin_url: speaker.linkedin_url,
          twitter_url: speaker.twitter_url,
          website_url: speaker.website_url,
          email: speaker.email,
          phone: speaker.phone,
          type: speaker.type,
          status: speaker.status,
          tags: speaker.tags
        })
        .select()
        .single();

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['event-stats', eventId] });
      toast.success('Speaker created');
      return data;
    } catch (error) {
      console.error('Error creating speaker:', error);
      toast.error('Failed to create speaker');
    }
  };

  const updateSpeaker = async (id: string, speaker: Partial<Speaker>) => {
    try {
      // Build payload with only defined values to avoid overwriting with undefined
      const payload: Record<string, any> = {};
      if (speaker.full_name !== undefined) payload.full_name = speaker.full_name;
      if (speaker.title !== undefined) payload.title = speaker.title;
      if (speaker.company !== undefined) payload.company = speaker.company;
      if (speaker.bio !== undefined) payload.bio = speaker.bio;
      if (speaker.photo !== undefined) payload.avatar_url = speaker.photo;
      if (speaker.linkedin_url !== undefined) payload.linkedin_url = speaker.linkedin_url;
      if (speaker.twitter_url !== undefined) payload.twitter_url = speaker.twitter_url;
      if (speaker.website_url !== undefined) payload.website_url = speaker.website_url;
      if (speaker.email !== undefined) payload.email = speaker.email;
      if ((speaker as any).phone !== undefined) payload.phone = (speaker as any).phone;
      if (speaker.type !== undefined) payload.type = speaker.type;
      if (speaker.status !== undefined) payload.status = speaker.status;
      if (speaker.tags !== undefined) payload.tags = speaker.tags;

      const { data, error } = await supabase
        .from('event_speakers')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['event-stats', eventId] });
      toast.success('Speaker updated');
      return data;
    } catch (error) {
      console.error('Error updating speaker:', error);
      toast.error('Failed to update speaker');
    }
  };

  const deleteSpeaker = async (id: string) => {
    try {
      const { error } = await supabase
        .from('event_speakers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['event-stats', eventId] });
      toast.success('Speaker deleted');
    } catch (error) {
      console.error('Error deleting speaker:', error);
      toast.error('Failed to delete speaker');
    }
  };

  const setSpeakers = (updater: Speaker[] | ((prev: Speaker[]) => Speaker[])) => {
    queryClient.setQueryData(queryKey, (old: Speaker[] | undefined) => {
      if (typeof updater === 'function') return updater(old || []);
      return updater;
    });
  };

  const reorderSpeakers = async (orderedIds: string[]) => {
    const previousSpeakers = speakers;
    const reordered = orderedIds
      .map((id, index) => {
        const speaker = speakers.find(s => s.id === id);
        return speaker ? { ...speaker, sort_order: index } : null;
      })
      .filter(Boolean) as Speaker[];
    queryClient.setQueryData(queryKey, reordered);

    try {
      const { data: currentRows, error: fetchError } = await supabase
        .from('event_speakers')
        .select('id, updated_at')
        .in('id', orderedIds);

      if (fetchError) throw fetchError;

      const timestampMap = new Map(
        (currentRows || []).map((r: any) => [r.id, r.updated_at])
      );

      const results = await Promise.all(
        orderedIds.map((id, index) => {
          const expectedUpdatedAt = timestampMap.get(id);
          let query = supabase
            .from('event_speakers')
            .update({ sort_order: index })
            .eq('id', id);

          if (expectedUpdatedAt) {
            query = query.eq('updated_at', expectedUpdatedAt);
          }

          return query.select('id');
        })
      );

      const hasConflict = results.some(
        (r) => !r.error && (!r.data || r.data.length === 0)
      );

      if (hasConflict) {
        queryClient.invalidateQueries({ queryKey });
        toast.error('Speaker order was modified by another user. Refreshing...');
        return;
      }

      const firstError = results.find((r) => r.error);
      if (firstError?.error) throw firstError.error;
    } catch (error) {
      queryClient.setQueryData(queryKey, previousSpeakers);
      console.error('Error reordering speakers:', error);
      toast.error('Failed to reorder speakers');
    }
  };

  return {
    speakers,
    setSpeakers,
    isLoading,
    createSpeaker,
    updateSpeaker,
    deleteSpeaker,
    reorderSpeakers,
    loadSpeakers: () => queryClient.invalidateQueries({ queryKey })
  };
}
