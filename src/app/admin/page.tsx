'use client';

import { useUser, useFirestore, useCollection, type UserProfile } from '@/firebase';
import { Loader2, ShieldAlert, UserPlus, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { collection } from 'firebase/firestore';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


export default function AdminPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const firestore = useFirestore();

  // NOTE: The admin check has been removed for development purposes.
  const usersCollectionRef = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: users, isLoading: isLoadingUsers } = useCollection<(UserProfile & { id: string })>(usersCollectionRef);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/admin');
    }
  }, [user, isLoading, router]);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  }

  const handleMakeAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        variant: 'destructive',
        title: 'Email required',
        description: 'Please enter an email address to make an admin.',
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

  if (isLoading || !firestore) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // NOTE: The admin check has been removed for development purposes.
  // Any logged-in user can now see this page.
  // In a production app, you should re-enable the `!claims?.admin` check.


  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-between mb-2">
           <h1 className="font-headline text-4xl md:text-5xl font-bold">
            Admin Dashboard
          </h1>
           <Button onClick={handleRefreshPermissions} disabled={isRefreshing} variant="outline" size="sm">
            {isRefreshing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh Permissions
          </Button>
        </div>
       
        <p className="text-lg mb-8 text-muted-foreground">
          Welcome! This is where you'll manage the application.
        </p>
        
        <Card className="border-destructive/50 bg-destructive/10 text-destructive-foreground">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-destructive" />
                    Developer Workaround Active
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm">Access to this page is currently unrestricted for any logged-in user. For a production environment, you must secure this page by re-enabling the admin check as described in the accordion below.</p>
            </CardContent>
        </Card>

        <Card className="mt-8">
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

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              A list of all registered users in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Avatar</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map(u => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={u.photoURL || undefined} />
                          <AvatarFallback>{getInitials(u.displayName)}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{u.displayName}</TableCell>
                      <TableCell>{u.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Accordion type="single" collapsible className="w-full mt-8">
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
                    <strong>Refresh Your Permissions:</strong>
                    <p className="pl-4 mt-1 font-normal">Once the claim is set, return to this page and click the "Refresh Permissions" button. The app is already built to automatically detect this 'admin' claim and grant access.</p>
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
    </div>
  );
}
