import React, { useEffect, useState } from 'react';
import { getDailyDevFeed } from '../services/dailydev';
import { FeedCard } from './FeedCard';
import { Loader2, AlertCircle } from 'lucide-react';
import type { DailyDevPost } from '../types';

interface DailyDevFeedProps {
  darkMode: boolean;
  showImages: boolean;
  layout: 'grid' | 'list';
}

export function DailyDevFeed({ darkMode, showImages, layout }: DailyDevFeedProps) {
  const [posts, setPosts] = useState<DailyDevPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeed() {
      try {
        setLoading(true);
        const data = await getDailyDevFeed();
        setPosts(data.posts || data);
      } catch (error) {
        setError('Failed to load Daily.dev feed.');
      } finally {
        setLoading(false);
      }
    }

    fetchFeed();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#40f8b5]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{error}</p>
      </div>
    );
  }

  return (
    <div className={`${layout === 'grid' 
      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
      : 'space-y-4'}`}
    >
      {posts.map((post) => (
        <FeedCard
          key={post.id}
          item={{
            title: post.title,
            link: post.permalink,
            pubDate: post.publishedAt,
            description: post.tags?.map(tag => `#${tag}`).join(' ') || '',
            thumbnail: post.image,
            author: post.author?.name,
            category: post.tags?.[0] || 'General',
            feedName: post.source?.name || 'Daily.dev'
          }}
          darkMode={darkMode}
          showImage={showImages}
        />
      ))}
    </div>
  );
}