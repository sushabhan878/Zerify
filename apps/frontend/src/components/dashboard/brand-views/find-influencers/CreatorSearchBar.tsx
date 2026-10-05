'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

interface CreatorSearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

export default function CreatorSearchBar({ value, onChange }: CreatorSearchBarProps) {
  return (
    <div className="relative w-full">
      <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        placeholder="Search creators, keywords, niches, bio, handles or skills..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all shadow-inner"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          type="button"
          aria-label="Clear search query"
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
