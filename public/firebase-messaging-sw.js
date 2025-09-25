/* Firebase Cloud Messaging Service Worker */
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// NOTE: Service workers can't read Vite env at runtime. Do NOT hardcode secrets here.
// Replace the placeholders below at build or deployment time (CI, hosting platform) with real values
// For Netlify/Vercel/GH Actions you can template this file or write a small build step that
// injects the values from environment variables into the output service worker.
const firebaseConfig = {
  apiKey: "<YOUR_FIREBASE_API_KEY>",
  projectId: "<YOUR_FIREBASE_PROJECT_ID>",
  messagingSenderId: "<YOUR_FIREBASE_MESSAGING_SENDER_ID>",
  appId: "<YOUR_FIREBASE_APP_ID>"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title || 'Vendora Notification';
  const notificationOptions = {
    body: payload.notification.body || '',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: payload.collapseKey || 'default',
    data: payload.data || {}
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});
