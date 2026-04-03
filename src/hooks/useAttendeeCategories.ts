import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner@2.0.3';
import { useParams } from 'react-router-dom';

export interface AttendeeCategory {
  id: string;
  event_id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  is_default: boolean;
  assignment_criteria: string;
  assignment_value?: string;
}

const CATEGORIES_COLUMNS = 'id, event_id, name, description, color, icon, is_default, assignment_criteria, assignment_value';

async function fetchAttendeeCategories(eventId: string): Promise<AttendeeCategory[]> {
  const { data, error } = await supabase
    .from('event_attendee_categories')
    .select(CATEGORIES_COLUMNS)
    .eq('event_id', eventId)
    .order('is_default', { ascending: false });

  if (error) {
    if (error.code === 'PGRST204' || error.code === '42P01') return [];
    throw error;
  }
  return data || [];
}

export function useAttendeeCategories() {
  const { eventId } = useParams<{ eventId: string }>();
  const queryClient = useQueryClient();
  const queryKey = ['attendee-categories-standalone', eventId];

  const { data: categories = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchAttendeeCategories(eventId!),
    enabled: !!eventId,
  });

  const saveCategory = async (category: Partial<AttendeeCategory>) => {
    if (!eventId) return null;
    try {
      const payload = {
        ...category,
        event_id: eventId
      };

      let result;
      if (category.id) {
        result = await supabase
          .from('event_attendee_categories')
          .update(payload)
          .eq('id', category.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('event_attendee_categories')
          .insert([payload])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      queryClient.invalidateQueries({ queryKey });
      toast.success('Category saved');
      return result.data;
    } catch (error: any) {
      toast.error(error.message);
      return null;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('event_attendee_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey });
      toast.success('Category removed');
    } catch (error: any) {
      toast.error('Failed to delete category');
    }
  };

  return {
    categories,
    isLoading,
    saveCategory,
    deleteCategory,
    fetchCategories: () => queryClient.invalidateQueries({ queryKey })
  };
}
