'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Filter, ArrowDown, CheckCircle2 } from 'lucide-react';

export default function TrafficFunnelCard() {
  const funnelSteps = [
    { step: 'Profile Views', count: '12,450', conv: '100%', color: 'from-purple-600 to-indigo-600' },
    { step: 'Media Kit Opens', count: '4,180', conv: '33.5%', color: 'from-purple-600/90 to-pink-600/90' },
    { step: 'Brand Contact Requests', count: '850', conv: '20.3%', color: 'from-pink-600/80 to-rose-600/80' },
    { step: 'Campaign Invitations Sent', count: '142', conv: '16.7%', color: 'from-indigo-600/80 to-purple-600/80' },
    { step: 'Offers Accepted', count: '48', conv: '33.8%', color: 'from-emerald-600/90 to-teal-600/90' },
    { step: 'Collaborations Completed', count: '42', conv: '87.5%', color: 'from-emerald-500 to-cyan-500' },
  ];

  return (
    <div className="p-5 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
      <div>
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Filter className="w-4 h-4 text-purple-400" />
          <span>Creator Conversion Funnel</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">Track visitor conversion drop-off from initial profile view to deal completion</p>
      </div>

      <div className="space-y-2">
        {funnelSteps.map((fs, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="p-3 rounded-xl bg-slate-950/60 border border-white/10 flex items-center justify-between gap-3 shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <div>
                <h4 className="text-xs font-bold text-white">{fs.step}</h4>
                <span className="text-[10px] text-slate-400 font-medium">{fs.conv} conversion step</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-sm font-black text-white">{fs.count}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
