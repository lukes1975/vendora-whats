import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getMessaging, isSupported } from 'firebase/messaging';

// Helper: normalize env values (strip quotes/commas)
const _norm = (v) => {
  if (v === undefined || v === null) return v;
  let s = String(v).trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  if (s.endsWith(',')) s = s.slice(0, -1).trim();
  return s;
};

const firebaseConfig = {
  apiKey: _norm(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: _norm(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: _norm(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: _norm(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: _norm(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: _norm(import.meta.env.VITE_FIREBASE_APP_ID),
  measurementId: _norm(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID),
};

if (!firebaseConfig.apiKey || !firebaseConfig.authDomain) {
  console.error('Missing Firebase env vars. Check .env file.');
  throw new Error('Missing required Firebase config.');
}

const app = initializeApp(firebaseConfig);

// Core services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Use emulators if explicitly enabled
const shouldUseEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';

if (shouldUseEmulators) {
  try {
    connectAuthEmulator(auth, import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_URL || 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_HOST || 'localhost', Number(import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_PORT || 8080));
    connectStorageEmulator(storage, import.meta.env.VITE_FIREBASE_STORAGE_EMULATOR_HOST || 'localhost', Number(import.meta.env.VITE_FIREBASE_STORAGE_EMULATOR_PORT || 9199));
    console.log('✅ Connected to Firebase Emulators');
  } catch (error) {
    console.warn('Emulator connection failed:', error);
  }
}

// Messaging
let messaging = null;
isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
  }
});

export { messaging, shouldUseEmulators as isUsingEmulator };
export default app;
