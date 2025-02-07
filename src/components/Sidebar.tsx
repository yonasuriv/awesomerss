import React, { useState } from 'react';
import { Rss, History, Bookmark, Tag, Settings2, ChevronDown, ChevronRight, Home, Star, MessageCircle, Link2, ScrollText } from 'lucide-react';
import metadata from '../metadata.json';

interface SidebarProps {
  darkMode: boolean;
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onCollapse: () => void;
}

interface MenuSection {
  title: string;
  items: {
    icon: React.ElementType;
    label: string;
    href?: string;
  }[];
}

export function Sidebar({ 
  darkMode, 
  isOpen, 
  onClose,
  collapsed,
  onCollapse 
}: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Main': true,
    'Categories': true,
    'Links': true
  });

  const menuSections: MenuSection[] = [
    {
      title: 'Main',
      items: [
        { icon: Home, label: 'Home' },
        { icon: History, label: 'History' },
        { icon: Bookmark, label: 'Bookmarks' }
      ]
    },
    {
      title: 'Categories',
      items: [
        { icon: Tag, label: 'Cybersecurity' },
        { icon: Tag, label: 'Tech' },
        { icon: Tag, label: 'Science' },
        { icon: Tag, label: 'World' }
      ]
    },
    {
      title: 'Links',
      items: [
        { icon: Star, label: 'Fork Repository', href: 'https://github.com/yonasuriv/rss/fork' },
        { icon: MessageCircle, label: 'Submit an issue', href: 'https://github.com/yonasuriv/rss/issues/new?template=Blank+issue' },
        { icon: Link2, label: 'Submit a link', href: 'https://github.com/yonasuriv/rss/issues/new?template=feed-update--new-feed-request.md' },
        { icon: ScrollText, label: 'Changelog', href: 'https://github.com/yonasuriv/rss/wiki' }
      ]
    }
  ];

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full flex flex-col ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          darkMode ? 'bg-[#0f1613] border-[#1a2420]' : 'bg-white border-gray-200'
        } border-r shadow-lg transform transition-all duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <button
          onClick={onCollapse}
          className={`w-full p-4 flex items-center transition-colors ${
            darkMode ? 'hover:bg-[#1a2420]' : 'hover:bg-gray-100'
          }`}
        >
          <Rss className="h-6 w-6 text-[#40f8b5]" />
          {!collapsed && (
            <span className={`ml-3 font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              NITRO RSS
            </span>
          )}
        </button>

        <div className="flex-1 overflow-y-auto">
          <nav className="p-4">
            {menuSections.map((section) => (
              <div key={section.title} className="mb-6">
                {!collapsed && (
                  <button
                    onClick={() => toggleSection(section.title)}
                    className={`w-full flex items-center justify-between mb-2 px-2 py-1 rounded-md ${
                      darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-sm font-medium">{section.title}</span>
                    {expandedSections[section.title] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                )}
                {(collapsed || expandedSections[section.title]) && (
                  <ul className="space-y-1">
                    {section.items.map((item) => (
                      <li key={item.label}>
                        {item.href ? (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-md transition-colors ${
                              darkMode
                                ? 'text-gray-300 hover:bg-[#1a2420]'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <item.icon className="h-5 w-5" />
                            {!collapsed && <span>{item.label}</span>}
                          </a>
                        ) : (
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
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={() => window.location.href = ''}
            className={`w-full flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-md transition-colors ${
              darkMode
                ? 'text-gray-300 hover:bg-[#1a2420]'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Settings2 className="h-5 w-5" />
            {!collapsed && <span>Settings</span>}
          </button>

          {!collapsed && (
            <div className={`mt-4 text-xs text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <div>Version {metadata.version}</div>
              <div className="mt-1">{metadata.copyright}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
