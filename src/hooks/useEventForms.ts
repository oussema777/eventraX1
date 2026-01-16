import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner@2.0.3';
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

export function useEventForms() {
  const { eventId } = useParams<{ eventId: string }>();
  const [forms, setForms] = useState<EventForm[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchForms();
    }
  }, [eventId]);

  const fetchForms = useCallback(async () => {
    if (!eventId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('event_forms')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      setForms(data || []);
    } catch (error: any) {
      console.error('Error fetching forms:', error);
      toast.error('Failed to load forms');
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  const saveForm = async (form: Partial<EventForm>) => {
    if (!eventId) return null;
    setIsSaving(true);
    try {
      // Prepare payload
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
      await fetchForms();
      return result.data;
    } catch (error: any) {
      console.error('Error saving form:', error);
      toast.error(error.message || 'Failed to save form');
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteForm = async (id: string) => {
    try {
      const { error } = await supabase.from('event_forms').delete().eq('id', id);
      if (error) throw error;
      
      setForms(prev => prev.filter(f => f.id !== id));
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
    fetchForms,
    saveForm,
    deleteForm
  };
}
