'use client';

import React from 'react';

/** Shared avatar so the list and the header never drift apart visually. */
export default function ConversationAvatar({
  name,
  avatarUrl,
  online,
  size = 'md',
}: {
  name: string;
  avatarUrl: string | null;
  online: boolean;
  size?: 'md' | 'lg';
}) {
  const box = size === 'lg' ? 'w-11 h-11 text-sm' : 'w-10 h-10 text-xs';

  return (
    <div className="relative shrink-0">
      <div
        className={`${box} rounded-2xl bg-gradient-to-br from-purple-600/40 via-slate-900 to-indigo-600/30 border border-purple-500/30 font-black text-purple-200 flex items-center justify-center shadow-md shadow-purple-950/30 overflow-hidden`}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          name.charAt(0).toUpperCase()
        )}
      </div>

      {online && (
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950 shadow-sm">
          <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
        </span>
      )}
    </div>
  );
}
