'use client';

import React, { useState } from 'react';
import { SlidersHorizontal, ChevronDown, Check } from 'lucide-react';
import { PRIMARY_CATEGORY_NAMES } from '@/constants/categories';
import { useCurrency } from '@/context/CurrencyContext';

export interface CreatorQuickFilterState {
  category: string;
  rateRange: string;
  minMatchScore: number;
  platform: string;
  creatorTier: string;
  minEngagementRate?: number;
  location?: string;
}

interface CreatorQuickFiltersProps {
  filters: CreatorQuickFilterState;
  onFilterChange: (key: keyof CreatorQuickFilterState, val: any) => void;
  onOpenAdvancedModal: () => void;
  activeCount: number;
}

const CATEGORIES = ['All', ...PRIMARY_CATEGORY_NAMES];

export const RATE_RANGES_INR = [
  'Any Rate',
  'Under ₹20,000',
  '₹20,000 - ₹50,000',
  '₹50,000 - ₹1,00,000',
  '₹1,00,000 - ₹2,50,000',
  '₹2,50,000 - ₹5,00,000',
  '₹5,00,000+',
];

export const RATE_RANGES_USD = [
  'Any Rate',
  'Under $250',
  '$250 - $500',
  '$500 - $1K',
  '$1K - $2.5K',
  '$2.5K - $5K',
  '$5K+',
];

export const RATE_RANGES = RATE_RANGES_INR;

const MATCH_SCORES = [
  { label: 'Any Match', value: 0 },
  { label: '50%+ Match', value: 50 },
  { label: '70%+ Match', value: 70 },
  { label: '80%+ Match', value: 80 },
  { label: '90%+ Match', value: 90 },
];

const PLATFORMS = ['All Platforms', 'Instagram', 'YouTube', 'TikTok', 'LinkedIn', 'Twitter', 'Twitch'];

const CREATOR_TIERS = [
  'All Tiers',
  'Nano (1K - 10K)',
  'Micro (10K - 100K)',
  'Mid-Tier (100K - 500K)',
  'Macro (500K - 1M)',
  'Mega (1M+)',
];

export default function CreatorQuickFilters({
  filters,
  onFilterChange,
  onOpenAdvancedModal,
  activeCount,
}: CreatorQuickFiltersProps) {
  const { currency } = useCurrency();
  const rateRanges = currency === 'INR' ? RATE_RANGES_INR : RATE_RANGES_USD;
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  return (
    <div className="relative z-30 flex flex-wrap items-center justify-between gap-2.5 pb-1">
      {/* Click outside overlay */}
      {openDropdown && (
        <div
          className="fixed inset-0 z-30 bg-transparent"
          onClick={() => setOpenDropdown(null)}
        />
      )}

      {/* Left side: Quick Dropdowns */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        {/* 1. Category Dropdown */}
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
            <div className="absolute top-full left-0 mt-1.5 w-64 max-h-64 overflow-y-auto bg-slate-950 border border-purple-500/30 rounded-xl shadow-2xl p-1.5 z-50 space-y-0.5 backdrop-blur-xl">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    onFilterChange('category', cat);
                    setOpenDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                    filters.category === cat
                      ? 'bg-purple-600/30 text-purple-200 font-bold'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="truncate">{cat}</span>
                  {filters.category === cat && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. Rate / Budget Range */}
        <div className={`relative ${openDropdown === 'rate' ? 'z-40' : 'z-20'}`}>
          <button
            onClick={() => toggleDropdown('rate')}
            type="button"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              filters.rateRange !== 'Any Rate'
                ? 'bg-purple-500/15 text-purple-200 border-purple-500/40 shadow-sm'
                : 'bg-slate-900 border-white/10 text-slate-300 hover:border-white/20'
            }`}
          >
            <span>Rate: {filters.rateRange}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>
          {openDropdown === 'rate' && (
            <div className="absolute top-full left-0 mt-1.5 w-52 bg-slate-950 border border-purple-500/30 rounded-xl shadow-2xl p-1.5 z-50 space-y-0.5 backdrop-blur-xl">
              {rateRanges.map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => {
                    onFilterChange('rateRange', rate);
                    setOpenDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                    filters.rateRange === rate
                      ? 'bg-purple-600/30 text-purple-200 font-bold'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>{rate}</span>
                  {filters.rateRange === rate && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. Match Score Dropdown */}
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
            <span>
              Match:{' '}
              {filters.minMatchScore === 0
                ? 'Any'
                : `${filters.minMatchScore}%+`}
            </span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>
          {openDropdown === 'match' && (
            <div className="absolute top-full left-0 mt-1.5 w-44 bg-slate-950 border border-purple-500/30 rounded-xl shadow-2xl p-1.5 z-50 space-y-0.5 backdrop-blur-xl">
              {MATCH_SCORES.map((ms) => (
                <button
                  key={ms.value}
                  type="button"
                  onClick={() => {
                    onFilterChange('minMatchScore', ms.value);
                    setOpenDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                    filters.minMatchScore === ms.value
                      ? 'bg-purple-600/30 text-purple-200 font-bold'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>{ms.label}</span>
                  {filters.minMatchScore === ms.value && (
                    <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 4. Platform Dropdown */}
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
              {PLATFORMS.map((plat) => (
                <button
                  key={plat}
                  type="button"
                  onClick={() => {
                    onFilterChange('platform', plat);
                    setOpenDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                    filters.platform === plat
                      ? 'bg-purple-600/30 text-purple-200 font-bold'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>{plat}</span>
                  {filters.platform === plat && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 5. Tier Dropdown */}
        <div className={`relative ${openDropdown === 'tier' ? 'z-40' : 'z-20'}`}>
          <button
            onClick={() => toggleDropdown('tier')}
            type="button"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              filters.creatorTier !== 'All Tiers'
                ? 'bg-purple-500/15 text-purple-200 border-purple-500/40 shadow-sm'
                : 'bg-slate-900 border-white/10 text-slate-300 hover:border-white/20'
            }`}
          >
            <span>Tier: {filters.creatorTier}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>
          {openDropdown === 'tier' && (
            <div className="absolute top-full left-0 mt-1.5 w-56 bg-slate-950 border border-purple-500/30 rounded-xl shadow-2xl p-1.5 z-50 space-y-0.5 backdrop-blur-xl">
              {CREATOR_TIERS.map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => {
                    onFilterChange('creatorTier', tier);
                    setOpenDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                    filters.creatorTier === tier
                      ? 'bg-purple-600/30 text-purple-200 font-bold'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="truncate">{tier}</span>
                  {filters.creatorTier === tier && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right side: All Filters Drawer Trigger Button */}
      <button
        onClick={onOpenAdvancedModal}
        type="button"
        className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center gap-2 transition-all shadow-lg shadow-purple-950/40 shrink-0 active:scale-95"
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span>All Filters</span>
        {activeCount > 0 && (
          <span className="w-5 h-5 rounded-full bg-white text-purple-700 font-black text-[10px] flex items-center justify-center shadow-sm">
            {activeCount}
          </span>
        )}
      </button>
    </div>
  );
}
