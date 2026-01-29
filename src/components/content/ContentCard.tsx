"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Play, Plus, Check } from 'lucide-react';
import type { Content } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ContentCardProps = {
  content: Content;
};

export function ContentCard({ content }: ContentCardProps) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const onWatchlist = isInWatchlist(content.id);

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onWatchlist) {
      removeFromWatchlist(content.id);
    } else {
      addToWatchlist(content.id);
    }
  };

  return (
    <Link href={`/content/${content.id}`} className="group block">
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
        <Image
          src={content.posterPath}
          alt={content.title}
          width={500}
          height={750}
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          data-ai-hint="movie poster"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-white font-bold truncate">{content.title}</h3>
          <div className="flex items-center justify-between mt-2">
            <Link href={`/play/${content.id}`} onClick={(e) => e.stopPropagation()}>
              <Button size="icon" className="h-8 w-8">
                <Play className="h-4 w-4" />
              </Button>
            </Link>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="outline" className="h-8 w-8 bg-black/50" onClick={handleWatchlistClick}>
                    {onWatchlist ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{onWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </Link>
  );
}
