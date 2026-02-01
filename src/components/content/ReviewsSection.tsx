'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { Review } from '@/lib/types';
import Link from 'next/link';

const reviewFormSchema = z.object({
  rating: z.number().min(1, 'Please select a rating.').max(5),
  comment: z.string().min(10, 'Your review must be at least 10 characters.').max(1000, 'Your review cannot exceed 1000 characters.'),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface ReviewsSectionProps {
  contentId: string;
  reviews: Review[];
  isLoading: boolean;
}

export function ReviewsSection({ contentId, reviews, isLoading }: ReviewsSectionProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const onSubmit = async (data: ReviewFormValues) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'You must be logged in to leave a review.' });
      return;
    }
    setIsSubmitting(true);
    
    const reviewCollectionRef = collection(firestore, 'content', contentId, 'reviews');
    const newReview = {
        ...data,
        userId: user.uid,
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL || '',
        createdAt: serverTimestamp(),
    };
    
    addDoc(reviewCollectionRef, newReview)
        .then(() => {
            toast({ title: 'Review submitted!', description: 'Thanks for your feedback.' });
            form.reset();
        })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: reviewCollectionRef.path,
                operation: 'create',
                requestResourceData: newReview,
            });
            errorEmitter.emit('permission-error', permissionError);
        })
        .finally(() => {
            setIsSubmitting(false);
        });
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  }

  const userHasReviewed = reviews.some(review => review.userId === user?.uid);

  return (
    <div>
      <h2 className="font-headline text-2xl md:text-3xl font-semibold mb-4">Reviews</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
            {isLoading ? (
                 <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : reviews.length > 0 ? (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div key={review.id} className="flex gap-4">
                            <Avatar>
                                <AvatarImage src={review.photoURL} />
                                <AvatarFallback>{getInitials(review.displayName)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold">{review.displayName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {review.createdAt ? formatDistanceToNow(new Date(review.createdAt.seconds * 1000), { addSuffix: true }) : 'Just now'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 my-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={cn("w-4 h-4", i < review.rating ? "text-accent fill-accent" : "text-muted-foreground")} />
                                    ))}
                                </div>
                                <p className="text-muted-foreground">{review.comment}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-card rounded-lg border border-dashed">
                    <h3 className="text-lg font-semibold">No Reviews Yet</h3>
                    <p className="text-muted-foreground">Be the first to share your thoughts!</p>
                </div>
            )}
        </div>
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Leave a Review</CardTitle>
                    <CardDescription>Share your thoughts with the community.</CardDescription>
                </CardHeader>
                <CardContent>
                    {!user ? (
                        <div className="text-center text-muted-foreground p-4 border border-dashed rounded-lg">
                            <p>You must be <Link href="/login" className="text-primary underline">logged in</Link> to leave a review.</p>
                        </div>
                    ) : userHasReviewed ? (
                         <div className="text-center text-muted-foreground p-4 border border-dashed rounded-lg">
                            <p>You've already reviewed this item. Thanks for your feedback!</p>
                        </div>
                    ) : (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="rating"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Your Rating</FormLabel>
                                            <FormControl>
                                                <StarRatingInput value={field.value} onChange={field.onChange} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="comment"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Your Review</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="What did you think?" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Submit Review
                                </Button>
                            </form>
                        </Form>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}


function StarRatingInput({ value, onChange }: { value: number; onChange: (value: number) => void; }) {
    const [hoverRating, setHoverRating] = useState(0);
    
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={cn(
                        "h-6 w-6 cursor-pointer transition-colors",
                        (hoverRating || value) >= star
                        ? "text-accent fill-accent"
                        : "text-muted-foreground/50 hover:text-muted-foreground"
                    )}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => onChange(star)}
                />
            ))}
        </div>
    );
}