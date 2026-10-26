'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  Send,
  Video,
  DollarSign,
  Sparkles,
  Calendar,
  Layers,
  CheckCircle,
  Play,
  Pause,
  AlertCircle,
  Star,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { CampaignItem, CampaignService } from '@/services/campaign.service';
import { ApplicationService, CampaignApplicationItem } from '@/services/application.service';
import { OfferService, CampaignOfferItem } from '@/services/offer.service';
import { DeliverableService } from '@/services/deliverable.service';
import { ReviewService, ReviewStatusResponse } from '@/services/review.service';
import ApplicationListView from './ApplicationListView';
import ApplicantDetailModal from './ApplicantDetailModal';
import SendOfferModal from './SendOfferModal';
import CounterOfferModal from './CounterOfferModal';
import ApplicantComparisonView from './ApplicantComparisonView';
import ParticipantManagementView from './ParticipantManagementView';
import ParticipantDeliverablesPage from './ParticipantDeliverablesPage';
import OfferManagementView from './OfferManagementView';
import CreatorProfileFullView from '../find-influencers/CreatorProfileFullView';
import { CreatorItem, PlatformBadge } from '../find-influencers/CreatorCard';
import LottieLoader from '@/components/ui/LottieLoader';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency, normalizeCurrency } from '@/utils/currency';
import Money from '@/components/currency/Money';
import CampaignReviewModal from '../../subcomponents/CampaignReviewModal';
import CampaignActions from './CampaignActions';

interface CampaignOverviewDashboardProps {
  campaignId: string;
  onBack: () => void;
  initialTab?: 'applicants' | 'participants' | 'offers' | 'brief';
  initialCollabId?: string;
}

