'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { ConnectionStatus } from '@/hooks/useMessagingSocket';

import { ConversationFilter } from './ConversationSidebar';
export type { ConversationFilter };

const STATUS_COPY: Record<ConnectionStatus, { label: string; dot: string; text: string }> = {
  CONNECTED: { label: 'Live', dot: 'bg-emerald-500', text: 'text-emerald-400' },
  CONNECTING: { label: 'Connecting', dot: 'bg-amber-500 animate-pulse', text: 'text-amber-400' },
  RECONNECTING: { label: 'Reconnecting', dot: 'bg-amber-500 animate-pulse', text: 'text-amber-400' },
  DISCONNECTED: { label: 'Offline', dot: 'bg-rose-500', text: 'text-rose-400' },
};

interface Props {
  role: 'BRAND' | 'INFLUENCER';
  filter: ConversationFilter;
  onFilterChange: (next: ConversationFilter) => void;
  counts: Record<ConversationFilter, number>;
  connectionStatus: ConnectionStatus;
}

export default function MessagingToolbar({
  role,
  filter,
  onFilterChange,
  counts,
  connectionStatus,
}: Props) {
  const status = STATUS_COPY[connectionStatus];

  const tabs: { id: ConversationFilter; label: string }[] = [
    { id: 'ALL', label: 'All Chats' },
    { id: 'UNREAD', label: 'Unread' },
    { id: 'CAMPAIGN', label: 'Campaigns' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            <span>Messages</span>
          </h2>
          <p className="text-xs text-slate-400">
            {role === 'BRAND'
              ? 'Talk terms with creators, share briefs, and keep every collaboration in one thread'
              : 'Reply to brands, share your deck, and track every collaboration in one thread'}
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shrink-0">
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          <span className={`text-[10px] font-black uppercase tracking-wider ${status.text}`}>
            {status.label}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 border border-white/10 rounded-2xl backdrop-blur-xl w-fit">
        {tabs.map((tab) => {
          const isSelected = filter === tab.id;
          const count = counts[tab.id];
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onFilterChange(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>{tab.label}</span>
              {count > 0 && (
                <span
                  className={`px-1.5 rounded-full text-[10px] font-black ${
                    isSelected ? 'bg-purple-950/60 text-purple-200' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
