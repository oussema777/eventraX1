import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner@2.0.3';
import { clearEventWizardState } from '../utils/eventStorage';

export interface EventDraft {
  id?: string;
  name: string;
  tagline?: string;
  description?: string;
  event_type?: string;
  event_status?: string; 
  event_format?: string; 
  start_date?: string;
  end_date?: string;
  timezone?: string;
  location_address?: string;
  capacity_limit?: number;
  waitlist_enabled?: boolean;
  cover_image_url?: string;
  primary_color?: string;
  secondary_color?: string;
  branding_settings?: any;
  attendee_settings?: any;
  status: 'draft' | 'published' | 'archived' | 'completed' | 'cancelled';
  is_public?: boolean;
  owner_id?: string;
}

export function useEventWizard(initialEventId?: string) {
  const { eventId: urlEventId } = useParams();
  const [eventData, setEventData] = useState<EventDraft>({
    name: '',
    status: 'draft',
    event_format: 'in-person',
    event_status: 'free'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // 1. Determine which ID to use (URL Params > Props > LocalStorage)
  const effectiveId = urlEventId || initialEventId || localStorage.getItem('currentEventId');

  useEffect(() => {
    if (effectiveId && effectiveId !== 'new') {
      loadEvent(effectiveId);
    } else {
      setIsLoading(false);
    }
  }, [effectiveId]);

  const loadEvent = async (id: string) => {
    if (id === 'new') {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setEventData(data);
        localStorage.setItem('currentEventId', data.id);
      } else {
        console.warn('Event ID found in storage but not DB. Clearing stale ID:', id);
        localStorage.removeItem('currentEventId');
      }
    } catch (err: any) {
      console.error('Error loading event:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveDraft = useCallback(async (data: Partial<EventDraft>, isNew: boolean = false) => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const normalizeName = (value?: string | null) => (value || '').trim();
      const safeName = normalizeName(data.name) || normalizeName(eventData.name) || 'Untitled Event';

      // Ensure Profile Exists (Safety check)
      const ensureOwnerRecord = async () => {
        try {
          await supabase.from('profiles').upsert({ id: user.id, email: user.email }, { onConflict: 'id' });
        } catch (_e) { /* ignore */ }
      };

      const payload = {
        name: safeName,
        ...data,
        owner_id: user.id,
      };

      const trySave = async (payloadToSave: any, existingId: string | null) => {
        let result;
        if (existingId) {
          result = await supabase
            .from('events')
            .update(payloadToSave)
            .eq('id', existingId)
            .select()
            .single();
        } else {
          await ensureOwnerRecord();
          result = await supabase
            .from('events')
            .insert([payloadToSave])
            .select()
            .single();
        }
        return result;
      };

      // Attempt Save with Retry Logic for missing columns or constraints
      let result;
      const currentId = !isNew ? (eventData.id || localStorage.getItem('currentEventId')) : null;
      let safePayload = { ...payload };
      
      for (let attempt = 0; attempt < 3; attempt += 1) {
        result = await trySave(safePayload, currentId);
        if (!result.error) break;
        
        // Handle specific error: Missing owner (create profile)
        if (result.error.code === '23503') {
           await ensureOwnerRecord();
           continue;
        }
        break;
      }

      if (result.error) throw result.error;
      
      if (result.data) {
        setEventData(result.data);
        localStorage.setItem('currentEventId', result.data.id);
        setLastSaved(new Date());
      }
      return result.data;
    } catch (err: any) {
      console.error('Save failed:', err);
      toast.error('Failed to save event changes');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [eventData.id, eventData.name]);

  const resetWizard = () => {
    localStorage.removeItem('currentEventId');
    clearEventWizardState();
    setEventData({ 
      name: '', 
      status: 'draft',
      event_format: 'in-person',
      event_status: 'free'
    } as any);
  };

  return {
    eventData,
    saveDraft,
    isSaving,
    isLoading,
    lastSaved,
    resetWizard
  };
}
