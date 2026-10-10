'use client';

import React, { useState } from 'react';
import AnalyticsFilterBar from './analytics/AnalyticsFilterBar';
import OverviewKpiGrid from './overview/OverviewKpiGrid';
import AnalyticsPerformanceChart from './analytics/AnalyticsPerformanceChart';
import CampaignPerformanceTrend from './overview/CampaignPerformanceTrend';
import AnalyticsTopCampaigns from './analytics/AnalyticsTopCampaigns';
import AnalyticsTopInfluencers from './analytics/AnalyticsTopInfluencers';
import RecentActivityFeed from './overview/RecentActivityFeed';
import UnderConstructionNotice from '../common/UnderConstructionNotice';
import { BarChart3, TrendingUp } from 'lucide-react';

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
  const [dateRange, setDateRange] = useState('30d');
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [chartView, setChartView] = useState<'weekly' | 'daily'>('weekly');

  const handleExport = () => {
    alert(`Exporting consolidated analytics & overview report for ${dateRange}...`);
  };

  return (
    <div className="space-y-6">
      {/* Production Deployment Under Construction Notice */}
      <UnderConstructionNotice
        customMessage="Brand analytics, real-time campaign performance tracking, and automated ROI intelligence are currently undergoing data pipeline integration for production deployment. Full telemetry will be live soon."
      />

      {/* 1. Analytics & Overview Filter Bar */}
      <AnalyticsFilterBar
        dateRange={dateRange}
        setDateRange={setDateRange}
        selectedCampaign={selectedCampaign}
        setSelectedCampaign={setSelectedCampaign}
        selectedPlatform={selectedPlatform}
        setSelectedPlatform={setSelectedPlatform}
        onExport={handleExport}
      />

      {/* 2. Comprehensive KPI Summary Grid (7 key metrics) */}
      <OverviewKpiGrid />

      {/* 3. Performance Over Time & Trajectory Chart with Toggle */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Performance Analytics
            </span>
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-900/90 border border-white/10 rounded-xl backdrop-blur-md">
            <button
              onClick={() => setChartView('weekly')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                chartView === 'weekly'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Weekly Velocity</span>
            </button>
            <button
              onClick={() => setChartView('daily')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                chartView === 'daily'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Daily Trajectory</span>
            </button>
          </div>
        </div>

        {chartView === 'weekly' ? (
          <AnalyticsPerformanceChart />
        ) : (
          <CampaignPerformanceTrend />
        )}
      </div>

      {/* 4. Top Performing Campaigns & Top Performing Influencers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AnalyticsTopCampaigns onViewCampaigns={() => onNavigate?.('my-campaigns')} />
        <AnalyticsTopInfluencers />
      </div>

      {/* 5. Recent Activity Feed */}
      <RecentActivityFeed onViewMessages={() => onNavigate?.('brand-messages')} />
    </div>
  );
}
