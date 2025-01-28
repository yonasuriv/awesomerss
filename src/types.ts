export interface Feed {
  name: string;
  url: string;
  category: string;
}

export interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  thumbnail?: string;
  author?: string;
  category: string;
  feedName: string;
}

export interface ParsedFeed {
  feed: {
    title: string;
    link: string;
    description: string;
  };
  items: FeedItem[];
}

export interface Settings {
  showImages: boolean;
  layout: 'grid' | 'list';
}

export interface DailyDevUser {
  id: string;
  name: string;
  image: string;
  username: string;
}

export interface DailyDevPost {
  id: string;
  title: string;
  permalink: string;
  publishedAt: string;
  createdAt: string;
  image: string;
  readTime: number;
  tags: string[];
  source: {
    name: string;
    image: string;
  };
  author: {
    name: string;
    image: string;
  };
}