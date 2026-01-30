import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// ============================================
// TYPES
// ============================================

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

interface AuthContextValue extends AuthState {
  displayName: string | null;
  avatarUrl: string | null;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

// ============================================
// CONTEXT
// ============================================

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    initialized: false,
  });

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          // Session retrieval error (non-critical in most cases)
        }

        setState({
          user: session?.user ?? null,
          session: session ?? null,
          loading: false,
          initialized: true,
        });
      } catch {
        // Auth initialization error - proceed with unauthenticated state
        setState(prev => ({
          ...prev,
          loading: false,
          initialized: true,
        }));
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setState(prev => ({
          ...prev,
          user: session?.user ?? null,
          session: session ?? null,
          loading: false,
        }));
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ============================================
  // AUTH METHODS
  // ============================================

  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true }));

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setState(prev => ({ ...prev, loading: false }));
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true }));

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Redirect to the app after email confirmation
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    setState(prev => ({ ...prev, loading: false }));
    return { error };
  };

  const signOut = async () => {
    setState(prev => ({ ...prev, loading: true }));

    const { error } = await supabase.auth.signOut();

    setState(prev => ({ ...prev, loading: false }));
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    return { error };
  };

  // ============================================
  // CONTEXT VALUE
  // ============================================

  // Extract display name and avatar from OAuth metadata
  const metadata = state.user?.user_metadata;
  const displayName = metadata?.full_name || metadata?.name || null;
  const avatarUrl = metadata?.avatar_url || metadata?.picture || null;

  const value: AuthContextValue = {
    user: state.user,
    session: state.session,
    loading: state.loading,
    initialized: state.initialized,
    displayName,
    avatarUrl,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

// Export types for external use
export type { AuthState, AuthContextValue };
