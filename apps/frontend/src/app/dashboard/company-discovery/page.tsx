'use client';

import React from 'react';
import CompanyDiscoverySection from '@/components/dashboard/influencer-views/CompanyDiscoverySection';
import ProfileCompletionBanner from '@/components/dashboard/subcomponents/ProfileCompletionBanner';
import { useDashboard } from '@/context/DashboardContext';
import { useRouter } from 'next/navigation';

export default function CompanyDiscoveryPage() {
  const router = useRouter();
  const { completionPercentage } = useDashboard();

  return (
    <div className="space-y-4">
      <ProfileCompletionBanner
        completionPercentage={completionPercentage}
        onCompleteProfile={() => router.push('/dashboard/settings')}
      />
      <CompanyDiscoverySection />
    </div>
  );
}
