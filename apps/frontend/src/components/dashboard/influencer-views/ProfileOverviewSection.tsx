'use client';

import React from 'react';
import DashboardKpiCards from './subcomponents/DashboardKpiCards';
import RecommendedBrandsCard from './subcomponents/RecommendedBrandsCard';
import RecommendedCampaignsCard from './subcomponents/RecommendedCampaignsCard';
import ActiveCollaborationsCard from './subcomponents/ActiveCollaborationsCard';

interface ProfileOverviewSectionProps {
  userName: string;
}

export default function ProfileOverviewSection({ userName }: ProfileOverviewSectionProps) {
  return (
    <div className="space-y-6">
      {/* 1. Top KPI Metrics */}
      <DashboardKpiCards />

      {/* 2. Highest Priority: AI Recommended Brands */}
      <RecommendedBrandsCard />

      {/* 3. Suggested Campaigns Opportunities */}
      <RecommendedCampaignsCard />

      {/* 4. Active Collaborations Tracker */}
      <ActiveCollaborationsCard />
    </div>
  );
}
