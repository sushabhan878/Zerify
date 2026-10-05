'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  CheckCircle2,
  Clock,
  MessageSquare,
  FileText,
  XCircle,
  Check,
  RefreshCw,
} from 'lucide-react';

export interface ApplicationItem {
  id: string | number;
  brand: string;
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
        return { label: 'Contract Sent', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'SHORTLISTED':
        return { label: 'Shortlisted', color: 'bg-purple-500/10 text-purple-300 border-purple-500/30' };
      case 'UNDER_REVIEW':
        return { label: 'Under Review', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
      case 'DECLINED':
        return { label: 'Not Selected', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
      case 'COUNTER_OFFER':
        return { label: 'Counter Offer', color: 'bg-amber-500/15 text-amber-300 border-amber-500/35' };
    }
  };

  const badge = getStatusBadge(application.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-5 sm:p-6 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-4 hover:border-purple-500/40 transition-all group"
    >
      {/* Overlapping Counter Offer Tag on Top Left Corner */}
      {application.isCounterOffer && (
        <div className="absolute -top-3 left-4 sm:left-6 z-20">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white text-[10px] font-black uppercase tracking-wider shadow-lg shadow-amber-950/60 border border-amber-300/40">
            <RefreshCw className="w-3 h-3 text-amber-100" />
            <span>Counter offer</span>
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl bg-gradient-to-br from-purple-900/60 to-slate-900 border border-purple-500/30 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform">
            <Building2 className="w-8 h-8 text-purple-300" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="text-xs font-black text-purple-300">{application.brand}</span>
              {application.verifiedBrand && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-extrabold text-purple-300">
                  <CheckCircle2 className="w-3 h-3 text-purple-400" /> Verified
                </span>
              )}
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${badge.color}`}>
                {badge.label}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white">{application.role}</h3>
            <span className="text-xs text-slate-400 font-medium">{application.industry}</span>
          </div>
        </div>

        {/* Amount Display */}
        <div className="shrink-0 text-right sm:text-right">
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
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
              {application.proposedRate}
            </span>
          )}
        </div>
      </div>

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

      {/* Middle: Submitted Pitch / Proposal Details */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-slate-300 space-y-1.5">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-300 uppercase tracking-wider">
          <FileText className="w-3.5 h-3.5 text-purple-400" />
          <span>Submitted Pitch Proposal</span>
        </div>
        <p className="leading-relaxed text-slate-300 line-clamp-3">
          {application.pitchSummary || 'Pitch proposal submitted for brand review.'}
        </p>
      </div>

      {/* Footer Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Left: Submission Date & Message Brand */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Submitted on: <strong className="text-white font-bold">{application.appliedDate}</strong>
          </span>
          <span className="text-slate-700">|</span>
          <button className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Message Brand</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {application.isCounterOffer ? (
            <>
              <button
                onClick={() => onDeclineOffer?.(application.offerId, application.id)}
                type="button"
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/50 text-xs font-bold text-slate-400 hover:text-rose-300 border border-white/10 transition-all flex items-center gap-1 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Decline Counter</span>
              </button>
              <button
                onClick={() => onAcceptOffer?.(application.offerId, application.id)}
                type="button"
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-xs font-bold text-white shadow-md shadow-amber-950/40 flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Accept Counter Offer</span>
              </button>
            </>
          ) : (
            <>
              {application.status === 'CONTRACT_SENT' && (
                <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-xs font-bold text-white shadow-md shadow-purple-950/40 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Review & Sign Contract</span>
                </button>
              )}
              {application.status !== 'DECLINED' && (
                <button
                  onClick={() => onWithdraw(application.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/50 text-xs font-bold text-slate-400 hover:text-rose-300 border border-white/10 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
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
