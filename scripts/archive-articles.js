import { promises as fs } from 'fs';
import path from 'path';
import { loadFeeds } from '../src/services/feeds.ts';

async function ensureDirectoryExists(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    if (error.code !== 'EXIST') {
      throw error;
    }
  }
}

async function archiveArticles() {
  try {
    // Load all feeds
    const feeds = await loadFeeds(false);
    
    // Group articles by date
    const articles = feeds.reduce((acc, feed) => {
      const date = new Date(feed.pubDate);
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      
      const key = `${year}/${month}/${day}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      
      acc[key].push({
        title: feed.title,
        image: feed.thumbnail || '',
        permalink: feed.link,
        createdAt: date.toISOString(),
        summary: feed.description,
        tags: [feed.category]
      });
      
      return acc;
    }, {});
    
    // Save articles to files
    for (const [datePath, dateArticles] of Object.entries(articles)) {
      const dirPath = path.join(process.cwd(), 'articles', datePath);
      await ensureDirectoryExists(dirPath);
      
      const filePath = path.join(dirPath, 'articles.json');
      await fs.writeFile(filePath, JSON.stringify({
        node: dateArticles
      }, null, 2));
      
      console.log(`Archived ${dateArticles.length} articles for ${datePath}`);
    }
  } catch (error) {
    console.error('Error archiving articles:', error);
    process.exit(1);
  }
}

archiveArticles();
