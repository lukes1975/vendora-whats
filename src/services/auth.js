import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

/**
 * User roles for Vendora platform
 */
export const USER_ROLES = {
  CUSTOMER: 'customer',
  SELLER: 'seller',
  RIDER: 'rider',
  ADMIN: 'admin'
};

/**
 * Sign in user with email and password
 */
export const signIn = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    
    // Get user profile data
    const userProfile = await getUserProfile(result.user.uid);
    
    return {
      user: result.user,
      profile: userProfile
    };
  } catch (error) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Sign up new user with email and password
 */
export const signUp = async (email, password, userData = {}) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update display name if provided
    if (userData.displayName) {
      await updateProfile(result.user, {
        displayName: userData.displayName
      });
    }
    
    // Create user profile in Firestore
    const profileData = {
      email: result.user.email,
      displayName: userData.displayName || '',
      role: userData.role || USER_ROLES.CUSTOMER,
      businessName: userData.businessName || '',
      phone: userData.phone || '',
      address: userData.address || {},
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      emailVerified: result.user.emailVerified
    };
    
    await setDoc(doc(db, 'users', result.user.uid), profileData);
    
    return {
      user: result.user,
      profile: profileData
    };
  } catch (error) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Sign out current user
 */
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error('Failed to sign out');
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Update user password
 */
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');
    
    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // Update password
    await updatePassword(user, newPassword);
  } catch (error) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Get user profile from Firestore
 */
export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

/**
 * Update user profile in Firestore
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };
    
    await updateDoc(doc(db, 'users', userId), updateData);
    return updateData;
  } catch (error) {
    throw new Error('Failed to update profile');
  }
};

/**
 * Check if user has specific role
 */
export const hasRole = (userProfile, role) => {
  return userProfile && userProfile.role === role;
};

/**
 * Check if user is seller
 */
export const isSeller = (userProfile) => {
  return hasRole(userProfile, USER_ROLES.SELLER);
};

/**
 * Check if user is customer
 */
export const isCustomer = (userProfile) => {
  return hasRole(userProfile, USER_ROLES.CUSTOMER);
};

/**
 * Check if user is rider
 */
export const isRider = (userProfile) => {
  return hasRole(userProfile, USER_ROLES.RIDER);
};

/**
 * Get friendly error messages
 */
const getAuthErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/invalid-credential':
      return 'Invalid email or password';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later';
    default:
      return 'An error occurred during authentication';
  }
};