'use client';

import { useUser } from '@/firebase';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
  const { user, claims, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/admin');
    }
  }, [user, isLoading, router]);

  if (isLoading || (user && !claims)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!claims?.admin) {
    return (
       <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <div className="max-w-md mx-auto">
          <ShieldAlert className="h-16 w-16 mx-auto text-destructive mb-4" />
          <h1 className="font-headline text-4xl md:text-5xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You do not have the necessary permissions to view this page. To become an admin, you must be granted administrator privileges in your Firebase project.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-headline text-4xl md:text-5xl font-bold mb-8">Admin Dashboard</h1>
      <p className="text-lg">Welcome, admin! This is where you'll manage the application.</p>
      {/* Placeholder for admin features */}
    </div>
  );
}
