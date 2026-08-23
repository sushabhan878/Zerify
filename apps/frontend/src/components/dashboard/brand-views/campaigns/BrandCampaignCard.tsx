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
    return `${symbol}${num.toLocaleString()}`;
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
        return 'Performance';
      case 'BARTER':
        return 'Product Barter';
      case 'HYBRID':
        return 'Hybrid';
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

  const objectivesList: string[] = Array.isArray(c.objective)
    ? c.objective
    : typeof c.objective === 'string' && c.objective
    ? [c.objective]
    : Array.isArray(c.categories)
    ? c.categories
    : [];

  const formattedDeadline = c.applicationDeadline
    ? new Date(c.applicationDeadline).toLocaleDateString(undefined, {
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
      className="group relative rounded-3xl bg-slate-950/45 border border-purple-500/20 hover:border-purple-500/40 p-6 backdrop-blur-2xl shadow-xl shadow-purple-950/20 hover:shadow-[0_16px_48px_rgba(168,85,247,0.18)] transition-all duration-300 cursor-pointer space-y-5 overflow-hidden"
    >
      {/* Ambient Purplish Glow Background Aura */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-600/20 transition-all duration-500" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-600/15 transition-all duration-500" />

      {/* Row 1: Tags on Top & Prominent Large Pricing */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
        {/* Tags Cloud on Top */}
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
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-950/40 border border-purple-500/20 text-purple-200 flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-purple-400" />
              <span>{c.industry}</span>
            </span>
          )}

          {/* Objective / Goal Tags */}
          {objectivesList.slice(0, 3).map((obj) => (
            <span
              key={obj}
              className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-600/15 border border-purple-500/25 text-purple-200"
            >
              {obj}
            </span>
          ))}

          {/* Payment Model Tag */}
          {c.budgetPaymentModel && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-950/40 border border-indigo-400/25 text-indigo-200">
              {formatPaymentModel(c.budgetPaymentModel)}
            </span>
          )}
        </div>

        {/* Large Pricing Display */}
        <div className="sm:text-right flex sm:flex-col items-baseline sm:items-end justify-between gap-0.5 flex-shrink-0">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
            Total Budget
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight leading-none flex items-baseline gap-1">
            <span>
              {c.budgetPaymentModel === 'BARTER'
                ? 'Product Barter'
                : formatCurrency(c.budgetTotalAmount, c.budgetCurrency)}
            </span>
            {c.budgetPaymentModel !== 'BARTER' && c.budgetCurrency && (
              <span className="text-xs font-bold text-emerald-300/70 uppercase">
                {c.budgetCurrency}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Row 2: Campaign Title, Description & Platforms */}
      <div className="space-y-2 relative z-10">
        <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-purple-200 transition-colors tracking-tight flex items-center gap-2">
          <span>{c.title}</span>
          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-purple-300 opacity-0 group-hover:opacity-100 transition-all -translate-y-0.5 group-hover:translate-x-0.5" />
        </h3>

        {c.description && (
          <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed font-normal">
            {c.description}
          </p>
        )}

        {/* Platforms Badges */}
        {Array.isArray(c.platforms) && c.platforms.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {c.platforms.map((p) => (
              <span
                key={p}
                className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-purple-950/30 border border-purple-500/20 text-purple-200"
              >
                {p}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Row 3: Modern Direct Metrics without dark card boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 relative z-10">
        {/* Metric 1: Creators Hired */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Creators Hired
            </span>
            <Users className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {hired}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              / {targetParticipants} slots
            </span>
          </div>
          <div className="flex items-center gap-2 max-w-xs pt-0.5">
            <div className="w-full h-1.5 bg-slate-900/80 border border-purple-500/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-purple-300 flex-shrink-0">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Metric 2: Pitches Received */}
        <div className="space-y-1.5 sm:border-l sm:border-purple-500/20 sm:pl-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Pitches Received
            </span>
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-cyan-300 tracking-tight">
              {applicants}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {applicants === 1 ? 'pitch' : 'pitches'}
            </span>
          </div>
          <span className="text-[11px] text-cyan-400/80 font-medium block">
            {applicants > 0 ? `${applicants} to review` : 'Accepting pitches'}
          </span>
        </div>

        {/* Metric 3: Escrow Status */}
        <div className="space-y-1.5 sm:border-l sm:border-purple-500/20 sm:pl-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Escrow Protection
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
              100%
            </span>
            <span className="text-xs font-semibold text-slate-400">
              Protected
            </span>
          </div>
          <span className="text-[11px] text-emerald-300/80 font-medium block">
            Automated smart escrow
          </span>
        </div>
      </div>

      {/* Row 4: Footer Meta & Manage Button */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
          {formattedDate && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              <span>Created {formattedDate}</span>
            </span>
          )}

          {formattedDeadline && (
            <span className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Deadline: {formattedDeadline}</span>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-black text-white shadow-md shadow-purple-950/40 flex items-center justify-center gap-1.5 transition-all group/btn"
        >
          <span>Manage Campaign</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
