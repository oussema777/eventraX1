import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { clearEventWizardState } from '../utils/eventStorage';
import { DEFAULT_BRANDING_SETTINGS } from '../utils/wizardConstants';

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
  is_approved?: boolean;
  moderation_status?: 'pending' | 'approved' | 'rejected';
  owner_id?: string;
  seo_title?: string;
  seo_description?: string;
  seo_slug?: string;
  seo_keywords?: string[];
  access_code?: string | null;
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

  // 1. Determine which ID to use (URL Params > Props)
  // Removed localStorage fallback to prevent loading stale event IDs from previous sessions
  const effectiveId = urlEventId || initialEventId;

  useEffect(() => {
    if (effectiveId && effectiveId !== 'new') {
      loadEvent(effectiveId);
    } else {
      // If it's "new" or no ID, reset the data state but don't clear all storage yet
      setEventData({
        name: '',
        status: 'draft',
        event_format: 'in-person',
        event_status: 'free'
      });
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
      } else {
        console.warn('Event ID not found in DB:', id);
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

      const payload: any = {
        name: safeName,
        ...data,
      };

      // Safety: for existing event updates that are NOT a publish action,
      // never send approval fields — prevents accidental approval reset
      const isPublishAction = data.status === 'published';
      if (!isNew && !isPublishAction) {
        delete payload.is_approved;
        delete payload.moderation_status;
        delete payload.is_public;
      }

      // For new events, initialize with default branding (includes default Hero block)
      if (isNew && !payload.branding_settings && !eventData.branding_settings) {
        payload.branding_settings = DEFAULT_BRANDING_SETTINGS;
      }

      // Only set owner_id if it's a NEW event
      if (isNew || (!eventData.id && !localStorage.getItem('currentEventId'))) {
        payload.owner_id = user.id;
      }

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
      const currentId = !isNew ? (eventData.id || effectiveId) : null;
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
  }, [eventData.id, eventData.name, effectiveId]);

  const resetWizard = () => {
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
