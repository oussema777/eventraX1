import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { sanitizeError } from '../utils/errorHandler';
import { useI18n } from '../i18n/I18nContext';

export interface BusinessProfile {
  id: string;
  owner_profile_id: string;
  company_name: string;
  company_size?: string;
  description?: string;
  sectors?: string[];
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo_url?: string;
  cover_url?: string;
  is_public?: boolean;
  verification_status?: string;
  created_at?: string;
  updated_at?: string;
  // Relations
  business_offerings?: any[];
  business_documents?: any[];
}

async function fetchBusinessProfileData(userId: string): Promise<BusinessProfile | null> {
  const { data, error } = await supabase
    .from('business_profiles')
    .select(`
      *,
      business_offerings(*),
      business_documents(*)
    `)
    .eq('owner_profile_id', userId)
    .maybeSingle();

  if (error) throw error;

  return data;
}

export function useBusinessProfile() {
  const { user } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const queryKey = ['business-profile', user?.id];
  const [isSaving, setIsSaving] = useState(false);
  const savingRef = useRef(false);

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await fetchBusinessProfileData(user!.id);
      return result;
    },
    enabled: !!user,
    retry: 1,
  });

  const businessProfile = data ?? null;

  const updateBusinessProfile = async (updates: Partial<BusinessProfile>) => {
    if (!user || savingRef.current) return null;
    savingRef.current = true;
    setIsSaving(true);
    try {
      const payload = {
        ...updates,
        owner_profile_id: user.id,
        updated_at: new Date().toISOString()
      };

      const current = queryClient.getQueryData<BusinessProfile>(queryKey);
      let result;
      if (current?.id) {
        result = await supabase
          .from('business_profiles')
          .update(payload)
          .eq('id', current.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('business_profiles')
          .insert([payload])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      queryClient.setQueryData(queryKey, { ...current, ...result.data });
      return result.data;
    } catch (error: any) {
      console.error('Error updating business profile:', error);
      toast.error(sanitizeError(error, t('businessFlows.saveFailed')));
      return null;
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  const uploadDocument = async (file: File, type: string = 'legal', businessIdOverride?: string) => {
    const targetId = businessIdOverride || businessProfile?.id;
    if (!targetId) return null;
    setIsSaving(true);
    try {
      const { uploadFile } = await import('../utils/storage');
      const path = `${targetId}/docs/${file.name}`;
      const url = await uploadFile('business-docs', path, file, 'businessDocument');
      if (!url) throw new Error('Upload failed');

      const { data, error } = await supabase.from('business_documents').insert([{
        business_id: targetId,
        name: file.name,
        file_url: url,
        type
      }]).select().single();

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey });
      return data;
    } catch (error: any) {
      toast.error(sanitizeError(error, t('businessFlows.uploadFailed')));
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteDocument = async (docId: string) => {
    try {
      const { error } = await supabase.from('business_documents').delete().eq('id', docId);
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey });
    } catch (error: any) {
      toast.error(t('businessFlows.deleteFailed'));
    }
  };

  return {
    businessProfile,
    error,
    isLoading,
    isFetching,
    isSaving,
    fetchBusinessProfile: refetch,
    updateBusinessProfile,
    uploadDocument,
    deleteDocument
  };
}
