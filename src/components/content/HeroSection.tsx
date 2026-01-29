import Image from 'next/image';
import Link from 'next/link';
import { Play, Info } from 'lucide-react';
import type { Content } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type HeroSectionProps = {
  content: Content;
};

export function HeroSection({ content }: HeroSectionProps) {
  return (
    <div className="relative h-[80vh] w-full">
      <Image
        src={content.coverPath}
        alt={`Backdrop for ${content.title}`}
        fill
        className="object-cover object-center"
        priority
        data-ai-hint="movie backdrop"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-full md:w-1/2 lg:w-1/3">
            <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
              {content.title}
            </h1>
            <div className="flex items-center gap-4 my-4">
              <Badge variant="outline">{content.rating.toFixed(1)}</Badge>
              <span className="text-sm text-muted-foreground">{content.releaseYear}</span>
              <span className="text-sm text-muted-foreground">{content.duration}</span>
            </div>
            <p className="text-muted-foreground text-sm md:text-base line-clamp-3">
              {content.description}
            </p>
            <div className="mt-6 flex gap-4">
              <Link href={`/play/${content.id}`}>
                <Button size="lg">
                  <Play className="mr-2" />
                  Play
                </Button>
              </Link>
              <Link href={`/content/${content.id}`}>
                <Button size="lg" variant="secondary">
                  <Info className="mr-2" />
                  More Info
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
