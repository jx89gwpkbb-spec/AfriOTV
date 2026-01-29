// src/ai/flows/personalized-recommendations.ts
'use server';

/**
 * @fileOverview A flow for generating personalized movie/TV show recommendations based on user viewing history and preferences.
 *
 * - generateRecommendations - A function that generates personalized content recommendations.
 * - RecommendationsInput - The input type for the generateRecommendations function.
 * - RecommendationsOutput - The return type for the generateRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendationsInputSchema = z.object({
  viewingHistory: z
    .array(z.string())
    .describe('A list of movie and TV show titles the user has watched.'),
  preferences: z
    .string()
    .describe(
      'A description of the user preferences, including genres, actors, directors, or any other relevant information.'
    ),
});
export type RecommendationsInput = z.infer<typeof RecommendationsInputSchema>;

const RecommendationsOutputSchema = z.object({
  recommendations: z
    .array(z.string())
    .describe(
      'A list of movie and TV show titles recommended to the user, based on their viewing history and preferences.'
    ),
});
export type RecommendationsOutput = z.infer<typeof RecommendationsOutputSchema>;

export async function generateRecommendations(
  input: RecommendationsInput
): Promise<RecommendationsOutput> {
  return recommendationsFlow(input);
}

const recommendationsPrompt = ai.definePrompt({
  name: 'recommendationsPrompt',
  input: {schema: RecommendationsInputSchema},
  output: {schema: RecommendationsOutputSchema},
  prompt: `You are a movie and TV show recommendation expert. Based on the user's viewing history and preferences, suggest movies and TV shows they might enjoy.

Viewing History: {{viewingHistory}}
Preferences: {{preferences}}

Recommendations:
`,
});

const recommendationsFlow = ai.defineFlow(
  {
    name: 'recommendationsFlow',
    inputSchema: RecommendationsInputSchema,
    outputSchema: RecommendationsOutputSchema,
  },
  async input => {
    const {output} = await recommendationsPrompt(input);
    return output!;
  }
);
