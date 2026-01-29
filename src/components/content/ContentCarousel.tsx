import type { Content } from '@/lib/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { ContentCard } from './ContentCard';

type ContentCarouselProps = {
  title: string;
  content: Content[];
};

export function ContentCarousel({ title, content }: ContentCarouselProps) {
    if (content.length === 0) return null;

  return (
    <div>
      <h2 className="font-headline text-2xl md:text-3xl font-semibold mb-4">{title}</h2>
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {content.map((item) => (
            <CarouselItem key={item.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
              <ContentCard content={item} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden lg:flex" />
        <CarouselNext className="hidden lg:flex" />
      </Carousel>
    </div>
  );
}
