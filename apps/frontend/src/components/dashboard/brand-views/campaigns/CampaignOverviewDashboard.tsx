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
      <div className="p-12 text-center text-xs text-slate-400">
        Loading campaign control center...
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
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 backdrop-blur-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase bg-purple-500/10 text-purple-400 border-purple-500/30">
                {campaign.status}
              </span>
              <span className="text-xs text-slate-400 font-bold">{campaign.industry}</span>
            </div>
            <h2 className="text-xl font-black text-white mt-1">{campaign.title}</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-white/5 text-right">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Budget Pool</span>
              <span className="text-base font-black text-emerald-400">
                ${campaign.budgetTotalAmount?.toLocaleString() || '0'} {campaign.budgetCurrency}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stat Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Applications</span>
            <span className="text-base font-black text-white">{applications.length} Pitches</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Offers Sent</span>
            <span className="text-base font-black text-purple-400">{offers.length} Pending</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Creators Hired</span>
            <span className="text-base font-black text-emerald-400">
              {confirmedCount} / {campaign.targetParticipants}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Escrow Protected</span>
            <span className="text-base font-black text-indigo-400">100% Guaranteed</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
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