export default function CampaignOverviewDashboard({
  campaignId,
  onBack,
  initialTab,
  initialCollabId,
}: CampaignOverviewDashboardProps) {
  const { currency, formatBudget, convert } = useCurrency();
  const [campaign, setCampaign] = useState<CampaignItem | null>(null);
  const [applications, setApplications] = useState<CampaignApplicationItem[]>([]);
  const [offers, setOffers] = useState<CampaignOfferItem[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'applicants' | 'participants' | 'offers' | 'brief'>(
    initialTab || 'applicants'
  );

  // Modals & In-Platform Profile state
  const [selectedCreatorForProfile, setSelectedCreatorForProfile] = useState<CreatorItem | null>(null);
  const [managingParticipant, setManagingParticipant] = useState<any | null>(null);
  const [selectedAppForDetail, setSelectedAppForDetail] = useState<CampaignApplicationItem | null>(null);
  const [selectedAppForOffer, setSelectedAppForOffer] = useState<CampaignApplicationItem | null>(null);
  const [selectedAppForCounterOffer, setSelectedAppForCounterOffer] = useState<CampaignApplicationItem | null>(null);
  const [comparingApplicants, setComparingApplicants] = useState<CampaignApplicationItem[] | null>(null);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatusResponse | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTargetInfluencer, setReviewTargetInfluencer] = useState<{ id: string; name: string } | null>(null);

  const isDirectBrandInvite = (app: CampaignApplicationItem) =>
    app.reviewNotes === 'DIRECT_INVITE' ||
    app.applicationMessage === 'Official brand collaboration invite' ||
    app.applicationMessage === 'Direct brand invitation' ||
    Boolean(app.offers && app.offers.length > 0 && app.status === 'OFFER_SENT' && !app.submittedAt);

  const inboundApplications = useMemo(
    () => applications.filter((app) => !isDirectBrandInvite(app)),
    [applications],
  );

  const loadData = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const [campRes, appRes, offerRes, partRes] = await Promise.allSettled([
        CampaignService.getCampaignDetails(campaignId),
        ApplicationService.getCampaignApplications(campaignId),
        OfferService.getCampaignOffers(campaignId),
        DeliverableService.getCampaignParticipants(campaignId),
      ]);

      if (campRes.status === 'fulfilled' && campRes.value) {
        setCampaign(campRes.value);
        if (campRes.value.status === 'COMPLETED' || campRes.value.status === 'CANCELLED') {
          ReviewService.getReviewStatus(campaignId).then(setReviewStatus).catch(() => {});
        }
      }
      if (appRes.status === 'fulfilled' && Array.isArray(appRes.value)) {
        setApplications(appRes.value);
      }
      if (offerRes.status === 'fulfilled' && Array.isArray(offerRes.value)) {
        setOffers(offerRes.value);
      }
      if (partRes.status === 'fulfilled' && Array.isArray(partRes.value)) {
        setParticipants(partRes.value);
        if (initialCollabId) {
          const matched = partRes.value.find((p: any) => p.id === initialCollabId);
          if (matched) {
            setManagingParticipant(matched);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load campaign data', err);
    } finally {
      setIsLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  };

  const handleReviewSuccess = () => {
    setShowReviewModal(false);
    setReviewTargetInfluencer(null);
    if (campaign?.status === 'COMPLETED' || campaign?.status === 'CANCELLED') {
      ReviewService.getReviewStatus(campaignId).then(setReviewStatus).catch(() => {});
    }
  };

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('zerify_offers_updated', handleUpdate);
      window.addEventListener('focus', handleUpdate);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('zerify_offers_updated', handleUpdate);
        window.removeEventListener('focus', handleUpdate);
      }
    };
  }, [campaignId]);

  const handleShortlist = async (appId: string) => {
    try {
      await ApplicationService.shortlistApplication(appId);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (appId: string) => {
    try {
      const matchingOffer = offers.find(
        (o) => o.applicationId === appId && o.status === 'PENDING',
      );
      const terms = (matchingOffer?.termsSnapshot as Record<string, any>) || {};
      const isCreatorCounter = Boolean(terms.isCounterOffer) && terms.counterBy === 'INFLUENCER';

      if (matchingOffer && isCreatorCounter) {
        await OfferService.declineOffer(matchingOffer.id);
      } else {
        await ApplicationService.rejectApplication(appId);
      }
      loadData();
    } catch (err) {
      console.error('Failed to reject application/counter offer:', err);
    }
  };

  const handleAccept = async (app: CampaignApplicationItem) => {
    try {
      const matchingOffer = offers.find(
        (o) => o.applicationId === app.id && o.status === 'PENDING',
      );
      const terms = (matchingOffer?.termsSnapshot as Record<string, any>) || {};
      const isCreatorCounter = Boolean(terms.isCounterOffer) && terms.counterBy === 'INFLUENCER';

      if (matchingOffer && isCreatorCounter) {
        // Brand accepts creator's counter offer directly -> immediately counts as an active collaboration!
        await OfferService.acceptOffer(matchingOffer.id);
      } else {
        const sourceCurr =
          app.proposedCurrency ||
          (app as any).influencerProfile?.currency ||
          campaign?.budgetCurrency ||
          'USD';
        const isDiff = normalizeCurrency(sourceCurr) !== normalizeCurrency(currency);
        const finalAmt =
          isDiff && app.proposedAmount
            ? convert(app.proposedAmount, sourceCurr)
            : app.proposedAmount || 0;

        await OfferService.sendOffer(app.id, {
          compensationAmount: finalAmt,
          compensationCurrency: currency || 'INR',
          customNotes: 'Pitch accepted at proposed quote.',
        });
      }
      loadData();
    } catch (err) {
      console.error('Failed to accept offer/counter offer:', err);
    }
  };

  const handlePublish = async () => {
    try {
      await CampaignService.publishCampaign(campaignId);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePause = async () => {
    try {
      await CampaignService.pauseCampaign(campaignId);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading || !campaign) {
    return (
      <div className="min-h-[450px] flex items-center justify-center p-12">
        <LottieLoader size={200} message="Loading campaign details..." />
      </div>
    );
  }

  // Dedicated Participant Deliverables Management View
  if (managingParticipant) {
    const currentParticipant =
      participants.find((p) => p.id === managingParticipant.id) || managingParticipant;
    return (
      <ParticipantDeliverablesPage
        participant={currentParticipant}
        campaign={campaign}
        onBack={() => setManagingParticipant(null)}
        onRefresh={loadData}
        onViewProfile={(creator) => {
          setManagingParticipant(null);
          setSelectedCreatorForProfile(creator);
        }}
      />
    );
  }

  // In-Platform Dedicated Creator Profile View
  if (selectedCreatorForProfile) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <CreatorProfileFullView
          creator={selectedCreatorForProfile}
          onBack={() => setSelectedCreatorForProfile(null)}
          onInvite={() => {
            const app = applications.find(
              (a) =>
                a.influencerProfileId === selectedCreatorForProfile.id ||
                a.id === selectedCreatorForProfile.id,
            );
            if (app) {
              setSelectedCreatorForProfile(null);
              setSelectedAppForOffer(app);
            }
          }}
          onToggleBookmark={() => {}}
        />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELETED':
        return { label: 'Deleted', gradient: 'bg-gradient-to-r from-rose-700 to-rose-600', border: 'border-rose-400/60', shadow: 'shadow-lg shadow-rose-950/30', dot: 'bg-rose-200' };
      case 'OPEN':
      case 'ACTIVE':
        return {
          label: 'Active & Open',
          gradient: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500',
          border: 'border-emerald-400/60',
          shadow: 'shadow-lg shadow-emerald-600/30',
          dot: 'bg-emerald-200 animate-pulse shadow-sm',
        };
      case 'FILLING':
        return {
          label: 'Filling Roster',
          gradient: 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600',
          border: 'border-purple-400/60',
          shadow: 'shadow-lg shadow-purple-600/30',
          dot: 'bg-purple-200 animate-pulse shadow-sm',
        };
      case 'PAUSED':
        return {
          label: 'Paused',
          gradient: 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600',
          border: 'border-amber-400/60',
          shadow: 'shadow-lg shadow-amber-600/30',
          dot: 'bg-amber-200 shadow-sm',
        };
      case 'COMPLETED':
        return {
          label: 'Completed',
          gradient: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600',
          border: 'border-blue-400/60',
          shadow: 'shadow-lg shadow-blue-600/30',
          dot: 'bg-blue-200 shadow-sm',
        };
      case 'DRAFT':
      default:
        return {
          label: 'Draft',
          gradient: 'bg-gradient-to-r from-slate-700 via-slate-800 to-slate-700',
          border: 'border-slate-500/60',
          shadow: 'shadow-lg shadow-slate-900/40',
          dot: 'bg-slate-400',
        };
    }
  };

  const formatPaymentModel = (model?: string) => {
    switch (model) {
      case 'FIXED':
        return 'Fixed Payout';
      case 'NEGOTIABLE':
        return 'Pitch / Negotiable';
      case 'RANGE':
        return 'Budget Range';
      case 'PERFORMANCE_BASED':
        return 'Performance';
      case 'BARTER':
        return 'Product Barter';
      case 'HYBRID':
        return 'Hybrid';
      default:
        return model || 'Standard';
    }
  };

  const statusConfig = getStatusBadge(campaign.status);
  const hired = participants.length;
  const targetParticipants = campaign.targetParticipants || 1;
  const progressPercent = Math.min(100, Math.round((hired / targetParticipants) * 100));
  const applicantsCount = inboundApplications.length;

  const objectivesList: string[] = Array.isArray(campaign.objective)
    ? campaign.objective
    : typeof campaign.objective === 'string' && campaign.objective
    ? [campaign.objective]
    : Array.isArray(campaign.categories)
    ? campaign.categories
    : [];

  const maxVisibleObjectives = objectivesList.length <= 3 ? 3 : 2;
  const visibleObjectives = objectivesList.slice(0, maxVisibleObjectives);
  const hiddenObjectives = objectivesList.slice(maxVisibleObjectives);

  const formattedCreated = campaign.createdAt
    ? new Date(campaign.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  const formattedDeadline = campaign.applicationDeadline
    ? new Date(campaign.applicationDeadline).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <button
          onClick={onBack}
          type="button"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 text-purple-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Campaigns</span>
        </button>
      </div>
      {campaign.status === 'DELETED' && <div role="status" className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-sm">This campaign has been deleted. Historical applications and collaboration records are retained.</div>}

      {/* Main Campaign Hero Card with All Card Details */}
      <div className="relative px-6 pb-6 pt-3.5 sm:px-8 sm:pb-8 sm:pt-4 rounded-3xl bg-slate-950/45 border border-purple-500/20 backdrop-blur-2xl shadow-2xl shadow-purple-950/20 space-y-5">
        {/* Ambient Glow Aura */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Floating Status Badge Overlapping Top-Right Corner - Shifted a bit more top */}
        <div className="absolute -top-8 sm:-top-9 right-6 sm:right-8 z-30 pointer-events-none">
          <span
            className={`px-4 py-1.5 rounded-full ${statusConfig.gradient} border ${statusConfig.border} text-xs sm:text-sm font-black text-white flex items-center gap-1.5 shadow-xl ${statusConfig.shadow} ring-4 ring-[#090C15] group-hover:scale-105 transition-all duration-300`}
          >
            <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
            <span>{statusConfig.label}</span>
          </span>
        </div>

        {/* Row 1: Tags on Top & Prominent Large Pricing */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10 min-w-0">
          {/* Tags Cloud (shifted upper side, strictly single line) */}
          <div className="flex items-center gap-2 flex-nowrap overflow-hidden min-w-0 max-w-full -mt-1 sm:-mt-1.5">

            {/* Industry Tag */}
            {campaign.industry && (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-950/40 border border-purple-500/25 text-purple-200 flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                <Layers className="w-3 h-3 text-purple-400 shrink-0" />
                <span>{campaign.industry}</span>
              </span>
            )}

            {/* Objective / Goal Tags */}
            {visibleObjectives.map((obj) => (
              <span
                key={obj}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-600/15 border border-purple-500/25 text-purple-200 shrink-0 whitespace-nowrap"
              >
                {obj}
              </span>
            ))}

            {/* Truncated ... indicator if more objectives */}
            {hiddenObjectives.length > 0 && (
              <span
                className="px-3 py-1.5 rounded-full text-xs font-black bg-purple-950/60 border border-purple-500/30 text-purple-300 shrink-0 whitespace-nowrap cursor-help hover:bg-purple-900/60 hover:text-white transition-colors tracking-widest"
                title={`More tags: ${hiddenObjectives.join(', ')}`}
              >
                ...
              </span>
            )}

            {/* Payment Model Tag */}
            {campaign.budgetPaymentModel && (
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-950/40 border border-indigo-400/25 text-indigo-200 shrink-0 whitespace-nowrap">
                {formatPaymentModel(campaign.budgetPaymentModel)}
              </span>
            )}
          </div>

          {/* Large Pricing Display */}
          <div className="sm:text-right flex sm:flex-col items-baseline sm:items-end justify-between gap-0.5 flex-shrink-0">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Total Budget
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight leading-none flex items-baseline gap-1">
              <span>
                {campaign.budgetPaymentModel === 'BARTER'
                  ? 'Product Barter'
                  : formatCurrency(campaign.budgetTotalAmount, campaign.budgetCurrency || currency)}
              </span>
              {campaign.budgetPaymentModel !== 'BARTER' && (
                <span className="text-xs font-bold text-emerald-300/70 uppercase">
                  {campaign.budgetCurrency || currency || 'USD'}
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Row 2: Campaign Title, Description & Platforms */}
        <div className="space-y-3 sm:space-y-3.5 relative z-10 -mt-2.5 sm:-mt-3">
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>{campaign.title}</span>
          </h1>

          {campaign.description && (
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal w-full max-w-full">
              {campaign.description}
            </p>
          )}

          {/* Overlapping Social Platforms */}
          {Array.isArray(campaign.platforms) && campaign.platforms.length > 0 && (
            <div className="flex items-center -space-x-2 isolate pt-1 sm:pt-1.5">
              {campaign.platforms.slice(0, 6).map((plat: string, idx: number) => (
                <div
                  key={plat}
                  style={{ zIndex: 10 + idx }}
                  className="hover:z-30 transition-transform duration-200 hover:scale-120 hover:-translate-y-0.5"
                >
                  <PlatformBadge platform={plat} size="md" />
                </div>
              ))}
              {campaign.platforms.length > 6 && (
                <div
                  style={{ zIndex: 20 }}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full ring-2 ring-[#090C15] flex items-center justify-center text-xs font-bold bg-slate-900 border border-white/10 text-purple-300"
                  title={campaign.platforms.slice(6).join(', ')}
                >
                  +{campaign.platforms.length - 6}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Row 3: Modern Direct Metrics: Creators Hired, Pitches Received, Escrow Protection */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 relative z-10">
          {/* Metric 1: Creators Hired */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Creators Hired
              </span>
              <Users className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {hired}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                / {targetParticipants} slots
              </span>
            </div>
            <span className="text-[11px] text-purple-300/80 font-medium block">
              {hired >= targetParticipants ? 'Roster full' : `${progressPercent}% filled`}
            </span>
          </div>

          {/* Metric 2: Pitches Received */}
          <div className="space-y-1.5 sm:border-l sm:border-purple-500/20 sm:pl-6">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Pitches Received
              </span>
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-cyan-300 tracking-tight">
                {applicantsCount}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {applicantsCount === 1 ? 'pitch' : 'pitches'}
              </span>
            </div>
            <span className="text-[11px] text-cyan-400/80 font-medium block">
              {applicantsCount > 0 ? `${applicantsCount} to review` : 'Accepting pitches'}
            </span>
          </div>

          {/* Metric 3: Escrow Status */}
          <div className="space-y-1.5 sm:border-l sm:border-purple-500/20 sm:pl-6">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Escrow Protection
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
                100%
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Protected
              </span>
            </div>
            <span className="text-[11px] text-emerald-300/80 font-medium block">
              Automated smart escrow
            </span>
          </div>
        </div>

        {/* Row 4: Footer Meta Dates & Bottom-Right Actions (No Horizontal Dividing Line) */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
            {formattedCreated && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>Created {formattedCreated}</span>
              </span>
            )}

            {formattedDeadline && (
              <span className="flex items-center gap-1.5 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Deadline: {formattedDeadline}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {campaign.status === 'DRAFT' && (
              <button
                onClick={handlePublish}
                type="button"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-black text-white flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Publish Campaign</span>
              </button>
            )}
            <CampaignActions campaign={campaign} onUpdated={() => void loadData(true)} onDeleted={onBack} />
          </div>
        </div>
      </div>

      {/* Review Prompt Banner - shown when campaign is completed/cancelled and review not yet submitted */}
      {(campaign.status === 'COMPLETED' || campaign.status === 'CANCELLED') &&
        reviewStatus &&
        !reviewStatus.hasBrandReview && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-purple-900/30 border border-purple-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Rate your experience</h4>
                <p className="text-xs text-white/40">
                  This campaign is {campaign.status.toLowerCase()}. Share your feedback about the creators you worked with.
                </p>
              </div>
            </div>
            {participants.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {participants.map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setReviewTargetInfluencer({
                        id: p.influencerProfileId,
                        name: p.influencerProfile?.handle || p.influencerProfile?.user?.name || 'Creator',
                      });
                      setShowReviewModal(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-purple-600/80 hover:bg-purple-500 text-white text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    <Star className="w-3 h-3" />
                    Review {p.influencerProfile?.handle || p.influencerProfile?.user?.name || 'Creator'}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

      {/* Navigation Tabs in Logical Lifecycle Order */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('applicants')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'applicants'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Applications ({inboundApplications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('offers')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'offers'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Offers Sent ({offers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('participants')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'participants'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Active Collabs ({participants.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'applicants' && (
          <ApplicationListView
            applications={inboundApplications}
            onViewDetails={(app) => setSelectedAppForDetail(app)}
            onViewProfile={(creator) => setSelectedCreatorForProfile(creator)}
            onShortlist={handleShortlist}
            onReject={handleReject}
            onSendOffer={(app) => setSelectedAppForOffer(app)}
            onOpenComparison={(selected) => setComparingApplicants(selected)}
            onAccept={handleAccept}
            onCounterOffer={(app) => setSelectedAppForCounterOffer(app)}
          />
        )}

        {activeTab === 'offers' && (
          <OfferManagementView
            offers={offers}
            onRefresh={loadData}
            onViewCollab={() => setActiveTab('participants')}
          />
        )}

        {activeTab === 'participants' && (
          <ParticipantManagementView
            participants={participants}
            campaign={campaign}
            onRefresh={loadData}
            onViewOffers={() => setActiveTab('offers')}
            offersCount={offers.length}
            onViewProfile={(creator) => setSelectedCreatorForProfile(creator)}
            onManageDeliverables={(p) => setManagingParticipant(p)}
          />
        )}
      </div>

      {/* Modals */}
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
          onShortlist={handleShortlist}
          onReject={handleReject}
          onAccept={handleAccept}
          onCounterOffer={(app) => {
            setSelectedAppForDetail(null);
            setSelectedAppForCounterOffer(app);
          }}
        />
      )}

      {selectedAppForOffer && (
        <SendOfferModal
          application={selectedAppForOffer}
          onClose={() => setSelectedAppForOffer(null)}
          onViewProfile={(creator) => {
            setSelectedAppForOffer(null);
            setSelectedCreatorForProfile(creator);
          }}
          onSuccess={loadData}
        />
      )}

      {selectedAppForCounterOffer && (
        <CounterOfferModal
          application={selectedAppForCounterOffer}
          onClose={() => setSelectedAppForCounterOffer(null)}
          onViewProfile={(creator) => {
            setSelectedAppForCounterOffer(null);
            setSelectedCreatorForProfile(creator);
          }}
          onSuccess={loadData}
        />
      )}

      {comparingApplicants && (
        <ApplicantComparisonView
          applicants={comparingApplicants}
          onClose={() => setComparingApplicants(null)}
          onViewProfile={(creator) => {
            setComparingApplicants(null);
            setSelectedCreatorForProfile(creator);
          }}
          onSendOffer={(app) => {
            setComparingApplicants(null);
            setSelectedAppForOffer(app);
          }}
        />
      )}

      {showReviewModal && reviewTargetInfluencer && (
        <CampaignReviewModal
          campaignId={campaignId}
          reviewType="BRAND_TO_INFLUENCER"
          revieweeInfluencerId={reviewTargetInfluencer.id}
          revieweeName={reviewTargetInfluencer.name}
          onClose={() => {
            setShowReviewModal(false);
            setReviewTargetInfluencer(null);
          }}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
}
