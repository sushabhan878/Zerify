'use client';

import React from 'react';
import CampaignInvitationsSection from '@/components/dashboard/influencer-views/CampaignInvitationsSection';
import ProfileCompletionBanner from '@/components/dashboard/subcomponents/ProfileCompletionBanner';
import { useDashboard } from '@/context/DashboardContext';
import { useRouter } from 'next/navigation';
import { getRoutePath } from '@/utils/dashboardRoutes';

export default function CampaignInvitationsPage() {
  const router = useRouter();
  const { completionPercentage } = useDashboard();

  return (
    <div className="space-y-4">
      <ProfileCompletionBanner
        completionPercentage={completionPercentage}
        onCompleteProfile={() => router.push('/dashboard/settings')}
      />
      <CampaignInvitationsSection onNavigate={(routeId) => router.push(getRoutePath(routeId))} />
    </div>
  );
}
