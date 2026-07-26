'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ListChecks, Send, Users, Sparkles, FolderPlus } from 'lucide-react';

export default function ShortlistsSection() {
  const shortlists = [
    { id: 1, title: 'Q3 Enterprise SaaS Launch', candidates: 4, budget: '$15,000', status: 'Ready for Proposals' },
    { id: 2, title: 'Fall Performance Gear Roster', candidates: 3, budget: '$8,500', status: 'Contract Draft Stage' },
    { id: 3, title: 'Holiday Gaming Bundle Video', candidates: 5, budget: '$20,000', status: 'Reviewing Profiles' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-purple-400" />
            <span>Campaign Shortlists</span>
          </h2>
          <p className="text-xs text-slate-400">Curated candidate pools organized by campaign strategy</p>
        </div>

        <button className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-md shadow-purple-950/40">
          <FolderPlus className="w-4 h-4" />
          <span>New Shortlist</span>
        </button>
      </div>

      <div className="space-y-4">
        {shortlists.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4 hover:border-purple-500/30 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400">{item.status}</span>
                <h3 className="text-base font-black text-white">{item.title}</h3>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 block">{item.candidates} Selected Candidates</span>
                <span className="text-base font-black text-emerald-400">{item.budget} Pool</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>Roster includes top tech & lifestyle creators</span>
              </div>

              <button className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-purple-600 text-xs font-extrabold text-white flex items-center gap-1.5 transition-all">
                <Send className="w-3.5 h-3.5" />
                <span>Send Bulk Invitations</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
