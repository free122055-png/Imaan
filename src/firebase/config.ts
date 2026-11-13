import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import appletConfig from '../../firebase-applet-config.json';

// Use the officially provisioned Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || appletConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || appletConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || appletConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || appletConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || appletConfig.appId,
};

export const isRealFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('Dummy')
);

let app: FirebaseApp;
let auth: Auth | null = null;
let db: Firestore | null = null;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  // Pass databaseId if provided
  if (appletConfig.firestoreDatabaseId && appletConfig.firestoreDatabaseId !== '(default)') {
    db = getFirestore(app, appletConfig.firestoreDatabaseId);
  } else {
    db = getFirestore(app);
  }

  // Set browser local persistence
  if (typeof window !== 'undefined' && auth) {
    setPersistence(auth, browserLocalPersistence).catch(err => {
      console.warn('Firebase persistence setting warning:', err);
    });
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export { app, auth, db };
export default firebaseConfig;
