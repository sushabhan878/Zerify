'use client';

import { mapActiveCampaign } from '../campaign-execution/mapActiveCampaign';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Megaphone, Search, Compass, AlertCircle, Star } from 'lucide-react';
import ActiveCampaignKpiBar from './subcomponents/ActiveCampaignKpiBar';
import ActiveCampaignCardItem, { ActiveCampaignItem } from './subcomponents/ActiveCampaignCardItem';
import CollaborationWorkspace from './collaborations/CollaborationWorkspace';
import { DeliverableService } from '@/services/deliverable.service';
import { ReviewService, ReviewStatusResponse } from '@/services/review.service';
import LottieLoader from '@/components/ui/LottieLoader';
import { useCurrency } from '@/context/CurrencyContext';
import CampaignReviewModal from '../subcomponents/CampaignReviewModal';

interface ActiveCampaignsSectionProps {
  onNavigate?: (routeId: string) => void;
}

export default function ActiveCampaignsSection({ onNavigate }: ActiveCampaignsSectionProps) {
  const { currency: userCurrency, format: formatUserCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState<'ALL' | 'IN_PRODUCTION' | 'CONTENT_REVIEW' | 'READY_TO_PUBLISH' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeParticipantId, setActiveParticipantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [campaigns, setCampaigns] = useState<ActiveCampaignItem[]>([]);
  const [reviewStatuses, setReviewStatuses] = useState<Record<string, ReviewStatusResponse>>({});
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTargetCampaign, setReviewTargetCampaign] = useState<{ campaignId: string; brandName: string; brandId: string } | null>(null);

  const loadData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const data = await DeliverableService.getMyCollaborations();
      if (data && Array.isArray(data)) {
        const formatted = data.map(mapActiveCampaign);
        setCampaigns(formatted);

        const completedCampaigns = data.filter(
          (p: any) => p.campaign?.status === 'COMPLETED' || p.campaign?.status === 'CANCELLED',
        );
        const statuses: Record<string, ReviewStatusResponse> = {};
        await Promise.all(
          completedCampaigns.map(async (p: any) => {
            try {
              const status = await ReviewService.getReviewStatus(String(p.campaignId));
              statuses[p.campaignId] = status;
            } catch {
              // silently fail
            }
          }),
        );
        setReviewStatuses(statuses);
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
  }, [userCurrency, formatUserCurrency]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUploadSubmit = (id: string | number) => {
    setActiveParticipantId(String(id));
  };

  const handleReviewSuccess = () => {
    setShowReviewModal(false);
    setReviewTargetCampaign(null);
    loadData(true);
  };

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

  const kpis = useMemo(() => {
    const currentList =
      activeTab === 'ALL' ? campaigns : campaigns.filter((c) => c.stage === activeTab);
    const count = currentList.length;
    const totalRev = currentList.reduce((acc, c) => acc + (c.payoutAmount || 0), 0);
    const avgRev = count > 0 ? totalRev / count : 0;
    const totalDeliverables = currentList.reduce(
      (acc, c) => acc + (c.deliverables?.length || 0),
      0
    );
    const completedDeliverables = currentList.reduce(
      (acc, c) => acc + (c.deliverables?.filter((d) => d.completed)?.length || 0),
      0
    );
    const avgProgress =
      count > 0
        ? Math.round(currentList.reduce((acc, c) => acc + (c.progress || 0), 0) / count)
        : 0;

    if (activeTab === 'IN_PRODUCTION') {
      return [
        {
          label: 'In Production',
          val: `${count} Campaigns`,
          change: count > 0 ? `${avgProgress}% avg. progress` : 'None in production',
        },
        {
          label: 'Contract Value',
          val: formatUserCurrency(totalRev),
          change: count > 0 ? 'Subject to completion and payment checks' : 'No active contract value',
        },
        {
          label: 'Deliverables Pending',
          val: `${totalDeliverables - completedDeliverables} Deliverables`,
          change: `${completedDeliverables} completed so far`,
        },
        {
          label: 'Avg. Contract Value',
          val: formatUserCurrency(avgRev),
          change: 'Per active production',
        },
      ];
    }

    if (activeTab === 'CONTENT_REVIEW') {
      return [
        {
          label: 'Under Review',
          val: `${count} Campaigns`,
          change: count > 0 ? 'Awaiting brand approval' : 'No drafts in review',
        },
        {
          label: 'Review Value',
          val: formatUserCurrency(totalRev),
          change: count > 0 ? 'Awaiting content review' : 'No funds in review',
        },
        {
          label: 'Submitted Deliverables',
          val: `${totalDeliverables} Items`,
          change: `${completedDeliverables} verified`,
        },
        {
          label: 'Avg. Deal Size',
          val: formatUserCurrency(avgRev),
          change: 'Per review campaign',
        },
      ];
    }

    if (activeTab === 'READY_TO_PUBLISH') {
      return [
        {
          label: 'Ready to Publish',
          val: `${count} Campaigns`,
          change: count > 0 ? 'Approved for posting' : 'None awaiting post',
        },
        {
          label: 'Pending Release',
          val: formatUserCurrency(totalRev),
          change: count > 0 ? 'Released after live link' : 'No funds pending',
        },
        {
          label: 'Approved Items',
          val: `${totalDeliverables} Deliverables`,
          change: '100% brand approved',
        },
        {
          label: 'Avg. Release Value',
          val: formatUserCurrency(avgRev),
          change: 'Average pending payout',
        },
      ];
    }

    if (activeTab === 'COMPLETED') {
      return [
        {
          label: 'Completed Campaigns',
          val: `${count} Finished`,
          change: 'Fulfilled partnerships',
        },
        {
          label: 'Completed Contract Value',
          val: formatUserCurrency(totalRev),
          change: 'Payment status shown in each workspace',
        },
        {
          label: 'Deliverables Fulfilled',
          val: `${totalDeliverables} Delivered`,
          change: '100% completion rate',
        },
        {
          label: 'Avg. Deal Value',
          val: formatUserCurrency(avgRev),
          change: 'Per completed campaign',
        },
      ];
    }

    // ALL Participated
    return [
      {
        label: 'Total Collaborations',
        val: `${count} Campaigns`,
        change: `${campaigns.filter((c) => c.stage !== 'COMPLETED').length} active currently`,
      },
      {
        label: 'Total Contract Value',
        val: formatUserCurrency(totalRev),
        change: 'Combined deal volume',
      },
      {
        label: 'Overall Progress',
        val: `${avgProgress}% Rate`,
        change: `${completedDeliverables} of ${totalDeliverables} deliverables`,
      },
      {
        label: 'Avg. Contract Value',
        val: formatUserCurrency(avgRev),
        change: 'Across all campaigns',
      },
    ];
  }, [activeTab, campaigns, formatUserCurrency]);

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

  return (
    <div className="space-y-6">
      {/* 1. KPI Stats Summary Bar */}
      <ActiveCampaignKpiBar kpis={kpis} />

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

        {/* Filter Tabs */}
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
          {filteredCampaigns.map((c) => {
            const status = reviewStatuses[String(c.id)];
            const needsReview = status && !status.hasInfluencerReview;
            return (
              <div key={c.id}>
                <ActiveCampaignCardItem campaign={c} onUploadSubmit={handleUploadSubmit} />
                {needsReview && (
                  <div className="mt-2 p-3 rounded-xl bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border border-purple-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-purple-400" />
                      <span className="text-xs text-white/60 font-medium">Rate this brand collaboration</span>
                    </div>
                    <button
                      onClick={() => {
                        setReviewTargetCampaign({
                          campaignId: String(c.id),
                          brandName: c.brand,
                          brandId: '',
                        });
                        setShowReviewModal(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-purple-600/80 hover:bg-purple-500 text-white text-xs font-medium transition-colors flex items-center gap-1.5"
                    >
                      <Star className="w-3 h-3" />
                      Leave Review
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showReviewModal && reviewTargetCampaign && (
        <CampaignReviewModal
          campaignId={reviewTargetCampaign.campaignId}
          reviewType="INFLUENCER_TO_BRAND"
          revieweeBrandId={reviewTargetCampaign.brandId || undefined}
          revieweeName={reviewTargetCampaign.brandName}
          onClose={() => {
            setShowReviewModal(false);
            setReviewTargetCampaign(null);
          }}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
}
