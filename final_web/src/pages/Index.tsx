
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import UrlInput from '@/components/UrlInput';
import ImageGrid, { ScrapedImage } from '@/components/ImageGrid';
import { ScraperService } from '@/services/ScraperService';
import { Separator } from '@/components/ui/separator';

const Index = () => {
  const [images, setImages] = useState<ScrapedImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [serverStatus, setServerStatus] = useState<boolean | null>(null);

  // Check if the backend server is running
  useEffect(() => {
    const checkServer = async () => {
      try {
        const isUp = await ScraperService.checkHealth();
        setServerStatus(isUp);
        
        if (!isUp) {
          toast.error(
            "Backend server is not running. Please start the server with 'node server.js'",
            { duration: 8000 }
          );
        }
      } catch (error) {
        setServerStatus(false);
        toast.error("Failed to connect to backend server");
      }
    };
    
    checkServer();
  }, []);

  const handleScrape = async (urls: string[]) => {
    if (!serverStatus) {
      toast.error(
        "Cannot scrape: Backend server is not running. Please start the server with 'node server.js'", 
        { duration: 8000 }
      );
      return;
    }
    
    setIsLoading(true);
    
    try {
      const scrapedImages = await ScraperService.scrapeUrls(urls);
      setImages(scrapedImages);
      
      if (scrapedImages.length === 0) {
        toast.info("No images found on the provided URLs");
      } else {
        toast.success(`Found ${scrapedImages.length} images`);
      }
    } catch (error) {
      console.error('Scraping error:', error);
      toast.error("Failed to scrape URLs. Please check console for details.");
      setImages([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container py-8 flex-1">
        <div className="max-w-4xl mx-auto space-y-8">
          <section className="text-center space-y-4 mb-8">
            <h2 className="text-3xl md:text-4xl font-bold">Web Image Scraper</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Enter one or multiple URLs below to extract all images from those webpages.
              Results will appear in the gallery below.
            </p>
          </section>
          
          <UrlInput onScrape={handleScrape} isLoading={isLoading} />
          
          {(images.length > 0 || isLoading) && (
            <>
              <Separator className="my-8 bg-gray-700" />
              <section className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">
                    {isLoading ? 'Fetching images...' : `${images.length} Images Found`}
                  </h3>
                </div>
                <ImageGrid images={images} isLoading={isLoading} />
              </section>
            </>
          )}
        </div>
      </main>
      
      <footer className="border-t border-gray-700 py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Image Scraper &copy; {new Date().getFullYear()} - Built with React & Node.js</p>
          {serverStatus === false && (
            <p className="mt-2 text-destructive">
              ⚠️ Backend server is offline. Start with 'node server.js'
            </p>
          )}
        </div>
      </footer>
    </div>
  );
};

export default Index;
