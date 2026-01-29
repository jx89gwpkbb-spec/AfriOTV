'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, collection, Query, DocumentData, CollectionReference } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export const useCollection = <T extends DocumentData>(query: Query<T> | CollectionReference<T> | null) => {
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!query) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setData(data);
        setIsLoading(false);
      },
      async (err) => {
        const path = query instanceof CollectionReference ? query.path : 'unknown';
        const permissionError = new FirestorePermissionError({
          path: path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error(err);
        setData(null);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, isLoading };
};
