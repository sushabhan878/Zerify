'use client';

import React, { Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import CampaignOverviewDashboard from '@/components/dashboard/brand-views/campaigns/CampaignOverviewDashboard';

function CampaignDetailContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const campaignId = typeof params?.id === 'string' ? params.id : '';
  const tabParam = searchParams?.get('tab');
  const collabIdParam = searchParams?.get('collabId') || searchParams?.get('participantId') || undefined;

  const initialTab =
    tabParam === 'participants' || tabParam === 'collabs' || tabParam === 'active-collabs'
      ? 'participants'
      : tabParam === 'offers'
      ? 'offers'
      : tabParam === 'brief'
      ? 'brief'
      : undefined;

  return (
    <div className="space-y-4">
      <CampaignOverviewDashboard
        campaignId={campaignId}
        onBack={() => router.push('/dashboard/campaigns')}
        initialTab={initialTab}
        initialCollabId={collabIdParam}
      />
    </div>
  );
}

export default function CampaignDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading campaign...</div>}>
      <CampaignDetailContent />
    </Suspense>
  );
}
