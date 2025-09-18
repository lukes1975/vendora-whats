import { useAuth as useAuthContext } from '@/contexts/AuthContext';

/**
 * Custom hook that wraps the AuthContext
 * Provides authentication state and methods
 */
export const useAuth = () => {
  return useAuthContext();
};

/**
 * Hook to check if user is authenticated
 */
export const useIsAuthenticated = () => {
  const { user, loading } = useAuthContext();
  return { isAuthenticated: !!user && !loading, loading };
};

/**
 * Hook to check user role
 */
export const useUserRole = () => {
  const { userProfile, isSeller, isCustomer, isRider } = useAuthContext();
  
  return {
    role: userProfile?.role,
    isSeller: isSeller(),
    isCustomer: isCustomer(),
    isRider: isRider()
  };
};

/**
 * Hook for authentication actions
 */
export const useAuthActions = () => {
  const { signIn, signUp, logout, resetPassword, changePassword } = useAuthContext();
  
  return {
    signIn,
    signUp,
    logout,
    resetPassword,
    changePassword
  };
};