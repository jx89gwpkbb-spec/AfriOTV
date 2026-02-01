'use client';
import {
  createContext,
  useContext,
  ReactNode,
  useMemo,
} from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { Storage } from 'firebase/storage';
import { getFirebase } from '@/firebase';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface FirebaseContextValue {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  storage: Storage;
}

const FirebaseContext = createContext<FirebaseContextValue | undefined>(
  undefined
);

export const FirebaseProvider = ({ children }: { children: ReactNode }) => {
  const { app, auth, firestore, storage } = getFirebase();

  const contextValue = useMemo(
    () => ({
      app,
      auth,
      firestore,
      storage,
    }),
    [app, auth, firestore, storage]
  );

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
      <FirebaseErrorListener />
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const useFirebaseApp = () => useFirebase().app;
export const useAuth = () => useFirebase().auth;
export const useFirestore = () => useFirebase().firestore;
export const useStorage = () => useFirebase().storage;
