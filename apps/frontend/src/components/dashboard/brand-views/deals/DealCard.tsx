'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  BadgeCheck,
  Target,
  ArrowRight,
} from 'lucide-react';
import { DealItem } from './deal-types';
import { useCurrency } from '@/context/CurrencyContext';
import { PlatformBadge } from '../find-influencers/CreatorCard';
import { BrandWorkedRibbonBadge } from '../shortlists/ShortlistApplicantCard';

interface DealCardProps {
  deal: DealItem;
  onPreviewDraft: (deal: DealItem) => void;
  onViewDetails: (deal: DealItem) => void;
  onApproveRelease: (deal: DealItem) => void;
  onRequestEdits: (deal: DealItem) => void;
}

export default function DealCard({
  deal,
  onPreviewDraft,
  onViewDetails,
  onApproveRelease,
}: DealCardProps) {
  const { format } = useCurrency();
  const [imageError, setImageError] = React.useState(false);

  const defaultAvatar =
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onClick={() => onViewDetails(deal)}
      className="p-5 sm:p-6 lg:p-7 rounded-[26px] bg-[#090C15]/95 border border-white/[0.08] backdrop-blur-2xl hover:border-purple-500/40 transition-[border-color,box-shadow] duration-300 group shadow-2xl hover:shadow-purple-950/30 relative overflow-visible flex flex-col md:flex-row gap-5 lg:gap-6 items-stretch cursor-pointer mt-3"
    >
      {/* Background ambient purple glow */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-600/20 transition-all duration-500" />

      {/* Floating Match / Status Rate Badge Overlapping Top-Right Corner */}
      <div className="absolute -top-3.5 right-6 sm:right-8 z-30 pointer-events-none">
        <span
          className={`px-4 py-1.5 rounded-full border text-xs sm:text-sm font-black text-white flex items-center gap-1.5 shadow-xl ring-4 ring-[#090C15] group-hover:scale-105 transition-all duration-300 ${
            deal.status === 'COMPLETED'
              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 border-emerald-400/50 shadow-emerald-950/80 group-hover:shadow-emerald-600/40'
              : deal.status === 'CANCELLED'
              ? 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-600 border-rose-400/50 shadow-rose-950/80 group-hover:shadow-rose-600/40'
              : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 border-purple-400/50 shadow-purple-950/80 group-hover:shadow-purple-600/40'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-white animate-pulse shrink-0" />
          <span>
            {deal.status === 'COMPLETED'
              ? 'Completed Deal'
              : deal.status === 'CANCELLED'
              ? 'Cancelled Deal'
              : '100% Match'}
          </span>
        </span>
      </div>

      {/* LEFT COLUMN: Portrait Image with Overlapping Badges */}
      <div className="relative w-full md:w-[180px] lg:w-[195px] h-[250px] sm:h-[260px] md:h-auto min-h-[240px] lg:min-h-[260px] shrink-0 rounded-2xl border border-white/10 group-hover:border-purple-500/40 bg-slate-900/60 shadow-md transition-colors flex flex-col justify-end">
        {/* Overlapping Rosette Ribbon Award Medal on top-left corner */}
        <div className="absolute -top-4 -left-4 z-30 pointer-events-auto">
          <BrandWorkedRibbonBadge />
        </div>

        {/* Clipped Inner Container for Image and Bottom Shadow */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          {deal.creator.avatarUrl && !imageError ? (
            <img
              src={deal.creator.avatarUrl || defaultAvatar}
              alt={deal.creator.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-purple-700 via-indigo-700 to-pink-700 flex items-center justify-center text-white font-black text-4xl">
              {deal.creator.name.charAt(0)}
            </div>
          )}

          {/* Gradient shadow for icon legibility at bottom of photo */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
        </div>

        {/* Overlapping Social Media Logos starting from left */}
        <div className="relative z-10 p-3 flex items-center justify-start -space-x-2 isolate">
          {(deal.creator.platforms && deal.creator.platforms.length > 0
            ? deal.creator.platforms
            : ['YouTube', 'Instagram']
          ).map((plat, idx) => (
            <div
              key={plat}
              style={{ zIndex: 10 + idx }}
              className="hover:z-30 transition-transform duration-200 hover:scale-125 hover:-translate-y-1"
            >
              <PlatformBadge platform={plat} />
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN: Info, Pitch, Quote & CTA Actions */}
      <div className="flex-1 flex flex-col justify-between space-y-3.5 relative z-10 min-w-0 pt-1">
        <div className="space-y-2.5">
          {/* Top Campaign Badge */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(deal);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-950/60 hover:bg-purple-900/70 border border-purple-500/30 text-[11px] font-bold text-purple-200 transition-colors truncate max-w-[240px] text-left cursor-pointer"
              title={`Campaign: ${deal.campaignTitle}`}
            >
              <Target className="w-3 h-3 text-purple-400 shrink-0" />
              <span className="truncate">{deal.campaignTitle}</span>
            </button>
          </div>

          {/* Creator Name & Category */}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-2xl sm:text-[26px] font-black text-white group-hover:text-purple-300 transition-colors tracking-tight leading-snug truncate">
                {deal.creator.name}
              </h3>
              {deal.creator.isVerified && (
                <span className="shrink-0 text-purple-400" title="Verified Creator">
                  <BadgeCheck className="w-5 h-5 fill-purple-600 text-[#090C15]" />
                </span>
              )}
            </div>
            <p className="text-sm text-slate-300 font-medium truncate whitespace-nowrap mt-0.5">
              {deal.creator.category || 'Content Creator'}
            </p>
          </div>

          {/* Description / Scope in italic line-clamp-2 */}
          <p className="text-sm text-slate-300/80 leading-relaxed italic line-clamp-2">
            &quot;{deal.primaryDeliverableTitle}&quot;
          </p>
        </div>

        {/* Amount Display & Action Buttons */}
        <div className="space-y-4 pt-1">
          <div className="flex items-center justify-between py-2 px-1 border-t border-white/[0.08]">
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
              {deal.status === 'COMPLETED'
                ? 'Paid Settlement'
                : deal.status === 'CANCELLED'
                ? 'Refunded Amount'
                : 'Pitch Quote'}
            </span>
            <span className="text-2xl sm:text-[28px] font-black text-purple-300 tracking-tight">
              {format(deal.agreedAmount)}
            </span>
          </div>

          {/* Action Buttons: Pitch + Offer Accepted/Main Action */}
          <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onPreviewDraft(deal)}
              type="button"
              className="group/pitch relative h-10 sm:h-11 w-24 sm:w-28 rounded-xl bg-slate-900/90 hover:bg-slate-800 hover:bg-purple-950/40 border border-white/10 hover:border-purple-500/50 text-xs sm:text-sm font-bold text-slate-200 hover:text-white flex items-center justify-center transition-colors duration-200 shadow-sm hover:shadow-md hover:shadow-purple-900/30 cursor-pointer shrink-0 select-none overflow-hidden"
            >
              <span className="transition-transform duration-200 group-hover/pitch:-translate-x-2">
                Pitch
              </span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 absolute right-3 opacity-0 translate-x-2 group-hover/pitch:opacity-100 group-hover/pitch:translate-x-0 transition-all duration-200" />
            </button>

            {/* Right Status / Action Button */}
            {deal.status === 'ACTIVE' ? (
              <button
                onClick={() => onApproveRelease(deal)}
                type="button"
                className="flex-1 py-2 sm:py-2.5 px-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs sm:text-sm font-bold text-emerald-300 flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                title="Click to review & release payment"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Offer Accepted</span>
              </button>
            ) : deal.status === 'COMPLETED' ? (
              <div className="flex-1 py-2 sm:py-2.5 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs sm:text-sm font-bold text-emerald-300 flex items-center justify-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Contract Completed</span>
              </div>
            ) : (
              <div className="flex-1 py-2 sm:py-2.5 px-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs sm:text-sm font-bold text-rose-300 flex items-center justify-center gap-1.5 shadow-sm">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>Deal Cancelled</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
