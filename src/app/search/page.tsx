'use client';

import { useSearchParams } from 'next/navigation';
import { useContent } from '@/contexts/ContentContext';
import { useMemo } from 'react';
import { ContentGrid } from '@/components/shared/ContentGrid';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Content } from '@/lib/types';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const { content: allContent, isLoading } = useContent();

  const filteredContent = useMemo(() => {
    if (!query || !allContent) return [];
    
    const lowercasedQuery = query.toLowerCase();
    
    return allContent.filter((item: Content) => {
      const inTitle = item.title.toLowerCase().includes(lowercasedQuery);
      const inDescription = item.description.toLowerCase().includes(lowercasedQuery);
      const inGenres = item.genres.some(genre => genre.toLowerCase().includes(lowercasedQuery));
      const inCast = item.cast.some(castMember => castMember.toLowerCase().includes(lowercasedQuery));
      return inTitle || inDescription || inGenres || inCast;
    });
  }, [query, allContent]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {query ? (
        <>
          <h1 className="font-headline text-4xl md:text-5xl font-bold mb-8">
            Search results for "{query}"
          </h1>
          {filteredContent.length > 0 ? (
            <ContentGrid content={filteredContent} />
          ) : (
            <div className="text-center py-20 bg-card rounded-lg border border-dashed">
              <h2 className="text-2xl font-semibold mb-2">No results found</h2>
              <p className="text-muted-foreground mb-6">We couldn't find any content matching your search for "{query}".</p>
              <Link href="/">
                <Button>Browse All Content</Button>
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <h1 className="font-headline text-4xl md:text-5xl font-bold mb-2">Search for content</h1>
          <p className="text-muted-foreground">Use the search bar in the header to find movies and TV shows.</p>
        </div>
      )}
    </div>
  );
}
