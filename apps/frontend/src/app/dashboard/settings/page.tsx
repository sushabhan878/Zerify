'use client';

import React from 'react';
import BrandSettingsSection from '@/components/dashboard/brand-views/BrandSettingsSection';
import SettingsSection from '@/components/dashboard/influencer-views/SettingsSection';
import ProfileCompletionBanner from '@/components/dashboard/subcomponents/ProfileCompletionBanner';
import { useDashboard } from '@/context/DashboardContext';
import { useRouter } from 'next/navigation';
import { getRoutePath } from '@/utils/dashboardRoutes';

export default function SettingsPage() {
  const router = useRouter();
  const {
    userRole,
    userName,
    userEmail,
    userHandle,
    companyName,
    effectiveAvatarUrl,
    brandProfile,
    influencerProfile,
    completionPercentage,
  } = useDashboard();

  return (
    <div className="space-y-4">
      <ProfileCompletionBanner
        completionPercentage={completionPercentage}
        onCompleteProfile={() => {}}
      />
      {userRole === 'BRAND' ? (
        <BrandSettingsSection
          userName={userName}
          userEmail={userEmail}
          userHandle={userHandle}
          companyName={companyName}
          avatarUrl={effectiveAvatarUrl}
          initialData={brandProfile}
        />
      ) : (
        <SettingsSection
          userName={userName}
          userEmail={userEmail}
          userHandle={userHandle}
          avatarUrl={effectiveAvatarUrl}
          completionPercentage={completionPercentage}
          initialData={influencerProfile}
          onNavigate={(routeId) => router.push(getRoutePath(routeId))}
        />
      )}
    </div>
  );
}
