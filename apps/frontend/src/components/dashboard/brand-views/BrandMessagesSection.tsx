'use client';

import React from 'react';
import MessagingWorkspace from '@/components/dashboard/messaging/MessagingWorkspace';

export default function BrandMessagesSection() {
  return (
    <div className="flex-1 min-h-0 flex flex-col h-full">
      <MessagingWorkspace role="BRAND" />
    </div>
  );
}
