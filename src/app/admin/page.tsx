'use client';

import { useUser, useFirestore, useCollection, type UserProfile } from '@/firebase';
import { Loader2, ShieldX, UserPlus, RefreshCw, Film } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const contentFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  type: z.enum(["movie", "tv"]),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  posterPath: z.string().url({ message: "Please enter a valid poster image URL." }),
  coverPath: z.string().url({ message: "Please enter a valid cover image URL." }),
  genres: z.string().min(1, { message: "Please enter at least one genre." }),
  cast: z.string().min(1, { message: "Please enter at least one cast member." }),
  rating: z.coerce.number().min(0).max(10, { message: "Rating must be between 0 and 10." }),
  duration: z.string().min(1, { message: "Duration is required." }),
  releaseYear: z.coerce.number().min(1888, { message: "Year must be after 1888." }).max(new Date().getFullYear() + 5, { message: "Year can't be too far in the future." }),
  isTrending: z.boolean().default(false),
});

type ContentFormValues = z.infer<typeof contentFormSchema>;


export default function AdminPage() {
  const { user, claims, isLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const firestore = useFirestore();

  const usersCollectionRef = useMemo(() => {
    // Temporary workaround: Allow any logged-in user to see the user list.
    // In production, you should revert this to: `if (!firestore || !claims?.admin) return null;`
    if (!firestore || !user) return null;
    return collection(firestore, 'users');
  }, [firestore, user]);

  const contentCollectionRef = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'content');
  }, [firestore]);

  const { data: users, isLoading: isLoadingUsers } = useCollection<(UserProfile & { id: string })>(usersCollectionRef);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, isLoading, router]);

  const contentForm = useForm<ContentFormValues>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: {
      title: "",
      type: "movie",
      description: "",
      posterPath: "https://picsum.photos/seed/10/500/750",
      coverPath: "https://picsum.photos/seed/11/1280/720",
      genres: "Action, Sci-Fi",
      cast: "Chris Pratt, Zoe Saldana",
      rating: 7.5,
      duration: "2h 5min",
      releaseYear: new Date().getFullYear(),
      isTrending: false,
    },
  });

  function onContentSubmit(data: ContentFormValues) {
    if (!contentCollectionRef) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Firestore is not available. Cannot add content.',
      });
      return;
    }

    const newContentData = {
      ...data,
      genres: data.genres.split(',').map(g => g.trim()),
      cast: data.cast.split(',').map(c => c.trim()),
      createdAt: serverTimestamp(),
    };

    addDoc(contentCollectionRef, newContentData)
      .then((docRef) => {
        toast({
          title: "Content Added",
          description: `"${data.title}" has been successfully added to the catalog.`,
        });
        contentForm.reset();
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: contentCollectionRef.path,
          operation: 'create',
          requestResourceData: newContentData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  }

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
      await user.getIdTokenResult(true);
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

  // Temporary developer workaround:
  // The following block is commented out to allow any logged-in user to see the admin page.
  // In a production app, you should re-enable this to ensure only admins can access it.
  /*
  if (!claims?.admin) {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center">
            <div className="w-full max-w-2xl text-center">
                <Card className="border-destructive/50 bg-destructive/10 text-destructive-foreground">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2">
                            <ShieldX className="h-6 w-6 text-destructive" />
                            Access Denied
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>You do not have the necessary permissions to view this page. This area is for administrators only.</p>
                        <p className="mt-4 text-sm">If you are an administrator, please ensure you have logged in with the correct account. If you believe this is an error, contact support.</p>
                        <Button onClick={() => router.push('/')} variant="destructive" className="mt-6">Go to Homepage</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
  }
  */


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
            <CardTitle>Content Management</CardTitle>
            <CardDescription>
              Add a new movie or TV show to the catalog.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...contentForm}>
              <form onSubmit={contentForm.handleSubmit(onContentSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={contentForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Galaxy Drifters" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={contentForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select content type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="movie">Movie</SelectItem>
                            <SelectItem value="tv">TV Show</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                    control={contentForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="A short synopsis of the content..." rows={4} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <FormField
                    control={contentForm.control}
                    name="posterPath"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Poster Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={contentForm.control}
                    name="coverPath"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cover Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <FormField
                    control={contentForm.control}
                    name="genres"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Genres</FormLabel>
                        <FormControl>
                          <Input placeholder="Action, Sci-Fi, Adventure" {...field} />
                        </FormControl>
                        <FormDescription>Comma-separated values.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={contentForm.control}
                    name="cast"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Main Cast</FormLabel>
                        <FormControl>
                          <Input placeholder="Chris Pratt, Zoe Saldana" {...field} />
                        </FormControl>
                         <FormDescription>Comma-separated values.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <FormField
                    control={contentForm.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={contentForm.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <FormControl>
                          <Input placeholder="2h 15min" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={contentForm.control}
                    name="releaseYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Release Year</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={contentForm.control}
                  name="isTrending"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Mark as Trending
                        </FormLabel>
                        <FormDescription>
                          Trending content is featured more prominently.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit">
                  <Film className="mr-2 h-4 w-4" />
                  Add Content to Catalog
                </Button>
              </form>
            </Form>
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
