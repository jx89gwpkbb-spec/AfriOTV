"use client";

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Play, Plus, Check, Star, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

import { contentData } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { ContentCarousel } from '@/components/content/ContentCarousel';
import { findSimilarContent } from '@/ai/flows/similar-content';
import type { Content } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function ContentDetailPage({ params }: { params: { id: string } }) {
  const content = contentData.find((item) => item.id === params.id);
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, isLoading: isWatchlistLoading } = useWatchlist();
  const { toast } = useToast();
  
  const [similarContent, setSimilarContent] = useState<Content[]>([]);
  const [isSimilarLoading, setIsSimilarLoading] = useState(false);

  useEffect(() => {
    if (content) {
      const fetchSimilar = async () => {
        setIsSimilarLoading(true);
        try {
          const result = await findSimilarContent({ title: content.title });
          const recommended = result.recommendations
            .map(title => 
              contentData.find(item => item.title.toLowerCase() === title.toLowerCase() && item.id !== content.id)
            )
            .filter((item): item is Content => !!item);
          setSimilarContent(recommended.slice(0, 10));
        } catch (error) {
          console.error("Failed to fetch similar content:", error);
          toast({
            variant: "destructive",
            title: "AI Error",
            description: "Could not fetch AI recommendations.",
          });
        } finally {
          setIsSimilarLoading(false);
        }
      };
      fetchSimilar();
    }
  }, [content, toast]);

  if (!content) {
    notFound();
  }
  
  const onWatchlist = isInWatchlist(content.id);

  const handleWatchlistClick = () => {
    if (onWatchlist) {
      removeFromWatchlist(content.id);
    } else {
      addToWatchlist(content.id);
    }
  };

  const relatedContent = contentData.filter(
    (item) => item.genres.some(g => content.genres.includes(g)) && item.id !== content.id
  ).slice(0, 10);

  return (
    <>
      <div className="relative w-full h-[60vh]">
        <Image
          src={content.coverPath}
          alt={`Backdrop for ${content.title}`}
          fill
          className="object-cover"
          priority
          data-ai-hint="movie backdrop"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-48 relative z-10 pb-16">
        <div className="md:flex md:items-end md:space-x-8">
          <div className="w-1/2 md:w-1/4 lg:w-1/5 flex-shrink-0">
            <div className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={content.posterPath}
                alt={content.title}
                fill
                className="object-cover"
                data-ai-hint="movie poster"
              />
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground">
              {content.title}
            </h1>
            <div className="flex items-center flex-wrap gap-4 mt-2 text-muted-foreground">
              <span>{content.releaseYear}</span>
              <span>{content.duration}</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-accent fill-accent" />
                <span>{content.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <p className="text-lg">{content.description}</p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href={`/play/${content.id}`}>
                <Button size="lg">
                  <Play className="mr-2" />
                  Play
                </Button>
              </Link>
              <Button size="lg" variant="secondary" onClick={handleWatchlistClick} disabled={isWatchlistLoading}>
                {isWatchlistLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : onWatchlist ? (
                  <Check className="mr-2" />
                ) : (
                  <Plus className="mr-2" />
                )}
                Watchlist
              </Button>
            </div>
          </div>
          <div>
            <div className="space-y-2">
              <p><span className="font-semibold text-muted-foreground">Cast:</span> {content.cast.join(', ')}</p>
              <div className="flex flex-wrap gap-2">
                <span className="font-semibold text-muted-foreground">Genres:</span>
                {content.genres.map(genre => <Badge key={genre} variant="secondary">{genre}</Badge>)}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <ContentCarousel title="You Might Also Like" content={relatedContent} />
        </div>

        <div className="mt-16">
          {isSimilarLoading ? (
            <div className="flex flex-col items-center justify-center text-center">
              <h2 className="font-headline text-2xl md:text-3xl font-semibold mb-4">Finding Similar Content...</h2>
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : similarContent.length > 0 && (
            <ContentCarousel title="AI-Powered: More Like This" content={similarContent} />
          )}
        </div>
      </div>
    </>
  );
}
