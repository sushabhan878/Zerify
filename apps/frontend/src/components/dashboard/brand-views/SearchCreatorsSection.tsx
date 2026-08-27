'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Users, RotateCcw, Loader2 } from 'lucide-react';
import CreatorSearchBar from './find-influencers/CreatorSearchBar';
import CreatorQuickFilters from './find-influencers/CreatorQuickFilters';
import CreatorActiveFilterChips from './find-influencers/CreatorActiveFilterChips';
import CreatorSortAndControls from './find-influencers/CreatorSortAndControls';
import CreatorCard, { CreatorItem } from './find-influencers/CreatorCard';
import CreatorPagination from './find-influencers/CreatorPagination';
import CreatorAdvancedFiltersModal, {
  CreatorAdvancedFilterState,
} from './find-influencers/CreatorAdvancedFiltersModal';
import CreatorDetailModal from './find-influencers/CreatorDetailModal';
import CreatorProfileFullView from './find-influencers/CreatorProfileFullView';
import CreatorInviteModal from './find-influencers/CreatorInviteModal';
import LottieLoader from '@/components/ui/LottieLoader';
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

function formatFollowerCount(count: number): string {
  if (!count || count <= 0) return '250K';
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(count);
}

function getTierFromReach(reachNum: number): string {
  if (reachNum >= 1_000_000) return 'Mega (1M+)';
  if (reachNum >= 500_000) return 'Macro (500K - 1M)';
  if (reachNum >= 100_000) return 'Mid-Tier (100K - 500K)';
  if (reachNum >= 10_000) return 'Micro (10K - 100K)';
  return 'Nano (1K - 10K)';
}

