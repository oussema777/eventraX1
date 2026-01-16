import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
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
      setIsLoading(true);
      try {
        await supabase
          .from('users')
          .upsert(
            {
              id: authUser.id,
              email: authUser.email
            },
            { onConflict: 'id' }
          );
      } catch (_error) {
        // Ignore if public users table is missing or blocked by RLS.
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (!error && data) {
        setProfile(data);
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
          setProfile(createdProfile);
        } else {
          setProfile(fallbackProfile);
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, isLoading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
