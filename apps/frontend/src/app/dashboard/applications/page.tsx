'use client';

import React from 'react';
import ApplicationsSection from '@/components/dashboard/influencer-views/ApplicationsSection';
import ProfileCompletionBanner from '@/components/dashboard/subcomponents/ProfileCompletionBanner';
import { useDashboard } from '@/context/DashboardContext';
import { useRouter } from 'next/navigation';
import { getRoutePath } from '@/utils/dashboardRoutes';

export default function ApplicationsPage() {
  const router = useRouter();
  const { completionPercentage } = useDashboard();

  return (
    <div className="space-y-4">
      <ProfileCompletionBanner
        completionPercentage={completionPercentage}
        onCompleteProfile={() => router.push('/dashboard/settings')}
      />
      <ApplicationsSection onNavigate={(routeId) => router.push(getRoutePath(routeId))} />
    </div>
  );
}
