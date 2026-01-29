import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// Provides a single instance of the Firebase app.
let firebaseApp: FirebaseApp;
const initializeFirebase = () => {
  if (getApps().length === 0) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApp();
  }
  return firebaseApp;
};

// Provides a single instance of the Firebase app, auth, and firestore.
let auth: Auth;
let firestore: Firestore;
export const getFirebase = () => {
  const app = initializeFirebase();

  if (!auth) {
    auth = getAuth(app);
  }
  if (!firestore) {
    firestore = getFirestore(app);
  }

  return { app, auth, firestore };
};

export {
  useUser,
  type User,
  type UserProfile,
  type Claims,
} from '@/firebase/auth/use-user';
export { FirebaseProvider, useFirebase, useFirebaseApp, useAuth, useFirestore } from '@/firebase/provider';
export { FirebaseClientProvider } from '@/firebase/client-provider';
export { useCollection } from '@/firebase/firestore/use-collection';
export { useDoc } from '@/firebase/firestore/use-doc';
export { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
export { errorEmitter } from '@/firebase/error-emitter';
export { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
