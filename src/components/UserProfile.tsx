import React from 'react';
import type { DailyDevUser } from '../types';
import { LogIn } from 'lucide-react';
import { openDailyDevLogin } from '../services/dailydev';

interface UserProfileProps {
  user: DailyDevUser | null;
  darkMode: boolean;
}

export function UserProfile({ user, darkMode }: UserProfileProps) {
  if (!user) {
    return (
      <button
        onClick={openDailyDevLogin}
        className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
          darkMode
            ? 'bg-[#1a2420] text-gray-300 hover:bg-[#243430]'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        <LogIn className="w-5 h-5" />
        <span>Login with Daily.dev</span>
      </button>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <img
        src={user.image}
        alt={user.name}
        className="w-8 h-8 rounded-full"
      />
      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        {user.name}
      </span>
    </div>
  );
}