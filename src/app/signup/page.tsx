"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Clapperboard, Loader2 } from "lucide-react";
import {
  createUserWithEmailAndPassword,
  signInWithRedirect,
  GoogleAuthProvider,
  getRedirectResult,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useAuth, useFirestore } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function SignupPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setGoogleLoading] = useState(false);
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(true);
  const [showAuthDomainError, setShowAuthDomainError] = useState(false);

  useEffect(() => {
    const handleRedirectResult = async () => {
      if (!auth || !firestore) return;
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // User has successfully signed up via redirect.
          const user = result.user;

          const userDocRef = doc(firestore, "users", user.uid);
          const profileData = {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
          };
          
          setDoc(userDocRef, profileData, { merge: true }).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
              path: userDocRef.path,
              operation: 'create',
              requestResourceData: profileData
            });
            errorEmitter.emit('permission-error', permissionError);
          });

          router.push("/");
        } else {
          setIsProcessingRedirect(false);
        }
      } catch (error: any) {
        let description = "An unexpected error occurred. Please try again.";
        switch (error.code) {
          case 'auth/unauthorized-domain':
            setShowAuthDomainError(true);
            break;
          default:
            description = `An error occurred: ${error.message} (Code: ${error.code})`;
            break;
        }
        toast({
          variant: "destructive",
          title: "Google Signup Failed",
          description: description,
        });
        setIsProcessingRedirect(false);
        setGoogleLoading(false);
      }
    };

    handleRedirectResult();
  }, [auth, firestore, router, toast]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await updateProfile(user, { displayName });

      const userDocRef = doc(firestore, "users", user.uid);
      const profileData = {
        displayName: displayName,
        email: user.email,
        photoURL: user.photoURL,
      };
      
      setDoc(userDocRef, profileData, { merge: true }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'create',
          requestResourceData: profileData
        });
        errorEmitter.emit('permission-error', permissionError);
      });

      router.push("/");
    } catch (error: any) {
      let description = "An unexpected error occurred. Please try again.";
      switch (error.code) {
        case 'auth/email-already-in-use':
          description = "This email address is already in use by another account.";
          break;
        case 'auth/weak-password':
          description = "The password is too weak. Please choose a stronger password (at least 6 characters).";
          break;
        case 'auth/invalid-email':
          description = "The email address is not valid. Please check the format.";
          break;
        default:
          description = `An error occurred: ${error.message} (Code: ${error.code})`;
          break;
      }
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth) return;
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  };
  
  if (isProcessingRedirect) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
       <AlertDialog open={showAuthDomainError} onOpenChange={setShowAuthDomainError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Configuration Required: Authorize Domain</AlertDialogTitle>
            <AlertDialogDescription>
              This is a one-time security setup in your Firebase project. To enable Google Sign-In, you must tell Firebase to trust this application's domain.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="text-sm space-y-4">
            <p>Please follow these steps exactly:</p>
            <ol className="list-decimal list-inside space-y-2 bg-muted p-4 rounded-md">
              <li>Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Firebase Console</a> and select your project: <strong>studio-2095727132-b9e55</strong>.</li>
              <li>Navigate to <strong>Authentication &gt; Settings &gt; Authorized domains</strong>.</li>
              <li>Click <strong>"Add domain"</strong> and enter: <code className="bg-background px-1 py-0.5 rounded">localhost</code></li>
              <li>Click <strong>"Add domain"</strong> again and enter: <code className="bg-background px-1 py-0.5 rounded">studio-2095727132-b9e55.firebaseapp.com</code></li>
            </ol>
            <p>After adding both domains, wait a minute, then close this dialog and try signing in again.</p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Clapperboard className="h-8 w-8 text-accent drop-shadow-[0_0_3px_hsl(var(--accent))]" strokeWidth={2.5} />
          </div>
          <CardTitle className="text-2xl font-headline text-center">
            Join AfriOTV
          </CardTitle>
          <CardDescription className="text-center">
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup}>
            <div className="grid gap-4">
               <div className="grid gap-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isLoading || isGoogleLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || isGoogleLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || isGoogleLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create an account
              </Button>
            </div>
          </form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
             <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4"><path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.58 2.6-5.5 2.6-4.25 0-7.75-3.5-7.75-7.75s3.5-7.75 7.75-7.75c2.38 0 3.88.94 4.8 1.88l2.53-2.53C18.3 1.19 15.8.02 12.48.02c-6.63 0-12 5.37-12 12s5.37 12 12 12c6.94 0 11.7-4.82 11.7-11.77 0-.79-.07-1.54-.2-2.31H12.48z"></path></svg>
            )}
            Sign up with Google
          </Button>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
