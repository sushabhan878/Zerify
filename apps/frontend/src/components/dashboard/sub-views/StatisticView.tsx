'use client';

import React, { useState } from 'react';
import { Sparkles, Download } from 'lucide-react';
import StatisticKpiCards from './statistic-subcomponents/StatisticKpiCards';
import AudienceGrowthChart from './statistic-subcomponents/AudienceGrowthChart';
import EngagementAnalyticsCard from './statistic-subcomponents/EngagementAnalyticsCard';
import AudienceDemographicsCard from './statistic-subcomponents/AudienceDemographicsCard';
import TimeframeDropdown from './statistic-subcomponents/TimeframeDropdown';

export default function StatisticView() {
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [demographics, setDemographics] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('zerify_token');
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

        const [accRes, demoRes] = await Promise.allSettled([
          fetch(`${apiUrl}/social/accounts`, { headers }),
          fetch(`${apiUrl}/social/user/demographics`, { headers }),
        ]);

        if (accRes.status === 'fulfilled' && accRes.value.ok) {
          const json = await accRes.value.json();
          if (Array.isArray(json.data)) {
            setAccounts(json.data);
          }
        }

        if (demoRes.status === 'fulfilled' && demoRes.value.ok) {
          const json = await demoRes.value.json();
          if (Array.isArray(json.data?.demographics)) {
            setDemographics(json.data.demographics);
          }
        }
      } catch (err) {
        console.warn('Could not fetch social analytics:', err);
      }
    };

    fetchAnalytics();
  }, []);

  // Filter accounts based on platform selector
  const filteredAccounts = selectedPlatform === 'all'
    ? accounts
    : accounts.filter((a) => (a.platform || '').toLowerCase() === selectedPlatform.toLowerCase());

  const totalFollowers = filteredAccounts.reduce(
    (sum, a) => sum + (typeof a.followerCount === 'number' ? a.followerCount : 0),
    0,
  );

  const avgEngagement = filteredAccounts.length > 0
    ? Number(
        (
          filteredAccounts.reduce(
            (sum, a) => sum + (typeof a.engagementRate === 'number' ? a.engagementRate : 0),
            0,
          ) / filteredAccounts.length
        ).toFixed(1),
      )
    : undefined;

  // Filter demographics for selected platform if applicable
  const filteredDemographics = selectedPlatform === 'all'
    ? demographics
    : demographics.filter((d) => {
        const acc = accounts.find((a) => a.id === d.socialAccountId);
        return acc && (acc.platform || '').toLowerCase() === selectedPlatform.toLowerCase();
      });

  return (
    <div className="space-y-6">
      {/* Filter & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Platform filter pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/60 border border-white/10 backdrop-blur-xl overflow-x-auto">
          {['all', 'instagram', 'youtube', 'twitter', 'threads', 'linkedin'].map((plat) => (
            <button
              key={plat}
              onClick={() => setSelectedPlatform(plat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${
                selectedPlatform === plat
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {plat === 'twitter' ? 'X (Twitter)' : plat}
            </button>
          ))}
        </div>

        {/* Timeframe & Export side by side */}
        <div className="flex items-center gap-2.5 shrink-0">
          <TimeframeDropdown
            value={selectedTimeframe}
            onChange={setSelectedTimeframe}
          />

          <button
            type="button"
            className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 active:scale-95 border border-purple-500/30 hover:border-purple-400/60 text-xs font-semibold text-purple-200 hover:text-white flex items-center gap-2 transition-all duration-200 shadow-sm shadow-purple-950/20 group cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-purple-400 group-hover:-translate-y-0.5 transition-transform" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 1. Overview KPIs */}
      <StatisticKpiCards
        totalFollowers={totalFollowers > 0 ? totalFollowers : undefined}
        avgEngagement={avgEngagement}
      />

      {/* 2. Audience Growth & AI Forecast */}
      <AudienceGrowthChart />

      {/* 3. Engagement & Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EngagementAnalyticsCard />
        <AudienceDemographicsCard
          demographics={filteredDemographics.length > 0 ? filteredDemographics : demographics}
        />
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
            <p className="text-[11px] text-slate-400">Video posts outperform static images by 41% higher engagement on Instagram & YouTube.</p>
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
