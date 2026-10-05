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
    <div className="text-center space-y-2 mb-6">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300 mb-1">
        <span>{badge}</span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight [font-family:'Playfair_Display',Georgia,serif]">
        {titlePrefix}{' '}
        <span className="italic bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent">
          {titleHighlight}
        </span>
      </h1>
      <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">{subtitle}</p>
    </div>
  );
}
