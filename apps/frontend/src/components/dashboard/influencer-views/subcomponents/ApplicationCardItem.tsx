'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  CheckCircle2,
  Clock,
  MessageSquare,
  Sparkles,
  XCircle,
  Check,
  RefreshCw,
  ArrowUpRight,
} from 'lucide-react';

export interface ApplicationItem {
  id: string | number;
  brand: string;
  brandLogo?: string;
  industry: string;
  role: string;
  appliedDate: string;
  proposedRate: string;
  proposedAmount?: number;
  deliveryTime: string;
  status: 'CONTRACT_SENT' | 'SHORTLISTED' | 'UNDER_REVIEW' | 'DECLINED' | 'COUNTER_OFFER';
  platforms: string[];
  verifiedBrand: boolean;
  pitchSummary: string;
  lastViewedByBrand?: string;
  isCounterOffer?: boolean;
  counterRate?: string;
  counterAmount?: number;
  counterNotes?: string;
  offerId?: string;
}

interface ApplicationCardItemProps {
  application: ApplicationItem;
  onWithdraw: (id: string | number) => void;
  onAcceptOffer?: (offerId?: string, appId?: string | number) => void;
  onDeclineOffer?: (offerId?: string, appId?: string | number) => void;
}

export default function ApplicationCardItem({
  application,
  onWithdraw,
  onAcceptOffer,
  onDeclineOffer,
}: ApplicationCardItemProps) {
  const getStatusBadge = (status: ApplicationItem['status']) => {
    switch (status) {
      case 'CONTRACT_SENT':
        return {
          label: 'Contract Sent',
          gradient: 'border-emerald-400/50 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 shadow-emerald-950/80',
        };
      case 'SHORTLISTED':
        return {
          label: 'Shortlisted',
          gradient: 'border-purple-400/50 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 shadow-purple-950/80',
        };
      case 'UNDER_REVIEW':
        return {
          label: 'Under Review',
          gradient: 'border-amber-400/50 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 shadow-amber-950/80',
        };
      case 'DECLINED':
        return {
          label: 'Not Selected',
          gradient: 'border-rose-400/50 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 shadow-rose-950/80',
        };
      case 'COUNTER_OFFER':
        return {
          label: 'Counter Offer',
          gradient: 'border-amber-400/50 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 shadow-amber-950/80',
        };
    }
  };

  const badge = getStatusBadge(application.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-visible mt-4 p-5 sm:p-6 pr-6 sm:pr-8 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-4 hover:border-purple-500/40 transition-all"
    >
      {/* Floating Status Badge Overlapping Top-Right Corner */}
      <div
        className="absolute right-6 sm:right-8 z-20 pointer-events-none flex items-center gap-2"
        style={{ top: '0px', transform: 'translateY(-50%)' }}
      >
        {application.isCounterOffer && (
          <span className="px-3 py-1 rounded-full border border-amber-400/50 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white text-[11px] font-black tracking-wide shadow-xl shadow-amber-950/80 ring-4 ring-[#080B14] flex items-center gap-1">
            <RefreshCw className="w-3 h-3 text-amber-100" />
            <span>Counter Offer</span>
          </span>
        )}
        <span
          className={`px-3.5 sm:px-4 py-1.5 rounded-full border text-xs sm:text-sm font-black tracking-wide text-white flex items-center gap-1.5 shadow-xl ring-4 ring-[#080B14] ${badge.gradient}`}
        >
          <Sparkles className="w-3.5 h-3.5 text-white shrink-0" />
          <span>{badge.label}</span>
        </span>
      </div>

      {/* Header Row: Company Logo covering text height (Left) and Proposed Rate (Right) */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-3.5 sm:gap-4 items-stretch min-w-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-900/60 to-slate-900 shadow-md">
            {application.brandLogo ? (
              <img
                src={application.brandLogo}
                alt={`${application.brand} logo`}
                className="h-full w-full object-cover"
              />
            ) : (
              <Building2 className="h-7 w-7 sm:h-8 sm:w-8 text-purple-300" />
            )}
          </div>
          <div className="min-w-0 flex flex-col justify-between py-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-purple-300">{application.brand}</span>
              {application.verifiedBrand && (
                <span title="Verified Brand" className="inline-flex items-center text-purple-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white truncate leading-snug">
              {application.role}
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              {application.industry}
            </p>
          </div>
        </div>

        {/* Amount Display */}
        <div className="shrink-0 text-right self-end sm:self-center">
          {application.isCounterOffer && application.counterRate ? (
            <div className="flex flex-col items-end">
              <span className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
                {application.counterRate}
              </span>
              <span className="text-[11px] text-slate-400 line-through">
                Original Pitch: {application.proposedRate}
              </span>
            </div>
          ) : (
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {application.proposedRate}
            </span>
          )}
        </div>
      </header>

      {/* Middle: Brand Counter Offer Details Banner if active */}
      {application.isCounterOffer && application.counterNotes && (
        <div className="p-3 sm:p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200/90 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Brand Counter Offer Rationale</span>
          </div>
          <p className="leading-relaxed text-amber-100 text-xs">
            {application.counterNotes.replace('[COUNTER_OFFER]', '').trim()}
          </p>
        </div>
      )}

      {/* Middle: Submitted Pitch / Proposal Details (Without background box) */}
      <div className="space-y-1">
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
          {application.pitchSummary || 'Pitch proposal submitted for brand review.'}
        </p>
      </div>

      {/* Footer Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/5">
        {/* Left: Submission Date & Message Brand */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Submitted on: <strong className="text-white font-bold">{application.appliedDate}</strong>
          </span>
          <span className="text-slate-700">|</span>
          <button className="group text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors cursor-pointer">
            <MessageSquare className="w-3.5 h-3.5 group-hover:scale-125 transition-transform duration-200" />
            <span>Message Brand</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {application.isCounterOffer ? (
            <>
              <button
                onClick={() => onDeclineOffer?.(application.offerId, application.id)}
                type="button"
                className="group inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-950/40 to-red-950/30 hover:from-rose-900/60 hover:to-red-900/50 border border-rose-500/30 hover:border-rose-400/60 px-3.5 py-2 text-xs font-bold text-rose-200 hover:text-white shadow-md shadow-rose-950/30 hover:shadow-lg hover:shadow-rose-950/60 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-400 group-hover:text-rose-200 group-hover:scale-125 transition-transform duration-200 shrink-0" />
                <span>Decline Counter</span>
              </button>
              <button
                onClick={() => onAcceptOffer?.(application.offerId, application.id)}
                type="button"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-lg shadow-amber-950/50 hover:shadow-amber-900/70 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Check className="w-4 h-4 text-white group-hover:scale-125 transition-transform duration-200 shrink-0" />
                <span>Accept Counter Offer</span>
                <ArrowUpRight className="h-4 w-4 text-white/90 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:scale-125 transition-all duration-200 shrink-0" />
              </button>
            </>
          ) : (
            <>
              {application.status === 'CONTRACT_SENT' && (
                <button
                  type="button"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:via-indigo-500 hover:to-pink-500 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-purple-950/50 hover:shadow-purple-900/70 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Check className="w-4 h-4 text-white group-hover:scale-125 transition-transform duration-200 shrink-0" />
                  <span>Review & Sign Contract</span>
                </button>
              )}
              {application.status !== 'DECLINED' && (
                <button
                  onClick={() => onWithdraw(application.id)}
                  type="button"
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-950/40 to-red-950/30 hover:from-rose-900/60 hover:to-red-900/50 border border-rose-500/30 hover:border-rose-400/60 px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-rose-200 hover:text-white shadow-md shadow-rose-950/30 hover:shadow-lg hover:shadow-rose-950/60 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <XCircle className="w-4 h-4 text-rose-400 group-hover:text-rose-200 group-hover:scale-125 transition-transform duration-200 shrink-0" />
                  <span>Withdraw Pitch</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
