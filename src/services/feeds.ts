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
  const categories = ['cybersecurity', 'tech', 'science', 'news'];
  const feedsPromises = categories.map(loadFeedConfig);
  const feedsArrays = await Promise.all(feedsPromises);
  return feedsArrays.flat();
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export async function loadFeeds(isExploreMode: boolean): Promise<FeedItem[]> {
  const feedConfigs = await loadAllFeedConfigs();
  const proxyUrl = 'https://api.allorigins.win/raw?url=';
  
  const feedPromises = feedConfigs.map(async (feed) => {
    try {
      const response = await fetch(`${proxyUrl}${encodeURIComponent(feed.url)}`);
      
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
        
        // If no thumbnail found, use a placeholder
        // if (!thumbnail) {
        //   thumbnail = `https://source.unsplash.com/featured/800x400/?${encodeURIComponent(feed.category.toLowerCase())}`;
        // }

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
      });
      
      return items;
    } catch (error) {
      console.warn(`Failed to fetch feed ${feed.name}:`, error);
      return [];
    }
  });

  const results = await Promise.all(feedPromises);
  let allFeeds = results.flat();

  if (isExploreMode) {
    // In explore mode, shuffle the feeds randomly
    allFeeds = shuffleArray(allFeeds);
  } else {
    // In latest mode, sort by date and priority
    allFeeds.sort((a, b) => {
      const dateA = new Date(a.pubDate).getTime();
      const dateB = new Date(b.pubDate).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return b.priority - a.priority;
    });
  }
  
  return allFeeds;
}

export function getCategories(): string[] {
  return ['All', 'Cybersecurity', 'Tech', 'Science', 'News'];
}
