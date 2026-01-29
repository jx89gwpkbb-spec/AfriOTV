"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

interface WatchlistContextType {
  watchlist: string[];
  addToWatchlist: (id: string) => void;
  removeFromWatchlist: (id: string) => void;
  isInWatchlist: (id: string) => boolean;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const WatchlistProvider = ({ children }: { children: React.ReactNode }) => {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedWatchlist = localStorage.getItem('afriotv-watchlist');
      if (storedWatchlist) {
        setWatchlist(JSON.parse(storedWatchlist));
      }
    } catch (error) {
      console.error("Could not load watchlist from local storage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('afriotv-watchlist', JSON.stringify(watchlist));
    } catch (error) {
      console.error("Could not save watchlist to local storage", error);
    }
  }, [watchlist]);

  const addToWatchlist = (id: string) => {
    setWatchlist((prev) => {
      if (prev.includes(id)) return prev;
      toast({ title: "Added to Watchlist", description: "You can find it on your watchlist page." });
      return [...prev, id];
    });
  };

  const removeFromWatchlist = (id:string) => {
    setWatchlist((prev) => {
      if (!prev.includes(id)) return prev;
      toast({ title: "Removed from Watchlist" });
      return prev.filter((item) => item !== id);
    });
  };

  const isInWatchlist = (id: string) => {
    return watchlist.includes(id);
  };

  return (
    <WatchlistContext.Provider value={{ watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist }}>
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
