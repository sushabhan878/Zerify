'use client';

import React from 'react';
import CampaignDiscoverySection from '@/components/dashboard/influencer-views/CampaignDiscoverySection';
import ProfileCompletionBanner from '@/components/dashboard/subcomponents/ProfileCompletionBanner';
import { useDashboard } from '@/context/DashboardContext';
import { useRouter } from 'next/navigation';

export default function CampaignDiscoveryPage() {
  const router = useRouter();
  const { completionPercentage } = useDashboard();

  return (
    <div className="space-y-4">
      <ProfileCompletionBanner
        completionPercentage={completionPercentage}
        onCompleteProfile={() => router.push('/dashboard/settings')}
      />
      <CampaignDiscoverySection />
    </div>
  );
}
