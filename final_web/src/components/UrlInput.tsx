
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface UrlInputProps {
  onScrape: (urls: string[]) => void;
  isLoading: boolean;
}

const UrlInput: React.FC<UrlInputProps> = ({ onScrape, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Split by newline or comma and trim whitespace
    const rawUrls = input.split(/[\n,]+/).map(url => url.trim()).filter(Boolean);
    
    if (rawUrls.length === 0) {
      toast.error("Please enter at least one URL");
      return;
    }
    
    // Basic URL validation
    const validUrls = [];
    const invalidUrls = [];
    
    for (const url of rawUrls) {
      try {
        // Try to construct a URL object (validates format)
        new URL(url.startsWith('http') ? url : `https://${url}`);
        validUrls.push(url.startsWith('http') ? url : `https://${url}`);
      } catch (e) {
        invalidUrls.push(url);
      }
    }
    
    if (invalidUrls.length > 0) {
      toast.error(`Invalid URLs detected: ${invalidUrls.join(', ')}`);
      return;
    }
    
    onScrape(validUrls);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="space-y-4">
        <Textarea
          placeholder="Enter URLs to scrape (one per line or comma-separated)
Example: https://example.com, https://another-site.org"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[120px] bg-cardBg border-gray-700 focus:border-brightTeal"
        />
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-teal hover:bg-brightTeal text-white"
          >
            {isLoading ? 'Scraping...' : 'Scrape Images'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default UrlInput;
