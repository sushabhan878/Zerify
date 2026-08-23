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
import LottieLoader from '@/components/ui/LottieLoader';

interface CampaignOverviewDashboardProps {
  campaignId: string;
  onBack: () => void;
}

export default function CampaignOverviewDashboard({
  campaignId,
  onBack,
}: CampaignOverviewDashboardProps) {
  const [campaign, setCampaign] = useState<CampaignItem | null>(null);
  const [applications, setApplications] = useState<CampaignApplicationItem[]>([]);
  const [offers, setOffers] = useState<CampaignOfferItem[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'applicants' | 'participants' | 'offers' | 'brief'>('applicants');

  // Modals state
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

  const confirmedCount = participants.length;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Campaigns</span>
        </button>

        <div className="flex items-center gap-2">
          {campaign.status === 'DRAFT' && (
            <button
              onClick={handlePublish}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105 text-xs font-black text-white flex items-center gap-1.5 shadow-lg transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Publish Campaign</span>
            </button>
          )}

          {campaign.status === 'OPEN' && (
            <button
              onClick={handlePause}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause Discovery</span>
            </button>
          )}
        </div>
      </div>

      {/* Campaign Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-950/45 border border-purple-500/20 backdrop-blur-2xl shadow-xl shadow-purple-950/20 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
                {campaign.status}
              </span>
              {campaign.industry && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-950/40 border border-purple-500/20 text-purple-200 flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-purple-400" />
                  <span>{campaign.industry}</span>
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black text-white">{campaign.title}</h2>
          </div>

          <div className="lg:text-right flex lg:flex-col items-baseline lg:items-end justify-between gap-0.5 flex-shrink-0">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Total Budget Pool
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
              {campaign.budgetCurrency === 'INR' ? '₹' : '$'}{campaign.budgetTotalAmount?.toLocaleString() || '0'}
              <span className="text-xs font-bold text-emerald-300/70 ml-1.5 uppercase">
                {campaign.budgetCurrency || 'USD'}
              </span>
            </span>
          </div>
        </div>

        {/* Quick Stat Direct Grid without border divider */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-2">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest block">Applications</span>
            <span className="text-2xl sm:text-3xl font-black text-white block">{applications.length}</span>
            <span className="text-[10px] text-cyan-400/80 font-semibold block">Pitches received</span>
          </div>
          <div className="space-y-1 sm:border-l sm:border-white/10 sm:pl-6">
            <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest block">Offers Sent</span>
            <span className="text-2xl sm:text-3xl font-black text-purple-400 block">{offers.length}</span>
            <span className="text-[10px] text-purple-300/80 font-semibold block">Pending responses</span>
          </div>
          <div className="space-y-1 sm:border-l sm:border-white/10 sm:pl-6">
            <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest block">Creators Hired</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">{confirmedCount}</span>
              <span className="text-xs font-bold text-slate-500">/ {campaign.targetParticipants} slots</span>
            </div>
            <span className="text-[10px] text-emerald-300/80 font-semibold block">Roster progress</span>
          </div>
          <div className="space-y-1 sm:border-l sm:border-white/10 sm:pl-6">
            <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest block">Escrow Status</span>
            <span className="text-2xl sm:text-3xl font-black text-indigo-400 block">100%</span>
            <span className="text-[10px] text-indigo-300/80 font-semibold block">Auto protection</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 pb-1">
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
          <span>Confirmed Creators ({participants.length})</span>
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
          onSuccess={loadData}
        />
      )}

      {comparingApplicants && (
        <ApplicantComparisonView
          applicants={comparingApplicants}
          onClose={() => setComparingApplicants(null)}
          onSendOffer={(app) => {
            setComparingApplicants(null);
            setSelectedAppForOffer(app);
          }}
        />
      )}
    </div>
  );
}
