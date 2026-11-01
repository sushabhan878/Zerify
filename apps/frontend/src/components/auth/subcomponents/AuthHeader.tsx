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
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 light:bg-purple-50 border border-purple-500/20 light:border-purple-200 text-xs font-semibold text-purple-300 light:text-purple-700 mb-1 shadow-sm">
        <span>{badge}</span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-semibold text-white light:text-slate-900 tracking-tight [font-family:'Playfair_Display',Georgia,serif]">
        {titlePrefix}{' '}
        <span className="italic bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 light:from-purple-600 light:via-pink-600 light:to-indigo-600 bg-clip-text text-transparent">
          {titleHighlight}
        </span>
      </h1>
      <p className="text-xs sm:text-sm text-slate-300 light:text-slate-600 max-w-sm mx-auto leading-relaxed">{subtitle}</p>
    </div>
  );
}
