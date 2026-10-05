'use client';

import React from 'react';

export default function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 px-1 pb-1">
      <div className="flex items-center gap-1 px-3 py-2 rounded-2xl rounded-bl-none bg-slate-900 border border-white/10">
        {[0, 0.15, 0.3].map((delay) => (
          <span
            key={delay}
            className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce"
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
      </div>
      <span className="text-[10px] font-semibold text-slate-500">{name} is typing…</span>
    </div>
  );
}
