'use client';

import React from 'react';
import { ConversationItem } from '@/services/messaging.service';
import ConversationAvatar from './ConversationAvatar';

function relativeTime(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  const now = new Date();

  if (now.getTime() - date.getTime() < 60_000) return 'now';
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function ConversationListItem({
  conversation,
  active,
  online,
  onSelect,
}: {
  conversation: ConversationItem;
  active: boolean;
  online: boolean;
  onSelect: () => void;
}) {
  const name = conversation.counterpart?.name ?? 'Zerify User';
  const unread = conversation.unreadCount || 0;

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-2xl transition-all flex items-center gap-3 relative border ${
        active
          ? 'bg-gradient-to-r from-purple-600/25 via-purple-600/10 to-transparent border-purple-500/40 shadow-md shadow-purple-950/30'
          : 'border-transparent hover:bg-white/5 hover:border-white/10'
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-[3px] rounded-r-full bg-gradient-to-b from-purple-400 to-pink-500" />
      )}

      <ConversationAvatar
        name={name}
        avatarUrl={conversation.counterpart?.avatarUrl ?? null}
        online={online}
      />

      <div className="flex-1 overflow-hidden min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-xs truncate ${
              unread > 0 ? 'font-black text-white' : 'font-bold text-slate-200'
            }`}
          >
            {name}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {unread > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-[9.5px] font-black text-white flex items-center justify-center shadow-sm shadow-purple-950/50">
                {unread > 99 ? '99+' : unread}
              </span>
            )}
            <span
              className={`text-[10px] font-bold ${
                unread > 0 ? 'text-purple-300' : 'text-slate-500'
              }`}
            >
              {relativeTime(conversation.lastMessageAt)}
            </span>
          </div>
        </div>

        {conversation.campaign?.title && (
          <span className="mt-1 inline-block max-w-full truncate px-1.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-[9.5px] font-black uppercase tracking-wide text-purple-300">
            {conversation.campaign.title}
          </span>
        )}
      </div>
    </button>
  );
}
