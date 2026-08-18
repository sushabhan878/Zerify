'use client';

import React from 'react';
import { ArrowUpDown, LayoutGrid, List } from 'lucide-react';

interface CompanySortAndControlsProps {
  count: number;
  sortBy: string;
  onSortChange: (val: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

const SORT_OPTIONS = [
  { label: 'Best Match (Match Score)', value: 'matchScore' },
  { label: 'Newest Posted', value: 'newest' },
  { label: 'Highest Budget', value: 'highestBudget' },
  { label: 'Lowest Budget', value: 'lowestBudget' },
  { label: 'Company Name (A-Z)', value: 'name' },
];

export default function CompanySortAndControls({
  count,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}: CompanySortAndControlsProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-xs border-b border-white/5">
      <div className="text-slate-400 font-medium">
        Showing <span className="text-white font-extrabold">{count}</span> company opportunities
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-slate-900 border border-white/10 px-3 py-1.5 rounded-xl">
          <ArrowUpDown className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-slate-400 font-medium hidden sm:inline">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center bg-slate-900 border border-white/10 p-1 rounded-xl gap-1">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="List View"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
