'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import CampaignOverviewDashboard from '@/components/dashboard/brand-views/campaigns/CampaignOverviewDashboard';
import { useDashboard } from '@/context/DashboardContext';

export default function CampaignDetailPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = typeof params?.id === 'string' ? params.id : '';

  return (
    <div className="space-y-4">
      <CampaignOverviewDashboard
        campaignId={campaignId}
        onBack={() => router.push('/dashboard/campaigns')}
      />
    </div>
  );
}
