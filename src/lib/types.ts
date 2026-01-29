export type Content = {
  id: string;
  title: string;
  type: 'movie' | 'tv';
  description: string;
  posterPath: string;
  coverPath: string;
  genres: string[];
  rating: number;
  duration: string;
  cast: string[];
  releaseYear: number;
  isTrending?: boolean;
};

export interface UserProfile {
  displayName: string;
  email: string;
  photoURL?: string;
}
