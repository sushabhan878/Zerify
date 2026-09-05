'use client';

import React, { useState } from 'react';
import { SlidersHorizontal, ChevronDown, Check } from 'lucide-react';

export interface QuickFilterState {
  industry: string;
  budgetRange: string;
  minMatchScore: number;
  platform: string;
  campaignType: string;
  paidOnly?: boolean;
  location: string;
}

import { PRIMARY_CATEGORY_NAMES } from '@/constants/categories';
import { useCurrency } from '@/context/CurrencyContext';

interface CompanyQuickFiltersProps {
  filters: QuickFilterState;
  onFilterChange: (key: keyof QuickFilterState, val: any) => void;
  onOpenAdvancedModal: () => void;
  activeCount: number;
}

const INDUSTRIES = ['All', ...PRIMARY_CATEGORY_NAMES];

const BUDGET_RANGES_INR = [
  'Any Budget',
  'Under ₹50,000',
  '₹50,000 - ₹2,00,000',
  '₹2,00,000 - ₹5,00,000',
  '₹5,00,000 - ₹10,00,000',
  '₹10,00,000 - ₹25,00,000',
  '₹25,00,000+',
];

const BUDGET_RANGES_USD = [
  'Any Budget',
  'Under $500',
  '$500 - $1K',
  '$1K - $3K',
  '$3K - $5K',
  '$5K - $10K',
  '$10K - $25K',
  '$25K+',
];

const MATCH_SCORES = [
  { label: 'Any Match', value: 0 },
  { label: '50%+ Match', value: 50 },
  { label: '70%+ Match', value: 70 },
  { label: '80%+ Match', value: 80 },
  { label: '90%+ Match', value: 90 },
];

const PLATFORMS = ['All Platforms', 'Instagram', 'YouTube', 'TikTok', 'LinkedIn', 'Twitter', 'Twitch'];

const CAMPAIGN_TYPES = [
  'All Types',
  'Sponsored Post',
  'Instagram Reel',
  'TikTok Video',
  'YouTube Video',
  'UGC Creation',
  'Brand Ambassador',
  'Product Review',
];

export default function CompanyQuickFilters({
  filters,
  onFilterChange,
  onOpenAdvancedModal,
  activeCount,
}: CompanyQuickFiltersProps) {
  const { currency } = useCurrency();
  const budgetRanges = currency === 'INR' ? BUDGET_RANGES_INR : BUDGET_RANGES_USD;
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

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
            filters.industry !== 'All'
              ? 'bg-purple-500/15 text-purple-200 border-purple-500/40 shadow-sm'
              : 'bg-slate-900 border-white/10 text-slate-300 hover:border-white/20'
          }`}
        >
          <span>Category: {filters.industry === 'All' ? 'All' : filters.industry}</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-70" />
        </button>
        {openDropdown === 'category' && (
          <div className="absolute top-full left-0 mt-1.5 w-64 max-h-64 overflow-y-auto bg-slate-950 border border-purple-500/30 rounded-xl shadow-2xl p-1.5 z-50 space-y-0.5 backdrop-blur-xl">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind}
                type="button"
                onClick={() => {
                  onFilterChange('industry', ind);
                  setOpenDropdown(null);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                  filters.industry === ind
                    ? 'bg-purple-500/20 text-purple-200 font-semibold border border-purple-500/30'
                    : 'text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                <span className="truncate">{ind}</span>
                {filters.industry === ind && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
              </button>
            ))}
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
