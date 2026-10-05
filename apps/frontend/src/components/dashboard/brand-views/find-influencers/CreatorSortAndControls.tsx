'use client';

import React from 'react';
import { ArrowUpDown, LayoutGrid, List } from 'lucide-react';

interface CreatorSortAndControlsProps {
  totalCount: number;
  sortBy: string;
  onSortChange: (val: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

const SORT_OPTIONS = [
  { value: 'matchScore', label: 'Best Match (Match Score)' },
  { value: 'reachDesc', label: 'Highest Reach (Followers)' },
  { value: 'engagementDesc', label: 'Top Engagement Rate' },
  { value: 'ratingDesc', label: 'Highest Rated' },
  { value: 'rateAsc', label: 'Rate: Low to High' },
  { value: 'rateDesc', label: 'Rate: High to Low' },
];

export default function CreatorSortAndControls({
  totalCount,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}: CreatorSortAndControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
      {/* Total count */}
      <div className="text-xs text-slate-400">
        Showing <span className="font-black text-white">{totalCount}</span> vetted creators
      </div>

      {/* Sort & View Mode Toggles */}
      <div className="flex items-center gap-2.5">
        {/* Sort Dropdown */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-slate-300">
          <ArrowUpDown className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="text-slate-400">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sort Creators"
            className="bg-transparent text-white font-bold focus:outline-none cursor-pointer pr-1"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-slate-950 text-white">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Grid/List Buttons */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-white/10">
          <button
            onClick={() => onViewModeChange('grid')}
            title="Grid View"
            type="button"
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            title="List View"
            type="button"
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
