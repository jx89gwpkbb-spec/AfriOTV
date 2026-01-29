import { HeroSection } from '@/components/content/HeroSection';
import { ContentCarousel } from '@/components/content/ContentCarousel';
import { contentData } from '@/lib/data';
import type { Content } from '@/lib/types';

export default function Home() {
  const trendingContent = contentData.filter(item => item.isTrending);
  const actionMovies = contentData.filter(item => item.genres.includes('Action') && item.type === 'movie');
  const comedyShows = contentData.filter(item => item.genres.includes('Comedy') && item.type === 'tv');
  const scifiMovies = contentData.filter(item => item.genres.includes('Sci-Fi') && item.type === 'movie');

  const featuredContent: Content | undefined = contentData.find(c => c.id === 'rec-3');

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
