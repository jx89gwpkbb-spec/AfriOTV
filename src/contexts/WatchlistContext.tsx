"use client";

import React, { createContext, useContext, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useUser } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { collection, addDoc, deleteDoc, serverTimestamp, doc } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface WatchlistContextType {
  watchlist: string[];
  addToWatchlist: (id: string) => void;
  removeFromWatchlist: (id: string) => void;
  isInWatchlist: (id: string) => boolean;
  isLoading: boolean;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const WatchlistProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const watchlistCollectionRef = useMemo(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'watchlist');
  }, [user, firestore]);
  
  const { data: watchlistItems, isLoading } = useCollection<{contentId: string, id: string}>(watchlistCollectionRef);

  const watchlist = useMemo(() => watchlistItems?.map(item => item.contentId) || [], [watchlistItems]);
  
  const addToWatchlist = (id: string) => {
    if (!watchlistCollectionRef) {
        toast({
            variant: "destructive",
            title: "Please log in",
            description: "You need to be logged in to add items to your watchlist.",
        });
        return;
    }
    const data = {
        contentId: id,
        addedAt: serverTimestamp(),
    };
    addDoc(watchlistCollectionRef, data)
        .then(() => {
            toast({ title: "Added to Watchlist", description: "You can find it on your watchlist page." });
        })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: watchlistCollectionRef.path,
                operation: 'create',
                requestResourceData: data,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
  };

  const removeFromWatchlist = (id: string) => {
    if (!watchlistCollectionRef) return;
    const itemToRemove = watchlistItems?.find(item => item.contentId === id);
    if (!itemToRemove) return;

    const docRef = doc(watchlistCollectionRef, itemToRemove.id);
    deleteDoc(docRef)
        .then(() => {
            toast({ title: "Removed from Watchlist" });
        })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
        });
  };

  const isInWatchlist = (id: string) => {
    return watchlist.includes(id);
  };

  return (
    <WatchlistContext.Provider value={{ watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist, isLoading }}>
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};
