'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

interface CampaignSearchBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onClear: () => void;
}

export default function CampaignSearchBar({
  searchQuery,
  onSearchChange,
  onClear,
}: CampaignSearchBarProps) {
  return (
    <div className="relative flex-1">
      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search campaigns by title, brand, hashtags, deliverables..."
        className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20 transition-all font-medium"
      />
      {searchQuery && (
        <button
          onClick={onClear}
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
