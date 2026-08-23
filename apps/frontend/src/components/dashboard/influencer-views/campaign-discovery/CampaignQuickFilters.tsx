'use client';

import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, ChevronDown, Check, Search, X } from 'lucide-react';
import { ALL_INDUSTRIES_FLAT, ALL_INDUSTRIES_GROUPED } from '@/constants/categories';

export interface CampaignQuickFilterState {
  category: string;
  budgetRange: string;
  minMatchScore: number;
  platform: string;
  campaignType: string;
}

interface CampaignQuickFiltersProps {
  filters: CampaignQuickFilterState;
  onFilterChange: (key: keyof CampaignQuickFilterState, val: any) => void;
  onOpenAdvancedModal: () => void;
  activeCount: number;
}

export const CAMPAIGN_CATEGORIES = ['All', ...ALL_INDUSTRIES_FLAT];

export const BUDGET_RANGES = [
  'Any Budget',
  'Under $500',
  '$500 - $1K',
  '$1K - $3K',
  '$3K - $5K',
  '$5K - $10K',
  '$10K - $25K',
  '$25K+',
];

export const MATCH_SCORES = [
  { label: 'Any', value: 0 },
  { label: '50%+', value: 50 },
  { label: '70%+', value: 70 },
  { label: '80%+', value: 80 },
  { label: '90%+', value: 90 },
];

export const PLATFORMS = [
  'All Platforms',
  'Instagram',
  'YouTube',
  'TikTok',
  'LinkedIn',
  'Twitter',
];

export const CAMPAIGN_TYPES = [
  'All Types',
  'Reel / Short',
  'YouTube Video',
  'Static Post',
  'Story Set',
  'UGC Video',
  'Review & Demo',
];

