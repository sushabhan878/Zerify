'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { CampaignItem, CampaignService } from '@/services/campaign.service';
import { ApplicationService, CampaignApplicationItem } from '@/services/application.service';
import { OfferService, CampaignOfferItem } from '@/services/offer.service';
import { DeliverableService } from '@/services/deliverable.service';
import ApplicationListView from './ApplicationListView';
import ApplicantDetailModal from './ApplicantDetailModal';
import SendOfferModal from './SendOfferModal';
import ApplicantComparisonView from './ApplicantComparisonView';
import ParticipantManagementView from './ParticipantManagementView';
import OfferManagementView from './OfferManagementView';
import CreatorProfileFullView from '../find-influencers/CreatorProfileFullView';
import { CreatorItem } from '../find-influencers/CreatorCard';
import LottieLoader from '@/components/ui/LottieLoader';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency } from '@/utils/currency';

interface CampaignOverviewDashboardProps {
  campaignId: string;
  onBack: () => void;
}

export default function CampaignOverviewDashboard({
  campaignId,
  onBack,
}: CampaignOverviewDashboardProps) {
  const { currency, formatBudget } = useCurrency();
  const [campaign, setCampaign] = useState<CampaignItem | null>(null);
  const [applications, setApplications] = useState<CampaignApplicationItem[]>([]);
  const [offers, setOffers] = useState<CampaignOfferItem[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'applicants' | 'participants' | 'offers' | 'brief'>('applicants');

  // Modals & In-Platform Profile state
  const [selectedCreatorForProfile, setSelectedCreatorForProfile] = useState<CreatorItem | null>(null);
  const [selectedAppForDetail, setSelectedAppForDetail] = useState<CampaignApplicationItem | null>(null);
  const [selectedAppForOffer, setSelectedAppForOffer] = useState<CampaignApplicationItem | null>(null);
  const [comparingApplicants, setComparingApplicants] = useState<CampaignApplicationItem[] | null>(null);

  const loadData = async () => {
    try {
      const [campData, appData, offerData, partData] = await Promise.all([
        CampaignService.getCampaignDetails(campaignId),
        ApplicationService.getCampaignApplications(campaignId),
        OfferService.getCampaignOffers(campaignId),
        DeliverableService.getCampaignParticipants(campaignId),
      ]);
      setCampaign(campData);
      setApplications(appData);
      setOffers(offerData);
      setParticipants(partData);
    } catch (err) {
      console.error('Failed to load campaign data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
      await ApplicationService.rejectApplication(appId);
      loadData();
    } catch (err) {
      console.error(err);
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

  const confirmedCount = participants.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <button
          onClick={onBack}
          type="button"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 text-purple-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Campaigns</span>
        </button>

        <div className="flex items-center gap-2">
          {campaign.status === 'DRAFT' && (
            <button
              onClick={handlePublish}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-black text-white flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Publish Campaign</span>
            </button>
          )}

          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border ${
              campaign.status === 'ACTIVE'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : campaign.status === 'COMPLETED'
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            {campaign.status}
          </span>
        </div>
      </div>

      {/* Main Campaign Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#090D16]/90 border border-white/10 backdrop-blur-xl relative overflow-hidden shadow-2xl space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-600/15 via-indigo-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest">
            <span>Campaign Management Hub</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {campaign.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {campaign.description}
              </p>
            </div>

            <div className="flex items-center gap-6 sm:gap-8 shrink-0">
              <div className="space-y-0.5 text-left sm:text-right">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                  Budget
                </span>
                <span className="text-2xl sm:text-3xl font-black text-purple-300 tracking-tight block">
                  {formatCurrency(Number(campaign.budgetTotalAmount || 0), campaign.budgetCurrency || currency)}
                </span>
              </div>
              <div className="space-y-0.5 text-left sm:text-right">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                  Target Creators
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight block">
                  {campaign.targetParticipants || 5}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Summary Stats Bar - Vertical Line Separated with Big Numbers without Headings or Horizontal Line */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-2 relative z-10">
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-black text-white tracking-tight block">
              {applications.length}
            </span>
            <div className="flex items-center gap-1.5 text-purple-300/80 text-xs font-bold">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>Pitches received</span>
            </div>
          </div>

          <div className="space-y-1 sm:border-l sm:border-white/10 sm:pl-6">
            <span className="text-3xl sm:text-4xl font-black text-indigo-300 tracking-tight block">
              {offers.length}
            </span>
            <div className="flex items-center gap-1.5 text-indigo-300/80 text-xs font-bold">
              <Send className="w-3.5 h-3.5 text-indigo-400" />
              <span>Pending responses</span>
            </div>
          </div>

          <div className="space-y-1 sm:border-l sm:border-white/10 sm:pl-6">
            <span className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight block">
              {participants.length}
            </span>
            <div className="flex items-center gap-1.5 text-emerald-300/80 text-xs font-bold">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Active creators</span>
            </div>
          </div>

          <div className="space-y-1 sm:border-l sm:border-white/10 sm:pl-6">
            <span className="text-3xl sm:text-4xl font-black text-amber-300 tracking-tight block">
              {participants.reduce((sum, p) => sum + (p.deliverables?.length || 0), 0)}
            </span>
            <div className="flex items-center gap-1.5 text-amber-300/80 text-xs font-bold">
              <Video className="w-3.5 h-3.5 text-amber-400" />
              <span>Content deliverables</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
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
          <span>Applicants ({applications.length})</span>
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
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'applicants' && (
          <ApplicationListView
            applications={applications}
            onViewDetails={(app) => setSelectedAppForDetail(app)}
            onViewProfile={(creator) => setSelectedCreatorForProfile(creator)}
            onShortlist={handleShortlist}
            onReject={handleReject}
            onSendOffer={(app) => setSelectedAppForOffer(app)}
            onOpenComparison={(selected) => setComparingApplicants(selected)}
          />
        )}

        {activeTab === 'participants' && (
          <ParticipantManagementView participants={participants} onRefresh={loadData} />
        )}

        {activeTab === 'offers' && (
          <OfferManagementView offers={offers} onRefresh={loadData} />
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
    </div>
  );
}
