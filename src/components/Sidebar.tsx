import React from 'react';
import { Home, Rss, History, Bookmark, Tag, Settings2, MessageCircleHeart, ScrollText, BookOpenText, Link, Star, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  darkMode: boolean;
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onCollapse: () => void;
}

export function Sidebar({ 
  darkMode, 
  isOpen, 
  onClose,
  collapsed,
  onCollapse 
}: SidebarProps) {
  const menuItems = [
    { id: 'rss' as const, icon: Home, label: 'Home' },
    // { icon: Home, label: 'Plugins' },
    // { icon: History, label: 'History' },
    // { icon: Bookmark, label: 'Bookmarks' },
    // { icon: Tag, label: 'Categories' },
    { icon: MessageCircleHeart, label: 'Feedback' },
    { icon: Link, label: 'Submit a link' },
    { icon: ScrollText, label: 'Changelog' },
    { icon: BookOpenText, label: 'Documentation' },
    { icon: Star, label: 'Star Repository' },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          darkMode ? 'bg-[#0f1613] border-[#1a2420]' : 'bg-white border-gray-200'
        } border-r shadow-lg transform transition-all duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Rss className="h-6 w-6 text-[#40f8b5]" />
              {!collapsed && (
                // Sidebar title if enabled should be writen in the span below
                <span className={`ml-3 font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                   
                </span>
              )}
            </div>
            <div className="flex items-center">
              <button
                onClick={onCollapse}
                className={`p-2 rounded-md ${
                  darkMode ? 'hover:bg-[#1a2420]' : 'hover:bg-gray-100'
                } lg:block hidden`}
              >
                {collapsed ? (
                  <ChevronRight className={`h-5 w-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                ) : (
                  <ChevronLeft className={`h-5 w-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                )}
              </button>
              <button
                onClick={onClose}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-[#1a2420]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <nav>
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.label}>
                  <button
                    className={`w-full flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-md transition-colors ${
                      darkMode
                        ? 'text-gray-300 hover:bg-[#1a2420]'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
