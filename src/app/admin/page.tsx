'use client';

import { useUser } from '@/firebase';
import { Loader2, ShieldAlert, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function AdminPage() {
  const { user, claims, isLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/admin');
    }
  }, [user, isLoading, router]);

  const handleMakeAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        variant: 'destructive',
        title: 'Email required',
        description:
          'Please enter the email address of the user you want to make an admin.',
      });
      return;
    }

    // In a real application, this would call a secure backend function.
    // For this demo, we will just show a toast.
    toast({
      title: 'Admin Promotion (Demo)',
      description: `In a real app, you would now call a backend function to set a custom claim for ${email}. You must use the Firebase Admin SDK to do this securely.`,
    });
    setEmail('');
  };

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
          <h1 className="font-headline text-4xl md:text-5xl font-bold mb-4">
            Access Denied
          </h1>
          <p className="text-muted-foreground">
            You do not have the necessary permissions to view this page. To
            become an admin, you must be granted administrator privileges in
            your Firebase project.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-headline text-4xl md:text-5xl font-bold mb-8">
        Admin Dashboard
      </h1>
      <p className="text-lg mb-8">
        Welcome, admin! This is where you'll manage the application.
      </p>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Grant administrator privileges to a user.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleMakeAdmin} className="flex items-end gap-4">
            <div className="grid gap-2 flex-grow">
              <Label htmlFor="email">User Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button type="submit">
              <UserPlus className="mr-2 h-4 w-4" />
              Make Admin
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-4">
            Note: This is a demonstration. To implement this feature, you must
            create a secure Cloud Function or server endpoint that uses the
            Firebase Admin SDK to set custom user claims. Do not attempt to set
            claims from the client-side.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
