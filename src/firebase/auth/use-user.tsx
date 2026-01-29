'use client';

import { useEffect, useState, useMemo } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase/provider';
import { doc } from 'firebase/firestore';
import { useDoc } from '../firestore/use-doc';
import type { UserProfile } from '@/lib/types';

export type User = FirebaseUser;

export { type UserProfile } from '@/lib/types';

export const useUser = () => {
  const auth = useAuth();
  const firestore = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const userProfileRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  return { user, profile, isLoading: isLoading || isProfileLoading };
};
