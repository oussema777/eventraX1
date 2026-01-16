import { useState, useEffect, useCallback } from 'react';
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

export function useAttendeeCategories() {
  const { eventId } = useParams<{ eventId: string }>();
  const [categories, setCategories] = useState<AttendeeCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    if (!eventId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('event_attendee_categories')
        .select('*')
        .eq('event_id', eventId)
        .order('is_default', { ascending: false });

      if (error) {
        if (error.code === 'PGRST204' || error.code === '42P01') {
          console.warn('event_attendee_categories table not found, returning empty array');
          setCategories([]);
          return;
        }
        throw error;
      }
    } catch (error: any) {
      console.error('Error fetching attendee categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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
      
      await fetchCategories();
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
      setCategories(prev => prev.filter(c => c.id !== id));
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
    fetchCategories
  };
}
