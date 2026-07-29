'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function ManageView() {
  const campaigns = [
    { campaign: 'Summer Glow Skincare Launch', stage: 'Content Under Review', creators: 8, budget: '$4,200' },
    { campaign: 'Wireless Earbuds Unboxing', stage: 'Brief Sent', creators: 14, budget: '$6,500' },
    { campaign: 'Autumn Apparel Try-On', stage: 'Completed & Paid', creators: 6, budget: '$3,800' },
  ];

  return (
    <motion.div
      key="manage"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      className="bg-slate-900 rounded-2xl p-6 border border-white/10 text-white min-h-[520px] flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div>
            <h3 className="text-2xl font-bold">Campaign Workflow & Contracts</h3>
            <p className="text-xs text-slate-400">Automate briefs, product dispatching, escrow approval, and usage licensing</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            12 Active Campaigns
          </span>
        </div>

        <div className="space-y-3">
          {campaigns.map((item, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-950/80 border border-white/10 flex flex-wrap items-center justify-between gap-4 hover:border-purple-500/40 transition-all">
              <div>
                <h4 className="text-sm font-bold text-white">{item.campaign}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{item.creators} Participating Creators • Budget: {item.budget}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 text-xs font-semibold border border-purple-500/20">
                  {item.stage}
                </span>
                <button className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold">
                  Manage Pipeline
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
