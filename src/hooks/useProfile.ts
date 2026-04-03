import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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

const PROFILE_COLUMNS = 'id, email, full_name, avatar_url, role, plan, language, job_title, company, location, bio, phone, website, linkedin_url, professional_data, b2b_profile, industry, interests, created_at, updated_at';
const EDUCATION_COLUMNS = 'id, profile_id, institution, degree, field_of_study, start_date, end_date, description';
const CERTIFICATION_COLUMNS = 'id, profile_id, name, issuer, issue_date, expiry_date, credential_url';

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

async function fetchProfileData(userId: string, currentUser: any): Promise<UserProfile | null> {
  // 1. Main Profile
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
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
        .select(PROFILE_COLUMNS)
        .eq('id', userId)
        .maybeSingle();
      if (!created.error && created.data) {
        // Recursively fetch with the created profile
        return fetchProfileData(userId, currentUser);
      }
    } catch (_error) {
      // ignore - profile creation may be blocked by RLS or missing table.
    }
  }

  // 2. Education & Certs in parallel
  const [eduRes, certRes] = await Promise.all([
    supabase.from('profile_education').select(EDUCATION_COLUMNS).eq('profile_id', userId),
    supabase.from('profile_certifications').select(CERTIFICATION_COLUMNS).eq('profile_id', userId)
  ]);

  return {
    ...profileData,
    profile_education: eduRes.data || [],
    profile_certifications: certRes.data || []
  };
}

export function useProfile(targetUserId?: string) {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const userId = targetUserId || currentUser?.id;
  const queryKey = ['profile', userId];

  const { data: profile = null, isLoading, error: queryError } = useQuery({
    queryKey,
    queryFn: () => fetchProfileData(userId!, currentUser),
    enabled: !!userId,
  });

  const error = queryError ? (queryError as Error).message : null;

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
          queryClient.invalidateQueries({ queryKey });
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
    queryClient.invalidateQueries({ queryKey });
  };

  const updateEducation = async (id: string, updates: Partial<Education>) => {
    const { error } = await supabase
      .from('profile_education')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey });
  };

  const deleteEducation = async (id: string) => {
    const { error } = await supabase.from('profile_education').delete().eq('id', id);
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey });
  };

  const addCertification = async (cert: Omit<Certification, 'id' | 'profile_id'>) => {
    if (!currentUser) return;
    const { error } = await supabase.from('profile_certifications').insert([{ ...cert, profile_id: currentUser.id }]);
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey });
  };

  const updateCertification = async (id: string, updates: Partial<Certification>) => {
    const { error } = await supabase
      .from('profile_certifications')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey });
  };

  const deleteCertification = async (id: string) => {
    const { error } = await supabase.from('profile_certifications').delete().eq('id', id);
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey });
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
    refetch: () => queryClient.invalidateQueries({ queryKey })
  };
}
