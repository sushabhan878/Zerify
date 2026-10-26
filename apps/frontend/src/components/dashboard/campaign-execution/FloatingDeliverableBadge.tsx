'use client';

import React from 'react';
import { CheckCircle2, Clock, Sparkles, X, Globe } from 'lucide-react';

interface FloatingDeliverableBadgeProps {
  status: string;
  className?: string;
}

export default function FloatingDeliverableBadge({ status, className = '' }: FloatingDeliverableBadgeProps) {
  const norm = (status || '').toUpperCase();
  const isVerified = /VERIFIED|COMPLETED/.test(norm);
  const isReadyToPublish = /READY_TO_PUBLISH|APPROVED/.test(norm);
  const isPublished = /PUBLISHED/.test(norm);
  const isRevision = /REVISION|REJECT|CANCEL|FAIL/.test(norm);
  const isSubmitted = /SUBMITTED|IN_REVIEW|REVIEW/.test(norm);

  if (isVerified) {
    return (
      <span className={`px-5 sm:px-6 py-2 sm:py-2.5 rounded-full border border-emerald-400/50 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white text-sm sm:text-[14px] font-black tracking-wide flex items-center gap-2 shadow-2xl shadow-emerald-950/80 ring-4 ring-[#090C15] group-hover:scale-105 transition-all duration-300 ${className}`}>
        <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
        <span>Approved</span>
      </span>
    );
  }

  if (isReadyToPublish) {
    return (
      <span className={`px-5 sm:px-6 py-2 sm:py-2.5 rounded-full border border-cyan-400/50 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white text-sm sm:text-[14px] font-black tracking-wide flex items-center gap-2 shadow-2xl shadow-cyan-950/80 ring-4 ring-[#090C15] group-hover:scale-105 transition-all duration-300 ${className}`}>
        <Globe className="w-4 h-4 text-cyan-200 animate-pulse shrink-0" />
        <span>Ready to Publish</span>
      </span>
    );
  }

  if (isPublished) {
    return (
      <span className={`px-5 sm:px-6 py-2 sm:py-2.5 rounded-full border border-purple-400/50 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white text-sm sm:text-[14px] font-black tracking-wide flex items-center gap-2 shadow-2xl shadow-purple-950/80 ring-4 ring-[#090C15] group-hover:scale-105 transition-all duration-300 ${className}`}>
        <Clock className="w-4 h-4 text-purple-200 animate-pulse shrink-0" />
        <span>Published · Verification Pending</span>
      </span>
    );
  }

  if (isRevision) {
    return (
      <span className={`px-5 sm:px-6 py-2 sm:py-2.5 rounded-full border border-rose-400/50 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 text-white text-sm sm:text-[14px] font-black tracking-wide flex items-center gap-2 shadow-2xl shadow-rose-950/80 ring-4 ring-[#090C15] group-hover:scale-105 transition-all duration-300 ${className}`}>
        <X className="w-4 h-4 text-rose-200 shrink-0" />
        <span>{norm === 'REVISION_REQUESTED' ? 'Revision Requested' : 'Rejected'}</span>
      </span>
    );
  }

  if (isSubmitted) {
    return (
      <span className={`px-5 sm:px-6 py-2 sm:py-2.5 rounded-full border border-purple-400/50 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white text-sm sm:text-[14px] font-black tracking-wide flex items-center gap-2 shadow-2xl shadow-purple-950/80 ring-4 ring-[#090C15] group-hover:scale-105 transition-all duration-300 ${className}`}>
        <Sparkles className="w-4 h-4 text-purple-200 animate-pulse shrink-0" />
        <span>Ready for Review</span>
      </span>
    );
  }

  // PENDING or default
  return (
    <span className={`px-5 sm:px-6 py-2 sm:py-2.5 rounded-full border border-amber-400/50 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 text-white text-sm sm:text-[14px] font-black tracking-wide flex items-center gap-2 shadow-2xl shadow-amber-950/80 ring-4 ring-[#090C15] group-hover:scale-105 transition-all duration-300 ${className}`}>
      <Clock className="w-4 h-4 text-amber-200 animate-pulse shrink-0" />
      <span>Pending</span>
    </span>
  );
}
