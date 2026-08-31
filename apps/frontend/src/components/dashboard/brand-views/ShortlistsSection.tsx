'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { CampaignApplicationItem, ApplicationService } from '@/services/application.service';
import { CampaignItem, CampaignService } from '@/services/campaign.service';
import { CreatorItem } from './find-influencers/CreatorCard';
import { mapApplicationToCreator } from './campaigns/mapApplicationToCreator';

import ShortlistKpiBanner from './shortlists/ShortlistKpiBanner';
import ShortlistFilterBar, { ShortlistFiltersState } from './shortlists/ShortlistFilterBar';
import ShortlistApplicantCard from './shortlists/ShortlistApplicantCard';
import CreatorPagination from './find-influencers/CreatorPagination';
import CreatorProfileFullView from './find-influencers/CreatorProfileFullView';
import SendOfferModal from './campaigns/SendOfferModal';
import ApplicantDetailModal from './campaigns/ApplicantDetailModal';
import ApplicantComparisonView from './campaigns/ApplicantComparisonView';
import LottieLoader from '@/components/ui/LottieLoader';

const INITIAL_FILTERS: ShortlistFiltersState = {
  campaignId: 'ALL',
  category: 'All Categories',
  platform: 'All Platforms',
  creatorTier: 'All Tiers',
  rateRange: 'Any Rate',
  minMatchScore: 0,
  minEngagementRate: 0,
  status: 'ALL',
};

