'use client';

import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import { GstVerificationStatus } from './types';

interface GstStatusBadgeProps {
  status: GstVerificationStatus;
  providerStatus?: string | null;
  className?: string;
}

export default function GstStatusBadge({
  status,
  className = '',
}: GstStatusBadgeProps) {
  switch (status) {
    case 'VERIFIED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Verified GSTIN</span>
        </span>
      );

    case 'PENDING':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm animate-pulse ${className}`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>Verifying with Cashfree...</span>
        </span>
      );

    case 'MISMATCH':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/35 shadow-sm shadow-amber-500/10 ${className}`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Name Mismatch</span>
        </span>
      );

    case 'INACTIVE':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-sm ${className}`}
        >
          <XCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>Inactive in GST Portal</span>
        </span>
      );

    case 'FAILED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-sm ${className}`}
        >
          <XCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>Verification Failed</span>
        </span>
      );

    case 'REVIEW_REQUIRED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30 shadow-sm ${className}`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
          <span>Review Required</span>
        </span>
      );

    case 'UNVERIFIED':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800/80 text-slate-400 border border-white/5 shadow-sm ${className}`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
          <span>Unverified</span>
        </span>
      );
  }
}
