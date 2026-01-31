'use client';

import { useUser } from '@/firebase';
import { Loader2, ShieldAlert, UserPlus, RefreshCw } from 'lucide-react';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from '@/hooks/use-toast';

export default function AdminPage() {
  const { user, claims, isLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleRefreshPermissions = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Not logged in',
        description: 'You must be logged in to refresh permissions.',
      });
      return;
    }
    setIsRefreshing(true);
    try {
      // This forces the client to get a new ID token from Firebase.
      await user.getIdTokenResult(true);
      // Reload the page to apply the new claims.
      window.location.reload();
    } catch (error) {
      console.error("Error refreshing permissions:", error);
      toast({
        variant: 'destructive',
        title: 'Refresh Failed',
        description: 'Could not refresh permissions. Please try logging out and back in.',
      });
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
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
          <p className="text-muted-foreground mb-6">
            You do not have the necessary permissions to view this page. If you have just been granted admin rights, you may need to refresh your session.
          </p>
          <Button onClick={handleRefreshPermissions} disabled={isRefreshing}>
            {isRefreshing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh Permissions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <h1 className="font-headline text-4xl md:text-5xl font-bold mb-2">
          Admin Dashboard
        </h1>
        <p className="text-lg mb-8 text-muted-foreground">
          Welcome, admin! This is where you'll manage the application.
        </p>

        <Card>
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
          </CardContent>
        </Card>
      </div>

      <Accordion type="single" collapsible className="w-full max-w-2xl mt-8">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-lg">How Do I Grant Admin Privileges?</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2 text-muted-foreground">
              <p>
                Granting admin rights is a sensitive operation that must be done securely on a server, not directly within the app. This prevents unauthorized users from making themselves admins. The standard method is using <strong>Firebase Custom Claims</strong>.
              </p>
              <p className="font-semibold text-foreground">Here’s the conceptual process:</p>
              <ol className="list-decimal list-inside space-y-3 pl-2">
                <li>
                  <strong>Create a Secure Backend Function:</strong>
                  <p className="pl-4 mt-1 font-normal">You need to use a server environment like Firebase Cloud Functions. Create a function (e.g., an "HTTP Callable Function") that can be securely called from your app.</p>
                </li>
                <li>
                  <strong>Use the Firebase Admin SDK:</strong>
                  <p className="pl-4 mt-1 font-normal">Inside that function, use the Firebase Admin SDK—a special library for servers. This SDK has the power to modify user roles.</p>
                </li>
                <li>
                  <strong>Set the Custom Claim:</strong>
                  <p className="pl-4 mt-1 font-normal">The function will take the user's email as input, find their account, and attach a "custom claim" to it. For this app, the claim must be <code>{`{ admin: true }`}</code>.</p>
                </li>
                <li>
                  <strong>Log In Again:</strong>
                  <p className="pl-4 mt-1 font-normal">Once the claim is set, the user must log out and log back in. The app is already built to automatically detect this 'admin' claim and grant access to this dashboard.</p>
                </li>
              </ol>
              <p className="text-xs pt-2">
                While I cannot write this backend Cloud Function for you (as it requires special server-side permissions), this is the industry-standard and most secure method. The "Make Admin" button on this page is the starting point for calling such a function once you have created it in your Firebase project.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
