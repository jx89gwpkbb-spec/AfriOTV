import type { Content } from '@/lib/types';
import { ContentCard } from '@/components/content/ContentCard';

type ContentGridProps = {
  content: Content[];
};

export function ContentGrid({ content }: ContentGridProps) {
  if (content.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {content.map((item) => (
        <ContentCard key={item.id} content={item} />
      ))}
    </div>
  );
}
