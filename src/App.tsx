import React, { useState, useEffect } from 'react';
import { Rss, Loader2, Moon, Sun, Settings2, Menu } from 'lucide-react';
import { feedsConfig } from './config/feeds.config';
import { FeedCard } from './components/FeedCard';
import { Sidebar } from './components/Sidebar';
import { SettingsModal } from './components/SettingsModal';
import type { ParsedFeed, FeedItem, Settings } from './types';

function App() {
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved) : { showImages: true, layout: 'grid' };
  });
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  const categories = ['All', ...new Set(feedsConfig.map(feed => feed.category))];

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        const feedPromises = feedsConfig.map(async (feed) => {
          const response = await fetch(
            `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`
          );
          const data: ParsedFeed = await response.json();
          return data.items.map(item => ({
            ...item,
            category: feed.category,
            feedName: feed.name
          }));
        });

        const results = await Promise.all(feedPromises);
        const allFeeds = results.flat().sort((a, b) => 
          new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
        );
        setFeeds(allFeeds);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching feeds:', error);
        setLoading(false);
      }
    };

    fetchFeeds();
  }, []);

  const filteredFeeds = selectedCategory === 'All'
    ? feeds
    : feeds.filter(feed => feed.category === selectedCategory);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0a0f0d]' : 'bg-gray-50'} transition-colors duration-200`}>
      <Sidebar
        darkMode={darkMode}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <header className={`${darkMode ? 'bg-[#0f1613] border-[#1a2420]' : 'bg-white border-gray-200'} border-b shadow-sm sticky top-0 z-10`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className={`lg:hidden p-2 rounded-md ${
                    darkMode ? 'text-gray-300 hover:bg-[#1a2420]' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Menu className="h-6 w-6" />
                </button>
                <Rss className="h-6 w-6 text-[#40f8b5] ml-2 lg:ml-0" />
                <h1 className={`ml-3 text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  RSS Reader
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`p-2 rounded-md ${darkMode ? 'bg-[#1a2420] text-gray-300 hover:bg-[#243430]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} transition-colors`}
                    aria-label="Toggle dark mode"
                  >
                    {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => setSettingsOpen(true)}
                    className={`p-2 rounded-md ${darkMode ? 'bg-[#1a2420] text-gray-300 hover:bg-[#243430]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} transition-colors`}
                    aria-label="Settings"
                  >
                    <Settings2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-[#40f8b5] text-[#0a0f0d]'
                      : darkMode 
                        ? 'bg-[#1a2420] text-gray-300 hover:bg-[#243430]'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-[#40f8b5]" />
            </div>
          ) : (
            <div className={`${settings.layout === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' 
              : 'space-y-4'}`}
            >
              {filteredFeeds.map((item, index) => (
                <FeedCard 
                  key={index} 
                  item={item} 
                  darkMode={darkMode}
                  showImage={settings.showImages}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
        darkMode={darkMode}
      />
    </div>
  );
}

export default App;