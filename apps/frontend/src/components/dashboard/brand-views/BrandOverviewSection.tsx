'use client';

import React from 'react';
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
