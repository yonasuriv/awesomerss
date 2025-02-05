import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Rss, Loader2, Moon, Sun, Settings2, Menu, AlertCircle, Flame, Compass } from 'lucide-react';
import { FeedCard } from './components/FeedCard';
import { Sidebar } from './components/Sidebar';
import { SettingsModal } from './components/SettingsModal';
import { loadFeeds } from './services/feeds';
import type { FeedItem, Settings } from './types';

const ITEMS_PER_PAGE = 32;

function App() {
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [displayedFeeds, setDisplayedFeeds] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Cybersecurity');
  const [isExploreMode, setIsExploreMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [page, setPage] = useState(0);
  const observerTarget = useRef<HTMLDivElement>(null);
  
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved) : {
      showImages: true,
      layout: 'grid',
      sidebarCollapsed: false,
      customHeaders: {}
    };
  });

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  const loadMoreFeeds = useCallback(() => {
    if (loadingMore) return;
    
    setLoadingMore(true);
    const start = page * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const newFeeds = feeds.slice(start, end);
    
    setDisplayedFeeds(prev => [...prev, ...newFeeds]);
    setPage(prev => prev + 1);
    setLoadingMore(false);
  }, [feeds, page, loadingMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && displayedFeeds.length < feeds.length) {
          loadMoreFeeds();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMoreFeeds, displayedFeeds.length, feeds.length]);

  useEffect(() => {
    const fetchFeeds = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const allFeeds = await loadFeeds(isExploreMode);
        setFeeds(allFeeds);
        setDisplayedFeeds(allFeeds.slice(0, ITEMS_PER_PAGE));
        setPage(1);
        
        if (allFeeds.length === 0) {
          setError('No feeds could be loaded. Please check your internet connection and try again.');
        }
      } catch (error) {
        console.error('Error fetching feeds:', error);
        setError('Failed to load feeds. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeeds();
  }, [isExploreMode]);

  const filteredFeeds = selectedCategory === 'All'
    ? displayedFeeds
    : displayedFeeds.filter(feed => feed.category === selectedCategory);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0a0f0d]' : 'bg-gray-50'} transition-colors duration-200`}>
      <Sidebar
        darkMode={darkMode}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={settings.sidebarCollapsed}
        onCollapse={() => setSettings(prev => ({
          ...prev,
          sidebarCollapsed: !prev.sidebarCollapsed
        }))}
      />

      <div className={`transition-all duration-200 ${settings.sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
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
                  Nitro RSS
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsExploreMode(!isExploreMode)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                    isExploreMode
                      ? 'bg-red-500 text-white'
                      : 'bg-[#40f8b5] text-[#0a0f0d]'
                  }`}
                >
                  {isExploreMode ? (
                    <Flame className="w-5 h-5" />
                  ) : (
                    <Compass className="w-5 h-5" />
                  )}
                  <span>{isExploreMode ? 'Exploring' : 'Latest'}</span>
                </button>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`px-4 py-2 rounded-md ${
                    darkMode
                      ? 'bg-[#1a2420] text-gray-300 border-[#243430]'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  } border focus:outline-none focus:ring-2 focus:ring-[#40f8b5]`}
                >
                  <option value="All">All Categories</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Tech">Tech</option>
                  <option value="Science">Science</option>
                  <option value="News">News</option>
                </select>

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
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-[#40f8b5]" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{error}</p>
            </div>
          ) : (
            <>
              <div className={`${settings.layout === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' 
                : 'space-y-4'}`}
              >
                {filteredFeeds.map((item, index) => (
                  <FeedCard 
                    key={`${item.link}-${index}`}
                    item={item} 
                    darkMode={darkMode}
                    showImage={settings.showImages && settings.layout === 'grid'}
                    layout={settings.layout}
                  />
                ))}
              </div>
              <div ref={observerTarget} className="h-10" />
              {loadingMore && (
                <div className="flex justify-center mt-4">
                  <Loader2 className="w-6 h-6 animate-spin text-[#40f8b5]" />
                </div>
              )}
            </>
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

export default App
