
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent } from '@/utils/security';

interface SecureAuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isSessionValid: boolean;
}

const SecureAuthContext = createContext<SecureAuthContextType | undefined>(undefined);

export const useSecureAuth = () => {
  const context = useContext(SecureAuthContext);
  if (context === undefined) {
    throw new Error('useSecureAuth must be used within a SecureAuthProvider');
  }
  return context;
};

export const SecureAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSessionValid, setIsSessionValid] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    // Get initial session and handle it properly
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          logSecurityEvent('Session retrieval error', error);
        }
        
        if (mounted) {
          setUser(session?.user ?? null);
          setIsSessionValid(!!session && !error);
          setLoading(false);
        }
      } catch (error) {
        logSecurityEvent('Failed to get initial session', error);
        if (mounted) {
          setUser(null);
          setIsSessionValid(false);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes with enhanced security logging
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      logSecurityEvent('Auth state change', { event, userId: session?.user?.id });
      
      setUser(session?.user ?? null);
      setIsSessionValid(!!session);
      setLoading(false);

      // Log security events
      if (event === 'SIGNED_IN') {
        logSecurityEvent('User signed in', { userId: session?.user?.id });
      } else if (event === 'SIGNED_OUT') {
        logSecurityEvent('User signed out');
      } else if (event === 'TOKEN_REFRESHED') {
        logSecurityEvent('Token refreshed', { userId: session?.user?.id });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        logSecurityEvent('Sign in failed', { email, error: error.message });
      }
      
      return { error };
    } catch (error) {
      logSecurityEvent('Sign in exception', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      
      if (error) {
        logSecurityEvent('Sign up failed', { email, error: error.message });
      }
      
      return { error };
    } catch (error) {
      logSecurityEvent('Sign up exception', error);
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      
      if (error) {
        logSecurityEvent('Google sign in failed', error.message);
      }
      
      return { error };
    } catch (error) {
      logSecurityEvent('Google sign in exception', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      logSecurityEvent('User signed out successfully');
    } catch (error) {
      logSecurityEvent('Sign out error', error);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    isSessionValid,
  };

  return <SecureAuthContext.Provider value={value}>{children}</SecureAuthContext.Provider>;
};
