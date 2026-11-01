'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';
import MessagingWorkspace from '@/components/dashboard/messaging/MessagingWorkspace';

export default function BrandMessagesSection() {
  return (
    <div className="flex-1 min-h-0 flex flex-col h-full space-y-4">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-xl font-extrabold text-white light:text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-400 light:text-purple-600" />
            <span>Direct Messages & Inquiries</span>
          </h2>
          <p className="text-xs text-slate-400 light:text-slate-500">
            Real-time chat with creators, negotiate deliverable terms, and share campaign briefs
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <MessagingWorkspace role="BRAND" />
      </div>
    </div>
  );
}
