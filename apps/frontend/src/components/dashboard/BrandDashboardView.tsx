'use client';

import React from 'react';
import SearchCreatorsSection from './brand-views/SearchCreatorsSection';
import BrandAiRecommendationsSection from './brand-views/BrandAiRecommendationsSection';
import SavedCreatorsSection from './brand-views/SavedCreatorsSection';
import ShortlistsSection from './brand-views/ShortlistsSection';
import MyCampaignsSection from './brand-views/MyCampaignsSection';
import ActiveDealsSection from './brand-views/ActiveDealsSection';
import BrandMessagesSection from './brand-views/BrandMessagesSection';
import BrandPayoutsSection from './brand-views/BrandPayoutsSection';
import BrandSettingsSection from './brand-views/BrandSettingsSection';
import ActivityView from './sub-views/ActivityView';
import TrafficView from './sub-views/TrafficView';
import StatisticView from './sub-views/StatisticView';

interface BrandDashboardViewProps {
  userName: string;
  activeRoute?: string;
}

export default function BrandDashboardView({
  userName,
  activeRoute = 'search-creators',
}: BrandDashboardViewProps) {
  switch (activeRoute) {
    case 'activity':
      return <ActivityView />;
    case 'traffic':
      return <TrafficView />;
    case 'statistic':
      return <StatisticView />;
    case 'ai-recommendations':
      return <BrandAiRecommendationsSection />;
    case 'saved-creators':
      return <SavedCreatorsSection />;
    case 'shortlists':
      return <ShortlistsSection />;
    case 'my-campaigns':
      return <MyCampaignsSection />;
    case 'active-deals':
      return <ActiveDealsSection />;
    case 'brand-messages':
      return <BrandMessagesSection />;
    case 'payouts-escrow':
      return <BrandPayoutsSection />;
    case 'brand-settings':
      return <BrandSettingsSection />;
    case 'search-creators':
    default:
      return <SearchCreatorsSection />;
  }
}
