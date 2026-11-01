'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface EligibilityBadgeProps {
  status: 'ELIGIBLE' | 'PARTIALLY_ELIGIBLE' | 'NOT_ELIGIBLE' | string;
  score?: number;
}

export default function EligibilityBadge({ status, score }: EligibilityBadgeProps) {
  if (status === 'ELIGIBLE') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 light:bg-emerald-50 text-emerald-400 light:text-emerald-700 border border-emerald-500/30 light:border-emerald-200">
        <CheckCircle2 className="w-3 h-3 text-emerald-400 light:text-emerald-600" />
        <span>Eligible {score ? `(${score}%)` : ''}</span>
      </span>
    );
  }

  if (status === 'PARTIALLY_ELIGIBLE') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 light:bg-amber-50 text-amber-400 light:text-amber-700 border border-amber-500/30 light:border-amber-200">
        <AlertCircle className="w-3 h-3 text-amber-400 light:text-amber-600" />
        <span>Partial Match {score ? `(${score}%)` : ''}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/10 light:bg-rose-50 text-rose-400 light:text-rose-700 border border-rose-500/30 light:border-rose-200">
      <XCircle className="w-3 h-3 text-rose-400 light:text-rose-600" />
      <span>Criteria Mismatch</span>
    </span>
  );
}
