'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Users,
  DollarSign,
  ArrowUpRight,
  Send,
  Video,
  Instagram,
  Youtube,
  Gift,
  Clock,
} from 'lucide-react';

export interface CampaignItem {
  id: string;
  title: string;
  brandName: string;
  brandLogo: string;
  category: string;
  industry: string;
  coverImage: string;
  description: string;
  payoutAmount: string;
  payoutModel: 'Fixed Fee' | 'Paid + Commission' | 'Product Barter';
  hasFreeProduct?: boolean;
  freeProductValue?: string;
  deliverables: string[];
  targetPlatforms: ('Instagram' | 'YouTube' | 'TikTok' | 'LinkedIn' | 'Twitter')[];
  creatorTiers: string[];
  slotsTotal: number;
  slotsFilled: number;
  deadline: string;
  daysRemaining: number;
  matchScore: number;
  audienceMatchScore: number;
  nicheMatchScore: number;
  isVerifiedBrand: boolean;
  isEscrowGuaranteed: boolean;
  requirements: string[];
  dos: string[];
  donts: string[];
  moodboardImages?: string[];
}

interface CampaignCardProps {
  campaign: CampaignItem;
  onViewBrief: (campaign: CampaignItem) => void;
  onApply: (campaign: CampaignItem) => void;
}

export default function CampaignCard({
  campaign,
  onViewBrief,
  onApply,
}: CampaignCardProps) {
  const slotsPercentage = Math.round((campaign.slotsFilled / campaign.slotsTotal) * 100);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Instagram':
        return <Instagram className="w-3 h-3 text-pink-400" />;
      case 'YouTube':
        return <Youtube className="w-3 h-3 text-rose-500" />;
      case 'TikTok':
        return <Video className="w-3 h-3 text-cyan-400" />;
      default:
        return <Video className="w-3 h-3 text-purple-400" />;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="group relative rounded-2xl bg-slate-950/60 border border-white/10 hover:border-purple-500/40 p-4 sm:p-5 flex flex-col justify-between backdrop-blur-xl shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* Background Ambient Glow */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-purple-600/10 rounded-full blur-2xl group-hover:bg-purple-600/20 transition-all pointer-events-none" />

      <div>
        {/* Top Header Row: Brand Logo, Name, Match Score & Escrow */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/15 overflow-hidden shrink-0 shadow-md">
              <img
                src={campaign.brandLogo}
                alt={campaign.brandName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
                  {campaign.brandName}
                </span>
                {campaign.isVerifiedBrand && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                )}
              </div>
              <span className="text-[10px] text-slate-500 font-medium">{campaign.category}</span>
            </div>
          </div>

          {/* Match Score Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-500/40 shadow-sm shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span className="text-xs font-extrabold text-white">{campaign.matchScore}%</span>
          </div>
        </div>

        {/* Campaign Title & Description */}
        <h3 className="text-sm font-black text-white group-hover:text-purple-300 transition-colors leading-snug line-clamp-2 mb-1.5">
          {campaign.title}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3.5 font-normal">
          {campaign.description}
        </p>

        {/* Deliverables Required Tags */}
        <div className="flex items-center gap-1.5 flex-wrap mb-3.5">
          {campaign.deliverables.map((del, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-lg bg-slate-900/90 border border-white/10 text-[10.5px] font-semibold text-slate-300 flex items-center gap-1"
            >
              <Video className="w-3 h-3 text-purple-400" />
              <span>{del}</span>
            </span>
          ))}
        </div>

        {/* Platform Targets & Creator Tiers */}
        <div className="flex items-center justify-between gap-2 py-2 border-y border-white/5 mb-3.5 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-500">Platforms:</span>
            <div className="flex items-center gap-1">
              {campaign.targetPlatforms.map((p) => (
                <span
                  key={p}
                  title={p}
                  className="p-1 rounded-md bg-slate-900 border border-white/5"
                >
                  {getPlatformIcon(p)}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px] font-medium text-slate-300">
              {campaign.creatorTiers.join(', ')}
            </span>
          </div>
        </div>

        {/* Compensation & Free Product Box */}
        <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 flex items-center justify-between gap-2 mb-3.5">
          <div>
            <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider block">
              Compensation
            </span>
            <span className="text-sm font-black text-white block">
              {campaign.payoutAmount}
            </span>
          </div>

          {campaign.hasFreeProduct && (
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                <Gift className="w-3 h-3" />
                <span>+ Free Product</span>
              </span>
              {campaign.freeProductValue && (
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Valued at {campaign.freeProductValue}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Application Progress Bar & Deadline */}
        <div className="space-y-1 mb-4">
          <div className="flex items-center justify-between text-[10.5px]">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Ends in {campaign.daysRemaining} days</span>
            </span>
            <span className="text-slate-300 font-bold">
              {campaign.slotsFilled}/{campaign.slotsTotal} spots filled
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${slotsPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
        <button
          onClick={() => onViewBrief(campaign)}
          type="button"
          className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 hover:border-purple-400/30 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
        >
          <span>View Brief</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        <button
          onClick={() => onApply(campaign)}
          type="button"
          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-950/50 flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Send className="w-3 h-3" />
          <span>Apply Now</span>
        </button>
      </div>
    </motion.div>
  );
}
