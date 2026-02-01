"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wand2, Loader2 } from 'lucide-react';
import { generateRecommendations } from '@/ai/flows/personalized-recommendations';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentGrid } from '@/components/shared/ContentGrid';
import { useContent } from '@/contexts/ContentContext';
import type { Content } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const FormSchema = z.object({
  viewingHistory: z.string().min(10, {
    message: "Please list a few movies or shows you've watched.",
  }),
  preferences: z.string().min(10, {
    message: "Tell us a bit about what you like (genres, actors, etc.).",
  }),
});

export default function RecommendationsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Content[]>([]);
  const { toast } = useToast();
  const { content: contentData } = useContent();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      viewingHistory: "The Matrix, Blade Runner 2049, Stranger Things",
      preferences: "I enjoy sci-fi with philosophical themes, synthwave soundtracks, and mind-bending plots. I'm also a fan of 80s nostalgia.",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setRecommendations([]);
    try {
      const result = await generateRecommendations({
        ...data,
        viewingHistory: data.viewingHistory.split(',').map(s => s.trim()),
      });
      const recommendedContent = result.recommendations
        .map(title => 
          contentData.find(item => item.title.toLowerCase() === title.toLowerCase())
        )
        .filter((item): item is Content => !!item);
      
      setRecommendations(recommendedContent);

      if (recommendedContent.length === 0) {
        toast({
          title: "No matches found in our library",
          description: "We got recommendations, but couldn't find them in our current catalog. Try being more specific!",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Could not generate recommendations. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-headline text-4xl md:text-5xl font-bold mb-2">For You</h1>
      <p className="text-muted-foreground mb-8">Let our AI find your next favorite movie or show.</p>

      <Card>
        <CardHeader>
          <CardTitle>Personalize Your Recommendations</CardTitle>
          <CardDescription>The more details you provide, the better the suggestions will be.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="viewingHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Viewing History</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., The Shawshank Redemption, Breaking Bad, The Office"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Preferences</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., I like psychological thrillers, movies directed by Christopher Nolan, and comedies with witty dialogue."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Generate Recommendations
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {recommendations.length > 0 && (
        <div className="mt-12">
          <h2 className="font-headline text-3xl font-bold mb-6">Here's What We Found For You</h2>
          <ContentGrid content={recommendations} />
        </div>
      )}
    </div>
  );
}
