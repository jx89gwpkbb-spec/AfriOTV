"use client";

import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login?redirect=/settings');
    }
  }, [isUserLoading, user, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-headline text-4xl md:text-5xl font-bold mb-8">Settings</h1>
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Manage how you receive notifications from us.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="new-release-switch" className="flex flex-col space-y-1">
                  <span>New Releases</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Notify me when new movies or TV shows are added.
                  </span>
                </Label>
                <Switch id="new-release-switch" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="recommendations-switch" className="flex flex-col space-y-1">
                  <span>Personalized Recommendations</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Send me AI-powered content recommendations.
                  </span>
                </Label>
                <Switch id="recommendations-switch" />
              </div>
               <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="watchlist-update-switch" className="flex flex-col space-y-1">
                  <span>Watchlist Updates</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Get updates on content in my watchlist.
                  </span>
                </Label>
                <Switch id="watchlist-update-switch" defaultChecked/>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-1">
            <Card className="sticky top-24">
                <CardHeader>
                    <CardTitle>Account</CardTitle>
                    <CardDescription>Manage your account settings.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <Button onClick={() => router.push('/profile')}>Edit Profile</Button>
                    <Button variant="destructive">Delete Account</Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
