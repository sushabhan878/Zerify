'use client';

import React from 'react';
import ProfileOverviewSection from './influencer-views/ProfileOverviewSection';
import CompanyDiscoverySection from './influencer-views/CompanyDiscoverySection';
import AiProfileMatchSection from './influencer-views/AiProfileMatchSection';
import CampaignInvitationsSection from './influencer-views/CampaignInvitationsSection';
import ActiveCampaignsSection from './influencer-views/ActiveCampaignsSection';
import MessagesSection from './influencer-views/MessagesSection';
import ApplicationsSection from './influencer-views/ApplicationsSection';
import MyNetworkSection from './influencer-views/MyNetworkSection';
import PaymentsSection from './influencer-views/PaymentsSection';
import SettingsSection from './influencer-views/SettingsSection';
import ActivityView from './sub-views/ActivityView';
import TrafficView from './sub-views/TrafficView';
import StatisticView from './sub-views/StatisticView';
import ProfileCompletionBanner from './subcomponents/ProfileCompletionBanner';

interface InfluencerDashboardViewProps {
  userName: string;
  userEmail?: string;
  userHandle?: string;
  avatarUrl?: string;
  activeRoute?: string;
  onSelectRoute?: (routeId: string) => void;
  completionPercentage?: number;
}

export default function InfluencerDashboardView({
  userName,
  userEmail,
  userHandle,
  avatarUrl,
  activeRoute = 'profile-overview',
  onSelectRoute,
  completionPercentage = 65,
}: InfluencerDashboardViewProps) {
  const renderSection = () => {
    switch (activeRoute) {
      case 'activity':
        return <ActivityView />;
      case 'traffic':
        return <TrafficView />;
      case 'statistic':
        return <StatisticView />;
      case 'company-discovery':
        return <CompanyDiscoverySection />;
      case 'ai-profile-match':
        return <AiProfileMatchSection />;
      case 'campaign-invitations':
        return <CampaignInvitationsSection />;
      case 'active-campaigns':
        return <ActiveCampaignsSection />;
      case 'messages':
        return <MessagesSection />;
      case 'applications':
        return <ApplicationsSection />;
      case 'my-network':
        return <MyNetworkSection />;
      case 'payments':
        return <PaymentsSection />;
      case 'settings':
        return (
          <SettingsSection
            userName={userName}
            userEmail={userEmail}
            userHandle={userHandle}
            avatarUrl={avatarUrl}
          />
        );
      case 'profile-overview':
      default:
        return <ProfileOverviewSection userName={userName} />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Profile Completion Setup Banner (Visible on all pages until setup reaches >= 90%) */}
      <ProfileCompletionBanner
        completionPercentage={completionPercentage}
        onCompleteProfile={() => onSelectRoute?.('settings')}
      />

      {/* Active Section Content */}
      {renderSection()}
    </div>
  );
}
