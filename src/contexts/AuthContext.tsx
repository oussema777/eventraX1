import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { isAuthRetryableFetchError, type User, type Session } from '@supabase/supabase-js';
import type { Profile } from '../types/profile';

const PROFILE_COLUMNS = '*';

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

const buildFallbackProfile = (authUser: User) => ({
  id: authUser.id,
  email: authUser.email,
  full_name:
    authUser.user_metadata?.full_name ||
    authUser.user_metadata?.name ||
    authUser.email?.split('@')[0] ||
    'New User'
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (authUser: User) => {
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
  }, []);

  useEffect(() => {
    let generation = 0;
    let currentUserId: string | undefined;
    let retry: ReturnType<typeof setTimeout>;

    const applySession = (session: Session | null, refreshed = false) => {
      const sameUser = currentUserId === session?.user.id;
      currentUserId = session?.user.id;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        if (!refreshed || !sameUser) void fetchProfile(session.user);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    };

    // INITIAL_SESSION can be null when renewal is temporarily unavailable.
    // Confirm the result outside the SDK callback before redirecting to login.
    const confirmInitialSession = async (version: number) => {
      const { data, error } = await supabase.auth.getSession();
      if (version !== generation) return;
      if (isAuthRetryableFetchError(error)) {
        retry = setTimeout(() => void confirmInitialSession(version), 5000);
        return;
      }
      applySession(data.session);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const version = ++generation;
      clearTimeout(retry);
      if (event === 'INITIAL_SESSION' && !session) {
        retry = setTimeout(() => void confirmInitialSession(version), 0);
      } else {
        applySession(session, event === 'TOKEN_REFRESHED');
      }
    });

    return () => {
      generation++;
      clearTimeout(retry);
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user);
  }, [user, fetchProfile]);

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
