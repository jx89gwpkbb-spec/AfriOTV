"use client";

import { useUser, useFirestore } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { doc, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const { user, profile, claims, isLoading: isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
    } else if (user) {
      setDisplayName(user.displayName || "");
    }
  }, [profile, user]);
  
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  if (isUserLoading || !user || !firestore) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // 1. Update Firebase Auth profile
      if (user.displayName !== displayName) {
          await updateProfile(user, { displayName });
      }

      // 2. Update Firestore document
      const userDocRef = doc(firestore, "users", user.uid);
      const profileData = {
          displayName: displayName,
          email: user.email,
          photoURL: user.photoURL,
      };

      setDoc(userDocRef, profileData, { merge: true })
        .then(() => {
            toast({
                title: "Profile Updated",
                description: "Your profile has been updated successfully.",
            });
        })
        .catch((err) => {
           const permissionError = new FirestorePermissionError({
              path: userDocRef.path,
              operation: 'update',
              requestResourceData: profileData
            });
            errorEmitter.emit('permission-error', permissionError);
        });
    } catch(authError: any) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: authError.message,
        });
    } finally {
      setIsSaving(false);
    }
  };
  

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">My Profile</h1>
        {claims?.admin && <Badge variant="secondary" className="h-fit py-1 px-3 text-base">Admin</Badge>}
      </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your display name.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email || ""}
                disabled
              />
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
