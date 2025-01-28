import React from 'react';
import { X, LayoutGrid, LayoutList, Image } from 'lucide-react';
import type { Settings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  darkMode: boolean;
}

export function SettingsModal({ isOpen, onClose, settings, onSettingsChange, darkMode }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 rounded-lg shadow-xl z-50 ${
        darkMode ? 'bg-[#0f1613] text-gray-100' : 'bg-white text-gray-900'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-md ${
              darkMode ? 'hover:bg-[#1a2420]' : 'hover:bg-gray-100'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Layout</h3>
            <div className="flex space-x-4">
              <button
                onClick={() => onSettingsChange({ ...settings, layout: 'grid' })}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                  settings.layout === 'grid'
                    ? 'bg-[#40f8b5] text-[#0a0f0d]'
                    : darkMode
                    ? 'bg-[#1a2420] text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <LayoutGrid className="h-5 w-5" />
                <span>Grid</span>
              </button>
              <button
                onClick={() => onSettingsChange({ ...settings, layout: 'list' })}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                  settings.layout === 'list'
                    ? 'bg-[#40f8b5] text-[#0a0f0d]'
                    : darkMode
                    ? 'bg-[#1a2420] text-gray-300'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <LayoutList className="h-5 w-5" />
                <span>List</span>
              </button>
            </div>
          </div>

          {/* <div>
            <h3 className="text-lg font-medium mb-3">Display</h3>
            <button
              onClick={() => onSettingsChange({ ...settings, showImages: !settings.showImages })}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                settings.showImages
                  ? 'bg-[#40f8b5] text-[#0a0f0d]'
                  : darkMode
                  ? 'bg-[#1a2420] text-gray-300'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Image className="h-5 w-5" />
              <span>Show Images</span>
            </button>
          </div> */}
        </div>
      </div>
    </>
  );
}