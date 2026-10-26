'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function RedirectToDashboardCampaignCollab() {
  const router = useRouter();
  const params = useParams();

  const campaignId = (params?.campaignId as string) || '';
  const collaborationId = (params?.collaborationId as string) || '';

  useEffect(() => {
    if (campaignId) {
      router.replace(`/dashboard/campaigns/${campaignId}?tab=participants&collabId=${collaborationId}`);
    } else {
      router.replace('/dashboard/campaigns');
    }
  }, [campaignId, collaborationId, router]);

  return <div className="p-8 text-center text-slate-400">Opening campaign collaboration...</div>;
}
