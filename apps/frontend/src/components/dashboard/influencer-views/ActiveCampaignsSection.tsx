'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Megaphone, Search, RefreshCw, Compass, AlertCircle } from 'lucide-react';
import ActiveCampaignKpiBar from './subcomponents/ActiveCampaignKpiBar';
import ActiveCampaignCardItem, { ActiveCampaignItem } from './subcomponents/ActiveCampaignCardItem';
import CollaborationWorkspace from './collaborations/CollaborationWorkspace';
import { DeliverableService } from '@/services/deliverable.service';
import LottieLoader from '@/components/ui/LottieLoader';

interface ActiveCampaignsSectionProps {
  onNavigate?: (routeId: string) => void;
}

export default function ActiveCampaignsSection({ onNavigate }: ActiveCampaignsSectionProps) {
  const [activeTab, setActiveTab] = useState<'ALL' | 'IN_PRODUCTION' | 'CONTENT_REVIEW' | 'READY_TO_PUBLISH' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeParticipantId, setActiveParticipantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [campaigns, setCampaigns] = useState<ActiveCampaignItem[]>([]);

  const loadData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const data = await DeliverableService.getMyCollaborations();
      if (data && Array.isArray(data)) {
        const formatted: ActiveCampaignItem[] = data.map((p: any) => {
          const deliverables = p.deliverables || [];
          const completedCount = deliverables.filter(
            (d: any) => d.status === 'VERIFIED' || d.status === 'APPROVED' || d.status === 'PUBLISHED'
          ).length;
          const progress = deliverables.length > 0
            ? Math.round((completedCount / deliverables.length) * 100)
            : (p.status === 'PARTICIPANT_COMPLETED' ? 100 : 0);

          let stage: ActiveCampaignItem['stage'] = 'IN_PRODUCTION';
          if (p.status === 'PARTICIPANT_COMPLETED') {
            stage = 'COMPLETED';
          } else if (progress >= 100) {
            stage = 'READY_TO_PUBLISH';
          } else if (deliverables.some((d: any) => d.status === 'SUBMITTED' || d.status === 'UNDER_REVIEW')) {
            stage = 'CONTENT_REVIEW';
          } else if (progress > 0) {
            stage = 'CONTENT_REVIEW';
          }

          const currency = p.agreedCurrency || 'USD';
          const sym = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
          const amountNum = Number(p.agreedAmount || p.agreedBudget || 0);
          const payoutStr = amountNum > 0 ? `${sym}${amountNum.toLocaleString()}` : 'Product Barter / Fixed';

          let deadlineStr = 'Rolling Milestone';
          if (p.campaign?.endDate) {
            deadlineStr = new Date(p.campaign.endDate).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });
          } else if (p.campaign?.applicationDeadline) {
            deadlineStr = new Date(p.campaign.applicationDeadline).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });
          }

          return {
            id: p.id,
            title: p.campaign?.title || 'Creator Collaboration',
            brand: p.campaign?.brandProfile?.companyName || 'Verified Brand',
            industry: p.campaign?.industry || p.campaign?.brandProfile?.industry || 'Tech & Creator',
            stage,
            deadline: deadlineStr,
            payout: payoutStr,
            progress,
            deliverables: deliverables.length > 0
              ? deliverables.map((d: any) => ({
                  title: `${d.quantity || 1}x ${d.type || 'Deliverable'}`,
                  completed: d.status === 'VERIFIED' || d.status === 'APPROVED' || d.status === 'PUBLISHED',
                }))
              : [{ title: '1x Content Deliverable', completed: progress === 100 }],
            verifiedBrand: true,
            contractBrief: p.campaign?.description || 'Deliverable guidelines and brand objectives.',
          };
        });
        setCampaigns(formatted);
      } else {
        setCampaigns([]);
      }
    } catch (err) {
      console.error('Failed to load participated campaigns:', err);
      setCampaigns([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUploadSubmit = (id: string | number) => {
    setActiveParticipantId(String(id));
  };

  if (activeParticipantId) {
    return (
      <CollaborationWorkspace
        participantId={activeParticipantId}
        onBack={() => {
          setActiveParticipantId(null);
          loadData(true);
        }}
      />
    );
  }

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesTab = activeTab === 'ALL' || c.stage === activeTab;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.brand.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.industry.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  const totalEscrowNumeric = campaigns.reduce((acc, c) => {
    const match = c.payout.replace(/,/g, '').match(/[0-9.]+/);
    return acc + (match ? parseFloat(match[0]) : 0);
  }, 0);
  const totalEscrowStr = `$${totalEscrowNumeric.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return (
    <div className="space-y-6">
      {/* 1. KPI Stats Summary Bar */}
      <ActiveCampaignKpiBar
        activeCount={campaigns.filter((c) => c.stage !== 'COMPLETED').length}
        totalEscrowLocked={totalEscrowStr}
      />

      {/* 2. Search & Stage Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search participated campaigns by brand, title, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Filter Tabs & Refresh Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-white/10 overflow-x-auto no-scrollbar">
            {[
              { id: 'ALL', label: 'All Participated' },
              { id: 'IN_PRODUCTION', label: 'In Production' },
              { id: 'CONTENT_REVIEW', label: 'In Review' },
              { id: 'READY_TO_PUBLISH', label: 'Ready to Publish' },
              { id: 'COMPLETED', label: 'Completed' },
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
            title="Refresh participated campaigns"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-purple-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* 3. Campaign Cards */}
      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center min-h-[300px]">
          <LottieLoader size={180} message="Loading your participated campaigns..." />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-950/60 border border-purple-500/20 text-center space-y-4 flex flex-col items-center justify-center min-h-[340px] backdrop-blur-2xl shadow-xl shadow-purple-950/20">
          <div className="w-14 h-14 rounded-2xl bg-purple-600/15 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-inner">
            <Megaphone className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h3 className="text-base font-bold text-white">No Participated Campaigns Yet</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              You have not joined or participated in any brand campaigns yet. Apply to campaigns in Campaign Discovery or accept brand invitations to begin active collaborations!
            </p>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('campaign-discovery')}
              type="button"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-950/40 flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>Discover Campaigns to Join</span>
            </button>
          )}
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">No campaigns found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No participated campaigns match your search or selected stage filter.
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
          {filteredCampaigns.map((c) => (
            <ActiveCampaignCardItem key={c.id} campaign={c} onUploadSubmit={handleUploadSubmit} />
          ))}
        </div>
      )}
    </div>
  );
}
