
# Vendora - Simple JavaScript App with Firebase

A simple, clean JavaScript-only application built with React and Firebase.

## Features

- 🔥 Firebase Authentication
- 📱 Responsive Design
- ⚡ Fast and Lightweight
- 🎨 Modern UI with Tailwind CSS

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication with Email/Password
   - Enable Firestore Database
   - Enable Storage
   - Copy your Firebase config and update `src/config/firebase.js`

3. **Firebase Configuration**
   Replace the placeholder values in `src/config/firebase.js` with your actual Firebase config:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-actual-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id"
   };
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── components/
│   └── Header.jsx          # Navigation header
├── contexts/
│   └── AuthContext.jsx     # Firebase auth context
├── pages/
│   ├── Home.jsx           # Landing page
│   └── Dashboard.jsx      # User dashboard
├── config/
│   └── firebase.js        # Firebase configuration
└── App.jsx               # Main app component
```

## Technologies Used

- React 18
- Firebase 9+
- Tailwind CSS
- Vite
- React Router

## Next Steps

1. Update Firebase configuration with your project details
2. Customize the UI components in `src/components/`
3. Add more pages and features as needed
4. Deploy to your preferred hosting platform

## Firebase Security Rules

Don't forget to configure your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
