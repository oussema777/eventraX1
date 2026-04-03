import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';

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

async function fetchBusinessProfileData(userId: string): Promise<{ profile: BusinessProfile | null; localOnly: boolean }> {
  const { data, error } = await supabase
    .from('business_profiles')
    .select(`
      *,
      business_offerings(*),
      business_documents(*)
    `)
    .eq('owner_profile_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    if (error.code === 'PGRST205') {
      const raw = window.localStorage.getItem(`eventra_business_profile_${userId}`);
      return { profile: raw ? JSON.parse(raw) : null, localOnly: true };
    }
    throw error;
  }

  return { profile: data, localOnly: false };
}

export function useBusinessProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['business-profile', user?.id];
  const [isSaving, setIsSaving] = useState(false);
  const [useLocalOnly, setUseLocalOnly] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await fetchBusinessProfileData(user!.id);
      if (result.localOnly) setUseLocalOnly(true);
      return result.profile;
    },
    enabled: !!user,
  });

  const businessProfile = data ?? null;

  const updateBusinessProfile = async (updates: Partial<BusinessProfile>) => {
    if (!user) return null;
    setIsSaving(true);
    try {
      const payload = {
        ...updates,
        owner_profile_id: user.id,
        updated_at: new Date().toISOString()
      };

      if (useLocalOnly) {
        const nextProfile = {
          ...(businessProfile || { id: `local-${Date.now()}`, owner_profile_id: user.id }),
          ...payload
        } as BusinessProfile;
        queryClient.setQueryData(queryKey, nextProfile);
        window.localStorage.setItem(`eventra_business_profile_${user.id}`, JSON.stringify(nextProfile));
        return nextProfile;
      }

      let result;
      if (businessProfile?.id) {
        result = await supabase
          .from('business_profiles')
          .update(payload)
          .eq('id', businessProfile.id)
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

      queryClient.invalidateQueries({ queryKey });
      return result.data;
    } catch (error: any) {
      console.error('Error updating business profile:', error);
      toast.error(error.message);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const uploadDocument = async (file: File, type: string = 'legal', businessIdOverride?: string) => {
    const targetId = businessIdOverride || businessProfile?.id;
    if (!targetId) return null;
    setIsSaving(true);
    try {
      if (useLocalOnly) {
        const url = URL.createObjectURL(file);
        const localDoc = {
          id: `local-doc-${Date.now()}`,
          business_id: targetId,
          name: file.name,
          file_url: url,
          type
        };
        queryClient.setQueryData(queryKey, (old: BusinessProfile | null) => {
          if (!old) return old;
          return { ...old, business_documents: [...(old.business_documents || []), localDoc] };
        });
        const raw = window.localStorage.getItem(`eventra_business_profile_${user?.id}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          parsed.business_documents = [...(parsed.business_documents || []), localDoc];
          window.localStorage.setItem(`eventra_business_profile_${user?.id}`, JSON.stringify(parsed));
        }
        return localDoc;
      }

      const { uploadFile } = await import('../utils/storage');
      const path = `${targetId}/docs/${file.name}`;
      const url = await uploadFile('business-docs', path, file);
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
      toast.error(error.message);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteDocument = async (docId: string) => {
    try {
      if (useLocalOnly) {
        queryClient.setQueryData(queryKey, (old: BusinessProfile | null) => {
          if (!old) return null;
          const nextDocs = old.business_documents?.filter(d => d.id !== docId) || [];
          const nextProfile = { ...old, business_documents: nextDocs };
          if (user) {
            window.localStorage.setItem(`eventra_business_profile_${user.id}`, JSON.stringify(nextProfile));
          }
          return nextProfile;
        });
        return;
      }
      const { error } = await supabase.from('business_documents').delete().eq('id', docId);
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey });
    } catch (error: any) {
      toast.error('Failed to delete document');
    }
  };

  return {
    businessProfile,
    isLoading,
    isSaving,
    fetchBusinessProfile: () => queryClient.invalidateQueries({ queryKey }),
    updateBusinessProfile,
    uploadDocument,
    deleteDocument
  };
}
