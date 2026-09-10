'use client';

import React from 'react';
import { Inbox, MessagesSquare } from 'lucide-react';
import { ConversationItem } from '@/services/messaging.service';
import { PeerPresence } from '@/context/MessagingContext';
import LottieLoader from '@/components/ui/LottieLoader';
import ConversationSearch from './ConversationSearch';
import ConversationListItem from './ConversationListItem';
import { ConversationFilter } from './MessagingToolbar';

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
  searchQuery,
  onSearch,
  onSelect,
}: Props) {
  const empty = EMPTY_COPY[filter];

  return (
    <div className="w-full md:w-[336px] border-r border-white/10 shrink-0 bg-slate-950/40 flex flex-col min-h-0">
      <div className="p-3.5 pb-3 border-b border-white/5">
        <ConversationSearch value={searchQuery} onChange={onSearch} />
      </div>

      <div className="p-2.5 space-y-1.5 overflow-y-auto flex-1 min-h-0">
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
