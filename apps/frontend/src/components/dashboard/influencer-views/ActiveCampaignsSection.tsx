'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Clock, Upload, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ActiveCampaignsSection() {
  const campaigns = [
    {
      id: 1,
      title: 'Ergonomic Desk Accessories Showcase',
      brand: 'FlexiSpot',
      stage: 'In Content Review',
      deadline: '2 Days Remaining',
      payout: '$2,800',
      progress: 75,
      deliverable: '1x YouTube Video (10-12 mins)',
      stageColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    },
    {
      id: 2,
      title: 'Wireless ANC Headphones Unboxing',
      brand: 'Soundcore',
      stage: 'Ready for Publishing',
      deadline: 'Aug 5, 2026',
      payout: '$1,500',
      progress: 90,
      deliverable: '2x Instagram Reels & Story Set',
      stageColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-purple-400" />
            <span>Active Collaborations</span>
          </h2>
          <p className="text-xs text-slate-400">Track current deliverables, approval stages & draft uploads</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {campaigns.map((c) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4 hover:border-purple-500/30 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-400">{c.brand}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${c.stageColor}`}>
                    {c.stage}
                  </span>
                </div>
                <h3 className="text-base font-black text-white">{c.title}</h3>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 block flex items-center gap-1 sm:justify-end">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {c.deadline}
                </span>
                <span className="text-lg font-black text-emerald-400">{c.payout}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Campaign Progress</span>
                <span className="text-purple-400 font-bold">{c.progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${c.progress}%` }} />
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-medium text-slate-300">
                <strong>Deliverable:</strong> {c.deliverable}
              </span>

              <button className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-extrabold text-white flex items-center gap-1.5 transition-all shadow-md shadow-purple-950/40">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Content Draft</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
