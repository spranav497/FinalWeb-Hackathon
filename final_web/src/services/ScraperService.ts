
import axios from 'axios';
import { ScrapedImage } from '@/components/ImageGrid';

// Define the API base URL
const API_URL = 'http://localhost:3001/api';

// Interface for scrape response
interface ScrapeResponse {
  results: {
    [url: string]: {
      success: boolean;
      count?: number;
      images?: ScrapedImage[];
      error?: string;
    };
  };
}

export const ScraperService = {
  // Scrape images from multiple URLs
  async scrapeUrls(urls: string[]): Promise<ScrapedImage[]> {
    try {
      const response = await axios.post<ScrapeResponse>(`${API_URL}/scrape`, { urls });
      
      // Combine all images from all URLs
      let allImages: ScrapedImage[] = [];
      
      Object.entries(response.data.results).forEach(([url, result]) => {
        if (result.success && result.images && result.images.length > 0) {
          allImages = [...allImages, ...result.images];
        }
      });
      
      return allImages;
    } catch (error) {
      console.error('Error scraping URLs:', error);
      throw error;
    }
  },
  
  // Check if API server is up
  async checkHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${API_URL}/health`);
      return response.data.status === 'ok';
    } catch (error) {
      return false;
    }
  }
};
