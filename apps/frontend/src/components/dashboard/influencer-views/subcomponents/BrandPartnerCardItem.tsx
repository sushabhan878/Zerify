'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  CheckCircle2,
  Clock,
  MessageSquare,
  Briefcase,
  Send,
  History,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface BrandPartnerItem {
  id: string | number;
  brandProfileId?: string;
  name: string;
  industry: string;
  logoUrl?: string;
  website?: string;
  totalDeals: number;
  totalPaid: string;
  lastWorked: string;
  contactPerson: string;
  contactRole: string;
  verified: boolean;
  relationshipTag: 'PREFERRED' | 'REPEAT_SPONSOR' | 'COMPLETED';
  pastCampaignsList: string[];
}

interface BrandPartnerCardItemProps {
  brand: BrandPartnerItem;
  onProposePitch: (brandName: string) => void;
}

export default function BrandPartnerCardItem({ brand, onProposePitch }: BrandPartnerCardItemProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [imgError, setImgError] = useState(false);

  const getTagBadge = (tag: BrandPartnerItem['relationshipTag']) => {
    switch (tag) {
      case 'PREFERRED':
        return { label: 'Preferred Partner', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'REPEAT_SPONSOR':
        return { label: 'Repeat Sponsor', color: 'bg-purple-500/10 text-purple-300 border-purple-500/30' };
      case 'COMPLETED':
      default:
        return { label: 'Past Sponsor', color: 'bg-slate-800 text-slate-300 border-white/10' };
    }
  };

  const badge = getTagBadge(brand.relationshipTag);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 sm:p-6 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-4 hover:border-purple-500/40 transition-all group"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl bg-gradient-to-br from-purple-900/60 to-slate-900 border border-purple-500/30 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform overflow-hidden">
            {brand.logoUrl && !imgError ? (
              <img
                src={brand.logoUrl}
                alt={brand.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <Building2 className="w-8 h-8 text-purple-300" />
            )}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="text-xs font-black text-purple-300">{brand.name}</span>
              {brand.verified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-extrabold text-purple-300">
                  <CheckCircle2 className="w-3 h-3 text-purple-400" /> Verified
                </span>
              )}
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${badge.color}`}>
                {badge.label}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white">{brand.name}</h3>
            <span className="text-xs text-slate-400 font-medium">{brand.industry}</span>
          </div>
        </div>

        {/* Amount Display (No Background Card) */}
        <div className="shrink-0 text-right sm:text-right">
          <span className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
            {brand.totalPaid}
          </span>
        </div>
      </div>

      {/* Middle: Collaboration Details */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-slate-300 space-y-1.5">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-300 uppercase tracking-wider">
          <Briefcase className="w-3.5 h-3.5 text-purple-400" />
          <span>Partnership Summary</span>
        </div>
        <div className="flex items-center gap-4 flex-wrap text-slate-300">
          <span>Completed: <strong className="text-white font-bold">{brand.totalDeals} Campaigns</strong></span>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <span>Contact Lead: <strong className="text-white font-bold">{brand.contactPerson}</strong> ({brand.contactRole})</span>
        </div>
      </div>

      {/* History Drawer Toggle */}
      {showHistory && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/20 text-xs text-slate-300 space-y-2"
        >
          <span className="font-bold text-purple-300 block flex items-center gap-1">
            <History className="w-3.5 h-3.5 text-purple-400" />
            Completed Campaigns History:
          </span>
          <ul className="space-y-1">
            {brand.pastCampaignsList.map((camp, idx) => (
              <li key={idx} className="flex items-center gap-2 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                <span>{camp}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Footer Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Left: Last Worked Date & Message Brand */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Last Worked: <strong className="text-white font-bold">{brand.lastWorked}</strong>
          </span>
          <span className="text-slate-700">|</span>
          <button className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat Manager</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-400 hover:text-white border border-white/10 transition-colors flex items-center gap-1"
          >
            <History className="w-3.5 h-3.5 text-purple-400" />
            <span>{showHistory ? 'Hide History' : 'View History'}</span>
            {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => onProposePitch(brand.name)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 hover:scale-105 text-xs font-black text-white shadow-lg shadow-purple-950/40 transition-all flex items-center justify-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Propose New Pitch</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
