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

interface InfluencerDashboardViewProps {
  userName: string;
  activeRoute?: string;
}

export default function InfluencerDashboardView({
  userName,
  activeRoute = 'profile-overview',
}: InfluencerDashboardViewProps) {
  switch (activeRoute) {
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
      return <SettingsSection />;
    case 'profile-overview':
    default:
      return <ProfileOverviewSection userName={userName} />;
  }
}
