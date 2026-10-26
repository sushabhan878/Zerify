'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import { CampaignItem } from '@/services/campaign.service';
import { formatCurrency as formatMoney } from '@/utils/currency';
import { useCurrency } from '@/context/CurrencyContext';
import { PlatformBadge } from '../find-influencers/CreatorCard';
import CampaignActions from './CampaignActions';

interface BrandCampaignCardProps {
  campaign: CampaignItem;
  onClick: () => void;
  onUpdated: () => void;
}

export default function BrandCampaignCard({ campaign: c, onClick, onUpdated }: BrandCampaignCardProps) {
  const { currency: userCurrency, convertAndFormat } = useCurrency();
  const hired = c._count?.participants || 0;
  const applicants = Array.isArray((c as any).applications)
    ? (c as any).applications.filter(
        (app: any) =>
          app.reviewNotes !== 'DIRECT_INVITE' &&
          app.applicationMessage !== 'Official brand collaboration invite' &&
          app.applicationMessage !== 'Direct brand invitation'
      ).length
    : c._count?.applications || 0;
  const targetParticipants = c.targetParticipants || 1;
  const progressPercent = Math.min(100, Math.round((hired / targetParticipants) * 100));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
      case 'ACTIVE':
        return {
          label: 'Active & Open',
          gradient: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500',
          border: 'border-emerald-400/60',
          shadow: 'shadow-lg shadow-emerald-600/30',
          dot: 'bg-emerald-200 animate-pulse shadow-sm',
        };
      case 'FILLING':
        return {
          label: 'Filling Roster',
          gradient: 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600',
          border: 'border-purple-400/60',
          shadow: 'shadow-lg shadow-purple-600/30',
          dot: 'bg-purple-200 animate-pulse shadow-sm',
        };
      case 'PAUSED':
        return {
          label: 'Paused',
          gradient: 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600',
          border: 'border-amber-400/60',
          shadow: 'shadow-lg shadow-amber-600/30',
          dot: 'bg-amber-200 shadow-sm',
        };
      case 'COMPLETED':
        return {
          label: 'Completed',
          gradient: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600',
          border: 'border-blue-400/60',
          shadow: 'shadow-lg shadow-blue-600/30',
          dot: 'bg-blue-200 shadow-sm',
        };
      case 'DRAFT':
      default:
        return {
          label: 'Draft',
          gradient: 'bg-gradient-to-r from-slate-700 via-slate-800 to-slate-700',
          border: 'border-slate-500/60',
          shadow: 'shadow-lg shadow-slate-900/40',
          dot: 'bg-slate-400',
        };
    }
  };

  const statusConfig = getStatusBadge(c.status);

  const formatCurrency = (amount?: number | string, budgetCurrency?: string) => {
    if (amount === undefined || amount === null || amount === '') return 'Flexible';
    return convertAndFormat(amount, budgetCurrency || 'INR');
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

  const maxVisibleObjectives = objectivesList.length <= 3 ? 3 : 2;
  const visibleObjectives = objectivesList.slice(0, maxVisibleObjectives);
  const hiddenObjectives = objectivesList.slice(maxVisibleObjectives);

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
      className="group relative rounded-3xl bg-slate-950/45 border border-purple-500/20 hover:border-purple-500/40 px-6 pb-6 pt-3.5 sm:pt-4 backdrop-blur-2xl shadow-xl shadow-purple-950/20 hover:shadow-[0_16px_48px_rgba(168,85,247,0.18)] transition-all duration-300 cursor-pointer space-y-5"
    >
      {/* Ambient Purplish Glow Background Aura Clipped */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/20 transition-all duration-500" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl group-hover:bg-indigo-600/15 transition-all duration-500" />
      </div>

      {/* Floating Status Badge Overlapping Top-Right Corner - Shifted a bit more top */}
      <div className="absolute -top-8 sm:-top-9 right-6 sm:right-8 z-30 pointer-events-none">
        <span
          className={`px-4 py-1.5 rounded-full ${statusConfig.gradient} border ${statusConfig.border} text-xs sm:text-sm font-black text-white flex items-center gap-1.5 shadow-xl ${statusConfig.shadow} ring-4 ring-[#090C15] group-hover:scale-105 transition-all duration-300`}
        >
          <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
          <span>{statusConfig.label}</span>
        </span>
      </div>

      {/* Row 1: Tags on Top & Prominent Large Pricing */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10 min-w-0">
        {/* Tags Cloud on Top (shifted upper side, strictly single line) */}
        <div className="flex items-center gap-2 flex-nowrap overflow-hidden min-w-0 max-w-full -mt-1 sm:-mt-1.5">
          {/* Industry Tag */}
          {c.industry && (
            <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-950/40 border border-purple-500/25 text-purple-200 flex items-center gap-1.5 shrink-0 whitespace-nowrap">
              <Layers className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>{c.industry}</span>
            </span>
          )}

          {/* Objective / Goal Tags */}
          {visibleObjectives.map((obj) => (
            <span
              key={obj}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-600/15 border border-purple-500/25 text-purple-200 shrink-0 whitespace-nowrap"
            >
              {obj}
            </span>
          ))}

          {/* Truncated ... indicator if more objectives */}
          {hiddenObjectives.length > 0 && (
            <span
              className="px-3 py-1.5 rounded-full text-xs font-black bg-purple-950/60 border border-purple-500/30 text-purple-300 shrink-0 whitespace-nowrap cursor-help hover:bg-purple-900/60 hover:text-white transition-colors tracking-wider"
              title={`More tags: ${hiddenObjectives.join(', ')}`}
            >
              ...
            </span>
          )}

          {/* Payment Model Tag */}
          {c.budgetPaymentModel && (
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-950/40 border border-indigo-400/25 text-indigo-200 shrink-0 whitespace-nowrap">
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
            {c.budgetPaymentModel !== 'BARTER' && (
              <span className="text-xs font-bold text-emerald-300/70 uppercase">
                {userCurrency || 'INR'}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Row 2: Campaign Title, Description & Platforms */}
      <div className="space-y-3 sm:space-y-3.5 relative z-10 -mt-2.5 sm:-mt-3">
        <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-purple-200 transition-colors tracking-tight flex items-center gap-2">
          <span>{c.title}</span>
          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-purple-300 opacity-0 group-hover:opacity-100 transition-all -translate-y-0.5 group-hover:translate-x-0.5" />
        </h3>

        {c.description && (
          <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed font-normal w-full max-w-full">
            {c.description}
          </p>
        )}

        {/* Overlapping Social Platforms */}
        {Array.isArray(c.platforms) && c.platforms.length > 0 && (
          <div className="flex items-center -space-x-2 isolate pt-1 sm:pt-1.5">
            {c.platforms.slice(0, 6).map((plat: string, idx: number) => (
              <div
                key={plat}
                style={{ zIndex: 10 + idx }}
                className="hover:z-30 transition-transform duration-200 hover:scale-120 hover:-translate-y-0.5"
              >
                <PlatformBadge platform={plat} size="md" />
              </div>
            ))}
            {c.platforms.length > 6 && (
              <div
                style={{ zIndex: 20 }}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full ring-2 ring-[#090C15] flex items-center justify-center text-xs font-bold bg-slate-900 border border-white/10 text-purple-300"
                title={c.platforms.slice(6).join(', ')}
              >
                +{c.platforms.length - 6}
              </div>
            )}
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
          <span className="text-[11px] text-purple-300/80 font-medium block">
            {hired >= targetParticipants ? 'Roster full' : `${progressPercent}% filled`}
          </span>
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

      {/* Row 4: Footer Meta Dates */}
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
        <CampaignActions campaign={c} onUpdated={onUpdated} onDeleted={onUpdated} />
      </div>
    </motion.div>
  );
}
