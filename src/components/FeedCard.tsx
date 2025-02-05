import React, { useEffect, useState } from 'react';
import { Calendar, ExternalLink } from 'lucide-react';
import { FeedItem } from '../types';

interface FeedCardProps {
  item: FeedItem;
  darkMode: boolean;
  showImage: boolean;
  layout: 'grid' | 'list';
}

export function FeedCard({ item, darkMode, showImage, layout }: FeedCardProps) {
  const date = new Date(item.pubDate);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const [favicon, setFavicon] = useState<string>('');

  useEffect(() => {
    const getFavicon = () => {
      try {
        const url = new URL(item.link);
        return `${url.protocol}//${url.hostname}/favicon.ico`;
      } catch {
        return '';
      }
    };
    setFavicon(getFavicon());
  }, [item.link]);

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const summary = stripHtml(item.description).slice(0, 150) + '...';

  if (layout === 'list') {
    return (
      <div className={`${
        darkMode ? 'bg-[#0f1613] hover:bg-[#1a2420]' : 'bg-white hover:bg-gray-50'
      } p-4 rounded-lg transition-all duration-200`}>
        <div className="flex items-start">
          {favicon && (
            <img
              src={favicon}
              alt=""
              className="w-6 h-6 mt-1 mr-4"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <div className="flex-1">
            <a 
              href={item.link}
              target="_blank"
              rel="noopener noreferrer" 
              className={`text-base font-medium hover:underline ${
                darkMode ? 'text-gray-100' : 'text-gray-900'
              }`}
            >
              {item.title}
            </a>
            <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {summary}
            </p>
            <div className="flex items-center mt-2 space-x-4">
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {item.feedName}
              </span>
              <div className="flex items-center space-x-1">
                <Calendar className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formattedDate}
                </span>
              </div>
            </div>
          </div>
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`ml-4 p-2 rounded-md transition-colors ${
              darkMode 
                ? 'bg-[#1a2420] text-gray-300 hover:bg-[#243430]' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`${
      darkMode ? 'bg-[#0f1613] hover:bg-[#1a2420]' : 'bg-white hover:bg-gray-50'
    } rounded-lg overflow-hidden transition-all duration-200 flex flex-col`}>
      {showImage && item.thumbnail && (
        <div className="aspect-[2/1] overflow-hidden bg-gray-100">
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = 'https://raw.githubusercontent.com/yonasuriv/rss/refs/heads/main/public/assets/placeholder.png';
            }}
          />
        </div>
      )}

      <div className="p-4 flex flex-col flex-grow">
        <a 
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-sm mb-3 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          {item.feedName}
        </a>
        
        <a 
          href={item.link}
          target="_blank"
          rel="noopener noreferrer" 
          className={`text-lg font-semibold mb-2 hover:underline ${
            darkMode ? 'text-gray-100' : 'text-gray-900'
          }`}
        >
          {item.title}
        </a>

        <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {summary}
        </p>

        

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Calendar className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {formattedDate}
            </span>
          </div>

          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              darkMode 
                ? 'bg-[#1a2420] text-gray-300 hover:bg-[#243430]' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Read post
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        </div>
      </div>
    </div>
  );
}
