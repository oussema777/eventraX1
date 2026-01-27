import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';

export interface Education {
  id: string;
  profile_id: string;
  degree: string;
  institution: string;
  years: string;
}

export interface Certification {
  id: string;
  profile_id: string;
  name: string;
  organization: string;
  year: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: string;
  location?: string;
  timezone?: string;
  bio?: string;
  job_title?: string;
  company?: string;
  department?: string;
  industry?: string;
  years_experience?: number;
  company_size?: string;
  linkedin_url?: string;
  twitter_url?: string;
  website_url?: string;
  linkedin_connected?: boolean;
  twitter_connected?: boolean;
  has_pro?: boolean;
  events_attended?: number;
  b2b_meetings?: number;
  connections_made?: number;
  profile_views?: number;
  professional_data?: any;
  b2b_profile?: any;
  app_preferences?: any;
  role?: 'admin' | 'user' | 'business' | string;
  created_at?: string;
  profile_education?: Education[];
  profile_certifications?: Certification[];
}

export function useProfile(targetUserId?: string) {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const extractMissingColumn = (error: any) => {
    if (!error) return '';
    const message = String(error.message || '');
    const match = message.match(/'([^']+)' column/i);
    return match ? match[1] : '';
  };

  const stripUnsupportedColumn = (payload: Record<string, any>, error: any) => {
    const column = extractMissingColumn(error);
    if (!column || !(column in payload)) return payload;
    const { [column]: _removed, ...rest } = payload;
    return rest;
  };

  const fetchProfile = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Main Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profileData && currentUser?.id === userId) {
        try {
          await supabase
            .from('profiles')
            .upsert(
              {
                id: currentUser.id,
                email: currentUser.email,
                full_name:
                  currentUser.user_metadata?.full_name ||
                  currentUser.user_metadata?.name ||
                  currentUser.email?.split('@')[0] ||
                  'New User'
              },
              { onConflict: 'id' }
            );
          const created = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
          if (!created.error && created.data) {
            await fetchProfile(userId);
            return;
          }
        } catch (_error) {
          // ignore - profile creation may be blocked by RLS or missing table.
        }
      }

      // 2. Education
      const { data: eduData } = await supabase
        .from('profile_education')
        .select('*')
        .eq('profile_id', userId);

      // 3. Certs
      const { data: certData } = await supabase
        .from('profile_certifications')
        .select('*')
        .eq('profile_id', userId);

      setProfile({
        ...profileData,
        profile_education: eduData || [],
        profile_certifications: certData || []
      });

    } catch (err: any) {
      console.error('useProfile: Fetch error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const idToFetch = targetUserId || currentUser?.id;
    if (idToFetch) {
      fetchProfile(idToFetch);
    } else if (!targetUserId && !currentUser) {
      setIsLoading(false);
    }
  }, [targetUserId, currentUser]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    try {
      let payload: Record<string, any> = {
        id: currentUser.id,
        email: currentUser.email,
        ...updates,
        updated_at: new Date().toISOString()
      };

      for (let attempt = 0; attempt < 10; attempt += 1) {
        const { data, error } = await supabase
          .from('profiles')
          .upsert(payload)
          .select()
          .maybeSingle();

        if (!error) {
          if (data) {
            setProfile((prev) => (prev ? { ...prev, ...data } : data));
          }
          return data;
        }

        if (error.code === 'PGRST204') {
          const trimmed = stripUnsupportedColumn(payload, error);
          if (trimmed === payload) throw error;
          payload = trimmed;
          continue;
        }

        throw error;
      }

      throw new Error('Profile update failed');
    } catch (err: any) {
      console.error('useProfile: Update error:', err);
      throw err;
    }
  };

  const addEducation = async (edu: Omit<Education, 'id' | 'profile_id'>) => {
    if (!currentUser) return;
    const { error } = await supabase.from('profile_education').insert([{ ...edu, profile_id: currentUser.id }]);
    if (error) throw error;
    await fetchProfile(currentUser.id);
  };

  const updateEducation = async (id: string, updates: Partial<Education>) => {
    const { error } = await supabase
      .from('profile_education')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    if (currentUser) await fetchProfile(currentUser.id);
  };

  const deleteEducation = async (id: string) => {
    const { error } = await supabase.from('profile_education').delete().eq('id', id);
    if (error) throw error;
    if (currentUser) await fetchProfile(currentUser.id);
  };

  const addCertification = async (cert: Omit<Certification, 'id' | 'profile_id'>) => {
    if (!currentUser) return;
    const { error } = await supabase.from('profile_certifications').insert([{ ...cert, profile_id: currentUser.id }]);
    if (error) throw error;
    await fetchProfile(currentUser.id);
  };

  const updateCertification = async (id: string, updates: Partial<Certification>) => {
    const { error } = await supabase
      .from('profile_certifications')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    if (currentUser) await fetchProfile(currentUser.id);
  };

  const deleteCertification = async (id: string) => {
    const { error } = await supabase.from('profile_certifications').delete().eq('id', id);
    if (error) throw error;
    if (currentUser) await fetchProfile(currentUser.id);
  };

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    addEducation,
    updateEducation,
    deleteEducation,
    addCertification,
    updateCertification,
    deleteCertification,
    refetch: () => {
      const id = targetUserId || currentUser?.id;
      if (id) fetchProfile(id);
    }
  };
}
