'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Layers,
  Sparkles,
} from 'lucide-react';
import DeliverableReviewCard from './DeliverableReviewCard';
import ManageDeliverableOverviewCard from './ManageDeliverableOverviewCard';
import StartCampaignConfirmationModal from './StartCampaignConfirmationModal';
import BrandDepositFundsModal from '@/components/dashboard/payment-views/BrandDepositFundsModal';
import { useCurrency } from '@/context/CurrencyContext';
import { isComplete } from '@/services/deliverable-workflow';
import { DeliverableService } from '@/services/deliverable.service';
import { CampaignService } from '@/services/campaign.service';

interface ParticipantDeliverablesPageProps {
  participant: any;
  campaign?: any;
  onBack: () => void;
  onRefresh: () => void;
  onViewProfile?: (creator: any) => void;
}

export default function ParticipantDeliverablesPage({
  participant,
  campaign,
  onBack,
  onRefresh,
  onViewProfile,
}: ParticipantDeliverablesPageProps) {
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [liveCampaign, setLiveCampaign] = useState<any>(null);

  const campaignId = campaign?.id || participant?.campaignId;

  // Fetch real-time campaign details and slot metrics directly from DB
  React.useEffect(() => {
    if (!campaignId) return;
    CampaignService.getCampaignDetails(campaignId)
      .then((data) => {
        if (data) setLiveCampaign(data);
      })
      .catch((err) => console.error('Failed to fetch live campaign slot data:', err));
  }, [campaignId]);

  const profile = participant.influencerProfile || {};
  const rawHandle = profile.handle || profile.user?.name || 'Creator';
  const cleanHandle = rawHandle.replace(/^@+/, '');
  const displayName = profile.user?.name || cleanHandle;
  const avatarUrl = profile.avatarUrl || profile.user?.avatarUrl;

  const deliverables = participant.deliverables || [];
  const completedCount = deliverables.filter(isComplete).length;
  const isAllDone = deliverables.length > 0 && deliverables.every(isComplete);
  const isCompleted = participant.status === 'PARTICIPANT_COMPLETED';

  // Live slot calculations directly reflecting database state
  const currentCampaign = liveCampaign || campaign || participant?.campaign;
  const targetSlots =
    currentCampaign?.targetParticipants ||
    currentCampaign?.maxParticipants ||
    10;

  const filledSlots =
    Array.isArray(currentCampaign?.participants) && currentCampaign.participants.length > 0
      ? currentCampaign.participants.length
      : typeof currentCampaign?._count?.participants === 'number'
      ? currentCampaign._count.participants
      : 1;

  const remainingSlots = Math.max(0, targetSlots - filledSlots);
  const isCampaignStarted =
    currentCampaign?.status === 'ACTIVE' || participant?.status === 'PARTICIPANT_ACTIVE';

  const { convert } = useCurrency();

  // Combined value of all active/confirmed collabs for this campaign
  const combinedEscrowAmount = React.useMemo(() => {
    const rawParts: any[] =
      Array.isArray(currentCampaign?.participants) && currentCampaign.participants.length > 0
        ? currentCampaign.participants
        : participant
        ? [participant]
        : [];

    const activeList = rawParts.filter(
      (p) => p.status !== 'PARTICIPANT_CANCELLED' && p.status !== 'CANCELLED'
    );

    if (activeList.length === 0) {
      return currentCampaign?.budgetTotalAmount || currentCampaign?.budgetMinPerInfluencer || 5000;
    }

    return activeList.reduce((sum: number, p: any) => {
      const amt = Number(p.agreedAmount || 0);
      const fromCurr = p.agreedCurrency || currentCampaign?.budgetCurrency || 'INR';
      const converted = convert ? convert(amt, fromCurr) : amt;
      return sum + converted;
    }, 0);
  }, [currentCampaign, participant, convert]);

  const activeCandidateCount = React.useMemo(() => {
    const rawParts: any[] =
      Array.isArray(currentCampaign?.participants) && currentCampaign.participants.length > 0
        ? currentCampaign.participants
        : participant
        ? [participant]
        : [];
    const active = rawParts.filter(
      (p) => p.status !== 'PARTICIPANT_CANCELLED' && p.status !== 'CANCELLED'
    );
    return Math.max(1, active.length);
  }, [currentCampaign, participant]);

  const handleOpenProfile = () => {
    if (!onViewProfile) return;
    onViewProfile({
      id: profile.id || participant.influencerProfileId,
      userId: profile.userId,
      name: displayName,
      handle: cleanHandle,
      avatarUrl: avatarUrl || '',
      category: profile.niches?.[0] || 'Content Creator',
      categories: profile.niches || ['Content Creator'],
      reach: profile.totalFollowers || '10K+',
      engRate: `${profile.averageEngagementRate || 4.5}%`,
      location: profile.location || 'Global',
      platforms: ['Instagram'],
      tier: 'Micro',
      verified: true,
    });
  };

  const handleFinalize = async () => {
    try {
      setIsFinalizing(true);
      await DeliverableService.completeParticipant(participant.id);
      onRefresh();
    } catch (err: any) {
      alert(err?.message || 'Could not complete collaboration');
    } finally {
      setIsFinalizing(false);
    }
  };

  const handlePaymentSuccess = async () => {
    setIsPaymentModalOpen(false);
    try {
      const activeId = currentCampaign?.id || campaignId;
      if (activeId) {
        const updated = await CampaignService.startCampaign(activeId);
        if (updated) setLiveCampaign(updated);
      }
      onRefresh();
    } catch (err: any) {
      console.error('Error starting campaign:', err);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Breadcrumbs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <button
          onClick={onBack}
          type="button"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 text-purple-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Collaborations</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="truncate max-w-[200px] text-purple-300 font-semibold">
            {currentCampaign?.title || 'Campaign'}
          </span>
          <span>/</span>
          <span className="text-white font-bold">{displayName}</span>
        </div>
      </div>

      {/* Collaboration Overview Banner */}
      <ManageDeliverableOverviewCard
        participant={participant}
        campaign={currentCampaign}
        displayName={displayName}
        avatarUrl={avatarUrl}
        isCompleted={isCompleted}
        isAllDone={isAllDone}
        completedCount={completedCount}
        deliverables={deliverables}
        isFinalizing={isFinalizing}
        onOpenProfile={handleOpenProfile}
        onFinalize={handleFinalize}
      />

      {/* Deliverables Pipeline Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Deliverables Pipeline
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 text-xs sm:text-sm font-black border border-purple-500/25">
              {deliverables.length}
            </span>
          </div>
          <span className="text-xs sm:text-sm text-slate-400">
            Review drafts, request revisions, and verify live publications
          </span>
        </div>

        {/* If campaign has not started (e.g. slots not filled or waiting for escrow launch) */}
        {!isCampaignStarted ? (
          <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-slate-950/60 border border-purple-500/20 hover:border-purple-500/40 backdrop-blur-2xl shadow-xl shadow-purple-950/20 transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-6 group">
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
              <div className="absolute -top-16 -left-16 w-56 h-56 bg-purple-600/10 rounded-full blur-2xl group-hover:bg-purple-600/20 transition-all duration-500" />
              <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-indigo-600/10 rounded-full blur-2xl group-hover:bg-indigo-600/15 transition-all duration-500" />
            </div>

            <div className="space-y-2 text-center sm:text-left relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
                <span>Campaign Pre-Activation Phase</span>
              </div>
              <h4 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {filledSlots} out of {targetSlots} slots filled
                {remainingSlots > 0 ? (
                  <span className="text-purple-300 font-semibold">
                    {' '}· {remainingSlots} remaining to start campaign
                  </span>
                ) : (
                  <span className="text-emerald-400 font-semibold"> · All slots filled!</span>
                )}
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Deliverable draft submissions and review controls will activate once the campaign is officially started with smart escrow reservation. You can start the campaign now with currently confirmed creators or wait for remaining slots.
              </p>
            </div>

            <div className="relative z-10 shrink-0">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(true)}
                className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:via-indigo-500 hover:to-purple-500 shadow-xl shadow-purple-950/60 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center gap-2.5 cursor-pointer ring-2 ring-purple-400/40"
              >
                <Sparkles className="w-4 h-4 text-purple-200" />
                <span>Start Campaign</span>
              </button>
            </div>
          </div>
        ) : deliverables.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-950/50 border border-dashed border-white/10 text-center space-y-2">
            <Layers className="w-8 h-8 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-300">No deliverables assigned yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Deliverables configured in the campaign brief will appear here once instantiated.
            </p>
          </div>
        ) : (
          <div className="space-y-8 sm:space-y-10 pt-3">
            {deliverables.map((del: any) => (
              <DeliverableReviewCard key={del.id} deliverable={del} onRefresh={onRefresh} />
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal before starting campaign */}
      <StartCampaignConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        campaign={currentCampaign}
        participant={participant}
        filledSlots={filledSlots}
        totalSlots={targetSlots}
        onProceedToEscrow={() => {
          setIsConfirmModalOpen(false);
          setIsPaymentModalOpen(true);
        }}
      />

      {/* Custom Payment / Escrow Deposit Modal */}
      <BrandDepositFundsModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        campaignId={currentCampaign?.id || campaignId}
        campaignTitle={currentCampaign?.title}
        initialAmount={Math.round(combinedEscrowAmount)}
        creatorCount={activeCandidateCount}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}


