'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  CheckCircle2,
  Calendar,
  DollarSign,
  MessageSquare,
  Check,
  X,
  Sparkles,
  Package,
  ShieldCheck,
  Tag,
  Instagram,
  Youtube,
} from 'lucide-react';

export interface CampaignInvite {
  id: number;
  brand: string;
  industry: string;
  title: string;
  payout: string;
  deadline: string;
  matchPct: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COUNTERED';
  deliverables: string[];
  perks: string[];
  platforms: string[];
  verifiedBrand: boolean;
}

interface InvitationCardItemProps {
  invite: CampaignInvite;
  onAction: (id: number, status: 'ACCEPTED' | 'DECLINED' | 'COUNTERED') => void;
}

export default function InvitationCardItem({ invite, onAction }: InvitationCardItemProps) {
  const [showNegotiate, setShowNegotiate] = useState(false);
  const [counterAmount, setCounterAmount] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 sm:p-6 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-4 hover:border-purple-500/40 transition-all group"
    >
      {/* Top Header: Brand info + Match + Payout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-900/60 to-slate-900 border border-purple-500/30 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform">
            <Building2 className="w-6 h-6 text-purple-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-purple-300">{invite.brand}</span>
              {invite.verifiedBrand && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-extrabold text-purple-300">
                  <CheckCircle2 className="w-3 h-3 text-purple-400" /> Verified Brand
                </span>
              )}
              <span className="px-2 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-[10px] font-extrabold text-pink-300">
                <Sparkles className="w-3 h-3 inline mr-1" />
                {invite.matchPct} Match
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mt-0.5">{invite.title}</h3>
            <span className="text-xs text-slate-400 font-medium">{invite.industry}</span>
          </div>
        </div>

        {/* Payout & Deadline Box */}
        <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-1 p-3 rounded-xl bg-slate-950/60 border border-white/10 shrink-0">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Offered Compensation</span>
            <span className="text-xl font-black text-emerald-400">{invite.payout}</span>
          </div>
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-500" />
            Deadline: {invite.deadline}
          </span>
        </div>
      </div>

      {/* Deliverables & Platforms Tags */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-purple-400" />
            Deliverables Required:
          </span>
          <span className="text-emerald-400 font-extrabold flex items-center gap-1 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Escrow Protected Payout
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {invite.deliverables.map((del, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-lg bg-slate-900 border border-white/10 text-xs font-semibold text-slate-200"
            >
              {del}
            </span>
          ))}
        </div>
      </div>

      {/* Perks Tags */}
      <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400">
        <span className="font-semibold text-slate-300 flex items-center gap-1">
          <Package className="w-3.5 h-3.5 text-pink-400" /> Included Perks:
        </span>
        {invite.perks.map((perk, i) => (
          <span key={i} className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[11px] font-bold text-purple-300">
            {perk}
          </span>
        ))}
      </div>

      {/* Counter Offer Input Box (if negotiating) */}
      {showNegotiate && invite.status === 'PENDING' && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 space-y-2">
          <label className="text-xs font-bold text-purple-200 block">Submit Counter Offer Amount ($)</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. $4,200"
              value={counterAmount}
              onChange={(e) => setCounterAmount(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-purple-500 flex-1"
            />
            <button
              onClick={() => {
                onAction(invite.id, 'COUNTERED');
                setShowNegotiate(false);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-md"
            >
              Send Counter Offer
            </button>
          </div>
        </motion.div>
      )}

      {/* Footer Action Bar */}
      <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors self-start sm:self-auto">
          <MessageSquare className="w-4 h-4" />
          <span>Message Brand Manager</span>
        </button>

        {invite.status === 'PENDING' ? (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowNegotiate(!showNegotiate)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 border border-white/10 transition-all"
            >
              Counter Offer
            </button>
            <button
              onClick={() => onAction(invite.id, 'DECLINED')}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/50 text-xs font-bold text-slate-300 hover:text-rose-300 border border-white/10 transition-all flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Decline</span>
            </button>
            <button
              onClick={() => onAction(invite.id, 'ACCEPTED')}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 hover:scale-105 text-xs font-bold text-white shadow-lg shadow-purple-950/50 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Accept Offer</span>
            </button>
          </div>
        ) : (
          <span
            className={`px-4 py-1.5 rounded-full text-xs font-extrabold ${
              invite.status === 'ACCEPTED'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : invite.status === 'COUNTERED'
                ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}
          >
            {invite.status === 'ACCEPTED' && 'Offer Accepted'}
            {invite.status === 'COUNTERED' && 'Counter Offer Sent'}
            {invite.status === 'DECLINED' && 'Offer Declined'}
          </span>
        )}
      </div>
    </motion.div>
  );
}
