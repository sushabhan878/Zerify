'use client';

import React from 'react';
import BrandPayoutsSection from '@/components/dashboard/brand-views/BrandPayoutsSection';
import PaymentsSection from '@/components/dashboard/influencer-views/PaymentsSection';
import ProfileCompletionBanner from '@/components/dashboard/subcomponents/ProfileCompletionBanner';
import { useDashboard } from '@/context/DashboardContext';
import { useRouter } from 'next/navigation';

export default function PayoutsPage() {
  const router = useRouter();
  const { userRole, completionPercentage } = useDashboard();

  return (
    <div className="space-y-4">
      <ProfileCompletionBanner
        completionPercentage={completionPercentage}
        onCompleteProfile={() => router.push('/dashboard/settings')}
      />
      {userRole === 'INFLUENCER' ? <PaymentsSection /> : <BrandPayoutsSection />}
    </div>
  );
}
