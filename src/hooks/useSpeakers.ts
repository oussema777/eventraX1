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
}

const SPEAKERS_COLUMNS = 'id, event_id, name, full_name, title, company, bio, email, avatar_url, type, status, tags, linkedin_url, twitter_url, website_url, phone';

function mapSpeaker(s: any): Speaker {
  return {
    id: s.id,
    full_name: s.name || s.full_name,
    title: s.title || '',
    company: s.company || '',
    bio: s.bio || '',
    shortBio: (s.bio || '').substring(0, 100) + '...',
    email: s.email || '',
    photo: s.avatar_url,
    type: (s.type as any) || 'regular',
    status: (s.status as any) || 'confirmed',
    tags: s.tags || [],
    sessions: 0,
    expectedAttendees: '',
    linkedin_url: s.linkedin_url,
    twitter_url: s.twitter_url,
    website_url: s.website_url,
    phone: s.phone,
    event_id: s.event_id
  };
}

async function fetchSpeakers(eventId: string): Promise<Speaker[]> {
  const { data, error } = await supabase
    .from('event_speakers')
    .select(SPEAKERS_COLUMNS)
    .eq('event_id', eventId);

  if (error) {
    if (error.code === 'PGRST204' || error.code === '42P01') return [];
    throw error;
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
      toast.success('Speaker created');
      return data;
    } catch (error) {
      console.error('Error creating speaker:', error);
      toast.error('Failed to create speaker');
    }
  };

  const updateSpeaker = async (id: string, speaker: Partial<Speaker>) => {
    try {
      const { data, error } = await supabase
        .from('event_speakers')
        .update({
          full_name: speaker.name,
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
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey });
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
      toast.success('Speaker deleted');
    } catch (error) {
      console.error('Error deleting speaker:', error);
      toast.error('Failed to delete speaker');
    }
  };

  return {
    speakers,
    isLoading,
    createSpeaker,
    updateSpeaker,
    deleteSpeaker,
    loadSpeakers: () => queryClient.invalidateQueries({ queryKey })
  };
}
