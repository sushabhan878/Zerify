'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { MessageItem } from '@/services/messaging.service';

/**
 * System messages are deliberately not styled as bubbles — the user must be
 * able to tell platform-generated copy from something a person typed.
 */
export default function SystemMessage({ message }: { message: MessageItem }) {
  const time = new Date(message.createdAt).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="flex justify-center py-2">
      <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-purple-500/[0.07] border border-purple-500/20 max-w-md backdrop-blur-sm">
        <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />
        <span className="text-[11px] font-semibold text-slate-300 text-center leading-snug">
          {message.content}
        </span>
        <span className="text-[9.5px] font-bold text-slate-600 shrink-0">{time}</span>
      </div>
    </div>
  );
}
