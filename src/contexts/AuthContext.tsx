import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import type { Profile } from '../types/profile';

const PROFILE_COLUMNS = 'id, email, full_name, avatar_url, role, plan, language, job_title, company, location, bio, phone, website, linkedin_url, professional_data, b2b_profile, industry, interests, sector, company_description, social_url, created_at, updated_at';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  accountType: 'user' | 'event_guest';
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const buildFallbackProfile = (authUser: User) => ({
    id: authUser.id,
    email: authUser.email,
    full_name:
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      authUser.email?.split('@')[0] ||
      'New User'
  });

  const fetchProfile = async (authUser: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(PROFILE_COLUMNS)
        .eq('id', authUser.id)
        .maybeSingle();

      if (!error && data) {
        setProfile(data as Profile);
      } else {
        const fallbackProfile = buildFallbackProfile(authUser);
        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .upsert(
            {
              ...fallbackProfile,
              updated_at: new Date().toISOString()
            },
            { onConflict: 'id' }
          )
          .select()
          .single();

        if (!createError && createdProfile) {
          setProfile(createdProfile as Profile);
        } else {
          setProfile(fallbackProfile as Profile);
        }
      }
    } catch (error) {
      console.error('AuthContext: Profile error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (event === 'TOKEN_REFRESHED') return;

      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user);
  }, [user]);

  const accountType = ((session?.user ?? user)?.app_metadata?.account_type ?? 'user') as 'user' | 'event_guest';

  const value = useMemo(() => ({
    user, session, profile, isLoading, accountType, signOut, refreshProfile
  }), [user, session, profile, isLoading, accountType, signOut, refreshProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