export default function SearchCreatorsSection() {
  const [creators, setCreators] = useState<CreatorItem[]>(MOCK_CREATORS);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<CreatorAdvancedFilterState>(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState('matchScore');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false);
  const [selectedCreatorForDetail, setSelectedCreatorForDetail] = useState<CreatorItem | null>(null);
  const [selectedCreatorForInvite, setSelectedCreatorForInvite] = useState<CreatorItem | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set(['c1', 'c2']));

  // Pagination state: default 8 creators per page (max 8-10)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  useEffect(() => {
    async function loadInfluencersFromDb() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('zerify_token') : null;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

        const res = await fetch(`${apiUrl}/influencer/discovery`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (res.ok) {
          const dbData = await res.json();
          if (Array.isArray(dbData) && dbData.length > 0) {
            const formatted: CreatorItem[] = dbData.map((inf: any, idx: number) => {
              const socialAcc = inf.user?.socialAccounts?.[0] || {};
              const followerNum =
                inf.user?.socialAccounts?.reduce((sum: number, sa: any) => sum + (sa.followerCount || 0), 0) ||
                socialAcc.followerCount ||
                450000;
              const engRateNum = socialAcc.engagementRate || 6.5;
              const startingRateNum = inf.minPricePerReel || 750;
              const baseMatch = Math.min(99, Math.max(68, 97 - (idx % 12) * 2));
              const mainPlatform = socialAcc.platform || 'Instagram';
              const platformsList =
                inf.user?.socialAccounts?.map((sa: any) => sa.platform) || [mainPlatform, 'YouTube'];

              return {
                id: inf.id || `creator_${idx}`,
                name: inf.user?.name || inf.handle?.replace('@', '') || `Creator ${idx + 1}`,
                handle: inf.handle || `@${(inf.user?.name || 'creator').toLowerCase().replace(/\s+/g, '')}`,
                avatarUrl: inf.avatarUrl,
                avatarBg: AVATAR_COLORS[idx % AVATAR_COLORS.length],
                category: inf.niches?.[0] || 'Technology & AI',
                categories: inf.niches && inf.niches.length > 0 ? inf.niches : [inf.niches?.[0] || 'Technology & AI'],
                bio:
                  inf.bio ||
                  'Professional content creator and verified brand ambassador delivering high engagement campaigns.',
                reach: formatFollowerCount(followerNum),
                reachNumber: followerNum,
                engRate: `${engRateNum}%`,
                engRateNumber: engRateNum,
                rating: Number((4.8 + ((idx % 3) * 0.1)).toFixed(1)),
                startingRate: `$${startingRateNum}`,
                rateNumber: startingRateNum,
                platforms: Array.from(new Set(platformsList)),
                primaryPlatform: mainPlatform,
                location: inf.location || 'United States',
                matchScore: baseMatch,
                matchReasons: [
                  'Audience demographics align with your brand consumer base',
                  `Strong organic engagement in ${inf.niches?.[0] || 'their category'}`,
                  'Verified creator with reliable turnaround track record',
                ],
                isVerified: socialAcc.isVerified ?? true,
                skills: inf.collaborationTypes?.length > 0
                  ? inf.collaborationTypes
                  : ['Reels / Shorts', 'Product Reviews', 'Story Sequences'],
                role: inf.title || inf.role || `${inf.niches?.[0] || 'Content'} Specialist`,
                statusText: 'Available for Collabs',
                topAudienceAge: '25-34 (58%)',
                topAudienceGender: '64% Female / 36% Male',
                creatorTier: getTierFromReach(followerNum),
              };
            });

            setCreators(formatted);

            // Fetch saved creators from DB
            try {
              const savedRes = await fetch(`${apiUrl}/brand/saved-creators`, {
                headers: {
                  'Content-Type': 'application/json',
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
              });
              if (savedRes.ok) {
                const savedIds = await savedRes.json();
                if (Array.isArray(savedIds)) {
                  setBookmarkedIds(new Set(savedIds));
                }
              }
            } catch (e) {
              console.warn('Could not fetch saved creators list:', e);
            }

            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not fetch influencers from backend API, using pre-seeded fallback list:', err);
      }

      // Fallback
      setCreators(MOCK_CREATORS);
      setIsLoading(false);
    }

    loadInfluencersFromDb();
  }, []);

  // Reset page to 1 whenever filters, search or sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters, sortBy, pageSize]);

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
    return creators.filter((c) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesHandle = c.handle.toLowerCase().includes(q);
        const matchesCat = c.category.toLowerCase().includes(q);
        const matchesBio = c.bio.toLowerCase().includes(q);
        const matchesSkills = c.skills?.some((s) => s.toLowerCase().includes(q));
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
  }, [creators, searchQuery, filters, sortBy]);

  // Paginated subset
  const totalPages = Math.ceil(filteredCreators.length / pageSize);
  const paginatedCreators = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCreators.slice(start, start + pageSize);
  }, [filteredCreators, currentPage, pageSize]);

  // Dedicated Full Profile Screen View
  if (selectedCreatorForDetail) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <CreatorProfileFullView
          creator={{
            ...selectedCreatorForDetail,
            isBookmarked: bookmarkedIds.has(selectedCreatorForDetail.id),
          }}
          onBack={() => setSelectedCreatorForDetail(null)}
          onInvite={(c) => setSelectedCreatorForInvite(c)}
          onToggleBookmark={handleToggleBookmark}
          onSelectCreator={(c) => setSelectedCreatorForDetail(c)}
        />

        {/* Direct Campaign Invite Modal */}
        <CreatorInviteModal
          creator={selectedCreatorForInvite}
          onClose={() => setSelectedCreatorForInvite(null)}
        />
      </div>
    );
  }

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
      {isLoading ? (
        <div className="min-h-[380px] flex items-center justify-center p-12">
          <LottieLoader size={200} message="Discovering live creators from verified database..." />
        </div>
      ) : filteredCreators.length === 0 ? (
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
        <>
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 xl:grid-cols-2 gap-6 pt-1'
                : 'space-y-4 pt-1'
            }
          >
            {paginatedCreators.map((creator, idx) => (
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

          {/* Pagination Controls */}
          <CreatorPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredCreators.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </>
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
