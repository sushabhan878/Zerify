'use client';

import React, { useState } from 'react';
import {
  Search,
  X,
  ChevronDown,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Target,
  Sparkles,
  Layers,
} from 'lucide-react';
import { CampaignItem } from '@/services/campaign.service';
import { PRIMARY_CATEGORY_NAMES } from '@/constants/categories';

export interface ShortlistFiltersState {
  campaignId: string;
  category: string;
  platform: string;
  creatorTier: string;
  rateRange: string;
  minMatchScore: number;
  minEngagementRate: number;
  status: string;
}

interface ShortlistFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  filters: ShortlistFiltersState;
  onFilterChange: (key: keyof ShortlistFiltersState, val: any) => void;
  onResetFilters: () => void;
  campaigns: CampaignItem[];
  campaignCounts: Record<string, number>;
  sortBy: string;
  onSortChange: (val: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  totalFiltered: number;
}

const CATEGORIES = ['All Categories', ...PRIMARY_CATEGORY_NAMES];
const PLATFORMS = ['All Platforms', 'Instagram', 'YouTube', 'TikTok', 'LinkedIn', 'Twitter'];
const CREATOR_TIERS = [
  'All Tiers',
  'Nano (1K - 10K)',
  'Micro (10K - 100K)',
  'Mid-Tier (100K - 500K)',
  'Macro (500K - 1M)',
  'Mega (1M+)',
];
const RATE_RANGES = [
  'Any Rate',
  'Under $250',
  '$250 - $500',
  '$500 - $1K',
  '$1K - $2.5K',
  '$2.5K+',
];
const STATUS_OPTIONS = [
  { id: 'ALL', label: 'All Candidates' },
  { id: 'SHORTLISTED', label: 'Shortlisted Only' },
  { id: 'OFFER_SENT', label: 'Offer Sent' },
  { id: 'OFFER_ACCEPTED', label: 'Accepted Deals' },
];

