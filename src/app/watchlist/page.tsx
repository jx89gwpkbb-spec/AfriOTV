"use client";

import { useWatchlist } from '@/contexts/WatchlistContext';
import { contentData } from '@/lib/data';
import { ContentGrid } from '@/components/shared/ContentGrid';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function WatchlistPage() {
  const { watchlist } = useWatchlist();
  const watchlistItems = contentData.filter(item => watchlist.includes(item.id));

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-headline text-4xl md:text-5xl font-bold mb-8">My Watchlist</h1>
      {watchlistItems.length > 0 ? (
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