export default function ShortlistsSection() {
  const [applications, setApplications] = useState<CampaignApplicationItem[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ShortlistFiltersState>(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState('matchScore');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Comparison & Selection state
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [isComparingOpen, setIsComparingOpen] = useState(false);

  // Modals state
  const [selectedAppForOffer, setSelectedAppForOffer] = useState<CampaignApplicationItem | null>(null);
  const [selectedAppForDetail, setSelectedAppForDetail] = useState<CampaignApplicationItem | null>(null);
  const [selectedCreatorForProfile, setSelectedCreatorForProfile] = useState<CreatorItem | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [appsData, campsData] = await Promise.all([
        ApplicationService.getBrandApplications(),
        CampaignService.getBrandCampaigns(),
      ]);

      // Filter only candidates relevant for shortlists (SHORTLISTED, OFFER_SENT, OFFER_ACCEPTED, or non-rejected)
      const shortlistedPool = (appsData || []).filter(
        (a) =>
          a.status === 'SHORTLISTED' ||
          a.status === 'OFFER_SENT' ||
          a.status === 'OFFER_ACCEPTED' ||
          Boolean(a.offers && a.offers.length > 0),
      );

      setApplications(shortlistedPool);
      setCampaigns(campsData || []);
    } catch (err) {
      console.error('Failed to load shortlisted applications', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFilterChange = (key: keyof ShortlistFiltersState, val: any) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilters(INITIAL_FILTERS);
    setCurrentPage(1);
  };

  const handleToggleCompare = (appId: string) => {
    setSelectedForCompare((prev) =>
      prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId],
    );
  };

  const handleRejectApplication = async (appId: string) => {
    try {
      await ApplicationService.rejectApplication(appId);
      loadData();
    } catch (err) {
      console.error('Failed to reject candidate', err);
    }
  };

  const handleShortlistApplication = async (appId: string) => {
    try {
      await ApplicationService.shortlistApplication(appId);
      loadData();
    } catch (err) {
      console.error('Failed to shortlist candidate', err);
    }
  };

  // Campaign count map
  const campaignCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    applications.forEach((app) => {
      const cId = app.campaignId || app.campaign?.id;
      if (cId) {
        counts[cId] = (counts[cId] || 0) + 1;
      }
    });
    return counts;
  }, [applications]);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const creator = mapApplicationToCreator(app);
      const campTitle = app.campaign?.title || '';
      const cId = app.campaignId || app.campaign?.id;

      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = creator.name.toLowerCase().includes(q);
        const matchesHandle = creator.handle.toLowerCase().includes(q);
        const matchesBio = creator.bio.toLowerCase().includes(q);
        const matchesCamp = campTitle.toLowerCase().includes(q);
        const matchesMsg = (app.applicationMessage || '').toLowerCase().includes(q);
        if (!matchesName && !matchesHandle && !matchesBio && !matchesCamp && !matchesMsg) {
          return false;
        }
      }

      // 2. Campaign Filter
      if (filters.campaignId !== 'ALL' && cId !== filters.campaignId) {
        return false;
      }

      // 3. Status Filter
      if (filters.status !== 'ALL') {
        if (filters.status === 'SHORTLISTED') {
          if (app.status !== 'SHORTLISTED' && app.status !== 'UNDER_REVIEW') return false;
        } else if (filters.status === 'OFFER_SENT') {
          if (app.status !== 'OFFER_SENT' && (!app.offers || app.offers.length === 0)) return false;
        } else if (filters.status === 'OFFER_ACCEPTED') {
          if (app.status !== 'OFFER_ACCEPTED') return false;
        }
      }

      // 4. Category Filter
      if (filters.category !== 'All Categories') {
        const cat = filters.category.toLowerCase();
        const matchesCat =
          creator.category.toLowerCase().includes(cat) ||
          (creator.categories && creator.categories.some((c) => c.toLowerCase().includes(cat)));
        if (!matchesCat) return false;
      }

      // 5. Platform Filter
      if (filters.platform !== 'All Platforms') {
        const plat = filters.platform.toLowerCase();
        const hasPlat = creator.platforms && creator.platforms.some((p) => p.toLowerCase().includes(plat));
        if (!hasPlat) return false;
      }

      // 6. Creator Tier
      if (filters.creatorTier !== 'All Tiers') {
        const tier = filters.creatorTier.toLowerCase();
        if (!creator.creatorTier.toLowerCase().includes(tier.split(' ')[0])) {
          return false;
        }
      }

      // 7. Rate Range
      if (filters.rateRange !== 'Any Rate') {
        const rawAmt = app.proposedAmount || creator.startingRate || 0;
        const amt = typeof rawAmt === 'number' ? rawAmt : parseFloat(String(rawAmt).replace(/[^0-9.]/g, '')) || 0;
        if (filters.rateRange === 'Under $250' && amt > 250) return false;
        if (filters.rateRange === '$250 - $500' && (amt < 250 || amt > 500)) return false;
        if (filters.rateRange === '$500 - $1K' && (amt < 500 || amt > 1000)) return false;
        if (filters.rateRange === '$1K - $2.5K' && (amt < 1000 || amt > 2500)) return false;
        if (filters.rateRange === '$2.5K+' && amt < 2500) return false;
      }

      // 8. Match Score
      if (filters.minMatchScore > 0) {
        const score = app.matchSnapshot?.score || 90;
        if (score < filters.minMatchScore) return false;
      }

      return true;
    });
  }, [applications, searchQuery, filters]);

  // Sorted applications
  const sortedApplications = useMemo(() => {
    return [...filteredApplications].sort((a, b) => {
      const cA = mapApplicationToCreator(a);
      const cB = mapApplicationToCreator(b);

      if (sortBy === 'matchScore') {
        const scoreA = a.matchSnapshot?.score || 90;
        const scoreB = b.matchSnapshot?.score || 90;
        return scoreB - scoreA;
      }
      if (sortBy === 'followers') {
        return cB.reachNumber - cA.reachNumber;
      }
      if (sortBy === 'engagement') {
        return cB.engRateNumber - cA.engRateNumber;
      }
      if (sortBy === 'priceLow') {
        const rawA = a.proposedAmount || cA.startingRate || 0;
        const rawB = b.proposedAmount || cB.startingRate || 0;
        const pA = typeof rawA === 'number' ? rawA : parseFloat(String(rawA).replace(/[^0-9.]/g, '')) || 0;
        const pB = typeof rawB === 'number' ? rawB : parseFloat(String(rawB).replace(/[^0-9.]/g, '')) || 0;
        return pA - pB;
      }
      if (sortBy === 'priceHigh') {
        const rawA = a.proposedAmount || cA.startingRate || 0;
        const rawB = b.proposedAmount || cB.startingRate || 0;
        const pA = typeof rawA === 'number' ? rawA : parseFloat(String(rawA).replace(/[^0-9.]/g, '')) || 0;
        const pB = typeof rawB === 'number' ? rawB : parseFloat(String(rawB).replace(/[^0-9.]/g, '')) || 0;
        return pB - pA;
      }
      if (sortBy === 'recent') {
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      }
      return 0;
    });
  }, [filteredApplications, sortBy]);

  // Paginated applications
  const totalPages = Math.ceil(sortedApplications.length / pageSize) || 1;
  const paginatedApplications = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedApplications.slice(start, start + pageSize);
  }, [sortedApplications, currentPage, pageSize]);

  // Applications selected for comparison modal
  const compareApplicantsList = useMemo(() => {
    return applications.filter((a) => selectedForCompare.includes(a.id));
  }, [applications, selectedForCompare]);

  if (isLoading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-12">
        <LottieLoader size={200} message="Loading shortlisted creators across your campaigns..." />
      </div>
    );
  }

  if (selectedCreatorForProfile) {
    return (
      <CreatorProfileFullView
        creator={selectedCreatorForProfile}
        onBack={() => setSelectedCreatorForProfile(null)}
        onToggleBookmark={() => {}}
        onInvite={(creator) => {
          const matchingApp = applications.find(
            (a) => a.influencerProfileId === creator.id || a.influencerProfile?.id === creator.id,
          );
          if (matchingApp) {
            setSelectedAppForOffer(matchingApp);
          }
        }}
      />
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Top KPI Banner */}
      <ShortlistKpiBanner
        applications={applications}
        campaignsCount={Object.keys(campaignCounts).length}
      />

      {/* Filter and Search Suite */}
      <ShortlistFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        campaigns={campaigns}
        campaignCounts={campaignCounts}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalFiltered={filteredApplications.length}
      />

      {/* Main Content Area */}
      {paginatedApplications.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
              : 'space-y-3'
          }
        >
          {paginatedApplications.map((app) => (
            <ShortlistApplicantCard
              key={app.id}
              application={app}
              viewMode={viewMode}
              onViewDetails={(a) => setSelectedAppForDetail(a)}
              onViewProfile={(creator) => setSelectedCreatorForProfile(creator)}
              onSendOffer={(a) => setSelectedAppForOffer(a)}
              onReject={handleRejectApplication}
              onSelectCompare={handleToggleCompare}
              isCompareSelected={selectedForCompare.includes(app.id)}
              onFilterByCampaign={(cId) => handleFilterChange('campaignId', cId)}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-purple-500/15 backdrop-blur-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mx-auto flex items-center justify-center">
            <Users className="w-8 h-8 opacity-75" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base font-extrabold text-white">No shortlisted candidates found</h3>
            <p className="text-xs text-slate-400">
              {applications.length === 0
                ? 'When you shortlist creators from campaign applicant pitches or discover candidates, they will appear here.'
                : 'No shortlisted candidates match your current search and filter criteria. Try resetting filters.'}
            </p>
          </div>
          {applications.length > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-all cursor-pointer shadow-md shadow-purple-950/40"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {sortedApplications.length > pageSize && (
        <CreatorPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          totalItems={sortedApplications.length}
        />
      )}

      {/* Floating Comparison Drawer / Action Bar */}
      <AnimatePresence>
        {selectedForCompare.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3.5 rounded-2xl bg-[#0b0f19]/95 border border-purple-500/40 shadow-2xl shadow-purple-950/80 backdrop-blur-2xl flex items-center gap-4 text-xs select-none"
          >
            <div className="flex items-center gap-2 text-white font-bold">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>
                {selectedForCompare.length} Candidate{selectedForCompare.length !== 1 ? 's' : ''}{' '}
                Selected
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedForCompare([])}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsComparingOpen(true)}
                disabled={selectedForCompare.length < 2}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
              >
                <span>Compare Side-by-Side</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Send / Change Offer Modal */}
      {selectedAppForOffer && (
        <SendOfferModal
          application={selectedAppForOffer}
          onClose={() => setSelectedAppForOffer(null)}
          onSuccess={() => {
            setSelectedAppForOffer(null);
            loadData();
          }}
          onViewProfile={(creator) => {
            setSelectedAppForOffer(null);
            setSelectedCreatorForProfile(creator);
          }}
        />
      )}

      {/* Applicant Full Pitch Detail Modal */}
      {selectedAppForDetail && (
        <ApplicantDetailModal
          application={selectedAppForDetail}
          onClose={() => setSelectedAppForDetail(null)}
          onViewProfile={(creator) => {
            setSelectedAppForDetail(null);
            setSelectedCreatorForProfile(creator);
          }}
          onSendOffer={(app) => {
            setSelectedAppForDetail(null);
            setSelectedAppForOffer(app);
          }}
          onShortlist={handleShortlistApplication}
          onReject={handleRejectApplication}
        />
      )}

      {/* Side-by-Side Comparison Modal */}
      {isComparingOpen && compareApplicantsList.length > 0 && (
        <ApplicantComparisonView
          applicants={compareApplicantsList}
          onClose={() => setIsComparingOpen(false)}
          onViewProfile={(creator) => {
            setIsComparingOpen(false);
            setSelectedCreatorForProfile(creator);
          }}
          onSendOffer={(app) => {
            setIsComparingOpen(false);
            setSelectedAppForOffer(app);
          }}
        />
      )}
    </div>
  );
}
