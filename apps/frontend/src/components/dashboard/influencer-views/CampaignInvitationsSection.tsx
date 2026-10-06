'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MailCheck, Search, Sparkles, AlertCircle, Compass } from 'lucide-react';
import InvitationKpiBar from './subcomponents/InvitationKpiBar';
import OfferReceivedCard from './applications/OfferReceivedCard';
import OfferDetailModal from './applications/OfferDetailModal';
import OfferConfirmationModal from './applications/OfferConfirmationModal';
import { OfferService, CampaignOfferItem } from '@/services/offer.service';
import { useMessaging } from '@/context/MessagingContext';
import { MessagingService } from '@/services/messaging.service';
import { useToast } from '@/components/ui/Toast';
import { useCurrency } from '@/context/CurrencyContext';
import LottieLoader from '@/components/ui/LottieLoader';

interface CampaignInvitationsSectionProps {
  onNavigate?: (routeId: string) => void;
}

export default function CampaignInvitationsSection({ onNavigate }: CampaignInvitationsSectionProps) {
  const { setActiveConversationId, refreshConversations } = useMessaging();
  const { toastSuccess, toastError } = useToast();
  const { format: formatCurrency } = useCurrency();

  const [activeTab, setActiveTab] = useState<'PENDING' | 'ACCEPTED' | 'CANCELLED' | 'ALL'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
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

  const loadData = useCallback(async () => {
    setIsLoading(true);
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

  const handleMessageBrand = async (offer: CampaignOfferItem) => {
    try {
      const brandUserId = offer.application?.campaign?.brandProfile?.userId;
      if (!brandUserId) {
        onNavigate?.('messages');
        return;
      }
      const res = await MessagingService.createConversation({
        participantId: brandUserId,
        campaignId: offer.campaignId,
      });
      if (res?.conversationId) {
        setActiveConversationId(res?.conversationId);
      }
      await refreshConversations();
      onNavigate?.('messages');
    } catch (err) {
      console.error('Failed to open message conversation with brand:', err);
      onNavigate?.('messages');
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmModal.offer || !confirmModal.type) return;
    setIsProcessingAction(true);
    try {
      if (confirmModal.type === 'ACCEPT') {
        const acceptRes: any = await OfferService.acceptOffer(confirmModal.offer.id);
        toastSuccess('Offer accepted! Starting your project workspace and opening messages...');
        await loadData();
        setSelectedOffer(null);
        setConfirmModal({ isOpen: false, type: null, offer: null });

        const convId = acceptRes?.conversationId;
        if (convId) {
          setActiveConversationId(convId);
        }
        await refreshConversations();
        onNavigate?.('messages');
        return;
      } else {
        await OfferService.declineOffer(confirmModal.offer.id);
        toastSuccess('Offer declined.');
      }
      await loadData();
      setSelectedOffer(null);
      setConfirmModal({ isOpen: false, type: null, offer: null });
    } catch (err: any) {
      console.error(`Failed to ${confirmModal.type.toLowerCase()} offer:`, err);
      toastError(err?.message || `Failed to ${confirmModal.type.toLowerCase()} offer`);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleCancelConfirmation = () => {
    if (!isProcessingAction) {
      setConfirmModal({ isOpen: false, type: null, offer: null });
    }
  };

  const pendingOffers = useMemo(() => offers.filter((o) => o.status === 'PENDING'), [offers]);
  const acceptedOffers = useMemo(() => offers.filter((o) => o.status === 'ACCEPTED'), [offers]);
  const cancelledOffers = useMemo(
    () =>
      offers.filter(
        (o) => o.status === 'CANCELLED' || o.status === 'DECLINED' || o.status === 'OFFER_EXPIRED'
      ),
    [offers]
  );

  const kpis = useMemo(() => {
    if (activeTab === 'PENDING') {
      const totalRev = pendingOffers.reduce(
        (acc, o) => acc + (Number(o.compensationAmount) || 0),
        0
      );
      const avgRev = pendingOffers.length > 0 ? totalRev / pendingOffers.length : 0;
      const maxRev =
        pendingOffers.length > 0
          ? Math.max(...pendingOffers.map((o) => Number(o.compensationAmount) || 0))
          : 0;

      return [
        {
          label: 'Pending Offers',
          val: `${pendingOffers.length} Offers`,
          change: pendingOffers.length > 0 ? 'Action Required' : 'All caught up',
        },
        {
          label: 'Potential Revenue',
          val: formatCurrency(totalRev),
          change: 'Across pending deals',
        },
        {
          label: 'Avg. Offer Value',
          val: formatCurrency(avgRev),
          change: 'Per pending contract',
        },
        {
          label: 'Highest Offer',
          val: formatCurrency(maxRev),
          change: pendingOffers.length > 0 ? 'Top single opportunity' : 'No pending offers',
        },
      ];
    }

    if (activeTab === 'ACCEPTED') {
      const totalRev = acceptedOffers.reduce(
        (acc, o) => acc + (Number(o.compensationAmount) || 0),
        0
      );
      const avgRev = acceptedOffers.length > 0 ? totalRev / acceptedOffers.length : 0;
      const maxRev =
        acceptedOffers.length > 0
          ? Math.max(...acceptedOffers.map((o) => Number(o.compensationAmount) || 0))
          : 0;

      return [
        {
          label: 'Accepted Deals',
          val: `${acceptedOffers.length} Deals`,
          change: 'Active collaborations',
        },
        {
          label: 'Secured Revenue',
          val: formatCurrency(totalRev),
          change: 'Confirmed earnings',
        },
        {
          label: 'Avg. Deal Value',
          val: formatCurrency(avgRev),
          change: 'Average accepted rate',
        },
        {
          label: 'Top Deal Value',
          val: formatCurrency(maxRev),
          change: acceptedOffers.length > 0 ? 'Largest active contract' : 'No accepted deals',
        },
      ];
    }

    if (activeTab === 'CANCELLED') {
      const totalRev = cancelledOffers.reduce(
        (acc, o) => acc + (Number(o.compensationAmount) || 0),
        0
      );
      const avgRev = cancelledOffers.length > 0 ? totalRev / cancelledOffers.length : 0;
      const maxRev =
        cancelledOffers.length > 0
          ? Math.max(...cancelledOffers.map((o) => Number(o.compensationAmount) || 0))
          : 0;

      return [
        {
          label: 'Cancelled Offers',
          val: `${cancelledOffers.length} Offers`,
          change: 'Declined or expired',
        },
        {
          label: 'Declined Volume',
          val: formatCurrency(totalRev),
          change: 'Total passed revenue',
        },
        {
          label: 'Avg. Offer Size',
          val: formatCurrency(avgRev),
          change: 'Average passed value',
        },
        {
          label: 'Highest Declined',
          val: formatCurrency(maxRev),
          change: cancelledOffers.length > 0 ? 'Largest passed deal' : 'No cancelled offers',
        },
      ];
    }

    // Combined data for ALL Received
    const totalRev = offers.reduce((acc, o) => acc + (Number(o.compensationAmount) || 0), 0);
    const avgRev = offers.length > 0 ? totalRev / offers.length : 0;
    const acceptanceRate =
      offers.length > 0 ? Math.round((acceptedOffers.length / offers.length) * 100) : 0;

    return [
      {
        label: 'Total Invitations',
        val: `${offers.length} Offers`,
        change: 'All-time pipeline',
      },
      {
        label: 'Combined Deal Value',
        val: formatCurrency(totalRev),
        change: 'All states combined',
      },
      {
        label: 'Avg. Invitation Value',
        val: formatCurrency(avgRev),
        change: 'Overall deal average',
      },
      {
        label: 'Acceptance Rate',
        val: `${acceptanceRate}%`,
        change: `${acceptedOffers.length} of ${offers.length} converted`,
      },
    ];
  }, [activeTab, offers, pendingOffers, acceptedOffers, cancelledOffers, formatCurrency]);

  const filteredOffers = offers.filter((offer) => {
    const matchesTab =
      activeTab === 'ALL'
        ? true
        : activeTab === 'CANCELLED'
        ? offer.status === 'CANCELLED' || offer.status === 'DECLINED' || offer.status === 'OFFER_EXPIRED'
        : offer.status === activeTab;
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
      {/* 1. Dynamic KPI Stats Summary Bar */}
      <InvitationKpiBar kpis={kpis} />

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

        {/* Filter Tabs in Order: Pending -> Accepted -> Cancelled -> All Received */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-white/10 overflow-x-auto no-scrollbar">
          {[
            { id: 'PENDING', label: 'Pending Offers' },
            { id: 'ACCEPTED', label: 'Accepted' },
            { id: 'CANCELLED', label: 'Cancelled' },
            { id: 'ALL', label: 'All Received' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
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
        <div className="space-y-8 sm:space-y-10 pt-5">
          {filteredOffers.map((offer) => (
            <OfferReceivedCard
              key={offer.id}
              offer={offer}
              onAccept={requestAcceptOffer}
              onDecline={requestDeclineOffer}
              onViewDetails={(off) => setSelectedOffer(off)}
              onMessageBrand={handleMessageBrand}
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
