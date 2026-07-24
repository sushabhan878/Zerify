'use client';

import React from 'react';

interface AuthHeaderProps {
  badge: string;
  titlePrefix: string;
  titleHighlight: string;
  subtitle: string;
}

export default function AuthHeader({
  badge,
  titlePrefix,
  titleHighlight,
  subtitle,
}: AuthHeaderProps) {
  return (
    <div className="text-center space-y-2 mb-8">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300 mb-2">
        <span>{badge}</span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
        {titlePrefix}{' '}
        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
          {titleHighlight}
        </span>
      </h1>
      <p className="text-xs sm:text-sm text-slate-400">{subtitle}</p>
    </div>
  );
}
