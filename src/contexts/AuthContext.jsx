import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/services/firebase';
import * as authService from '@/services/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await authService.getUserProfile(firebaseUser.uid);
        setUser(firebaseUser);
        setUserProfile(profile);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = (email, password) => authService.signIn(email, password);
  const signUp = (email, password, userData) => authService.signUp(email, password, userData);
  const logout = () => authService.logout();

  const value = { user, userProfile, loading, error, signIn, signUp, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
