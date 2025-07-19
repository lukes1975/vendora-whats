import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    // Get initial session and handle it properly
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        
        if (mounted) {
          console.log('Initial session:', session);
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to get initial session:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes - CRITICAL: Do not make this callback async
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      console.log('Auth state change:', event, session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Defer the welcome email to avoid blocking auth state updates
      if (event === 'SIGNED_IN' && session?.user) {
        setTimeout(async () => {
          try {
            const { error } = await supabase.functions.invoke('send-welcome-email');
            if (error) {
              console.error('Welcome email error:', error);
            }
          } catch (error) {
            console.error('Failed to send welcome email:', error);
          }
        }, 0);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('Signing in user:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Sign in error:', error);
      // Return user-friendly error messages
      if (error.message === 'Invalid login credentials') {
        return { error: { ...error, message: 'Invalid email or password. Please check your credentials and try again.' } };
      }
      if (error.message === 'Email not confirmed') {
        return { error: { ...error, message: 'Please verify your email address before signing in. Check your inbox for a confirmation email.' } };
      }
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    console.log('Signing up user:', email, 'with name:', fullName);
    
    const { data, error } = await supabase.auth.signUp({
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
      console.error('Sign up error:', error);
      // Return user-friendly error messages
      if (error.message === 'User already registered') {
        return { error: { ...error, message: 'An account with this email already exists. Please sign in instead.' } };
      }
      if (error.message.includes('Password should be')) {
        return { error: { ...error, message: 'Password must be at least 6 characters long.' } };
      }
    } else {
      console.log('Sign up successful');
    }
    
    return { error };
  };

  const signInWithGoogle = async () => {
    console.log('Signing in with Google');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) console.error('Google sign in error:', error);
    return { error };
  };

  const signOut = async () => {
    console.log('Signing out user');
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
