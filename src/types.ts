export interface Feed {
  name: string;
  url: string;
  category: string;
  priority: number;
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
  priority: number;
}

export interface Settings {
  showImages: boolean;
  layout: 'grid' | 'list';
  sidebarCollapsed: boolean;
  customHeaders: Record<string, string>;
}