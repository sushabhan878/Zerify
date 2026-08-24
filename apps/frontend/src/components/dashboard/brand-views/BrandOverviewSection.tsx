'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Sparkles } from 'lucide-react';
import OverviewKpiGrid from './overview/OverviewKpiGrid';
import CampaignPerformanceTrend from './overview/CampaignPerformanceTrend';
import TopCampaignsList from './overview/TopCampaignsList';
import RecentActivityFeed from './overview/RecentActivityFeed';

interface BrandOverviewSectionProps {
  userName?: string;
  companyName?: string;
  onNavigate?: (routeId: string) => void;
}

export default function BrandOverviewSection({
  userName = 'Partner',
  companyName = 'Apex Gear Inc',
  onNavigate,
}: BrandOverviewSectionProps) {
  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-[10.5px] font-black text-purple-300 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Company Overview
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Welcome back, {companyName}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Here is your real-time influencer marketing performance and active campaign status.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate?.('search-creators')}
            type="button"
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-bold text-slate-200 hover:text-white flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Search className="w-3.5 h-3.5 text-purple-400" />
            <span>Find Influencers</span>
          </button>

          <button
            onClick={() => onNavigate?.('my-campaigns')}
            type="button"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-black text-white flex items-center gap-1.5 transition-all shadow-lg shadow-purple-950/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Campaign</span>
          </button>
        </div>
      </div>

      {/* 1. Overview KPIs (7 key metrics) */}
      <OverviewKpiGrid />

      {/* 2. Campaign Performance Trend Chart */}
      <CampaignPerformanceTrend />

      {/* 3. Bottom Grid: Top Performing Campaigns & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <TopCampaignsList onViewCampaigns={() => onNavigate?.('my-campaigns')} />
        <RecentActivityFeed onViewMessages={() => onNavigate?.('brand-messages')} />
      </div>
    </div>
  );
}