export default function ShortlistFilterBar({
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange,
  onResetFilters,
  campaigns,
  campaignCounts,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalFiltered,
}: ShortlistFilterBarProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const activeChips: { key: keyof ShortlistFiltersState; label: string }[] = [];
  if (filters.campaignId !== 'ALL') {
    const selectedCamp = campaigns.find((c) => c.id === filters.campaignId);
    activeChips.push({
      key: 'campaignId',
      label: `Campaign: ${selectedCamp?.title || 'Selected'}`,
    });
  }
  if (filters.category !== 'All Categories') {
    activeChips.push({ key: 'category', label: `Category: ${filters.category}` });
  }
  if (filters.platform !== 'All Platforms') {
    activeChips.push({ key: 'platform', label: `Platform: ${filters.platform}` });
  }
  if (filters.creatorTier !== 'All Tiers') {
    activeChips.push({ key: 'creatorTier', label: `Tier: ${filters.creatorTier}` });
  }
  if (filters.rateRange !== 'Any Rate') {
    activeChips.push({ key: 'rateRange', label: `Rate: ${filters.rateRange}` });
  }
  if (filters.minMatchScore > 0) {
    activeChips.push({ key: 'minMatchScore', label: `${filters.minMatchScore}%+ Match` });
  }
  if (filters.status !== 'ALL') {
    const statusObj = STATUS_OPTIONS.find((s) => s.id === filters.status);
    activeChips.push({ key: 'status', label: `Status: ${statusObj?.label || filters.status}` });
  }

  return (
    <div className="space-y-4">
      {/* Search & Campaign Dropdown Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search candidate names, handles, skills, bio, or notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-slate-900/90 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              type="button"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Campaign Filter Dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => toggleDropdown('campaign')}
            type="button"
            className={`w-full md:w-auto px-4 py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-between gap-2 border shadow-sm ${
              filters.campaignId !== 'ALL'
                ? 'bg-purple-600/20 text-purple-200 border-purple-400/40 shadow-purple-950/30'
                : 'bg-slate-900/90 border-white/10 text-slate-300 hover:border-purple-500/30'
            }`}
          >
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              <span className="max-w-[180px] truncate">
                {filters.campaignId === 'ALL'
                  ? 'All Campaigns'
                  : campaigns.find((c) => c.id === filters.campaignId)?.title || 'Campaign'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 opacity-70 ml-1" />
          </button>

          {openDropdown === 'campaign' && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
              <div className="absolute top-full right-0 mt-2 w-72 max-h-72 overflow-y-auto bg-[#0b0f19] border border-purple-500/30 rounded-2xl shadow-2xl p-2 z-50 space-y-1 backdrop-blur-2xl">
                <button
                  type="button"
                  onClick={() => {
                    onFilterChange('campaignId', 'ALL');
                    setOpenDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                    filters.campaignId === 'ALL'
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>All Campaigns</span>
                  <span className="text-[10px] opacity-70 px-1.5 py-0.5 rounded-md bg-black/30">
                    {Object.values(campaignCounts).reduce((a, b) => a + b, 0)}
                  </span>
                </button>
                {campaigns.map((camp) => {
                  const count = campaignCounts[camp.id] || 0;
                  return (
                    <button
                      key={camp.id}
                      type="button"
                      onClick={() => {
                        onFilterChange('campaignId', camp.id);
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                        filters.campaignId === camp.id
                          ? 'bg-purple-600 text-white'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="truncate pr-2">{camp.title}</span>
                      <span className="text-[10px] opacity-70 px-1.5 py-0.5 rounded-md bg-black/30 shrink-0">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Secondary Filter Badges Row */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-white/5">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onFilterChange('status', opt.id)}
              type="button"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filters.status === opt.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-950/50'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Dropdowns (Category, Platform, Tier, Rate, Match) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('category')}
              type="button"
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                filters.category !== 'All Categories'
                  ? 'bg-purple-500/15 text-purple-200 border-purple-500/40 shadow-sm'
                  : 'bg-slate-900 border-white/10 text-slate-300 hover:border-white/20'
              }`}
            >
              <span>{filters.category}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>
            {openDropdown === 'category' && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
                <div className="absolute top-full left-0 mt-1.5 w-60 max-h-64 overflow-y-auto bg-[#0b0f19] border border-purple-500/30 rounded-xl shadow-2xl p-1.5 z-50 space-y-0.5 backdrop-blur-xl">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        onFilterChange('category', cat);
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        filters.category === cat
                          ? 'bg-purple-600 text-white'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Platform Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('platform')}
              type="button"
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                filters.platform !== 'All Platforms'
                  ? 'bg-purple-500/15 text-purple-200 border-purple-500/40 shadow-sm'
                  : 'bg-slate-900 border-white/10 text-slate-300 hover:border-white/20'
              }`}
            >
              <span>{filters.platform}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>
            {openDropdown === 'platform' && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
                <div className="absolute top-full left-0 mt-1.5 w-48 bg-[#0b0f19] border border-purple-500/30 rounded-xl shadow-2xl p-1.5 z-50 space-y-0.5 backdrop-blur-xl">
                  {PLATFORMS.map((plat) => (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => {
                        onFilterChange('platform', plat);
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        filters.platform === plat
                          ? 'bg-purple-600 text-white'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      {plat}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Creator Tier */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('tier')}
              type="button"
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                filters.creatorTier !== 'All Tiers'
                  ? 'bg-purple-500/15 text-purple-200 border-purple-500/40 shadow-sm'
                  : 'bg-slate-900 border-white/10 text-slate-300 hover:border-white/20'
              }`}
            >
              <span>{filters.creatorTier}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>
            {openDropdown === 'tier' && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
                <div className="absolute top-full left-0 mt-1.5 w-52 bg-[#0b0f19] border border-purple-500/30 rounded-xl shadow-2xl p-1.5 z-50 space-y-0.5 backdrop-blur-xl">
                  {CREATOR_TIERS.map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => {
                        onFilterChange('creatorTier', tier);
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        filters.creatorTier === tier
                          ? 'bg-purple-600 text-white'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Rate Range */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('rate')}
              type="button"
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                filters.rateRange !== 'Any Rate'
                  ? 'bg-purple-500/15 text-purple-200 border-purple-500/40 shadow-sm'
                  : 'bg-slate-900 border-white/10 text-slate-300 hover:border-white/20'
              }`}
            >
              <span>{filters.rateRange}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>
            {openDropdown === 'rate' && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
                <div className="absolute top-full left-0 mt-1.5 w-44 bg-[#0b0f19] border border-purple-500/30 rounded-xl shadow-2xl p-1.5 z-50 space-y-0.5 backdrop-blur-xl">
                  {RATE_RANGES.map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => {
                        onFilterChange('rateRange', rate);
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        filters.rateRange === rate
                          ? 'bg-purple-600 text-white'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      {rate}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Active Filter Chips & View Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-extrabold text-white">
            {totalFiltered} Candidate{totalFiltered !== 1 ? 's' : ''} Found
          </span>

          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="px-2.5 py-1 rounded-xl bg-purple-500/15 border border-purple-400/30 text-purple-200 text-xs font-bold flex items-center gap-1.5"
            >
              <span>{chip.label}</span>
              <button
                type="button"
                onClick={() =>
                  onFilterChange(
                    chip.key,
                    chip.key === 'campaignId' || chip.key === 'status'
                      ? 'ALL'
                      : chip.key === 'category'
                      ? 'All Categories'
                      : chip.key === 'platform'
                      ? 'All Platforms'
                      : chip.key === 'creatorTier'
                      ? 'All Tiers'
                      : chip.key === 'rateRange'
                      ? 'Any Rate'
                      : 0,
                  )
                }
                className="hover:text-white p-0.5 rounded-full hover:bg-white/10 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {activeChips.length > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs font-bold text-slate-400 hover:text-rose-300 transition-colors ml-1 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Sort & Grid/List controls */}
        <div className="flex items-center gap-2.5 ml-auto">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-bold text-slate-300 focus:outline-none focus:border-purple-500/40 cursor-pointer"
          >
            <option value="matchScore">Best Match Score</option>
            <option value="followers">Most Followers</option>
            <option value="engagement">Highest Engagement</option>
            <option value="priceLow">Quote: Low to High</option>
            <option value="priceHigh">Quote: High to Low</option>
            <option value="recent">Recently Added</option>
          </select>

          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-white/10">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
