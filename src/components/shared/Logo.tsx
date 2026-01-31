import Link from 'next/link';
import { Clapperboard } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <Clapperboard className="h-6 w-6 text-accent drop-shadow-[0_0_3px_hsl(var(--accent))]" strokeWidth={2.5} />
      <span className={cn('font-headline font-bold text-lg')}>AfriOTV</span>
    </Link>
  );
}
