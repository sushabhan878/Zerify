'use client';

import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, ChevronDown, Check, Search, X, Bookmark } from 'lucide-react';
import { ALL_INDUSTRIES_FLAT, ALL_INDUSTRIES_GROUPED } from '@/constants/categories';
import { useCurrency } from '@/context/CurrencyContext';

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
  showSavedOnly?: boolean;
  onToggleSavedOnly?: () => void;
  savedCount?: number;
}

export const CAMPAIGN_CATEGORIES = ['All', ...ALL_INDUSTRIES_FLAT];

export const BUDGET_RANGES_INR = [
  'Any Budget',
  'Under ₹50,000',
  '₹50,000 - ₹2,00,000',
  '₹2,00,000 - ₹5,00,000',
  '₹5,00,000 - ₹10,00,000',
  '₹10,00,000 - ₹25,00,000',
  '₹25,00,000+',
];

export const BUDGET_RANGES_USD = [
  'Any Budget',
  'Under $500',
  '$500 - $1K',
  '$1K - $3K',
  '$3K - $5K',
  '$5K - $10K',
  '$10K - $25K',
  '$25K+',
];

export const BUDGET_RANGES = BUDGET_RANGES_INR;

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
  showSavedOnly = false,
  onToggleSavedOnly,
  savedCount = 0,
}: CampaignQuickFiltersProps) {
  const { currency } = useCurrency();
  const budgetRanges = currency === 'INR' ? BUDGET_RANGES_INR : BUDGET_RANGES_USD;
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
      const matchGroup = group.category.toLowerCase().includes(q);
      const matchingItems = group.items.filter((item) => item.toLowerCase().includes(q));

      if (matchGroup || matchingItems.length > 0) {
        return {
          ...group,
          items: matchGroup ? group.items : matchingItems,
        };
      }
      return null;
    }).filter(Boolean) as typeof ALL_INDUSTRIES_GROUPED;
  }, [categorySearch]);

  return (
    <div className="relative z-30 flex flex-wrap items-center gap-2 sm:gap-2.5 pb-1">
      {/* Transparent Overlay to close open dropdowns on click outside */}
      {openDropdown && (
        <div
          className="fixed inset-0 z-30 bg-transparent"
          onClick={() => setOpenDropdown(null)}
        />
      )}

      {/* Category Dropdown */}
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
          <span>Category: {filters.category === 'All' ? 'All' : filters.category}</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-70" />
        </button>

        {openDropdown === 'category' && (
          <div className="absolute top-full left-0 mt-1.5 w-72 sm:w-80 max-h-80 overflow-y-auto bg-slate-950 border border-purple-500/30 rounded-2xl shadow-2xl p-2 z-50 space-y-1.5 backdrop-blur-xl">
            {/* Search within Category Dropdown */}
            <div className="relative mb-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search category or subcategory..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              {categorySearch && (
                <button
                  type="button"
                  onClick={() => setCategorySearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* All Option */}
            <button
              type="button"
              onClick={() => {
                onFilterChange('category', 'All');
                setOpenDropdown(null);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                filters.category === 'All'
                  ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30'
                  : 'text-slate-300 hover:bg-slate-800/80'
              }`}
            >
              <span>All Categories</span>
              {filters.category === 'All' && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
            </button>

            {/* Categorized Accordion Groups */}
            <div className="space-y-1 pt-1 border-t border-white/5 max-h-56 overflow-y-auto pr-1">
              {filteredCategoryGroups.map((group) => {
                const isGroupSelected = filters.category === group.category;
                return (
                  <div key={group.category} className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        onFilterChange('category', group.category);
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                        isGroupSelected
                          ? 'bg-purple-500/25 text-purple-100 font-bold border border-purple-500/30'
                          : 'text-slate-200 hover:bg-slate-800/80'
                      }`}
                    >
                      <span className="truncate">{group.category}</span>
                      {isGroupSelected && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                    </button>

                    {/* Subcategories (Pills) */}
                    <div className="pl-3.5 py-0.5 space-y-0.5">
                      {group.items.map((sub) => {
                        const isSubSelected = filters.category === sub;
                        return (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => {
                              onFilterChange('category', sub);
                              setOpenDropdown(null);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                              isSubSelected
                                ? 'bg-purple-600/30 text-purple-200 font-semibold'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                            }`}
                          >
                            <span className="truncate">{sub}</span>
                            {isSubSelected && <Check className="w-3 h-3 text-purple-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
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
          <div className="absolute top-full left-0 mt-1.5 w-56 max-h-64 overflow-y-auto bg-slate-950 border border-purple-500/30 rounded-xl shadow-2xl p-1.5 z-50 space-y-0.5 backdrop-blur-xl">
            {budgetRanges.map((b) => (
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

      {/* Show Saved Only Toggle Button */}
      {onToggleSavedOnly && (
        <button
          onClick={onToggleSavedOnly}
          type="button"
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shrink-0 ${
            showSavedOnly
              ? 'bg-purple-600/30 text-purple-200 border-purple-400/80 shadow-md shadow-purple-950/40 ring-1 ring-purple-500/50'
              : 'bg-slate-900 border-white/10 text-slate-300 hover:border-purple-500/30 hover:text-white'
          }`}
          title={showSavedOnly ? 'Showing saved campaigns' : 'Show only saved campaigns'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${showSavedOnly ? 'fill-current text-purple-400' : 'text-purple-400'}`} />
          <span>Saved</span>
          {savedCount > 0 && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                showSavedOnly
                  ? 'bg-purple-500 text-white'
                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              }`}
            >
              {savedCount}
            </span>
          )}
        </button>
      )}

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
