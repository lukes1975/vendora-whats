import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/services/firebase';
import * as authService from '@/services/auth';
import { initializeNotifications } from '@/services/notify';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setError(null);
        
        if (firebaseUser) {
          // Get user profile from Firestore
          const profile = await authService.getUserProfile(firebaseUser.uid);

          // If the user is a student and hasn't verified email, sign them out and set an error
          if (profile && profile.role === authService.USER_ROLES.STUDENT && !firebaseUser.emailVerified) {
            setUser(null);
            setUserProfile(null);
            setError('Email verification required for student accounts. Please verify your email.');
            // Optionally sign out from Firebase to clear session
            await authService.logout();
            setLoading(false);
            return;
          }

          setUser(firebaseUser);
          setUserProfile(profile);

          // Initialize push notifications
          await initializeNotifications(firebaseUser.uid);
        } else {
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Enhanced sign in with profile loading
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authService.signIn(email, password);
      
      // The onAuthStateChanged will handle setting user and profile
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Enhanced sign up with profile creation
  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authService.signUp(email, password, userData);
      
      // The onAuthStateChanged will handle setting user and profile
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Enhanced logout
  const logout = async () => {
    try {
      setError(null);
      await authService.logout();
      
      // Clear local state
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No authenticated user');
      
      setError(null);
      const updatedProfile = await authService.updateUserProfile(user.uid, updates);
      setUserProfile(prev => ({ ...prev, ...updatedProfile }));
      
      return updatedProfile;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Password reset
  const resetPassword = async (email) => {
    try {
      setError(null);
      await authService.resetPassword(email);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      await authService.changePassword(currentPassword, newPassword);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Resend verification email
  const resendVerification = async () => {
    try {
      setLoading(true);
      setError(null);
      await authService.resendVerification();
    } catch (error) {
      setError(error.message || 'Failed to resend verification');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Role checking helpers
  const isSeller = () => authService.isSeller(userProfile);
  const isCustomer = () => authService.isCustomer(userProfile);
  const isRider = () => authService.isRider(userProfile);
  const hasRole = (role) => authService.hasRole(userProfile, role);

  const value = {
    // Auth state
    user,
    userProfile,
    loading,
    error,
    
    // Auth methods
    signIn,
    signUp,
    logout,
    updateProfile,
    resetPassword,
    changePassword,
    
    // Role helpers
    isSeller,
    isCustomer,
    isRider,
    hasRole,
  // Verification helpers
  resendVerification,
    
    // User roles enum
    USER_ROLES: authService.USER_ROLES
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
