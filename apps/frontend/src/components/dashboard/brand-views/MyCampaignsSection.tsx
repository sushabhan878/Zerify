'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Megaphone } from 'lucide-react';
import { CampaignItem, CampaignService } from '@/services/campaign.service';
import CreateCampaignWizard from './campaigns/CreateCampaignWizard';
import CampaignOverviewDashboard from './campaigns/CampaignOverviewDashboard';
import BrandCampaignCard from './campaigns/BrandCampaignCard';
import LottieLoader from '@/components/ui/LottieLoader';

export default function MyCampaignsSection() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const loadCampaigns = async () => {
    try {
      const data = await CampaignService.getBrandCampaigns();
      setCampaigns(data);
    } catch (err) {
      console.error('Failed to fetch brand campaigns', err);
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
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 border border-white/10 rounded-2xl backdrop-blur-xl">
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      isSelected ? 'bg-purple-950/60 text-purple-200' : 'bg-slate-800 text-slate-400'
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
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-black text-white flex items-center gap-2 transition-all duration-200 shadow-lg shadow-purple-950/50 hover:shadow-purple-700/25 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Campaign List */}
      {isLoading ? (
        <div className="min-h-[350px] flex items-center justify-center p-12">
          <LottieLoader size={180} message="Loading your campaigns..." />
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-dashed border-white/10 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-400/20 text-purple-300 flex items-center justify-center mx-auto">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-white">
              {statusFilter === 'ALL' ? 'No campaigns created yet' : `No ${statusFilter.toLowerCase()} campaigns found`}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Launch your creator campaign to invite pitches from vetted influencers, manage deliverables, and secure payouts with Zerify Escrow.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsWizardOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-xs font-black text-white inline-flex items-center gap-2 shadow-lg shadow-purple-950/50 hover:opacity-95 transition-opacity"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Launch New Campaign</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCampaigns.map((c) => (
            <BrandCampaignCard
              key={c.id}
              campaign={c}
              onClick={() => setActiveCampaignId(c.id)}
            />
          ))}
        </div>
      )}

      {/* Campaign Creation Wizard Modal */}
      {isWizardOpen && (
        <CreateCampaignWizard
          onClose={() => setIsWizardOpen(false)}
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
