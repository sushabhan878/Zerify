'use client';

import React from 'react';

interface PortfolioTabProps {
  onSaveSuccess?: () => void;
}

export default function PortfolioTab({ onSaveSuccess }: PortfolioTabProps) {
  return (
    <div className="p-12 sm:p-20 rounded-2xl bg-slate-950/45 light:bg-white border border-white/10 light:border-slate-200/90 backdrop-blur-xl shadow-xl light:shadow-sm text-center flex flex-col items-center justify-center min-h-[380px] space-y-2">
      <h3 className="text-2xl sm:text-3xl font-extrabold text-white light:text-slate-900 tracking-tight">
        Coming Soon...
      </h3>
      <p className="text-xs sm:text-sm text-slate-400 light:text-slate-600">
        This feature is currently under development and will be available soon.
      </p>
    </div>
  );
}
