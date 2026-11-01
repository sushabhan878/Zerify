'use client';

import React, { useState } from 'react';
import { ArrowUpDown, LayoutGrid, List, ChevronDown, Check } from 'lucide-react';

interface CampaignSortAndControlsProps {
  count: number;
  sortBy: string;
  onSortChange: (val: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

const SORT_OPTIONS = [
  { label: 'Best Match (Match Score)', value: 'matchScore' },
  { label: 'Highest Budget', value: 'highestBudget' },
  { label: 'Lowest Budget', value: 'lowestBudget' },
  { label: 'Newest Posted', value: 'newest' },
  { label: 'Ending Soonest', value: 'endingSoon' },
];

export default function CampaignSortAndControls({
  count,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}: CampaignSortAndControlsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentOption = SORT_OPTIONS.find((opt) => opt.value === sortBy) || SORT_OPTIONS[0];

  return (
    <div className="flex items-center justify-between gap-4 py-2 text-xs border-b border-white/5 light:border-slate-200 relative z-20">
      <div className="text-slate-400 light:text-slate-600 font-medium">
        Showing <span className="text-white light:text-slate-900 font-extrabold">{count}</span> campaign opportunities
      </div>

      <div className="flex items-center gap-3">
        {/* Custom Sort Dropdown */}
        <div className="relative">
          {isOpen && (
            <div
              className="fixed inset-0 z-30 bg-transparent"
              onClick={() => setIsOpen(false)}
            />
          )}

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 bg-slate-900 light:bg-white border border-white/10 light:border-slate-200 hover:border-white/20 light:hover:border-purple-300 px-3 py-1.5 rounded-xl text-slate-300 light:text-slate-700 font-bold transition-all relative z-40 light:shadow-sm"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-purple-400 light:text-purple-600" />
            <span className="text-slate-400 light:text-slate-500 font-medium hidden sm:inline">Sort:</span>
            <span className="text-white light:text-slate-900">{currentOption.label}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70 ml-0.5" />
          </button>

          {isOpen && (
            <div className="absolute top-full right-0 mt-1.5 w-56 max-h-64 overflow-y-auto bg-slate-950 light:bg-white border border-purple-500/30 light:border-slate-200 rounded-xl shadow-2xl light:shadow-xl p-1.5 z-50 space-y-0.5 backdrop-blur-xl">
              {SORT_OPTIONS.map((opt) => {
                const isSelected = opt.value === sortBy;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onSortChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-purple-500/20 light:bg-purple-50 text-purple-200 light:text-purple-700 font-semibold border border-purple-500/30 light:border-purple-200'
                        : 'text-slate-300 light:text-slate-700 hover:bg-slate-800/80 light:hover:bg-slate-100'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-purple-400 light:text-purple-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* View Mode Grid/List Toggle */}
        <div className="flex items-center bg-slate-900 light:bg-white border border-white/10 light:border-slate-200 p-1 rounded-xl gap-1 light:shadow-sm">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-purple-500/20 light:bg-purple-50 text-purple-200 light:text-purple-700 border border-purple-500/30 light:border-purple-200'
                : 'text-slate-400 light:text-slate-500 hover:text-white light:hover:text-slate-900'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-purple-500/20 light:bg-purple-50 text-purple-200 light:text-purple-700 border border-purple-500/30 light:border-purple-200'
                : 'text-slate-400 light:text-slate-500 hover:text-white light:hover:text-slate-900'
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
