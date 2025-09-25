import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
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

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: _norm(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: _norm(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: _norm(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: _norm(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: _norm(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: _norm(import.meta.env.VITE_FIREBASE_APP_ID),
  measurementId: _norm(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID),
};

// Validate config
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain) {
  console.error('❌ Missing Firebase env vars. Check your .env file.');
  throw new Error('Missing required Firebase config.');
}

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Core services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable Firestore offline persistence
(async () => {
  try {
    await enableIndexedDbPersistence(db);
    console.log('✅ Firestore persistence enabled');
  } catch (err) {
    if (err.code === 'failed-precondition') {
      console.warn('⚠️ Persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('⚠️ This browser does not support persistence.');
    } else {
      console.warn('⚠️ Firestore persistence error:', err);
    }
  }
})();

// Setup messaging (for push notifications)
let messaging = null;
isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
    console.log('✅ Messaging enabled');
  } else {
    console.log('⚠️ Messaging not supported in this browser.');
  }
});

export { messaging };
export default app;
