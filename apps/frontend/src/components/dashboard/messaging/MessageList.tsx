'use client';

import React, { useEffect, useRef } from 'react';
import { ChevronUp, Loader2, MessageSquare } from 'lucide-react';
import { MessageItem } from '@/services/messaging.service';
import MessageBubble from './MessageBubble';
import SystemMessage from './SystemMessage';
import DateSeparator from './DateSeparator';
import TypingIndicator from './TypingIndicator';

interface Props {
  messages: MessageItem[];
  currentUserId: string | null;
  loading: boolean;
  hasMore: boolean;
  onLoadOlder: () => void;
  onRetry: (clientMessageId: string) => void;
  typingName: string | null;
}

function sameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export default function MessageList({
  messages,
  currentUserId,
  loading,
  hasMore,
  onLoadOlder,
  onRetry,
  typingName,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const count = messages.length;

  // Auto-scroll on new messages. Loading older pages prepends, so the count
  // check keeps the view from jumping when history is fetched.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [count, typingName]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-purple-300" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-black text-white">No messages yet</p>
          <p className="text-[11px] text-slate-400">Say hello to start the conversation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-2.5 overflow-y-auto no-scrollbar flex-1 min-h-0">
      {hasMore && (
        <div className="flex justify-center pb-1">
          <button
            onClick={onLoadOlder}
            className="px-3 py-1.5 rounded-full bg-slate-900/80 border border-white/10 text-[10px] font-bold text-slate-300 hover:text-white hover:border-purple-500/40 transition-colors flex items-center gap-1.5"
          >
            <ChevronUp className="w-3 h-3" />
            Load older messages
          </button>
        </div>
      )}

      {messages.map((message, index) => {
        const previous = messages[index - 1];
        const showSeparator = !previous || !sameDay(previous.createdAt, message.createdAt);
        // Consecutive messages from the same author render as one visual group.
        const grouped =
          !showSeparator &&
          previous?.type !== 'SYSTEM' &&
          message.type !== 'SYSTEM' &&
          previous?.senderId === message.senderId;

        return (
          <React.Fragment key={message.id}>
            {showSeparator && <DateSeparator iso={message.createdAt} />}
            {message.type === 'SYSTEM' ? (
              <SystemMessage message={message} />
            ) : (
              <MessageBubble
                message={message}
                own={Boolean(currentUserId) && message.senderId === currentUserId}
                grouped={grouped}
                onRetry={onRetry}
              />
            )}
          </React.Fragment>
        );
      })}

      {typingName && <TypingIndicator name={typingName} />}
      <div ref={bottomRef} />
    </div>
  );
}
