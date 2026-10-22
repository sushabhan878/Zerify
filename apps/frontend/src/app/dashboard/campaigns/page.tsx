'use client';

import React from 'react';
import MyCampaignsSection from '@/components/dashboard/brand-views/MyCampaignsSection';
import CampaignDiscoverySection from '@/components/dashboard/influencer-views/CampaignDiscoverySection';
import ProfileCompletionBanner from '@/components/dashboard/subcomponents/ProfileCompletionBanner';
import { useDashboard } from '@/context/DashboardContext';
import { useRouter } from 'next/navigation';

export default function CampaignsPage() {
  const router = useRouter();
  const { userRole, completionPercentage } = useDashboard();

  return (
    <div className="space-y-4">
      <ProfileCompletionBanner
        completionPercentage={completionPercentage}
        onCompleteProfile={() => router.push('/dashboard/settings')}
      />
      {userRole === 'INFLUENCER' ? <CampaignDiscoverySection /> : <MyCampaignsSection />}
    </div>
  );
}
