import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getMessaging, isSupported } from 'firebase/messaging';

// Read Firebase config from Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize messaging (for push notifications)
let messaging = null;
isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
  }
});

export { messaging };

// Helper to detect emulator usage via env var or default DEV
const shouldUseEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true' || import.meta.env.DEV;

if (shouldUseEmulators) {
  try {
    // Connect to emulators with safe calls; avoid relying on private SDK internals
    connectAuthEmulator(auth, import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_URL || 'http://localhost:9099');
    connectFirestoreEmulator(db, import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_HOST || 'localhost', Number(import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_PORT || 8080));
    connectStorageEmulator(storage, import.meta.env.VITE_FIREBASE_STORAGE_EMULATOR_HOST || 'localhost', Number(import.meta.env.VITE_FIREBASE_STORAGE_EMULATOR_PORT || 9199));
  } catch (error) {
    // Emulator connectivity is non-fatal for local dev, log for visibility
    // eslint-disable-next-line no-console
    console.warn('Emulator connection warning:', error);
  }
}

export const isUsingEmulator = shouldUseEmulators;

export default app;