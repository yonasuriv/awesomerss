import React from 'react';
import { ExternalLink, Clock } from 'lucide-react';
import { FeedItem } from '../types';

interface FeedCardProps {
  item: FeedItem;
  darkMode: boolean;
  showImage: boolean;
}

export function FeedCard({ item, darkMode, showImage }: FeedCardProps) {
  const date = new Date(item.pubDate);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className={`${
      darkMode ? 'bg-[#0f1613] border-[#1a2420] hover:border-[#40f8b5]' : 'bg-white border-gray-200 hover:border-[#40f8b5]'
    } rounded-lg border shadow-sm overflow-hidden transition-all duration-300`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {item.feedName}
            </span>
            <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>•</span>
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {item.category}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <Clock className={`w-4 h-4 mr-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{formattedDate}</span>
          </div>
        </div>
        
        <h3 className={`text-xl font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          {item.title}
        </h3>
        
        {showImage && item.thumbnail && (
          <div className="mb-4">
            <img
              src={item.thumbnail}
              alt={item.title}
              className="w-full h-48 object-cover rounded-md"
            />
          </div>
        )}
        
        <div 
          className={`mb-4 line-clamp-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
          dangerouslySetInnerHTML={{ __html: item.description }}
        />
        
        <div className="flex items-center justify-between">
          {item.author && (
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              By {item.author}
            </span>
          )}
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-[#40f8b5] hover:text-[#7dffc9] transition-colors ml-auto"
          >
            Read more
            <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
}