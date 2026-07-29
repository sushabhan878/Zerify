'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Wallet, Lock, TrendingUp, Download, ArrowUpRight } from 'lucide-react';

interface PaymentsKpiBarProps {
  availableBalance: string;
  inEscrow: string;
  lifetimeEarnings: string;
  onWithdraw: () => void;
}

export default function PaymentsKpiBar({ availableBalance, inEscrow, lifetimeEarnings, onWithdraw }: PaymentsKpiBarProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Available Balance Box */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/60 via-slate-900 to-slate-950 border border-purple-500/40 backdrop-blur-xl shadow-xl space-y-3 relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-purple-300">Available Balance</span>
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-black text-white">{availableBalance}</div>
          <span className="text-[11px] font-bold text-emerald-400 mt-0.5 block">Cleared for instant payout</span>
        </div>
        <button
          onClick={onWithdraw}
          className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-xs font-extrabold text-white shadow-lg shadow-purple-950/50 transition-all flex items-center justify-center gap-1.5"
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Withdraw to Bank Account</span>
        </button>
      </motion.div>

      {/* Escrow Funds Box */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="p-5 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-3 flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400">Locked in Escrow</span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Lock className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">{inEscrow}</div>
          <span className="text-[11px] font-bold text-slate-400 mt-0.5 block">Released upon deliverable approval</span>
        </div>
        <div className="pt-2 border-t border-white/5 text-[11px] font-semibold text-slate-400">
          3 active campaign milestones pending
        </div>
      </motion.div>

      {/* Lifetime Earnings Box */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-5 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-3 flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400">Lifetime Earnings</span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-black text-white">{lifetimeEarnings}</div>
          <span className="text-[11px] font-bold text-emerald-400 mt-0.5 block">+18.5% compared to last quarter</span>
        </div>
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-semibold text-slate-400">
          <span>100% On-Time Payouts</span>
          <button className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1">
            <Download className="w-3 h-3" /> Export Tax Doc
          </button>
        </div>
      </motion.div>
    </div>
  );
}
