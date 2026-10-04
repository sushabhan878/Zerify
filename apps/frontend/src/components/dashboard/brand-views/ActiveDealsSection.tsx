'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import DealsKpiBanner from './deals/DealsKpiBanner';
import DealsFilterBar, { DealsTabFilter } from './deals/DealsFilterBar';
import DealCard from './deals/DealCard';
import DealDetailModal from './deals/DealDetailModal';
import DeliverablePreviewModal from './deals/DeliverablePreviewModal';
import { DealItem, MOCK_DEALS } from './deals/deal-types';
import { CampaignService } from '@/services/campaign.service';

export default function ActiveDealsSection() {
  const [deals, setDeals] = useState<DealItem[]>(MOCK_DEALS);
  const [activeTab, setActiveTab] = useState<DealsTabFilter>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  // Modals state
  const [selectedDealForDetails, setSelectedDealForDetails] = useState<DealItem | null>(null);
  const [selectedDealForPreview, setSelectedDealForPreview] = useState<DealItem | null>(null);
  const [campaignsList, setCampaignsList] = useState<{ id: string; title: string }[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch real campaigns for filter dropdown
  useEffect(() => {
    async function loadCampaigns() {
      try {
        const camps = await CampaignService.getBrandCampaigns();
        if (camps && camps.length > 0) {
          setCampaignsList(camps.map((c) => ({ id: c.id, title: c.title })));
        } else {
          setCampaignsList([
            { id: 'camp-101', title: 'Q3 Enterprise SaaS Launch' },
            { id: 'camp-102', title: 'Summer Desk Setup Showcase' },
            { id: 'camp-103', title: 'Developer Tools AI Spotlight' },
          ]);
        }
      } catch (err) {
        setCampaignsList([
          { id: 'camp-101', title: 'Q3 Enterprise SaaS Launch' },
          { id: 'camp-102', title: 'Summer Desk Setup Showcase' },
          { id: 'camp-103', title: 'Developer Tools AI Spotlight' },
        ]);
      }
    }
    loadCampaigns();
  }, []);

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
    showToast(`Payment of $${deal.agreedAmount.toLocaleString()} released from Escrow to ${deal.creator.name}.`);
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
        if (sortBy === 'highest_amount') return b.agreedAmount - a.agreedAmount;
        return 0; // Default newest
      });
  }, [deals, activeTab, selectedCampaignId, searchQuery, sortBy]);

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
        onTabChange={setActiveTab}
        tabCounts={tabCounts}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        campaignsList={campaignsList}
        selectedCampaignId={selectedCampaignId}
        onCampaignChange={setSelectedCampaignId}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      {/* Deals List */}
      {filteredDeals.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pt-4">
          {filteredDeals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              onPreviewDraft={setSelectedDealForPreview}
              onViewDetails={setSelectedDealForDetails}
              onApproveRelease={handleApproveRelease}
              onRequestEdits={(d) => setSelectedDealForPreview(d)}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-[#090C15]/95 border border-white/[0.08] backdrop-blur-xl space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mx-auto flex items-center justify-center">
            <AlertCircle className="w-7 h-7 opacity-80" />
          </div>
          <h3 className="text-base font-bold text-white">No deals found in this view</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? 'No contracts match your current search criteria. Try modifying your search or reset filters.'
              : `There are currently no deals categorized under ${activeTab.toLowerCase()} deals.`}
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
