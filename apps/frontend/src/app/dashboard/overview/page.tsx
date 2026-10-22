'use client';

import React from 'react';
import BrandOverviewSection from '@/components/dashboard/brand-views/BrandOverviewSection';
import StatisticView from '@/components/dashboard/sub-views/StatisticView';
import ProfileCompletionBanner from '@/components/dashboard/subcomponents/ProfileCompletionBanner';
import { useDashboard } from '@/context/DashboardContext';
import { useRouter } from 'next/navigation';
import { getRoutePath } from '@/utils/dashboardRoutes';

export default function OverviewPage() {
  const router = useRouter();
  const { userRole, userName, companyName, completionPercentage } = useDashboard();

  if (userRole === 'INFLUENCER') {
    return (
      <div className="space-y-4">
        <ProfileCompletionBanner
          completionPercentage={completionPercentage}
          onCompleteProfile={() => router.push('/dashboard/settings')}
        />
        <StatisticView />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ProfileCompletionBanner
        completionPercentage={completionPercentage}
        onCompleteProfile={() => router.push('/dashboard/settings')}
      />
      <BrandOverviewSection
        userName={userName}
        companyName={companyName}
        onNavigate={(routeId) => router.push(getRoutePath(routeId))}
      />
    </div>
  );
}
