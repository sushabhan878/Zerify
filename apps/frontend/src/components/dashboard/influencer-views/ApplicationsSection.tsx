'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle2, Eye, XCircle } from 'lucide-react';

export default function ApplicationsSection() {
  const applications = [
    { id: 1, brand: 'Sony Audio', role: 'Headphone Unboxing Reel', appliedDate: 'Jul 22, 2026', proposedRate: '$2,800', status: 'SHORTLISTED', statusColor: 'bg-purple-500/10 text-purple-300 border-purple-500/30' },
    { id: 2, brand: 'Logitech G', role: 'Stream Deck Integration', appliedDate: 'Jul 18, 2026', proposedRate: '$3,200', status: 'UNDER REVIEW', statusColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
    { id: 3, brand: 'Razer Inc', role: 'Blade Laptop Showcase', appliedDate: 'Jul 10, 2026', proposedRate: '$4,500', status: 'CONTRACT SENT', statusColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            <span>Applications Tracker</span>
          </h2>
          <p className="text-xs text-slate-400">Track pitches and campaign applications submitted to brands</p>
        </div>
      </div>

      <div className="space-y-3">
        {applications.map((app) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-purple-500/30 transition-all"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">{app.brand}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${app.statusColor}`}>
                  {app.status}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">{app.role}</h3>
              <span className="text-[11px] text-slate-500 block">Submitted on {app.appliedDate}</span>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5">
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Proposed Rate</span>
                <span className="text-sm font-black text-emerald-400">{app.proposedRate}</span>
              </div>

              <button className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-purple-400" />
                <span>View Pitch</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
