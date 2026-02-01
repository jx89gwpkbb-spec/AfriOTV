"use client";

import { useState, useEffect, useMemo } from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import { generateRecommendations } from '@/ai/flows/personalized-recommendations';
import { Button } from '@/components/ui/button';
import { ContentGrid } from '@/components/shared/ContentGrid';
import { useContent } from '@/contexts/ContentContext';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { useUser } from '@/firebase';
import type { Content } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function RecommendationsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Content[]>([]);
  const { toast } = useToast();

  const { user, isLoading: isUserLoading } = useUser();
  const { watchlist, isLoading: isWatchlistLoading } = useWatchlist();
  const { content: allContent, isLoading: isContentLoading } = useContent();

  const watchlistItems = useMemo(() => {
    if (!allContent || !watchlist) return [];
    return allContent.filter(item => watchlist.includes(item.id))
  }, [allContent, watchlist]);

  useEffect(() => {
    if (!user || isWatchlistLoading || isContentLoading || watchlistItems.length === 0) {
      return;
    }

    const getRecommendations = async () => {
      setIsLoading(true);
      setRecommendations([]);
      try {
        const viewingHistory = watchlistItems.map(item => item.title);
        
        // Generate preferences from the genres of watchlist items
        const genres = new Set(watchlistItems.flatMap(item => item.genres));
        const preferences = `Based on my watchlist, I seem to enjoy content with the following genres: ${[...genres].join(', ')}.`;

        const result = await generateRecommendations({
          viewingHistory: viewingHistory,
          preferences: preferences,
        });

        const recommendedContent = result.recommendations
          .map(title => 
            allContent.find(item => item.title.toLowerCase() === title.toLowerCase())
          )
          .filter((item): item is Content => !!item);
        
        setRecommendations(recommendedContent);

        if (recommendedContent.length === 0) {
          toast({
            title: "AI couldn't find matches in our library",
            description: "We got some great recommendations, but couldn't find them in our current catalog.",
          });
        }
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "An error occurred",
          description: "Could not generate AI recommendations. Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    getRecommendations();
  }, [user, watchlistItems, allContent, isWatchlistLoading, isContentLoading, toast]);

  if (isUserLoading || isContentLoading) {
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
          <p className="text-muted-foreground mb-6">Log in to get personalized recommendations based on your watchlist.</p>
          <Button asChild>
            <Link href="/login?redirect=/recommendations">Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (watchlist.length === 0 && !isWatchlistLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-20 bg-card rounded-lg border border-dashed">
            <h1 className="font-headline text-4xl md:text-5xl font-bold mb-2">For You</h1>
            <p className="text-muted-foreground mb-6">Add some items to your watchlist to get started.</p>
            <Button asChild>
              <Link href="/">Browse Content</Link>
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-headline text-4xl md:text-5xl font-bold mb-2">For You</h1>
      <p className="text-muted-foreground mb-8">AI-powered recommendations based on your watchlist.</p>

      {(isLoading || isWatchlistLoading) && (
        <div className="flex flex-col items-center justify-center text-center py-20">
          <Wand2 className="h-12 w-12 mb-4 text-accent animate-pulse" />
          <h2 className="font-headline text-2xl md:text-3xl font-semibold mb-2">Generating your recommendations...</h2>
          <p className="text-muted-foreground">Our AI is analyzing your watchlist to find your next favorite show.</p>
          <Loader2 className="h-8 w-8 animate-spin mt-6" />
        </div>
      )}
      
      {!isLoading && recommendations.length > 0 && (
        <div>
          <h2 className="font-headline text-3xl font-bold mb-6">Here's What We Found For You</h2>
          <ContentGrid content={recommendations} />
        </div>
      )}

      {!isLoading && !isWatchlistLoading && recommendations.length === 0 && watchlist.length > 0 && (
          <div className="text-center py-20 bg-card rounded-lg border border-dashed">
            <h2 className="text-2xl font-semibold mb-2">Still thinking...</h2>
            <p className="text-muted-foreground mb-6">The AI is hard at work. Recommendations should appear shortly. If not, try refreshing.</p>
        </div>
      )}
    </div>
  );
}
