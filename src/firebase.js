import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasConfig = Boolean(import.meta.env.VITE_FIREBASE_API_KEY);
export const app     = hasConfig ? initializeApp(firebaseConfig) : null;
export const auth    = hasConfig ? getAuth(app)        : null;
export const db      = hasConfig ? getFirestore(app)   : null;
export const storage = hasConfig ? getStorage(app)     : null;
