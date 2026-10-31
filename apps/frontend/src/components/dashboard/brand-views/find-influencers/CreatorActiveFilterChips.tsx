'use client';

import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { CreatorQuickFilterState } from './CreatorQuickFilters';

interface CreatorActiveFilterChipsProps {
  filters: CreatorQuickFilterState;
  onRemoveFilter: (key: keyof CreatorQuickFilterState, defaultVal: any) => void;
  onClearAll: () => void;
  activeCount: number;
}

export default function CreatorActiveFilterChips({
  filters,
  onRemoveFilter,
  onClearAll,
  activeCount,
}: CreatorActiveFilterChipsProps) {
  if (activeCount === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-1 pb-1">
      <span className="text-[11px] font-bold text-slate-400 light:text-slate-500 mr-1">Active:</span>

      {filters.category !== 'All' && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/15 light:bg-purple-100/80 border border-purple-500/30 light:border-purple-300 text-purple-300 light:text-purple-700 text-xs font-semibold shadow-xs">
          Category: {filters.category}
          <button
            onClick={() => onRemoveFilter('category', 'All')}
            className="hover:text-white light:hover:text-purple-900 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {filters.rateRange !== 'Any Rate' && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/15 light:bg-purple-100/80 border border-purple-500/30 light:border-purple-300 text-purple-300 light:text-purple-700 text-xs font-semibold shadow-xs">
          Rate: {filters.rateRange}
          <button
            onClick={() => onRemoveFilter('rateRange', 'Any Rate')}
            className="hover:text-white light:hover:text-purple-900 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {filters.minMatchScore > 0 && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/15 light:bg-purple-100/80 border border-purple-500/30 light:border-purple-300 text-purple-300 light:text-purple-700 text-xs font-semibold shadow-xs">
          Match: {filters.minMatchScore}%+
          <button
            onClick={() => onRemoveFilter('minMatchScore', 0)}
            className="hover:text-white light:hover:text-purple-900 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {filters.platform !== 'All Platforms' && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/15 light:bg-purple-100/80 border border-purple-500/30 light:border-purple-300 text-purple-300 light:text-purple-700 text-xs font-semibold shadow-xs">
          Platform: {filters.platform}
          <button
            onClick={() => onRemoveFilter('platform', 'All Platforms')}
            className="hover:text-white light:hover:text-purple-900 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {filters.creatorTier !== 'All Tiers' && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/15 light:bg-purple-100/80 border border-purple-500/30 light:border-purple-300 text-purple-300 light:text-purple-700 text-xs font-semibold shadow-xs">
          Tier: {filters.creatorTier}
          <button
            onClick={() => onRemoveFilter('creatorTier', 'All Tiers')}
            className="hover:text-white light:hover:text-purple-900 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      <button
        onClick={onClearAll}
        type="button"
        className="text-[11px] font-bold text-slate-400 light:text-slate-500 hover:text-rose-400 light:hover:text-rose-600 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-500/10 light:hover:bg-rose-50 transition-colors ml-1"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Clear all</span>
      </button>
    </div>
  );
}
