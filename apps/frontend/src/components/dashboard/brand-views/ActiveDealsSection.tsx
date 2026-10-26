'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import DealsKpiBanner from './deals/DealsKpiBanner';
import DealsFilterBar, { DealsTabFilter } from './deals/DealsFilterBar';
import DealCard from './deals/DealCard';
import DealDetailModal from './deals/DealDetailModal';
import DeliverablePreviewModal from './deals/DeliverablePreviewModal';
import DealsLoadingSkeleton from './deals/DealsLoadingSkeleton';
import ParticipantDeliverablesPage from './campaigns/ParticipantDeliverablesPage';
import { DealItem, mapParticipantToDealItem, MOCK_DEALS } from './deals/deal-types';
import { CampaignService } from '@/services/campaign.service';
import { DeliverableService } from '@/services/deliverable.service';
import { useCurrency } from '@/context/CurrencyContext';

export default function ActiveDealsSection() {
  const { format, convert } = useCurrency();
  const [deals, setDeals] = useState<DealItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTabSwitching, setIsTabSwitching] = useState(false);
  const [activeTab, setActiveTab] = useState<DealsTabFilter>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  // Modals state
  const [selectedDealForDetails, setSelectedDealForDetails] = useState<DealItem | null>(null);
  const [selectedDealForPreview, setSelectedDealForPreview] = useState<DealItem | null>(null);
  const [campaignsList, setCampaignsList] = useState<{ id: string; title: string }[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dedicated Deliverables Management State
  const [managingDeal, setManagingDeal] = useState<DealItem | null>(null);
  const [managingParticipant, setManagingParticipant] = useState<any | null>(null);
  const [managingCampaign, setManagingCampaign] = useState<any | null>(null);

  // Fetch real deals and campaigns across all campaigns running by the brand
  const loadDealsAndCampaigns = useCallback(async () => {
    setIsLoading(true);
    try {
      // Run both brand deals and brand campaigns fetch in parallel
      const [rawDealsResult, campaignsResult] = await Promise.allSettled([
        CampaignService.getBrandDeals(),
        CampaignService.getBrandCampaigns(),
      ]);

      let allMappedDeals: DealItem[] = [];

      // 1. Process /brand/deals if returned
      if (rawDealsResult.status === 'fulfilled' && Array.isArray(rawDealsResult.value)) {
        allMappedDeals = rawDealsResult.value.map(mapParticipantToDealItem);
      }

      // 2. Process /campaigns to populate filter dropdown & aggregate any embedded participants
      if (campaignsResult.status === 'fulfilled' && Array.isArray(campaignsResult.value)) {
        const camps = campaignsResult.value;
        setCampaignsList(camps.map((c) => ({ id: c.id, title: c.title })));

        // If /brand/deals was empty, extract embedded participants from campaigns
        if (allMappedDeals.length === 0) {
          const extractedDeals: DealItem[] = [];
          for (const camp of camps) {
            const participants = (camp as any).participants;
            if (Array.isArray(participants) && participants.length > 0) {
              for (const p of participants) {
                extractedDeals.push(
                  mapParticipantToDealItem({
                    ...p,
                    campaign: p.campaign || { id: camp.id, title: camp.title, status: camp.status },
                  })
                );
              }
            }
          }
          if (extractedDeals.length > 0) {
            allMappedDeals = extractedDeals;
          }
        }
      }

      // If deals were found, save them; otherwise fallback to empty list
      setDeals(allMappedDeals);
    } catch (err) {
      console.error('Failed to load active brand deals:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDealsAndCampaigns();
  }, [loadDealsAndCampaigns]);

  const handleManageDeliverables = async (deal: DealItem) => {
    setManagingDeal(deal);

    // Initial participant structure immediately available from deal
    const initialParticipant = deal.rawParticipant || {
      id: deal.id,
      campaignId: deal.campaignId,
      status: deal.status === 'COMPLETED' ? 'PARTICIPANT_COMPLETED' : 'PARTICIPANT_ACTIVE',
      agreedAmount: deal.agreedAmount,
      agreedCurrency: deal.agreedCurrency,
      deliverables: deal.deliverables,
      influencerProfile: {
        id: deal.creator.id,
        handle: deal.creator.handle,
        user: {
          name: deal.creator.name,
          avatarUrl: deal.creator.avatarUrl,
        },
        avatarUrl: deal.creator.avatarUrl,
        niches: [deal.creator.category],
        collaborationTypes: deal.creator.platforms,
      },
      campaign: deal.rawCampaign || {
        id: deal.campaignId,
        title: deal.campaignTitle,
      },
    };

    const initialCampaign = deal.rawCampaign || {
      id: deal.campaignId,
      title: deal.campaignTitle,
    };

    setManagingParticipant(initialParticipant);
    setManagingCampaign(initialCampaign);

    // Fetch fresh live participant and campaign details from database
    try {
      const [freshPart, freshCamp] = await Promise.allSettled([
        DeliverableService.getParticipantDetails(deal.id),
        CampaignService.getCampaignDetails(deal.campaignId),
      ]);
      if (freshPart.status === 'fulfilled' && freshPart.value) {
        setManagingParticipant(freshPart.value);
      }
      if (freshCamp.status === 'fulfilled' && freshCamp.value) {
        setManagingCampaign(freshCamp.value);
      }
    } catch (err) {
      console.error('Error fetching participant deliverables page data:', err);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleApproveRelease = (deal: DealItem) => {
    setDeals((prev) =>
      prev.map((d) =>
        d.id === deal.id
          ? {
              ...d,
              status: 'COMPLETED',
              stage: 'COMPLETED',
              stageLabel: 'Contract Fulfilled & Escrow Released',
              escrowStatus: 'RELEASED',
              completedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            }
          : d,
      ),
    );
    const formattedAmt = format(convert(deal.agreedAmount, deal.agreedCurrency));
    showToast(`Payment of ${formattedAmt} released from Escrow to ${deal.creator.name}.`);
  };

  const handleRequestEdits = (deal: DealItem, note?: string) => {
    setDeals((prev) =>
      prev.map((d) =>
        d.id === deal.id
          ? {
              ...d,
              stageLabel: 'Revisions Requested from Creator',
            }
          : d,
      ),
    );
    showToast(`Revision request dispatched to ${deal.creator.name}.`);
  };

  const handleTabChange = (tab: DealsTabFilter) => {
    setActiveTab(tab);
    setIsTabSwitching(true);
    setTimeout(() => setIsTabSwitching(false), 240);
  };

  const handleCampaignChange = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setIsTabSwitching(true);
    setTimeout(() => setIsTabSwitching(false), 240);
  };

  // Tab counts
  const tabCounts = useMemo(() => ({
    ACTIVE: deals.filter((d) => d.status === 'ACTIVE').length,
    COMPLETED: deals.filter((d) => d.status === 'COMPLETED').length,
    CANCELLED: deals.filter((d) => d.status === 'CANCELLED').length,
    ALL: deals.length,
  }), [deals]);

  // Filtered & Sorted Deals
  const filteredDeals = useMemo(() => {
    return deals
      .filter((deal) => {
        // Tab filter
        if (activeTab !== 'ALL' && deal.status !== activeTab) return false;

        // Campaign filter
        if (selectedCampaignId !== 'ALL' && deal.campaignId !== selectedCampaignId) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = deal.creator.name.toLowerCase().includes(q);
          const matchHandle = deal.creator.handle.toLowerCase().includes(q);
          const matchCampaign = deal.campaignTitle.toLowerCase().includes(q);
          const matchId = deal.dealNumber.toLowerCase().includes(q);
          if (!matchName && !matchHandle && !matchCampaign && !matchId) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'highest_amount') {
          const amtA = convert(a.agreedAmount, a.agreedCurrency);
          const amtB = convert(b.agreedAmount, b.agreedCurrency);
          return amtB - amtA;
        }
        return 0; // Default newest
      });
  }, [deals, activeTab, selectedCampaignId, searchQuery, sortBy]);

  // If brand is managing deliverables for a specific deal, show the dedicated ParticipantDeliverablesPage
  if (managingDeal && managingParticipant) {
    return (
      <ParticipantDeliverablesPage
        participant={managingParticipant}
        campaign={managingCampaign}
        onBack={() => {
          setManagingDeal(null);
          setManagingParticipant(null);
          setManagingCampaign(null);
          loadDealsAndCampaigns();
        }}
        onRefresh={async () => {
          try {
            const [freshPart, freshCamp] = await Promise.allSettled([
              DeliverableService.getParticipantDetails(managingDeal.id),
              CampaignService.getCampaignDetails(managingDeal.campaignId),
            ]);
            if (freshPart.status === 'fulfilled' && freshPart.value) {
              setManagingParticipant(freshPart.value);
            }
            if (freshCamp.status === 'fulfilled' && freshCamp.value) {
              setManagingCampaign(freshCamp.value);
            }
          } catch (e) {
            console.error('Error refreshing deliverables page:', e);
          }
          loadDealsAndCampaigns();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl bg-purple-950/90 border border-purple-500/40 text-purple-200 text-xs font-bold shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4">
          {toastMessage}
        </div>
      )}



      {/* KPI Stats Banner */}
      <DealsKpiBanner deals={deals} />

      {/* Switchable Tabs & Filter Bar */}
      <DealsFilterBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        tabCounts={tabCounts}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        campaignsList={campaignsList}
        selectedCampaignId={selectedCampaignId}
        onCampaignChange={handleCampaignChange}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      {/* Deals List */}
      {isLoading || isTabSwitching ? (
        <DealsLoadingSkeleton count={4} />
      ) : filteredDeals.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pt-4">
          {filteredDeals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              onPreviewDraft={setSelectedDealForPreview}
              onViewDetails={setSelectedDealForDetails}
              onApproveRelease={handleApproveRelease}
              onRequestEdits={(d) => setSelectedDealForPreview(d)}
              onManageDeliverables={handleManageDeliverables}
            />
          ))}
        </div>
      ) : (
        <div className="py-14 sm:py-20 text-center">
          <p className="text-xs sm:text-sm font-medium text-slate-400 tracking-wide">
            {searchQuery
              ? `No deals matching "${searchQuery}"`
              : activeTab === 'ACTIVE'
              ? 'No Active Deals found'
              : activeTab === 'COMPLETED'
              ? 'No Completed Deals found'
              : activeTab === 'CANCELLED'
              ? 'No Cancelled Deals found'
              : 'No Deals found'}
          </p>
        </div>
      )}

      {/* Modals */}
      <DealDetailModal
        deal={selectedDealForDetails}
        onClose={() => setSelectedDealForDetails(null)}
        onApproveRelease={handleApproveRelease}
      />

      <DeliverablePreviewModal
        deal={selectedDealForPreview}
        onClose={() => setSelectedDealForPreview(null)}
        onApprove={handleApproveRelease}
        onRequestEdits={handleRequestEdits}
      />
    </div>
  );
}
