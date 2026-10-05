'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Calendar, CheckCircle2, Clock } from 'lucide-react';

export default function ActiveCollaborationsCard() {
  const collaborations = [
    {
      brand: 'Nordic Audio',
      campaign: 'Wireless Headphones Reel & Story',
      progress: 75,
      deliverables: '1 Reel, 2 IG Stories',
      deadline: 'Aug 04, 2026',
      status: 'Draft Submitted',
      statusColor: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    },
    {
      brand: 'Vibe Hydration',
      campaign: 'Electrolyte Launch Video',
      progress: 35,
      deliverables: '1 YouTube Dedicated Video',
      deadline: 'Aug 12, 2026',
      status: 'In Production',
      statusColor: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
    },
  ];

  return (
    <div className="p-5 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-400" />
            <span>Active Collaborations</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Track deliverables, contract deadlines, and progress</p>
        </div>
      </div>

      <div className="space-y-3">
        {collaborations.map((collab, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="p-4 rounded-xl bg-slate-950/60 border border-white/10 hover:border-purple-500/30 transition-all space-y-3 shadow-md"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs text-purple-300 font-semibold">{collab.brand}</span>
                <h4 className="text-sm font-bold text-white">{collab.campaign}</h4>
              </div>
              <span className={`px-2.5 py-1 rounded-full border text-[11px] font-bold ${collab.statusColor} self-start sm:self-auto`}>
                {collab.status}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-400">
                <span>Deliverables: {collab.deliverables}</span>
                <span className="text-slate-300 font-bold">{collab.progress}% Completed</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                  style={{ width: `${collab.progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Deadline: {collab.deadline}
              </span>
              <button className="text-purple-400 hover:text-purple-300 font-bold transition-colors">
                View Workspace →
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
