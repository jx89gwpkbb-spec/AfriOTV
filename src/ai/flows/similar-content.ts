'use server';

/**
 * @fileOverview A flow for finding movies and TV shows similar to a given title.
 *
 * - findSimilarContent - A function that returns a list of similar content titles.
 * - SimilarContentInput - The input type for the findSimilarContent function.
 * - SimilarContentOutput - The return type for the findSimilarContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimilarContentInputSchema = z.object({
  title: z.string().describe('The title of the movie or TV show to find similar content for.'),
});
export type SimilarContentInput = z.infer<typeof SimilarContentInputSchema>;

const SimilarContentOutputSchema = z.object({
  recommendations: z
    .array(z.string())
    .describe(
      'A list of movie and TV show titles that are similar to the input title.'
    ),
});
export type SimilarContentOutput = z.infer<typeof SimilarContentOutputSchema>;

export async function findSimilarContent(
  input: SimilarContentInput
): Promise<SimilarContentOutput> {
  return similarContentFlow(input);
}

const similarContentPrompt = ai.definePrompt({
  name: 'similarContentPrompt',
  input: {schema: SimilarContentInputSchema},
  output: {schema: SimilarContentOutputSchema},
  prompt: `You are a movie and TV show recommendation expert. Find a list of movies and TV shows that are similar in theme, genre, and style to the following title:

Title: {{title}}

Provide only the titles of the recommendations.`,
});

const similarContentFlow = ai.defineFlow(
  {
    name: 'similarContentFlow',
    inputSchema: SimilarContentInputSchema,
    outputSchema: SimilarContentOutputSchema,
  },
  async input => {
    const {output} = await similarContentPrompt(input);
    return output!;
  }
);
