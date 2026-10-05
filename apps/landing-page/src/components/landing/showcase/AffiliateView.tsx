'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function AffiliateView() {
  return (
    <motion.div
      key="affiliate"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      className="bg-slate-900 rounded-2xl p-6 border border-white/10 text-white min-h-[520px] flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div>
            <h3 className="text-2xl font-bold">Affiliate & Promo Attribution</h3>
            <p className="text-xs text-slate-400">Track unique discount code conversions, link clicks, and creator revenue shares</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold">
            24.8% Conv. Rate
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-white/10">
            <p className="text-xs text-slate-400">Tracked Promo Sales</p>
            <p className="text-2xl font-extrabold text-white mt-1">$48,920</p>
            <p className="text-xs text-emerald-400 font-bold mt-1">+34% vs last month</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-white/10">
            <p className="text-xs text-slate-400">Total Commissions Paid</p>
            <p className="text-2xl font-extrabold text-white mt-1">$7,338</p>
            <p className="text-xs text-purple-400 font-bold mt-1">15% standard split</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-white/10">
            <p className="text-xs text-slate-400">Active Creator Links</p>
            <p className="text-2xl font-extrabold text-white mt-1">142</p>
            <p className="text-xs text-indigo-400 font-bold mt-1">Across 4 platforms</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
