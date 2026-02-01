'use client';

import { HeroSection } from '@/components/content/HeroSection';
import { ContentCarousel } from '@/components/content/ContentCarousel';
import type { Content } from '@/lib/types';
import { useContent } from '@/contexts/ContentContext';
import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { content: contentData, isLoading } = useContent();

  const { trendingContent, actionMovies, comedyShows, scifiMovies, featuredContent } = useMemo(() => {
    if (!contentData) {
        return {
            trendingContent: [],
            actionMovies: [],
            comedyShows: [],
            scifiMovies: [],
            featuredContent: undefined,
        };
    }
    const trendingContent = contentData.filter(item => item.isTrending);
    const actionMovies = contentData.filter(item => item.genres.includes('Action') && item.type === 'movie');
    const comedyShows = contentData.filter(item => item.genres.includes('Comedy') && item.type === 'tv');
    const scifiMovies = contentData.filter(item => item.genres.includes('Sci-Fi') && item.type === 'movie');
    const featured = trendingContent.length > 0 ? trendingContent[0] : contentData.length > 0 ? contentData[0] : undefined;

    return {
        trendingContent,
        actionMovies,
        comedyShows,
        scifiMovies,
        featuredContent: featured
    };
  }, [contentData]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (contentData.length === 0) {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-20 bg-card rounded-lg border border-dashed">
                <h2 className="text-2xl font-semibold mb-2">No Content Available</h2>
                <p className="text-muted-foreground">It looks like there's no content in the catalog yet.</p>
                <p className="text-muted-foreground">An administrator can add movies and shows from the admin dashboard.</p>
            </div>
        </div>
    )
  }

  return (
    <div className="flex flex-col">
      {featuredContent && <HeroSection content={featuredContent} />}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        <ContentCarousel title="Trending Now" content={trendingContent} />
        <ContentCarousel title="Action-Packed Movies" content={actionMovies} />
        <ContentCarousel title="Binge-worthy Comedies" content={comedyShows} />
        <ContentCarousel title="Sci-Fi Adventures" content={scifiMovies} />
      </div>
    </div>
  );
}
