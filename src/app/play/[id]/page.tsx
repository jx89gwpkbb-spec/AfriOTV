import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { contentData } from '@/lib/data';
import { Button } from '@/components/ui/button';

export default function PlayPage({ params }: { params: { id: string } }) {
  const content = contentData.find((item) => item.id === params.id);

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
        <video 
          className="w-full h-full"
          controls
          autoPlay
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          poster={content.coverPath}
        >
          Your browser does not support the video tag.
        </video>
      </div>

       <h1 className="text-2xl font-bold mt-4 text-white">{content.title}</h1>
    </div>
  );
}
