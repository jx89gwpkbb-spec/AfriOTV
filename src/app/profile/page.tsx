"use client";

import { useUser, useFirestore, useStorage } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import { doc, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Loader2, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

export default function ProfilePage() {
  const { user, profile, claims, isLoading: isUserLoading } = useUser();
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
      setPhotoURL(profile.photoURL || user?.photoURL || "");
    } else if (user) {
      setDisplayName(user.displayName || "");
      setPhotoURL(user.photoURL || "");
    }
  }, [profile, user]);
  
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast({
                variant: 'destructive',
                title: 'Image too large',
                description: 'Please select an image smaller than 5MB.',
            });
            return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  }

  if (isUserLoading || !user || !firestore || !storage) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    let hasChanges = false;

    // --- Update Display Name ---
    if (user.displayName !== displayName) {
      hasChanges = true;
      setIsSaving(true);
      try {
        await updateProfile(user, { displayName });
        const userDocRef = doc(firestore, "users", user.uid);
        await setDoc(userDocRef, { displayName }, { merge: true })
          .catch((err) => {
              const permissionError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'update',
                requestResourceData: { displayName }
              });
              errorEmitter.emit('permission-error', permissionError);
              throw err;
          });
        toast({ title: "Display Name Updated" });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error Updating Name",
          description: error.message || "An unexpected error occurred.",
        });
      } finally {
        setIsSaving(false);
      }
    }

    // --- Handle Image Upload ---
    if (imageFile) {
      hasChanges = true;
      setUploadProgress(0);
      const storageRef = ref(storage, `profile_pictures/${user.uid}`);
      const uploadTask = uploadBytesResumable(storageRef, imageFile);
      const fileToUpload = imageFile;
      setImageFile(null); // Prevent re-upload

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload failed:", error);
          toast({
            variant: "destructive",
            title: "Upload Failed",
            description: "Could not upload your new profile picture.",
          });
          setUploadProgress(null);
          setImageFile(fileToUpload); // Restore for retry
        },
        async () => {
          try {
            const newPhotoURL = await getDownloadURL(uploadTask.snapshot.ref);
            await updateProfile(user, { photoURL: newPhotoURL });
            const userDocRef = doc(firestore, "users", user.uid);
            await setDoc(userDocRef, { photoURL: newPhotoURL }, { merge: true })
              .catch((err) => {
                  const permissionError = new FirestorePermissionError({
                      path: userDocRef.path,
                      operation: 'update',
                      requestResourceData: { photoURL: newPhotoURL }
                  });
                  errorEmitter.emit('permission-error', permissionError);
                  throw err;
              });

            setPhotoURL(newPhotoURL);
            setImagePreview(null);
            setUploadProgress(null);
            toast({
              title: "Profile Picture Updated",
              description: "Your new picture has been saved.",
            });
          } catch (error: any) {
            toast({
              variant: "destructive",
              title: "Save Failed",
              description: "Could not save the new profile picture URL.",
            });
            setUploadProgress(null);
            setImageFile(fileToUpload);
          }
        }
      );
    }

    if (!hasChanges) {
      toast({
        description: "You haven't made any changes.",
      });
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
          <CardDescription>Update your display name and profile picture.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="flex items-center gap-6">
                <div className="relative group">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={imagePreview || photoURL || undefined} alt={displayName} />
                        <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                    </Avatar>
                    <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        aria-label="Change profile picture"
                    >
                        <Camera className="h-8 w-8 text-white" />
                    </button>
                </div>
                <div className="w-full space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                    />
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/gif" className="hidden" />
                </div>
            </div>
            
            {uploadProgress !== null && (
                <div className="space-y-2">
                    <Label>Upload Progress</Label>
                    <Progress value={uploadProgress} />
                </div>
            )}
           
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email || ""}
                disabled
              />
            </div>
            <Button type="submit" disabled={isSaving || uploadProgress !== null}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {uploadProgress !== null ? 'Uploading...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
