"use client";

import { useWatchlist } from '@/contexts/WatchlistContext';
import { contentData } from '@/lib/data';
import { ContentGrid } from '@/components/shared/ContentGrid';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

export default function WatchlistPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const { watchlist, isLoading: isWatchlistLoading } = useWatchlist();
  const watchlistItems = contentData.filter(item => watchlist.includes(item.id));

  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-20 bg-card rounded-lg border border-dashed">
          <h2 className="text-2xl font-semibold mb-2">Please log in</h2>
          <p className="text-muted-foreground mb-6">You need to be logged in to view your watchlist.</p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-headline text-4xl md:text-5xl font-bold mb-8">My Watchlist</h1>
      {isWatchlistLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : watchlistItems.length > 0 ? (
        <ContentGrid content={watchlistItems} />
      ) : (
        <div className="text-center py-20 bg-card rounded-lg border border-dashed">
          <h2 className="text-2xl font-semibold mb-2">Your watchlist is empty</h2>
          <p className="text-muted-foreground mb-6">Add movies and shows to your watchlist to see them here.</p>
          <Link href="/">
            <Button>Browse Content</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
