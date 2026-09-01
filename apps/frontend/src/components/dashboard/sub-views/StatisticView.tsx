'use client';

import React, { useState } from 'react';
import { BarChart3, Calendar, Filter, Sparkles, Instagram, Youtube, Download } from 'lucide-react';
import StatisticKpiCards from './statistic-subcomponents/StatisticKpiCards';
import AudienceGrowthChart from './statistic-subcomponents/AudienceGrowthChart';
import EngagementAnalyticsCard from './statistic-subcomponents/EngagementAnalyticsCard';
import AudienceDemographicsCard from './statistic-subcomponents/AudienceDemographicsCard';

export default function StatisticView() {
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <span>Statistics & Performance Analytics</span>
          </h2>
          <p className="text-xs text-slate-400">Aggregated social intelligence, reach metrics, and audience insights</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Platform filter pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/60 border border-white/10 backdrop-blur-xl">
            {['all', 'instagram', 'youtube', 'tiktok'].map((plat) => (
              <button
                key={plat}
                onClick={() => setSelectedPlatform(plat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  selectedPlatform === plat
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {plat}
              </button>
            ))}
          </div>

          {/* Timeframe */}
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950/60 border border-white/10 text-xs font-bold text-slate-300 focus:outline-none focus:border-purple-500/50"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          <button className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-bold text-purple-300 flex items-center gap-1.5 transition-colors">
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 1. Overview KPIs */}
      <StatisticKpiCards />

      {/* 2. Audience Growth & AI Forecast */}
      <AudienceGrowthChart />

      {/* 3. Engagement & Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EngagementAnalyticsCard />
        <AudienceDemographicsCard />
      </div>

      {/* 4. AI Performance Takeaways Card */}
      <div className="p-5 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-3">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>AI Insight Engine Takeaways</span>
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
          <li className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
            <span className="font-bold text-purple-300 block">Video Format Dominance</span>
            <p className="text-[11px] text-slate-400">Video posts outperform static images by 41% higher engagement on Instagram & TikTok.</p>
          </li>
          <li className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
            <span className="font-bold text-pink-300 block">Optimal Posting Schedule</span>
            <p className="text-[11px] text-slate-400">Wednesday & Friday evenings between 7-9 PM generate 2.3x more initial reel saves.</p>
          </li>
          <li className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
            <span className="font-bold text-emerald-300 block">High Converting Niche</span>
            <p className="text-[11px] text-slate-400">Tech review reels drive 3.8% link click conversions to brand campaign landing pages.</p>
          </li>
        </ul>
      </div>
    </div>
  );
}
