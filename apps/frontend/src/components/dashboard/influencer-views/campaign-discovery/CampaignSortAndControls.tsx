'use client';

import React from 'react';
import { SlidersHorizontal, ArrowUpDown, Filter } from 'lucide-react';

export type CampaignSortOption =
  | 'matchScore'
  | 'highestBudget'
  | 'lowestBudget'
  | 'newest'
  | 'endingSoon';

interface CampaignSortAndControlsProps {
  sortBy: CampaignSortOption;
  onSortChange: (val: CampaignSortOption) => void;
  onOpenAdvancedFilters: () => void;
  activeFilterCount: number;
  totalResults: number;
}

export default function CampaignSortAndControls({
  sortBy,
  onSortChange,
  onOpenAdvancedFilters,
  activeFilterCount,
  totalResults,
}: CampaignSortAndControlsProps) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
      <div className="text-xs text-slate-400 font-medium">
        Showing <span className="font-bold text-white">{totalResults}</span> active campaign opportunities
      </div>

      <div className="flex items-center gap-2">
        {/* Sort Select */}
        <div className="relative flex items-center">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as CampaignSortOption)}
            className="pl-8 pr-7 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-purple-500/80 appearance-none cursor-pointer hover:bg-slate-800/90 transition-colors"
          >
            <option value="matchScore">Best Match %</option>
            <option value="highestBudget">Highest Budget</option>
            <option value="lowestBudget">Lowest Budget</option>
            <option value="newest">Newest First</option>
            <option value="endingSoon">Ending Soonest</option>
          </select>
        </div>

        {/* Advanced Filters Button */}
        <button
          onClick={onOpenAdvancedFilters}
          type="button"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-purple-950/40 border border-white/10 hover:border-purple-500/40 text-xs font-bold text-slate-200 hover:text-white transition-all shadow-sm group"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-purple-600 text-white text-[10px] font-black">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
