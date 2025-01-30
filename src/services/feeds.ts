import { Feed, FeedItem } from '../types';

async function loadFeedConfig(category: string): Promise<Feed[]> {
  try {
    const base = import.meta.env.BASE_URL || '/';
    const response = await fetch(`${base}feeds/${category.toLowerCase()}.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.feeds.map((feed: Feed) => ({
      ...feed,
      category: category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')
    }));
  } catch (error) {
    console.error(`Error loading ${category} feeds:`, error);
    return [];
  }
}

async function loadAllFeedConfigs(): Promise<Feed[]> {
  const categories = ['cybersecurity', 'cloud-security', 'tech', 'science', 'news'];
  const feedsPromises = categories.map(loadFeedConfig);
  const feedsArrays = await Promise.all(feedsPromises);
  return feedsArrays.flat();
}

export async function loadFeeds(selectedDate: string | null, customHeaders: Record<string, string> = {}): Promise<FeedItem[]> {
  const feedConfigs = await loadAllFeedConfigs();
  const proxyUrl = 'https://api.allorigins.win/raw?url=';
  
  const feedPromises = feedConfigs.map(async (feed) => {
    try {
      const headers = new Headers(customHeaders);
      const response = await fetch(`${proxyUrl}${encodeURIComponent(feed.url)}`, { headers });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'text/xml');
      
      const items = Array.from(xml.querySelectorAll('item')).map(item => {
        const title = item.querySelector('title')?.textContent || '';
        const link = item.querySelector('link')?.textContent || '';
        const pubDate = item.querySelector('pubDate')?.textContent || '';
        const description = item.querySelector('description')?.textContent || '';
        const pubDateTime = new Date(pubDate);
        
        // If selectedDate is null, show all dates
        // Otherwise, only show items from the selected date
        if (selectedDate) {
          const selectedDateTime = new Date(selectedDate);
          if (pubDateTime.toDateString() !== selectedDateTime.toDateString()) {
            return null;
          }
        }
        
        // Extract embedded content
        const content = item.querySelector('content\\:encoded, encoded')?.textContent || description;
        const mediaContent = item.querySelector('media\\:content, content');
        const enclosure = item.querySelector('enclosure');
        
        // Try different methods to get the thumbnail
        let thumbnail = '';
        if (mediaContent?.getAttribute('url')) {
          thumbnail = mediaContent.getAttribute('url') || '';
        } else if (enclosure?.getAttribute('url')) {
          thumbnail = enclosure.getAttribute('url') || '';
        } else {
          const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
          if (imgMatch) {
            thumbnail = imgMatch[1];
          }
        }
        
        const author = item.querySelector('author, dc\\:creator')?.textContent || '';
        
        return {
          title,
          link,
          pubDate,
          description,
          thumbnail,
          author,
          category: feed.category,
          feedName: feed.name,
          priority: feed.priority
        };
      }).filter((item): item is FeedItem => item !== null);
      
      return items;
    } catch (error) {
      console.warn(`Failed to fetch feed ${feed.name}:`, error);
      return [];
    }
  });

  const results = await Promise.all(feedPromises);
  const allFeeds = results.flat().sort((a, b) => {
    // First sort by date (newest first)
    const dateA = new Date(a.pubDate).getTime();
    const dateB = new Date(b.pubDate).getTime();
    if (dateB !== dateA) return dateB - dateA;
    
    // If same date, sort by priority
    return b.priority - a.priority;
  });
  
  return allFeeds;
}

export function getCategories(): string[] {
  return ['All', 'Cybersecurity', 'Cloud Security', 'Tech', 'Science', 'News'];
}