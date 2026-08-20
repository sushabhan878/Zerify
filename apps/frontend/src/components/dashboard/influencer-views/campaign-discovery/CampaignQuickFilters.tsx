'use client';

import React, { useState } from 'react';
import { SlidersHorizontal, ChevronDown, Check } from 'lucide-react';

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

export const CAMPAIGN_CATEGORIES = [
  'All',
  'Tech & AI',
  'Beauty & Skincare',
  'Fashion & Apparel',
  'Fitness & Wellness',
  'Gaming & Esports',
  'Finance & Crypto',
  'Food & Beverage',
  'Travel & Lifestyle',
  'Software & SaaS',
  'Consumer Electronics & Hardware',
];

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
  'Twitch',
];

export const CAMPAIGN_TYPES = [
  'All Types',
  'Instagram Reel',
  'YouTube Video',
  'TikTok Video',
  'UGC Video',
  'Carousel Post',
  'Story Series',
  'Product Review',
  'Live Stream',
];

export default function CampaignQuickFilters({
  filters,
  onFilterChange,
  onOpenAdvancedModal,
  activeCount,
}: CampaignQuickFiltersProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  return (
    <div className="relative z-30 flex flex-wrap items-center gap-2 sm:gap-2.5 pb-1">
      {/* Click Outside Backdrop */}
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
          <span>Category: {filters.category}</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-70" />
        </button>
        {openDropdown === 'category' && (
          <div className="absolute top-full left-0 mt-1.5 w-60 max-h-64 overflow-y-auto bg-slate-950 border border-purple-500/30 rounded-xl shadow-2xl p-1.5 z-50 space-y-0.5 backdrop-blur-xl">
            {CAMPAIGN_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  onFilterChange('category', cat);
                  setOpenDropdown(null);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                  filters.category === cat
                    ? 'bg-purple-500/20 text-purple-200 font-semibold border border-purple-500/30'
                    : 'text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                <span className="truncate">{cat}</span>
                {filters.category === cat && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
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
