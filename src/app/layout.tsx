import type { Metadata } from 'next';
import { FirebaseClientProvider } from '@/firebase';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import './globals.css';
import { WatchlistProvider } from '@/contexts/WatchlistContext';

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
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400..900&family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased min-h-screen flex flex-col')}>
        <FirebaseClientProvider>
          <WatchlistProvider>
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </WatchlistProvider>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
