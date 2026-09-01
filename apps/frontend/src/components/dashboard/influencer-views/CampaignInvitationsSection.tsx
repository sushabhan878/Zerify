'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MailCheck, Search, Sparkles, AlertCircle, Compass, RefreshCw } from 'lucide-react';
import InvitationKpiBar from './subcomponents/InvitationKpiBar';
import OfferReceivedCard from './applications/OfferReceivedCard';
import OfferDetailModal from './applications/OfferDetailModal';
import OfferConfirmationModal from './applications/OfferConfirmationModal';
import { OfferService, CampaignOfferItem } from '@/services/offer.service';
import LottieLoader from '@/components/ui/LottieLoader';

interface CampaignInvitationsSectionProps {
  onNavigate?: (routeId: string) => void;
}

export default function CampaignInvitationsSection({ onNavigate }: CampaignInvitationsSectionProps) {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'ALL' | 'ACCEPTED' | 'DECLINED'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [offers, setOffers] = useState<CampaignOfferItem[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<CampaignOfferItem | null>(null);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'ACCEPT' | 'DECLINE' | null;
    offer: CampaignOfferItem | null;
  }>({
    isOpen: false,
    type: null,
    offer: null,
  });
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const loadData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const myOffers = await OfferService.getMyOffers().catch(() => []);
      if (myOffers && Array.isArray(myOffers)) {
        setOffers(myOffers);
      } else {
        setOffers([]);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('zerify_offers_updated'));
      }
    } catch (err) {
      console.error('Failed to load campaign invitations & offers:', err);
      setOffers([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const requestAcceptOffer = (offerId: string) => {
    const target = offers.find((o) => o.id === offerId) || selectedOffer;
    if (target) {
      setConfirmModal({
        isOpen: true,
        type: 'ACCEPT',
        offer: target,
      });
    }
  };

  const requestDeclineOffer = (offerId: string) => {
    const target = offers.find((o) => o.id === offerId) || selectedOffer;
    if (target) {
      setConfirmModal({
        isOpen: true,
        type: 'DECLINE',
        offer: target,
      });
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmModal.offer || !confirmModal.type) return;
    setIsProcessingAction(true);
    try {
      if (confirmModal.type === 'ACCEPT') {
        await OfferService.acceptOffer(confirmModal.offer.id);
      } else {
        await OfferService.declineOffer(confirmModal.offer.id);
      }
      await loadData(true);
      setSelectedOffer(null);
      setConfirmModal({ isOpen: false, type: null, offer: null });
    } catch (err) {
      console.error(`Failed to ${confirmModal.type.toLowerCase()} offer:`, err);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleCancelConfirmation = () => {
    if (!isProcessingAction) {
      setConfirmModal({ isOpen: false, type: null, offer: null });
    }
  };

  const pendingOffers = offers.filter((o) => o.status === 'PENDING');
  const pendingCount = pendingOffers.length;

  const totalPotentialCash = offers
    .filter((o) => o.status === 'PENDING' || o.status === 'ACCEPTED')
    .reduce((acc, o) => acc + (Number(o.compensationAmount) || 0), 0);
  const totalPotentialPayoutStr = `$${totalPotentialCash.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const filteredOffers = offers.filter((offer) => {
    const matchesTab = activeTab === 'ALL' || offer.status === activeTab;
    const q = searchQuery.toLowerCase().trim();
    const app = offer.application || {};
    const campaign = app.campaign || {};
    const brand = campaign.brandProfile || {};
    const title = campaign.title || '';
    const brandName = brand.companyName || '';

    const matchesSearch =
      !q || title.toLowerCase().includes(q) || brandName.toLowerCase().includes(q);

    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* 1. KPI Stats Summary Bar */}
      <InvitationKpiBar
        pendingCount={pendingCount}
        totalPotentialPayout={totalPotentialPayoutStr}
      />

      {/* 2. Controls Bar: Search & Status Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search offers by brand, campaign title, or brief..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Filter Tabs & Refresh */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-white/10 overflow-x-auto no-scrollbar">
            {[
              { id: 'PENDING', label: 'Pending Offers' },
              { id: 'ALL', label: 'All Received' },
              { id: 'ACCEPTED', label: 'Accepted' },
              { id: 'DECLINED', label: 'Declined' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={isLoading || isRefreshing}
            className="p-2 rounded-xl bg-slate-900/80 border border-white/10 text-slate-300 hover:text-white hover:border-purple-500/40 transition-colors shadow-sm shrink-0"
            title="Refresh collaboration offers"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-purple-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* 3. Offers List */}
      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center min-h-[320px]">
          <LottieLoader size={180} message="Loading your direct collaboration offers..." />
        </div>
      ) : offers.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-950/60 border border-purple-500/20 text-center space-y-4 flex flex-col items-center justify-center min-h-[320px] backdrop-blur-2xl shadow-xl shadow-purple-950/20">
          <div className="w-14 h-14 rounded-2xl bg-purple-600/15 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-inner">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h3 className="text-base font-bold text-white">No Collaboration Offers Yet</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When brands review your profile or accept your application pitches, their direct contract offers with escrow payments will appear here.
            </p>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('campaign-discovery')}
              type="button"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-950/40 flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Campaigns to Pitch</span>
            </button>
          )}
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Offers Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No collaboration offers match your selected filter criteria.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveTab('ALL');
            }}
            type="button"
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-purple-500/20 text-xs font-bold text-slate-300 hover:text-white transition-all"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOffers.map((offer) => (
            <OfferReceivedCard
              key={offer.id}
              offer={offer}
              onAccept={requestAcceptOffer}
              onDecline={requestDeclineOffer}
              onViewDetails={(off) => setSelectedOffer(off)}
              isAccepting={isProcessingAction && confirmModal.offer?.id === offer.id}
            />
          ))}
        </div>
      )}

      {/* Offer Detail Modal */}
      {selectedOffer && (
        <OfferDetailModal
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
          onAccept={requestAcceptOffer}
          onDecline={requestDeclineOffer}
        />
      )}

      {/* Confirmation Modal for Accept/Decline */}
      <OfferConfirmationModal
        isOpen={confirmModal.isOpen}
        type={confirmModal.type}
        offer={confirmModal.offer}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelConfirmation}
        isProcessing={isProcessingAction}
      />
    </div>
  );
}
