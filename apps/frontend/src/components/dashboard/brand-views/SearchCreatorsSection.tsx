'use client';

import React, { useState, useMemo } from 'react';
import { Users, RotateCcw } from 'lucide-react';
import CreatorSearchBar from './find-influencers/CreatorSearchBar';
import CreatorQuickFilters from './find-influencers/CreatorQuickFilters';
import CreatorActiveFilterChips from './find-influencers/CreatorActiveFilterChips';
import CreatorSortAndControls from './find-influencers/CreatorSortAndControls';
import CreatorCard, { CreatorItem } from './find-influencers/CreatorCard';
import CreatorAdvancedFiltersModal, {
  CreatorAdvancedFilterState,
} from './find-influencers/CreatorAdvancedFiltersModal';
import CreatorDetailModal from './find-influencers/CreatorDetailModal';
import CreatorInviteModal from './find-influencers/CreatorInviteModal';
import { MOCK_CREATORS } from './find-influencers/mockCreators';

const INITIAL_FILTERS: CreatorAdvancedFilterState = {
  category: 'All',
  rateRange: 'Any Rate',
  minMatchScore: 0,
  platform: 'All Platforms',
  creatorTier: 'All Tiers',
  minEngagementRate: 0,
  location: 'All',
  audienceGender: 'All',
  audienceAge: 'All',
  contentType: 'All Types',
  isVerifiedOnly: false,
  escrowOnly: false,
  topRatedOnly: false,
};

const AVATAR_COLORS = [
  'bg-purple-600',
  'bg-indigo-600',
  'bg-pink-600',
  'bg-cyan-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-violet-600',
  'bg-rose-600',
];

