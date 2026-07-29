'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  MessageSquare,
  FileText,
  DollarSign,
  ChevronDown,
  ChevronUp,
  XCircle,
  Check,
  Send,
  Sparkles,
} from 'lucide-react';

export interface ApplicationItem {
  id: number;
  brand: string;
  industry: string;
  role: string;
  appliedDate: string;
  proposedRate: string;
  deliveryTime: string;
  status: 'CONTRACT_SENT' | 'SHORTLISTED' | 'UNDER_REVIEW' | 'DECLINED';
  platforms: string[];
  verifiedBrand: boolean;
  pitchSummary: string;
  lastViewedByBrand?: string;
}

interface ApplicationCardItemProps {
  application: ApplicationItem;
  onWithdraw: (id: number) => void;
}

export default function ApplicationCardItem({ application, onWithdraw }: ApplicationCardItemProps) {
  const [showPitch, setShowPitch] = useState(false);

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
    }
  };

  const badge = getStatusBadge(application.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 sm:p-6 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-4 hover:border-purple-500/40 transition-all group"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-900/60 to-slate-900 border border-purple-500/30 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform">
            <Building2 className="w-6 h-6 text-purple-300" />
          </div>
          <div>
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

        {/* Proposed Rate Box */}
        <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-1 p-3 rounded-xl bg-slate-950/60 border border-white/10 shrink-0">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Proposed Compensation</span>
            <span className="text-xl font-black text-emerald-400">{application.proposedRate}</span>
          </div>
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            Est. Delivery: {application.deliveryTime}
          </span>
        </div>
      </div>

      {/* Details Row: Submission date & Brand view status */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 p-3 rounded-xl bg-slate-950/60 border border-white/10">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          Submitted on: <strong className="text-white">{application.appliedDate}</strong>
        </span>
        {application.lastViewedByBrand && (
          <span className="inline-flex items-center gap-1.5 text-purple-300 font-semibold text-[11px]">
            <Eye className="w-3.5 h-3.5 text-purple-400" />
            {application.lastViewedByBrand}
          </span>
        )}
      </div>

      {/* Pitch Drawer Toggle */}
      {showPitch && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/20 text-xs text-slate-300 space-y-1.5">
          <span className="font-bold text-purple-300 block flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            Submitted Proposal Pitch Snippet:
          </span>
          <p className="leading-relaxed text-slate-300 italic">{application.pitchSummary}</p>
        </motion.div>
      )}

      {/* Footer Action Bar */}
      <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPitch(!showPitch)}
            className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-purple-400" />
            <span>{showPitch ? 'Hide Submitted Pitch' : 'View Submitted Pitch'}</span>
            {showPitch ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <span className="text-slate-700">|</span>
          <button className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Message Brand</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {application.status === 'CONTRACT_SENT' && (
            <button className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-xs font-bold text-white shadow-md shadow-purple-950/40 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Review & Sign Contract</span>
            </button>
          )}
          {application.status !== 'DECLINED' && (
            <button
              onClick={() => onWithdraw(application.id)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/50 text-xs font-bold text-slate-400 hover:text-rose-300 border border-white/10 transition-all flex items-center gap-1"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Withdraw Pitch</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
