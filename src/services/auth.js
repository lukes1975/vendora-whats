import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// --- Sign in ---
export const signIn = async (email, password) => {
  await setPersistence(auth, browserLocalPersistence);
  const result = await signInWithEmailAndPassword(auth, email, password);

  let userProfile = await getUserProfile(result.user.uid);

  if (!userProfile) {
    // If no profile exists, create one with default role = customer
    const now = new Date().toISOString();
    userProfile = {
      email: result.user.email,
      displayName: result.user.displayName || '',
      role: 'customer', // default if not set
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(doc(db, 'users', result.user.uid), userProfile);
  } else {
    // Update last login timestamp
    await updateDoc(doc(db, 'users', result.user.uid), {
      updatedAt: new Date().toISOString(),
    });
  }

  return { user: result.user, profile: userProfile };
};

// --- Sign up ---
export const signUp = async (email, password, userData = {}) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);

  const now = new Date().toISOString();
  const profileData = {
    email: result.user.email,
    displayName: userData.displayName || '',
    role: userData.role || 'customer', // 👈 explicit role stored
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, 'users', result.user.uid), profileData);

  return { user: result.user, profile: profileData };
};

// --- Logout ---
export const logout = async () => {
  await signOut(auth);
};

// --- Get profile ---
export const getUserProfile = async (userId) => {
  const snap = await getDoc(doc(db, 'users', userId));
  return snap.exists() ? snap.data() : null;
};
