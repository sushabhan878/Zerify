'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Megaphone, AlertCircle, RefreshCw } from 'lucide-react';
import { CampaignItem, CampaignService } from '@/services/campaign.service';
import CreateCampaignWizard from './campaigns/CreateCampaignWizard';
import CampaignOverviewDashboard from './campaigns/CampaignOverviewDashboard';
import BrandCampaignCard from './campaigns/BrandCampaignCard';
import LottieLoader from '@/components/ui/LottieLoader';

export default function MyCampaignsSection({ initialCampaignId }: { initialCampaignId?: string } = {}) {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(initialCampaignId || null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const loadCampaigns = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await CampaignService.getBrandCampaigns();
      setCampaigns(data || []);
    } catch (err: any) {
      console.error('Failed to fetch brand campaigns', err);
      setError(err?.message || 'Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  // If a specific campaign is selected, render the overview dashboard
  if (activeCampaignId) {
    return (
      <CampaignOverviewDashboard
        campaignId={activeCampaignId}
        onBack={() => {
          setActiveCampaignId(null);
          router.push('/dashboard/campaigns');
          loadCampaigns();
        }}
      />
    );
  }

  const filteredCampaigns = campaigns.filter((c) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ACTIVE') return c.status === 'ACTIVE' || c.status === 'OPEN' || c.status === 'FILLING';
    return c.status === statusFilter;
  });

  return (
    <div className="space-y-5">
      {/* Top Action Bar (Clean Toolbar without clunky Title) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 border border-white/10 light:bg-white light:border-slate-200/80 light:shadow-sm rounded-2xl backdrop-blur-xl">
          {[
            { id: 'ALL', label: 'All Campaigns', count: campaigns.length },
            {
              id: 'ACTIVE',
              label: 'Active',
              count: campaigns.filter((c) => c.status === 'ACTIVE' || c.status === 'OPEN' || c.status === 'FILLING').length,
            },
            { id: 'PAUSED', label: 'Paused', count: campaigns.filter((c) => c.status === 'PAUSED').length },
            { id: 'DRAFT', label: 'Drafts', count: campaigns.filter((c) => c.status === 'DRAFT').length },
          ].map((tab) => {
            const isSelected = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${isSelected
                    ? 'bg-purple-600 text-white keep-white shadow-md shadow-purple-900/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60 light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-100'
                  }`}
              >
                <span className={isSelected ? 'keep-white text-white' : ''}>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${isSelected ? 'bg-purple-950/60 text-purple-200 light:bg-purple-700 light:text-white keep-white' : 'bg-slate-800 text-slate-400 light:bg-slate-100 light:text-slate-600'
                      }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Create Campaign Primary Action */}
        <button
          type="button"
          onClick={() => setIsWizardOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-black text-white keep-white flex items-center gap-2 transition-all duration-200 shadow-lg shadow-purple-950/50 hover:shadow-purple-700/25 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[3] text-white keep-white" />
          <span className="keep-white text-white">Create Campaign</span>
        </button>
      </div>

      {/* Campaign List */}
      {isLoading ? (
        <div className="min-h-[350px] flex items-center justify-center p-12">
          <LottieLoader size={180} message="Loading your campaigns..." />
        </div>
      ) : error ? (
        <div className="p-10 rounded-3xl bg-rose-950/20 border border-rose-500/20 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-400/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-white">Failed to load campaigns</h3>
            <p className="text-xs text-rose-300/80 mt-1 max-w-md mx-auto">
              {error}
            </p>
          </div>
          <button
            type="button"
            onClick={loadCampaigns}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white inline-flex items-center gap-2 border border-white/10 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-dashed border-white/10 light:bg-white light:border-slate-200/80 light:shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-400/20 text-purple-300 light:bg-purple-50 light:border-purple-200 light:text-purple-600 flex items-center justify-center mx-auto">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-white light:text-slate-900">
              {statusFilter === 'ALL' ? 'No campaigns created yet' : `No ${statusFilter.toLowerCase()} campaigns found`}
            </h3>
            <p className="text-xs text-slate-400 light:text-slate-500 mt-1 max-w-md mx-auto">
              Launch your creator campaign to invite pitches from vetted influencers, manage deliverables, and secure payouts with Zerify Escrow.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsWizardOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-xs font-black text-white keep-white inline-flex items-center gap-2 shadow-lg shadow-purple-950/50 hover:opacity-95 transition-opacity"
          >
            <Plus className="w-4 h-4 stroke-[2.5] text-white keep-white" />
            <span className="keep-white text-white">Launch New Campaign</span>
          </button>
        </div>
      ) : (
        <div className="space-y-9 pt-9">
          {filteredCampaigns.map((c) => (
            <BrandCampaignCard
              key={c.id}
              campaign={c}
              onUpdated={loadCampaigns}
              onClick={() => {
                setActiveCampaignId(c.id);
                router.push(`/dashboard/campaigns/${c.id}`);
              }}
            />
          ))}
        </div>
      )}

      {/* Campaign Creation Wizard Modal */}
      {isWizardOpen && (
        <CreateCampaignWizard
          onClose={() => setIsWizardOpen(false)}
          existingCampaigns={campaigns}
          onSuccess={(newCampaign) => {
            setIsWizardOpen(false);
            loadCampaigns();
            if (newCampaign?.id) {
              setActiveCampaignId(newCampaign.id);
            }
          }}
        />
      )}
    </div>
  );
}
