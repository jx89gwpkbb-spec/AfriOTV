"use client";

import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { Play, Plus, Check, Star, Loader2, Wand2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';

import { useContent } from '@/contexts/ContentContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { ContentCarousel } from '@/components/content/ContentCarousel';
import { ReviewsSection } from '@/components/content/ReviewsSection';
import { findSimilarContent } from '@/ai/flows/similar-content';
import type { Content, Review } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';

export default function ContentDetailPage() {
  const params = useParams<{ id: string }>();
  const { content: contentData, isLoading: isContentLoading } = useContent();
  const firestore = useFirestore();
  
  const content = useMemo(() => contentData.find((item) => item.id === params.id), [contentData, params.id]);

  const reviewsCollectionRef = useMemo(() => {
    if (!firestore || !content) return null;
    return query(collection(firestore, 'content', content.id, 'reviews'), orderBy('createdAt', 'desc'));
  }, [firestore, content]);

  const { data: reviews, isLoading: areReviewsLoading } = useCollection<Review>(reviewsCollectionRef);

  const { averageRating, reviewCount } = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return { averageRating: content?.rating || 0, reviewCount: 0 };
    }
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    return {
      averageRating: totalRating / reviews.length,
      reviewCount: reviews.length,
    };
  }, [reviews, content]);

  const { isInWatchlist, addToWatchlist, removeFromWatchlist, isLoading: isWatchlistLoading } = useWatchlist();
  const { toast } = useToast();
  
  const [similarContent, setSimilarContent] = useState<Content[]>([]);
  const [isSimilarLoading, setIsSimilarLoading] = useState(false);
  const [aiSimilarRequested, setAiSimilarRequested] = useState(false);

  useEffect(() => {
    if (content && aiSimilarRequested) {
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
           const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
          toast({
            variant: "destructive",
            title: "AI Error",
            description: errorMessage.includes('429') 
              ? "You've made too many requests. Please wait a minute before trying again."
              : "Could not fetch AI recommendations.",
          });
          setAiSimilarRequested(false); // Allow user to try again
        } finally {
          setIsSimilarLoading(false);
        }
      };
      fetchSimilar();
    }
  }, [content, contentData, toast, aiSimilarRequested]);

  const relatedContent = useMemo(() => {
    if (!content) return [];
    return contentData.filter(
      (item) => item.genres.some(g => content.genres.includes(g)) && item.id !== content.id
    ).slice(0, 10);
  }, [content, contentData]);

  if (isContentLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
                <span>{averageRating.toFixed(1)}</span>
                <span className="text-xs">({reviewCount} reviews)</span>
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
          <ReviewsSection contentId={content.id} reviews={reviews || []} isLoading={areReviewsLoading} />
        </div>

        <div className="mt-16">
          <ContentCarousel title="You Might Also Like" content={relatedContent} />
        </div>

        <div className="mt-16">
          <h2 className="font-headline text-2xl md:text-3xl font-semibold mb-4">AI-Powered: More Like This</h2>
          {!aiSimilarRequested && !isSimilarLoading && similarContent.length === 0 && (
            <div className="text-center py-10 bg-card rounded-lg border border-dashed">
                <p className="text-muted-foreground mb-4">Let our AI find similar content based on this title.</p>
                <Button onClick={() => setAiSimilarRequested(true)} disabled={isSimilarLoading}>
                    <Wand2 className="mr-2" />
                    {isSimilarLoading ? 'Searching...' : 'Find Similar Content'}
                </Button>
            </div>
          )}
          {isSimilarLoading && (
            <div className="flex flex-col items-center justify-center text-center py-10">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="mt-4 text-muted-foreground">Our AI is searching...</p>
            </div>
          )}
          {!isSimilarLoading && aiSimilarRequested && similarContent.length > 0 && (
            <ContentCarousel content={similarContent} />
          )}
           {!isSimilarLoading && aiSimilarRequested && similarContent.length === 0 && (
            <div className="text-center py-10 bg-card rounded-lg border border-dashed">
                <p className="text-muted-foreground">The AI couldn't find any matches in our library for this title.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
