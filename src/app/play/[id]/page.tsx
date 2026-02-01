'use client';

import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useContent } from '@/contexts/ContentContext';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';

export default function PlayPage() {
  const params = useParams<{ id: string }>();
  const { content: contentData, isLoading } = useContent();
  const content = useMemo(() => contentData.find((item) => item.id === params.id), [contentData, params.id]);

  const getYouTubeEmbedUrl = (url: string): string => {
    if (!url) return '';
    let videoId = null;
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
        if (urlObj.pathname === '/watch') {
          videoId = urlObj.searchParams.get('v');
        } else if (urlObj.pathname.startsWith('/embed/')) {
          videoId = urlObj.pathname.split('/embed/')[1];
        }
      } else if (urlObj.hostname === 'youtu.be') {
        videoId = urlObj.pathname.slice(1);
      }
    } catch (error) {
      // Not a valid URL, so it won't be a YouTube URL.
      // We will fall back to the video tag.
      return url;
    }
    
    if (videoId) {
      // adding autoplay=1 to make it play directly
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    
    // Fallback for non-youtube but valid URLs
    return url;
  };

  const videoUrl = useMemo(() => content ? getYouTubeEmbedUrl(content.videoUrl) : '', [content]);
  const isYouTubeVideo = videoUrl.includes('youtube.com/embed');


  if (isLoading) {
    return (
      <div className="bg-black w-full h-screen flex flex-col items-center justify-center relative">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (!content) {
    notFound();
  }

  return (
    <div className="bg-black w-full h-screen flex flex-col items-center justify-center relative">
       <Link href={`/content/${params.id}`} className="absolute top-4 left-4 z-20">
        <Button variant="outline" size="icon">
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back to details</span>
        </Button>
      </Link>
      
      <div className="w-full max-w-4xl aspect-video bg-zinc-900 flex items-center justify-center rounded-lg shadow-2xl">
        {isYouTubeVideo ? (
           <iframe
              className="w-full h-full"
              src={videoUrl}
              title={content.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
        ) : (
            <video 
              className="w-full h-full"
              controls
              playsInline
              src={videoUrl}
              poster={content.coverPath}
            >
              Your browser does not support the video tag.
            </video>
        )}
      </div>

       <h1 className="text-2xl font-bold mt-4 text-white">{content.title}</h1>
    </div>
  );
}
