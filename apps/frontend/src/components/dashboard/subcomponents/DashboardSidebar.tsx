'use client';

import React from 'react';
import InfluencerSidebar from '../influencer-sidebar/InfluencerSidebar';
import BrandSidebar from '../brand-sidebar/BrandSidebar';

interface DashboardSidebarProps {
  userRole: 'BRAND' | 'INFLUENCER';
  userName: string;
  userEmail: string;
  userHandle?: string;
  companyName?: string;
  industry?: string;
  avatarUrl?: string;
  onLogout: () => void;
  activeRoute?: string;
  onSelectRoute?: (routeId: string) => void;
  isMobileDrawer?: boolean;
  style?: React.CSSProperties;
}

export default function DashboardSidebar({
  userRole,
  userName,
  userEmail,
  userHandle,
  companyName,
  industry,
  avatarUrl,
  onLogout,
  activeRoute,
  onSelectRoute,
  isMobileDrawer = false,
  style,
}: DashboardSidebarProps) {
  if (userRole === 'BRAND') {
    return (
      <BrandSidebar
        userName={userName}
        userEmail={userEmail}
        companyName={companyName || userName || 'Enterprise Partner'}
        industry={industry || 'Tech & Consumer AI'}
        logoUrl={avatarUrl}
        onLogout={onLogout}
        activeRoute={activeRoute}
        onSelectRoute={onSelectRoute}
        isMobileDrawer={isMobileDrawer}
        style={style}
      />
    );
  }

  return (
    <InfluencerSidebar
      userName={userName}
      userEmail={userEmail}
      userHandle={userHandle}
      avatarUrl={avatarUrl}
      onLogout={onLogout}
      activeRoute={activeRoute}
      onSelectRoute={onSelectRoute}
      isMobileDrawer={isMobileDrawer}
      style={style}
    />
  );
}
