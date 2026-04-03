import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { sanitizeError } from '../utils/errorHandler';
import { useParams } from 'react-router-dom';

export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'dropdown' | 'checkbox' | 'radio' | 'date' | 'file' | 'number' | 'multichoice' | 'country' | 'email' | 'phone' | 'url' | 'address';
  label: string;
  placeholder?: string;
  helpText?: string;
  description?: string;
  required: boolean;
  options?: string[];
  isPro?: boolean;
}

export interface EventForm {
  id: string;
  event_id: string;
  title: string;
  description: string;
  type: string;
  status: 'active' | 'draft' | 'locked';
  fields: FormField[];
  created_at?: string;
  updated_at?: string;
  is_default?: boolean;
}

const FORMS_COLUMNS = 'id, event_id, title, description, type, status, fields, created_at, updated_at, is_default, schema, form_type';

async function fetchForms(eventId: string): Promise<EventForm[]> {
  const { data, error } = await supabase
    .from('event_forms')
    .select(FORMS_COLUMNS)
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });

  if (error) {
    if (error.code === 'PGRST204' || error.code === '42P01') return [];
    throw error;
  }
  return data || [];
}

export function useEventForms() {
  const { eventId } = useParams<{ eventId: string }>();
  const queryClient = useQueryClient();
  const queryKey = ['event-forms', eventId];
  const [isSaving, setIsSaving] = useState(false);

  const { data: forms = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchForms(eventId!),
    enabled: !!eventId,
  });

  const saveForm = async (form: Partial<EventForm>) => {
    if (!eventId) return null;
    setIsSaving(true);
    try {
      const payload = {
        event_id: eventId,
        title: form.title || 'Untitled Form',
        description: form.description || '',
        type: form.type || 'survey',
        status: form.status || 'draft',
        fields: form.fields || [],
        is_default: form.is_default || false
      };

      let result;
      if (form.id && !form.id.startsWith('new-')) {
        result = await supabase
          .from('event_forms')
          .update(payload)
          .eq('id', form.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('event_forms')
          .insert(payload)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast.success('Form saved successfully');
      queryClient.invalidateQueries({ queryKey });
      return result.data;
    } catch (error: any) {
      console.error('Error saving form:', error);
      toast.error(sanitizeError(error, 'Failed to save form'));
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteForm = async (id: string) => {
    try {
      const { error } = await supabase.from('event_forms').delete().eq('id', id);
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey });
      toast.success('Form deleted');
    } catch (error: any) {
      console.error('Error deleting form:', error);
      toast.error('Failed to delete form');
    }
  };

  return {
    forms,
    isLoading,
    isSaving,
    fetchForms: () => queryClient.invalidateQueries({ queryKey }),
    saveForm,
    deleteForm
  };
}
