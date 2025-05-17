const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to normalize URLs
const normalizeUrl = (url, baseUrl) => {
  try {
    // If the URL is already absolute, return it
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If the URL starts with '//', add https:
    if (url.startsWith('//')) {
      return `https:${url}`;
    }
    
    // Otherwise, resolve relative to base URL
    return new URL(url, baseUrl).href;
  } catch (error) {
    console.error('Error normalizing URL:', error);
    return null;
  }
};

// Main scraping endpoint
app.post('/api/scrape', async (req, res) => {
  const { urls } = req.body;
  
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: 'Please provide an array of URLs' });
  }
  
  try {
    const results = {};
    
    for (const url of urls) {
      try {
        // Validate URL
        const validatedUrl = new URL(url).href;
        
        // Fetch the page
        const response = await axios.get(validatedUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          timeout: 10000
        });
        
        // Load HTML into cheerio
        const $ = cheerio.load(response.data);
        const images = [];
        
        // Extract all image URLs
        $('img').each((_, element) => {
          const imgSrc = $(element).attr('src') || $(element).attr('data-src');
          
          if (imgSrc) {
            const normalizedUrl = normalizeUrl(imgSrc, validatedUrl);
            if (normalizedUrl && normalizedUrl.match(/\\.(jpeg|jpg|gif|png|webp|svg)/i)) {
              images.push({
                url: normalizedUrl,
                alt: $(element).attr('alt') || '',
                width: $(element).attr('width') || 'unknown',
                height: $(element).attr('height') || 'unknown'
              });
            }
          }
        });
        
        // Also check for background images in style attributes and CSS
        $('[style*="background"]').each((_, element) => {
          const style = $(element).attr('style');
          if (style) {
            const match = style.match(/url\\(['"]?([^'"\\)]+)['"]?\\)/i);
            if (match && match[1]) {
              const normalizedUrl = normalizeUrl(match[1], validatedUrl);
              if (normalizedUrl) {
                images.push({
                  url: normalizedUrl,
                  alt: 'Background Image',
                  width: 'unknown',
                  height: 'unknown'
                });
              }
            }
          }
        });
        
        results[url] = {
          success: true,
          count: images.length,
          images
        };
      } catch (error) {
        results[url] = {
          success: false,
          error: error.message
        };
      }
    }
    
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
