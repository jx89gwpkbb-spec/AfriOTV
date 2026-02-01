'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useFirestore } from '@/firebase/provider';
import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { Content } from '@/lib/types';

interface ContentContextType {
  content: Content[];
  isLoading: boolean;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider = ({ children }: { children: React.ReactNode }) => {
  const firestore = useFirestore();

  const contentCollectionRef = useMemo(() => {
    if (!firestore) return null;
    // Query to order content by creation date, newest first
    return query(collection(firestore, 'content'), orderBy('createdAt', 'desc'));
  }, [firestore]);
  
  const { data: contentItems, isLoading } = useCollection<Content>(contentCollectionRef);

  const content = useMemo(() => contentItems || [], [contentItems]);
  
  return (
    <ContentContext.Provider value={{ content, isLoading }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
