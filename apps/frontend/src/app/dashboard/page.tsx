'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDashboard } from '@/context/DashboardContext';
import { getRoutePath } from '@/utils/dashboardRoutes';
import LottieLoader from '@/components/ui/LottieLoader';

export default function DashboardIndexPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userRole, loading } = useDashboard();

  useEffect(() => {
    if (loading || !user) return;

    // Check if legacy query params exist (e.g., ?tab=search-creators)
    const legacyTab = searchParams.get('tab') || searchParams.get('view') || searchParams.get('screen');

    if (legacyTab) {
      const targetPath = getRoutePath(legacyTab);
      router.replace(targetPath);
      return;
    }

    // Default route based on user role
    const defaultRoute = userRole === 'BRAND' ? '/dashboard/overview' : '/dashboard/statistics';
    router.replace(defaultRoute);
  }, [user, userRole, loading, searchParams, router]);

  return (
    <div className="h-full w-full min-h-[400px] flex items-center justify-center">
      <LottieLoader size={200} message="Redirecting to your workspace..." />
    </div>
  );
}
