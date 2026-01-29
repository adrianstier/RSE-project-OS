import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { AuthError } from '@supabase/supabase-js';

// ============================================
// TYPES
// ============================================

interface AuthCredentials {
  email: string;
  password: string;
}

interface AuthResult {
  success: boolean;
  error: AuthError | null;
}

// ============================================
// SIGN IN HOOK
// ============================================

export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password }: AuthCredentials): Promise<AuthResult> => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error };
      }

      return { success: true, error: null };
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate all queries to refetch with new auth state
        queryClient.invalidateQueries();
      }
    },
  });
}

// ============================================
// SIGN UP HOOK
// ============================================

interface SignUpOptions extends AuthCredentials {
  metadata?: {
    name?: string;
    [key: string]: unknown;
  };
}

export function useSignUp() {
  return useMutation({
    mutationFn: async ({ email, password, metadata }: SignUpOptions): Promise<AuthResult> => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        return { success: false, error };
      }

      return { success: true, error: null };
    },
  });
}

// ============================================
// SIGN OUT HOOK
// ============================================

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<AuthResult> => {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return { success: false, error };
      }

      return { success: true, error: null };
    },
    onSuccess: (result) => {
      if (result.success) {
        // Clear all cached queries on sign out
        queryClient.clear();
      }
    },
  });
}

// ============================================
// RESET PASSWORD HOOK
// ============================================

interface ResetPasswordOptions {
  email: string;
  redirectTo?: string;
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async ({ email, redirectTo }: ResetPasswordOptions): Promise<AuthResult> => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo || `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { success: false, error };
      }

      return { success: true, error: null };
    },
  });
}

// ============================================
// UPDATE PASSWORD HOOK (for reset flow)
// ============================================

export function useUpdatePassword() {
  return useMutation({
    mutationFn: async (newPassword: string): Promise<AuthResult> => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error };
      }

      return { success: true, error: null };
    },
  });
}

// ============================================
// OAUTH SIGN IN HOOK
// ============================================

type OAuthProvider = 'google' | 'github' | 'gitlab' | 'azure';

export function useOAuthSignIn() {
  return useMutation({
    mutationFn: async (provider: OAuthProvider): Promise<AuthResult> => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        return { success: false, error };
      }

      return { success: true, error: null };
    },
  });
}
