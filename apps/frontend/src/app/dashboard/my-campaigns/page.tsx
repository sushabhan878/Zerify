'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MyCampaignsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/campaigns');
  }, [router]);
  return null;
}
