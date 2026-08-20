'use client';

import React, { useState } from 'react';
import { ArrowUpDown, LayoutGrid, List, ChevronDown, Check } from 'lucide-react';

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
  const [isOpen, setIsOpen] = useState(false);

  const currentOption = SORT_OPTIONS.find((opt) => opt.value === sortBy) || SORT_OPTIONS[0];

  return (
    <div className="flex items-center justify-between gap-4 py-2 text-xs border-b border-white/5 relative z-20">
      <div className="text-slate-400 font-medium">
        Showing <span className="text-white font-extrabold">{count}</span> company opportunities
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
            className="flex items-center gap-1.5 bg-slate-900 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-xl text-slate-300 font-bold transition-all relative z-40"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-slate-400 font-medium hidden sm:inline">Sort:</span>
            <span className="text-white">{currentOption.label}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70 ml-0.5" />
          </button>

          {isOpen && (
            <div className="absolute top-full right-0 mt-1.5 w-56 max-h-64 overflow-y-auto bg-slate-950 border border-purple-500/30 rounded-xl shadow-2xl p-1.5 z-50 space-y-0.5 backdrop-blur-xl">
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
                        ? 'bg-purple-500/20 text-purple-200 font-semibold border border-purple-500/30'
                        : 'text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* View Mode Grid/List Toggle */}
        <div className="flex items-center bg-slate-900 border border-white/10 p-1 rounded-xl gap-1">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30'
                : 'text-slate-400 hover:text-white'
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
