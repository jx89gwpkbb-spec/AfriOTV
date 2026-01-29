'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, doc, DocumentReference, DocumentData } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export const useDoc = <T extends DocumentData>(ref: DocumentReference<T> | null) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!ref) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        setData(snapshot.exists() ? snapshot.data() : null);
        setIsLoading(false);
      },
      async (err) => {
        const permissionError = new FirestorePermissionError({
          path: ref.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error(err);
        setData(null);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [ref]);

  return { data, isLoading };
};
