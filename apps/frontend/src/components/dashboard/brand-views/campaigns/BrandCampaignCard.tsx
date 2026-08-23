'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  ShieldCheck,
  ChevronRight,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import { CampaignItem } from '@/services/campaign.service';

interface BrandCampaignCardProps {
  campaign: CampaignItem;
  onClick: () => void;
}

export default function BrandCampaignCard({ campaign: c, onClick }: BrandCampaignCardProps) {
  const hired = c._count?.participants || 0;
  const applicants = c._count?.applications || 0;
  const targetParticipants = c.targetParticipants || 1;
  const progressPercent = Math.min(100, Math.round((hired / targetParticipants) * 100));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
      case 'ACTIVE':
        return {
          label: 'Active & Open',
          bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          dot: 'bg-emerald-400 animate-pulse',
        };
      case 'FILLING':
        return {
          label: 'Filling Roster',
          bg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
          dot: 'bg-purple-400 animate-pulse',
        };
      case 'PAUSED':
        return {
          label: 'Paused',
          bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          dot: 'bg-amber-400',
        };
      case 'COMPLETED':
        return {
          label: 'Completed',
          bg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
          dot: 'bg-indigo-400',
        };
      case 'DRAFT':
      default:
        return {
          label: 'Draft',
          bg: 'bg-slate-800/80 text-slate-300 border-white/10',
          dot: 'bg-slate-400',
        };
    }
  };

  const statusConfig = getStatusBadge(c.status);

  const formatCurrency = (amount?: number | string, currency?: string) => {
    if (amount === undefined || amount === null || amount === '') return 'Flexible';
    const num = Number(amount);
    if (isNaN(num)) return 'Flexible';
    const curr = currency || 'USD';
    const symbol =
      curr === 'INR' ? '₹' : curr === 'EUR' ? '€' : curr === 'GBP' ? '£' : curr === 'CAD' ? 'C$' : curr === 'AUD' ? 'A$' : '$';
    return `${symbol}${num.toLocaleString()} ${curr}`;
  };

  const formatPaymentModel = (model?: string) => {
    switch (model) {
      case 'FIXED':
        return 'Fixed Payout';
      case 'NEGOTIABLE':
        return 'Pitch / Negotiable';
      case 'RANGE':
        return 'Budget Range';
      case 'PERFORMANCE_BASED':
        return 'Performance / CPM';
      case 'BARTER':
        return 'Product Barter';
      case 'HYBRID':
        return 'Hybrid Payout';
      default:
        return model || 'Standard';
    }
  };

  const formattedDate = (c as any).createdAt
    ? new Date((c as any).createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="group relative overflow-hidden rounded-3xl bg-slate-900/80 border border-white/10 hover:border-purple-500/40 p-6 backdrop-blur-2xl shadow-xl transition-all duration-300 hover:shadow-[0_12px_40px_rgba(168,85,247,0.14)] cursor-pointer space-y-5"
    >
      {/* Top Ambient Glow Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent group-hover:via-purple-400 group-hover:h-[3px] transition-all duration-300" />
      
      {/* Subtle Background Radial Aura */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-600/20 transition-all duration-500" />

      {/* Row 1: Status, Categories & Budget Highlight */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm ${statusConfig.bg}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
            <span>{statusConfig.label}</span>
          </span>

          {/* Industry Tag */}
          {c.industry && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800/80 border border-white/10 text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-purple-400" />
              <span>{c.industry}</span>
            </span>
          )}

          {/* Payment Model Tag */}
          {c.budgetPaymentModel && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-950/40 border border-purple-400/20 text-purple-200">
              {formatPaymentModel(c.budgetPaymentModel)}
            </span>
          )}
        </div>

        {/* Budget Highlight */}
        <div className="sm:text-right flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center gap-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Campaign Budget
          </span>
          <span className="text-lg font-black text-emerald-400 tracking-tight flex items-center gap-1">
            {c.budgetPaymentModel === 'BARTER'
              ? 'Product Barter ($0 Escrow)'
              : formatCurrency(c.budgetTotalAmount, c.budgetCurrency)}
          </span>
        </div>
      </div>

      {/* Row 2: Campaign Title & Description / Platform Tags */}
      <div className="space-y-2 relative z-10">
        <h3 className="text-xl font-black text-white group-hover:text-purple-200 transition-colors tracking-tight flex items-center gap-2">
          <span>{c.title}</span>
          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-purple-300 opacity-0 group-hover:opacity-100 transition-all -translate-y-0.5 group-hover:translate-x-0.5" />
        </h3>

        {c.description && (
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-normal">
            {c.description}
          </p>
        )}

        {/* Platforms Badges Cloud */}
        {Array.isArray(c.platforms) && c.platforms.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {c.platforms.map((p) => (
              <span
                key={p}
                className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-800/60 border border-white/5 text-purple-200"
              >
                {p}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Row 3: Enhanced Metrics Card Trio */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10">
        {/* Metric 1: Creators Hired */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col justify-between space-y-2.5 group-hover:border-purple-400/20 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Creators Hired
            </span>
            <div className="w-6 h-6 rounded-lg bg-purple-500/15 text-purple-300 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-black text-white">
                {hired} <span className="text-xs text-slate-400 font-semibold">/ {targetParticipants} Slots</span>
              </span>
              <span className="text-[10px] font-bold text-purple-300">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1.5">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 2: Pitches Received */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col justify-between space-y-2.5 group-hover:border-cyan-400/20 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Pitches Received
            </span>
            <div className="w-6 h-6 rounded-lg bg-cyan-500/15 text-cyan-300 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <span className="text-sm font-black text-white block">
              {applicants} <span className="text-xs text-slate-400 font-semibold">{applicants === 1 ? 'Applicant' : 'Applicants'}</span>
            </span>
            <span className="text-[10px] text-cyan-300 font-medium block mt-0.5">
              {applicants > 0 ? `${applicants} pitches to review` : 'Accepting creator pitches'}
            </span>
          </div>
        </div>

        {/* Metric 3: Escrow Status */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col justify-between space-y-2.5 group-hover:border-emerald-400/20 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Escrow Protection
            </span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-300 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <span className="text-sm font-black text-emerald-400 block">
              100% Protected
            </span>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
              Released upon deliverable approval
            </span>
          </div>
        </div>
      </div>

      {/* Row 4: Footer Meta & Manage Button */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/5 relative z-10">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          {formattedDate && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              <span>Created {formattedDate}</span>
            </span>
          )}

          {c.applicationDeadline && (
            <span className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Deadline: {c.applicationDeadline}</span>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white shadow-md shadow-purple-950/40 flex items-center justify-center gap-1.5 transition-all group/btn"
        >
          <span>Manage Roster & Deliverables</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
