import { useState, useEffect, useCallback } from 'react';
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

export function useBusinessProfile() {
  const { user } = useAuth();
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [useLocalOnly, setUseLocalOnly] = useState(false);

  const fetchBusinessProfile = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      if (useLocalOnly) {
        const raw = window.localStorage.getItem(`eventra_business_profile_${user.id}`);
        if (raw) {
          setBusinessProfile(JSON.parse(raw));
        }
        return;
      }
      const { data, error } = await supabase
        .from('business_profiles')
        .select(`
          *,
          business_offerings(*),
          business_documents(*)
        `)
        .eq('owner_profile_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        if (error.code === 'PGRST205') {
          setUseLocalOnly(true);
          const raw = window.localStorage.getItem(`eventra_business_profile_${user.id}`);
          if (raw) {
            setBusinessProfile(JSON.parse(raw));
          }
          return;
        }
        throw error;
      }

      setBusinessProfile(data);
    } catch (error: any) {
      console.error('Error fetching business profile:', error);
      toast.error('Failed to load business profile');
    } finally {
      setIsLoading(false);
    }
  }, [user, useLocalOnly]);

  useEffect(() => {
    fetchBusinessProfile();
  }, [fetchBusinessProfile]);

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
        setBusinessProfile(nextProfile);
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

      setBusinessProfile(prev => ({ ...prev, ...result.data }));
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
          setBusinessProfile(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              business_documents: [...(prev.business_documents || []), localDoc]
            };
          });
          const raw = window.localStorage.getItem(`eventra_business_profile_${user?.id}`);
          if (raw) {
            const parsed = JSON.parse(raw);
            parsed.business_documents = [...(parsed.business_documents || []), localDoc];
            window.localStorage.setItem(`eventra_business_profile_${user?.id}`, JSON.stringify(parsed));
          }
          return localDoc;
        }
        // Import dynamically or assume storage util is available. 
        // For hook purity, we'll use supabase direct or the util if imported.
        // Let's use the util pattern but inline simple storage logic or import it.
        // We will assume `uploadFile` is available or implement simple one.
        // Ideally we should import `uploadFile` from `../utils/storage`.
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
        
        // Update local state
        setBusinessProfile(prev => {
            if (!prev) return null;
            return {
                ...prev,
                business_documents: [...(prev.business_documents || []), data]
            };
        });
        
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
            setBusinessProfile(prev => {
              if (!prev) return null;
              const nextDocs = prev.business_documents?.filter(d => d.id !== docId) || [];
              const nextProfile = { ...prev, business_documents: nextDocs };
              if (user) {
                window.localStorage.setItem(`eventra_business_profile_${user.id}`, JSON.stringify(nextProfile));
              }
              return nextProfile;
            });
            return;
          }
          const { error } = await supabase.from('business_documents').delete().eq('id', docId);
          if (error) throw error;
          
          setBusinessProfile(prev => {
              if (!prev) return null;
              return {
                  ...prev,
                  business_documents: prev.business_documents?.filter(d => d.id !== docId) || []
              };
          });
      } catch (error: any) {
          toast.error('Failed to delete document');
      }
  };

  return {
    businessProfile,
    isLoading,
    isSaving,
    fetchBusinessProfile,
    updateBusinessProfile,
    uploadDocument,
    deleteDocument
  };
}
