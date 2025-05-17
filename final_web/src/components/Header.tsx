
import React from 'react';

const Header = () => {
  return (
    <header className="py-6 border-b border-gray-700">
      <div className="container flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-brightTeal">
          Image<span className="text-lightGray">Scraper</span>
        </h1>
        <div className="flex gap-2">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-white transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
