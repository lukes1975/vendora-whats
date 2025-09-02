import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client.js';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
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
      
      // Welcome emails are now sent via the onboarding flow after email confirmation
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
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

  const signUp = async (email, password, fullName) => {
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