export default function CampaignQuickFilters({
  filters,
  onFilterChange,
  onOpenAdvancedModal,
  activeCount,
}: CampaignQuickFiltersProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [categorySearch, setCategorySearch] = useState('');

  const toggleDropdown = (name: string) => {
    if (openDropdown === name) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(name);
      if (name === 'category') setCategorySearch('');
    }
  };

  const filteredCategoryGroups = useMemo(() => {
    const q = categorySearch.trim().toLowerCase();
    if (!q) return ALL_INDUSTRIES_GROUPED;

    return ALL_INDUSTRIES_GROUPED.map((group) => {
      const groupMatches = group.category.toLowerCase().includes(q);
      const matchingItems = group.items.filter((item) =>
        item.toLowerCase().includes(q) || groupMatches
      );
      if (matchingItems.length === 0) return null;
      return {
        ...group,
        items: matchingItems,
      };
    }).filter(Boolean) as typeof ALL_INDUSTRIES_GROUPED;
  }, [categorySearch]);

  return (
    <div className="relative flex items-center gap-2.5 flex-wrap">
      {/* Backdrop for closing dropdown */}
      {openDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setOpenDropdown(null);
            setCategorySearch('');
          }}
        />
      )}

      {/* Category / Subcategory Dropdown */}
      <div className={`relative ${openDropdown === 'category' ? 'z-40' : 'z-20'}`}>
        <button
          onClick={() => toggleDropdown('category')}
          type="button"
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
            filters.category !== 'All'
              ? 'bg-purple-500/15 text-purple-200 border-purple-500/40 shadow-sm'
              : 'bg-slate-900 border-white/10 text-slate-300 hover:border-white/20'
          }`}
        >
          <span>Category: {filters.category}</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-70" />
        </button>
        {openDropdown === 'category' && (
          <div className="absolute top-full left-0 mt-1.5 w-72 max-h-80 flex flex-col bg-slate-950 border border-purple-500/30 rounded-2xl shadow-2xl z-50 backdrop-blur-xl overflow-hidden">
            {/* Category Search Input */}
            <div className="p-2 border-b border-purple-500/20 bg-slate-900/60 sticky top-0 z-10">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-purple-400 absolute left-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Search subcategories..."
                  className="w-full bg-slate-950/90 border border-purple-500/30 rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400"
                  autoFocus
                />
                {categorySearch && (
                  <button
                    type="button"
                    onClick={() => setCategorySearch('')}
                    className="absolute right-2 text-slate-400 hover:text-white p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Subcategories List */}
            <div className="p-2 overflow-y-auto max-h-64 space-y-2">
              {!categorySearch && (
                <button
                  type="button"
                  onClick={() => {
                    onFilterChange('category', 'All');
                    setOpenDropdown(null);
                    setCategorySearch('');
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                    filters.category === 'All'
                      ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30'
                      : 'text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <span>All Subcategories</span>
                  {filters.category === 'All' && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                </button>
              )}

              {filteredCategoryGroups.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  No matching subcategories found
                </div>
              ) : (
                filteredCategoryGroups.map((group) => (
                  <div key={group.id} className="space-y-0.5 pt-1.5 border-t border-purple-500/15 first:border-0 first:pt-0">
                    <div className="px-2.5 py-1 text-[10px] uppercase font-black tracking-wider text-purple-400/80">
                      {group.category}
                    </div>
                    {group.items.map((subItem) => (
                      <button
                        key={subItem}
                        type="button"
                        onClick={() => {
                          onFilterChange('category', subItem);
                          setOpenDropdown(null);
                          setCategorySearch('');
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                          filters.category === subItem
                            ? 'bg-purple-500/25 text-purple-200 font-bold border border-purple-500/30'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <span className="truncate">{subItem}</span>
                        {filters.category === subItem && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Budget Dropdown */}
      <div className={`relative ${openDropdown === 'budget' ? 'z-40' : 'z-20'}`}>
        <button
          onClick={() => toggleDropdown('budget')}
          type="button"
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
            filters.budgetRange !== 'Any Budget'
              ? 'bg-purple-500/15 text-purple-200 border-purple-500/40 shadow-sm'
              : 'bg-slate-900 border-white/10 text-slate-300 hover:border-white/20'
          }`}
        >
          <span>Budget: {filters.budgetRange}</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-70" />
        </button>
        {openDropdown === 'budget' && (
          <div className="absolute top-full left-0 mt-1.5 w-52 max-h-64 overflow-y-auto bg-slate-950 border border-purple-500/30 rounded-xl shadow-2xl p-1.5 z-50 space-y-0.5 backdrop-blur-xl">
            {BUDGET_RANGES.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => {
                  onFilterChange('budgetRange', b);
                  setOpenDropdown(null);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                  filters.budgetRange === b
                    ? 'bg-purple-500/20 text-purple-200 font-semibold border border-purple-500/30'
                    : 'text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                <span>{b}</span>
                {filters.budgetRange === b && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Match Score Dropdown */}
      <div className={`relative ${openDropdown === 'match' ? 'z-40' : 'z-20'}`}>
        <button
          onClick={() => toggleDropdown('match')}
          type="button"
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
            filters.minMatchScore > 0
              ? 'bg-purple-500/15 text-purple-200 border-purple-500/40 shadow-sm'
              : 'bg-slate-900 border-white/10 text-slate-300 hover:border-white/20'
          }`}
        >
          <span>Match: {filters.minMatchScore > 0 ? `${filters.minMatchScore}%+` : 'Any'}</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-70" />
        </button>
        {openDropdown === 'match' && (
          <div className="absolute top-full left-0 mt-1.5 w-44 bg-slate-950 border border-purple-500/30 rounded-xl shadow-2xl p-1.5 z-50 space-y-0.5 backdrop-blur-xl">
            {MATCH_SCORES.map((m) => (
              <button
                key={m.label}
                type="button"
                onClick={() => {
                  onFilterChange('minMatchScore', m.value);
                  setOpenDropdown(null);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                  filters.minMatchScore === m.value
                    ? 'bg-purple-500/20 text-purple-200 font-semibold border border-purple-500/30'
                    : 'text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                <span>{m.label}</span>
                {filters.minMatchScore === m.value && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Platform Dropdown */}
      <div className={`relative ${openDropdown === 'platform' ? 'z-40' : 'z-20'}`}>
        <button
          onClick={() => toggleDropdown('platform')}
          type="button"
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
            filters.platform !== 'All Platforms'
              ? 'bg-purple-500/15 text-purple-200 border-purple-500/40 shadow-sm'
              : 'bg-slate-900 border-white/10 text-slate-300 hover:border-white/20'
          }`}
        >
          <span>Platform: {filters.platform}</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-70" />
        </button>
        {openDropdown === 'platform' && (
          <div className="absolute top-full left-0 mt-1.5 w-48 bg-slate-950 border border-purple-500/30 rounded-xl shadow-2xl p-1.5 z-50 space-y-0.5 backdrop-blur-xl">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  onFilterChange('platform', p);
                  setOpenDropdown(null);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                  filters.platform === p
                    ? 'bg-purple-500/20 text-purple-200 font-semibold border border-purple-500/30'
                    : 'text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                <span>{p}</span>
                {filters.platform === p && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Campaign Type Dropdown */}
      <div className={`relative ${openDropdown === 'campaignType' ? 'z-40' : 'z-20'}`}>
        <button
          onClick={() => toggleDropdown('campaignType')}
          type="button"
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
            filters.campaignType !== 'All Types'
              ? 'bg-purple-500/15 text-purple-200 border-purple-500/40 shadow-sm'
              : 'bg-slate-900 border-white/10 text-slate-300 hover:border-white/20'
          }`}
        >
          <span>Type: {filters.campaignType}</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-70" />
        </button>
        {openDropdown === 'campaignType' && (
          <div className="absolute top-full left-0 mt-1.5 w-52 bg-slate-950 border border-purple-500/30 rounded-xl shadow-2xl p-1.5 z-50 space-y-0.5 backdrop-blur-xl">
            {CAMPAIGN_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  onFilterChange('campaignType', t);
                  setOpenDropdown(null);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                  filters.campaignType === t
                    ? 'bg-purple-500/20 text-purple-200 font-semibold border border-purple-500/30'
                    : 'text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                <span>{t}</span>
                {filters.campaignType === t && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Advanced All Filters Button */}
      <button
        onClick={onOpenAdvancedModal}
        type="button"
        className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black transition-all shrink-0 flex items-center gap-1.5 ml-auto shadow-md shadow-purple-950/40 border border-purple-400/30"
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span>All Filters {activeCount > 0 ? `(${activeCount})` : ''}</span>
      </button>
    </div>
  );
}
