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