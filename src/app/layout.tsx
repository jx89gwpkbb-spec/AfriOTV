import type { Metadata } from 'next';
import { FirebaseClientProvider } from '@/firebase';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import './globals.css';
import { WatchlistProvider } from '@/contexts/WatchlistContext';
import { ContentProvider } from '@/contexts/ContentContext';
import { Playfair_Display, PT_Sans } from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-pt-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AfriOTV',
  description: 'Your universe of movies and TV shows.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head />
      <body className={cn('font-body antialiased min-h-screen flex flex-col', playfair.variable, ptSans.variable)} suppressHydrationWarning>
          <FirebaseClientProvider>
            <ContentProvider>
              <WatchlistProvider>
                <Header />
                <main className="flex-grow">{children}</main>
                <Footer />
              </WatchlistProvider>
            </ContentProvider>
          </FirebaseClientProvider>
          <Toaster />
      </body>
    </html>
  );
}
