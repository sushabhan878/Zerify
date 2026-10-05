'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface ThemeToggleProps {
  isCollapsed?: boolean;
}

export default function ThemeToggle({ isCollapsed = false }: ThemeToggleProps) {
  const { theme, setTheme, toggleTheme } = useTheme();

  if (isCollapsed) {
    return (
      <div className="flex justify-center">
        <button
          onClick={toggleTheme}
          type="button"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 hover:border-purple-500/40 text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="p-2 rounded-2xl bg-slate-900/90 border border-white/10 space-y-1.5">
      <div className="px-1 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          APPEARANCE
        </span>
        <span className="text-[9.5px] font-extrabold text-purple-400 uppercase">
          {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-950/80 border border-white/5">
        <button
          onClick={() => setTheme('light')}
          type="button"
          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-extrabold transition-all duration-200 ${
            theme === 'light'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md scale-[1.02]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Sun className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-slate-950' : 'text-amber-400'}`} />
          <span>Light</span>
        </button>

        <button
          onClick={() => setTheme('dark')}
          type="button"
          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-extrabold transition-all duration-200 ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white shadow-md scale-[1.02]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Moon className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-white' : 'text-indigo-400'}`} />
          <span>Dark</span>
        </button>
      </div>
    </div>
  );
}