export default function SearchCreatorsSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<CreatorAdvancedFilterState>(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState('matchScore');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false);
  const [selectedCreatorForDetail, setSelectedCreatorForDetail] = useState<CreatorItem | null>(null);
  const [selectedCreatorForInvite, setSelectedCreatorForInvite] = useState<CreatorItem | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set(['c1', 'c2']));

  const activeCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'All') count++;
    if (filters.rateRange !== 'Any Rate') count++;
    if (filters.minMatchScore > 0) count++;
    if (filters.platform !== 'All Platforms') count++;
    if (filters.creatorTier !== 'All Tiers') count++;
    if (filters.minEngagementRate > 0) count++;
    if (filters.location !== 'All') count++;
    if (filters.audienceGender !== 'All') count++;
    if (filters.audienceAge !== 'All') count++;
    if (filters.contentType !== 'All Types') count++;
    if (filters.isVerifiedOnly) count++;
    if (filters.escrowOnly) count++;
    if (filters.topRatedOnly) count++;
    return count;
  }, [filters]);

  const handleFilterChange = (key: keyof CreatorAdvancedFilterState, val: any) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setSearchQuery('');
  };

  const handleToggleBookmark = (creatorId: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(creatorId)) {
        next.delete(creatorId);
      } else {
        next.add(creatorId);
      }
      return next;
    });
  };

  // Filter & Sort Logic
  const filteredCreators = useMemo(() => {
    return MOCK_CREATORS.filter((c) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesHandle = c.handle.toLowerCase().includes(q);
        const matchesCat = c.category.toLowerCase().includes(q);
        const matchesBio = c.bio.toLowerCase().includes(q);
        const matchesSkills = c.skills.some((s) => s.toLowerCase().includes(q));
        const matchesLoc = c.location.toLowerCase().includes(q);
        if (!matchesName && !matchesHandle && !matchesCat && !matchesBio && !matchesSkills && !matchesLoc) {
          return false;
        }
      }

      // 2. Category
      if (filters.category !== 'All' && !c.category.toLowerCase().includes(filters.category.toLowerCase())) {
        return false;
      }

      // 3. Platform
      if (filters.platform !== 'All Platforms' && !c.platforms.includes(filters.platform)) {
        return false;
      }

      // 4. Creator Tier
      if (filters.creatorTier !== 'All Tiers') {
        if (!c.creatorTier.toLowerCase().includes(filters.creatorTier.split(' ')[0].toLowerCase())) {
          return false;
        }
      }

      // 5. Match Score
      if (filters.minMatchScore > 0 && c.matchScore < filters.minMatchScore) {
        return false;
      }

      // 6. Min Engagement Rate
      if (filters.minEngagementRate > 0 && c.engRateNumber < filters.minEngagementRate) {
        return false;
      }

      // 7. Verification signals
      if (filters.isVerifiedOnly && !c.isVerified) return false;
      if (filters.topRatedOnly && c.rating < 4.8) return false;

      // 8. Location
      if (filters.location !== 'All' && !c.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'matchScore') return b.matchScore - a.matchScore;
      if (sortBy === 'reachDesc') return b.reachNumber - a.reachNumber;
      if (sortBy === 'engagementDesc') return b.engRateNumber - a.engRateNumber;
      if (sortBy === 'ratingDesc') return b.rating - a.rating;
      if (sortBy === 'rateAsc') return a.rateNumber - b.rateNumber;
      if (sortBy === 'rateDesc') return b.rateNumber - a.rateNumber;
      return 0;
    });
  }, [searchQuery, filters, sortBy]);

  return (
    <div className="space-y-4">
      {/* 1. Large Top Search Bar */}
      <CreatorSearchBar value={searchQuery} onChange={setSearchQuery} />

      {/* 2. Quick Filters Pills Row with All Filters Button */}
      <CreatorQuickFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onOpenAdvancedModal={() => setIsAdvancedModalOpen(true)}
        activeCount={activeCount}
      />

      {/* 3. Active Filter Chips */}
      <CreatorActiveFilterChips
        filters={filters}
        onRemoveFilter={(key, defaultVal) => handleFilterChange(key, defaultVal)}
        onClearAll={handleResetFilters}
        activeCount={activeCount}
      />

      {/* 4. Total Count, Sort Dropdown & Grid/List View Mode */}
      <CreatorSortAndControls
        totalCount={filteredCreators.length}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* 5. Creators Grid / List */}
      {filteredCreators.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-dashed border-white/10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-300 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-white">No creators match your filters</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search keywords, lowering the match threshold, or clearing specific filters.
          </p>
          <button
            onClick={handleResetFilters}
            type="button"
            className="px-4 py-2 rounded-xl bg-purple-600 text-xs font-bold text-white inline-flex items-center gap-1.5 shadow-md shadow-purple-950/40"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pt-1'
              : 'space-y-3 pt-1'
          }
        >
          {filteredCreators.map((creator, idx) => (
            <CreatorCard
              key={creator.id}
              creator={{
                ...creator,
                avatarBg: AVATAR_COLORS[idx % AVATAR_COLORS.length],
                isBookmarked: bookmarkedIds.has(creator.id),
              }}
              viewMode={viewMode}
              onInvite={(c) => setSelectedCreatorForInvite(c)}
              onViewProfile={(c) => setSelectedCreatorForDetail(c)}
              onToggleBookmark={handleToggleBookmark}
            />
          ))}
        </div>
      )}

      {/* 6. Sliding Filter Drawer from the Right Side */}
      <CreatorAdvancedFiltersModal
        isOpen={isAdvancedModalOpen}
        onClose={() => setIsAdvancedModalOpen(false)}
        filters={filters}
        onApplyFilters={(newFilters) => setFilters(newFilters)}
        onResetFilters={handleResetFilters}
      />

      {/* 7. Creator Detail Profile & Media Kit Modal */}
      <CreatorDetailModal
        creator={selectedCreatorForDetail}
        onClose={() => setSelectedCreatorForDetail(null)}
        onInvite={(c) => setSelectedCreatorForInvite(c)}
      />

      {/* 8. Creator Direct Campaign Invite Modal */}
      <CreatorInviteModal
        creator={selectedCreatorForInvite}
        onClose={() => setSelectedCreatorForInvite(null)}
      />
    </div>
  );
}
