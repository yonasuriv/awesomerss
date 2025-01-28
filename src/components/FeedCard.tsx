import React from 'react';
import { Calendar, ExternalLink } from 'lucide-react';
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

  // Extract hashtags from description or use category
  const hashtags = item.description?.match(/#\w+/g) || [`#${item.category.toLowerCase()}`];

  return (
    <div className={`${
      darkMode ? 'bg-[#0f1613] hover:bg-[#1a2420]' : 'bg-white hover:bg-gray-50'
    } rounded-lg overflow-hidden transition-all duration-200 flex flex-col`}>
      {showImage && item.thumbnail ? (
        <div className="aspect-[2/1] overflow-hidden bg-gray-100">
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://placehold.co/300x150/gray/white?text=No+Image';
            }}
          />
        </div>
      ) : (
        <div className="aspect-[2/1] bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400">No image available</span>
        </div>
        )
      }

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

        <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {item.description}
        </p>

        <div className="space-y-4 flex-grow">
          <div className="flex flex-wrap gap-2">
            {hashtags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
                // If you wanna display the tags, uncoment it and paste it between the > <
                // {tag} 
              >
                
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
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