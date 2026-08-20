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
import ProfileCompletionBanner from './subcomponents/ProfileCompletionBanner';

interface BrandDashboardViewProps {
  userName: string;
  userEmail?: string;
  userHandle?: string;
  companyName?: string;
  avatarUrl?: string;
  activeRoute?: string;
  onSelectRoute?: (routeId: string) => void;
  completionPercentage?: number;
  brandProfile?: any;
}

export default function BrandDashboardView({
  userName,
  userEmail,
  userHandle,
  companyName,
  avatarUrl,
  activeRoute = 'search-creators',
  onSelectRoute,
  completionPercentage = 65,
  brandProfile,
}: BrandDashboardViewProps) {
  const renderSection = () => {
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
        return (
          <BrandSettingsSection
            userName={userName}
            userEmail={userEmail}
            userHandle={userHandle}
            companyName={companyName}
            avatarUrl={avatarUrl}
            initialData={brandProfile}
          />
        );
      case 'search-creators':
      default:
        return <SearchCreatorsSection />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Profile Completion Setup Banner (Visible on all pages until setup reaches >= 90%) */}
      <ProfileCompletionBanner
        completionPercentage={completionPercentage}
        onCompleteProfile={() => onSelectRoute?.('brand-settings')}
      />

      {/* Active Section Content */}
      {renderSection()}
    </div>
  );
}
