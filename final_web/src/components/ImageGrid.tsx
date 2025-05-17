
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Image, ImageOff } from 'lucide-react';

export interface ScrapedImage {
  url: string;
  alt: string;
  width: string | number;
  height: string | number;
}

interface ImageGridProps {
  images: ScrapedImage[];
  isLoading: boolean;
}

const ImageGrid: React.FC<ImageGridProps> = ({ images, isLoading }) => {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const handleImageError = (url: string) => {
    setFailedImages(prev => new Set(prev).add(url));
  };

  // Loading placeholders
  if (isLoading) {
    return (
      <div className="image-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="image-card">
            <CardContent className="p-0">
              <Skeleton className="w-full h-[200px]" />
            </CardContent>
            <CardFooter className="px-4 py-3">
              <Skeleton className="h-4 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  // No images state
  if (!isLoading && images.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 mb-4 text-muted-foreground flex items-center justify-center rounded-full bg-muted">
          <Image size={24} />
        </div>
        <h3 className="text-xl font-semibold mb-2">No images found</h3>
        <p className="text-muted-foreground mb-4">
          Enter URLs to scrape or try different websites
        </p>
      </div>
    );
  }

  return (
    <div className="image-grid">
      {images.map((image, index) => (
        <Card key={`${image.url}-${index}`} className="image-card">
          <CardContent className="p-0">
            {!failedImages.has(image.url) ? (
              <img 
                src={image.url} 
                alt={image.alt || 'Scraped image'} 
                onError={() => handleImageError(image.url)}
                loading="lazy"
              />
            ) : (
              <div className="image-placeholder">
                <ImageOff size={40} className="text-muted-foreground" />
              </div>
            )}
          </CardContent>
          <CardFooter className="px-4 py-2 flex justify-between items-center bg-card text-sm truncate">
            <div className="truncate max-w-[180px]">
              {image.alt || 'No description'}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => window.open(image.url, '_blank')}
              className="text-xs"
            >
              Open
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default ImageGrid;
