import React, { useState, useEffect } from 'react';
import { Rss, Loader2, Moon, Sun, Settings2, Menu, AlertCircle } from 'lucide-react';
import { feedsConfig } from './config/feeds.config';
import { FeedCard } from './components/FeedCard';
import { Sidebar } from './components/Sidebar';
import { SettingsModal } from './components/SettingsModal';
import { DailyDevFeed } from './components/DailyDevFeed';
import { UserProfile } from './components/UserProfile';
import { getDailyDevUser } from './services/dailydev';
import type { ParsedFeed, FeedItem, Settings, DailyDevUser } from './types';

function App() {
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'rss' | 'daily'>('rss');
  const [user, setUser] = useState<DailyDevUser | null>(null);
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
    async function checkUser() {
      const userData = await getDailyDevUser();
      setUser(userData);
    }
    checkUser();
  }, []);

  useEffect(() => {
    const fetchFeeds = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const feedPromises = feedsConfig.map(async (feed) => {
          try {
            // Use a CORS proxy to fetch the RSS feeds
            const proxyUrl = 'https://api.allorigins.win/raw?url=';
            const response = await fetch(`${proxyUrl}${encodeURIComponent(feed.url)}`);
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const text = await response.text();
            const parser = new DOMParser();
            const xml = parser.parseFromString(text, 'text/xml');
            
            // Parse the RSS feed
            const items = Array.from(xml.querySelectorAll('item')).map(item => {
              const title = item.querySelector('title')?.textContent || '';
              const link = item.querySelector('link')?.textContent || '';
              const pubDate = item.querySelector('pubDate')?.textContent || '';
              const description = item.querySelector('description')?.textContent || '';
              
              // Try to find an image in the description or content
              let thumbnail = '';
              const content = item.querySelector('content\\:encoded, encoded')?.textContent || description;
              const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
              if (imgMatch) {
                thumbnail = imgMatch[1];
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
                feedName: feed.name
              };
            });
            
            return items;
          } catch (error) {
            console.warn(`Failed to fetch feed ${feed.name}:`, error);
            return []; // Return empty array for failed feeds
          }
        });

        const results = await Promise.all(feedPromises);
        const allFeeds = results.flat().sort((a, b) => 
          new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
        );
        
        if (allFeeds.length === 0) {
          setError('No feeds could be loaded. Please check your internet connection and try again.');
        } else {
          setFeeds(allFeeds);
        }
      } catch (error) {
        console.error('Error fetching feeds:', error);
        setError('Failed to load feeds. Please try again later.');
      } finally {
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
        activeTab={activeTab}
        onTabChange={setActiveTab}
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
                {/* <Rss className="h-6 w-6 text-[#40f8b5] ml-2 lg:ml-0" />
                <h1 className={`ml-3 text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  RSS Reader
                </h1> */}
              </div>
              <div className="flex items-center space-x-4">
                <UserProfile user={user} darkMode={darkMode} />
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
            {activeTab === 'rss' && (
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
            )}
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'rss' ? (
            loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[#40f8b5]" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
                <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{error}</p>
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
            )
          ) : (
            <DailyDevFeed
              darkMode={darkMode}
              showImages={settings.showImages}
              layout={settings.layout}
            />
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