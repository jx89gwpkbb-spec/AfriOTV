"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Clapperboard } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { UserNav } from '@/components/shared/UserNav';
import { Logo } from '@/components/shared/Logo';

const navLinks = [
  { href: '/', label: 'Browse' },
  { href: '/watchlist', label: 'Watchlist' },
  { href: '/recommendations', label: 'For You' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Logo />
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium ml-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'transition-colors hover:text-foreground/80',
                pathname === link.href ? 'text-foreground' : 'text-foreground/60'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search movies & TV shows..."
              className="pl-9"
            />
          </div>
          <UserNav />
        </div>
      </div>
    </header>
  );
}
