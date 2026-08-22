'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Plus, Calendar, DollarSign, Users, Sparkles, ChevronRight, Play } from 'lucide-react';
import { CampaignItem, CampaignService } from '@/services/campaign.service';
import CreateCampaignWizard from './campaigns/CreateCampaignWizard';
import CampaignOverviewDashboard from './campaigns/CampaignOverviewDashboard';

export default function MyCampaignsSection() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
      case 'ACTIVE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'FILLING':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'DRAFT':
        return 'bg-slate-800 text-slate-400 border-white/10';
      case 'PAUSED':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'COMPLETED':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-white/10';
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-purple-400" />
            <span>Brand Campaigns</span>
          </h2>
          <p className="text-xs text-slate-400">
            Manage live sponsorships, applicant rosters, deliverable tracking & escrow budgets
          </p>
        </div>

        <button
          onClick={() => setIsWizardOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105 text-xs font-black text-white flex items-center gap-1.5 transition-all shadow-lg shadow-purple-950/50"
        >
          <Plus className="w-4 h-4" />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Campaign List */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">
          Loading active campaigns...
        </div>
      ) : campaigns.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-dashed border-white/10 text-center space-y-4">
          <Megaphone className="w-10 h-10 text-purple-400 mx-auto" />
          <div>
            <h3 className="text-base font-black text-white">No campaigns created yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Launch your first creator campaign to invite proposals from top-tier influencers, manage deliverables, and protect payments with Zerify Escrow.
            </p>
          </div>
          <button
            onClick={() => setIsWizardOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-xs font-black text-white inline-flex items-center gap-2 shadow-lg shadow-purple-950/50"
          >
            <Plus className="w-4 h-4" />
            <span>Start Campaign Wizard</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((c) => {
            const hired = c._count?.participants || 0;
            const applicants = c._count?.applications || 0;

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4 hover:border-purple-500/40 transition-all cursor-pointer"
                onClick={() => setActiveCampaignId(c.id)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getStatusColor(c.status)}`}>
                        {c.status}
                      </span>
                      <span className="text-[11px] text-slate-400 font-bold">{c.industry}</span>
                    </div>
                    <h3 className="text-base font-black text-white mt-1">{c.title}</h3>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs font-bold text-slate-400 block">Total Budget</span>
                    <span className="text-base font-black text-emerald-400">
                      ${c.budgetTotalAmount?.toLocaleString() || 'Flexible'} {c.budgetCurrency}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-xl border border-white/5 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Creators Hired</span>
                    <span className="font-black text-purple-400">{hired} / {c.targetParticipants} Creators</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Pitches Received</span>
                    <span className="font-black text-white">{applicants} Applicants</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Escrow Protection</span>
                    <span className="font-bold text-emerald-400">100% Guaranteed</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">
                    Created {new Date((c as any).createdAt).toLocaleDateString()}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCampaignId(c.id);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-all shadow-md flex items-center gap-1"
                  >
                    <span>Manage Roster & Deliverables</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
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
