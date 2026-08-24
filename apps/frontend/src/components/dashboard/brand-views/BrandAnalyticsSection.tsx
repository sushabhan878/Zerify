'use client';

import React, { useState } from 'react';
import { BarChart3, Sparkles } from 'lucide-react';
import AnalyticsFilterBar from './analytics/AnalyticsFilterBar';
import AnalyticsSummaryCards from './analytics/AnalyticsSummaryCards';
import AnalyticsPerformanceChart from './analytics/AnalyticsPerformanceChart';
import AnalyticsTopCampaigns from './analytics/AnalyticsTopCampaigns';
import AnalyticsTopInfluencers from './analytics/AnalyticsTopInfluencers';

export default function BrandAnalyticsSection() {
  const [dateRange, setDateRange] = useState('30d');
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  const handleExport = () => {
    // Generates a mock download or alert
    alert('Exporting analytics report for ' + dateRange + '...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-[10.5px] font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            Performance & Insights
          </span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight mt-1">
          Brand Analytics
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Measure campaign reach, influencer return-on-investment, and aggregate audience engagement.
        </p>
      </div>

      {/* 1. Filter Bar */}
      <AnalyticsFilterBar
        dateRange={dateRange}
        setDateRange={setDateRange}
        selectedCampaign={selectedCampaign}
        setSelectedCampaign={setSelectedCampaign}
        selectedPlatform={selectedPlatform}
        setSelectedPlatform={setSelectedPlatform}
        onExport={handleExport}
      />

      {/* 2. Summary Metric Cards (Total Reach, Total Engagement, Average ER, Total Campaigns) */}
      <AnalyticsSummaryCards />

      {/* 3. Performance Over Time Interactive Chart */}
      <AnalyticsPerformanceChart />

      {/* 4. Bottom Grid: Top Performing Campaigns & Top Performing Influencers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AnalyticsTopCampaigns />
        <AnalyticsTopInfluencers />
      </div>
    </div>
  );
}
