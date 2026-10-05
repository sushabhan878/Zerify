'use client';

import React from 'react';
import { Inbox, MessagesSquare } from 'lucide-react';
import { ConversationItem } from '@/services/messaging.service';
import { PeerPresence } from '@/context/MessagingContext';
import LottieLoader from '@/components/ui/LottieLoader';
import ConversationSearch from './ConversationSearch';
import ConversationListItem from './ConversationListItem';
export type ConversationFilter = 'ALL' | 'UNREAD' | 'CAMPAIGN';

const TABS: { id: ConversationFilter; label: string }[] = [
  { id: 'ALL', label: 'All Chats' },
  { id: 'UNREAD', label: 'Unread' },
  { id: 'CAMPAIGN', label: 'Campaigns' },
];

const EMPTY_COPY: Record<ConversationFilter, { title: string; body: string }> = {
  ALL: {
    title: 'No conversations yet',
    body: 'Chats appear here once you apply to a campaign or a brand reaches out.',
  },
  UNREAD: {
    title: 'All caught up',
    body: 'Every conversation has been read. Nice work.',
  },
  CAMPAIGN: {
    title: 'No campaign chats',
    body: 'Threads tied to a campaign application will show up here.',
  },
};

interface Props {
  conversations: ConversationItem[];
  loading: boolean;
  activeId: string | null;
  presence: Record<string, PeerPresence>;
  filter: ConversationFilter;
  onFilterChange: (filter: ConversationFilter) => void;
  counts: Record<ConversationFilter, number>;
  searchQuery: string;
  onSearch: (q: string) => void;
  onSelect: (id: string) => void;
}

export default function ConversationSidebar({
  conversations,
  loading,
  activeId,
  presence,
  filter,
  onFilterChange,
  counts,
  searchQuery,
  onSearch,
  onSelect,
}: Props) {
  const empty = EMPTY_COPY[filter];

  return (
    <div className="w-full md:w-[350px] lg:w-[380px] border-r border-white/10 shrink-0 bg-slate-950/40 flex flex-col min-h-0">
      <div className="p-3 pb-2 border-b border-white/5 space-y-2">
        <ConversationSearch value={searchQuery} onChange={onSearch} />

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => {
            const isSelected = filter === tab.id;
            const count = counts[tab.id] || 0;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onFilterChange(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap leading-none ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-900/40'
                    : 'text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800/80 border border-white/5'
                }`}
              >
                <span>{tab.label}</span>
                {count > 0 && (
                  <span
                    className={`min-w-[15px] h-[15px] px-1 rounded-full text-[9px] font-bold flex items-center justify-center ${
                      isSelected
                        ? 'bg-purple-950/70 text-purple-200'
                        : 'bg-slate-800 text-slate-300'
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

      <div className="p-2.5 space-y-1.5 overflow-y-auto no-scrollbar flex-1 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <LottieLoader size={120} message="Loading chats" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 px-5 text-center">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              {searchQuery ? (
                <MessagesSquare className="w-5 h-5 text-purple-300" />
              ) : (
                <Inbox className="w-5 h-5 text-purple-300" />
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs font-black text-white">
                {searchQuery ? 'No matches' : empty.title}
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {searchQuery
                  ? `Nothing matched “${searchQuery}”. Try a different name.`
                  : empty.body}
              </p>
            </div>
          </div>
        ) : (
          conversations.map((conversation) => (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              active={conversation.id === activeId}
              online={Boolean(
                conversation.counterpart &&
                  presence[conversation.counterpart.userId]?.online,
              )}
              onSelect={() => onSelect(conversation.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
