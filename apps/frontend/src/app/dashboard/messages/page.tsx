'use client';

import React from 'react';
import BrandMessagesSection from '@/components/dashboard/brand-views/BrandMessagesSection';
import MessagesSection from '@/components/dashboard/influencer-views/MessagesSection';
import { useDashboard } from '@/context/DashboardContext';

export default function MessagesPage() {
  const { userRole } = useDashboard();

  return (
    <div className="h-full flex flex-col">
      {userRole === 'INFLUENCER' ? <MessagesSection /> : <BrandMessagesSection />}
    </div>
  );
}
