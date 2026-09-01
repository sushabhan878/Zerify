'use client';

import React, { useState } from 'react';
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
