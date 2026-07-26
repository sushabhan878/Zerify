'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Plus, Calendar, DollarSign, Users } from 'lucide-react';

export default function MyCampaignsSection() {
  const campaigns = [
    { id: 1, title: 'Q3 Enterprise SaaS Video Sponsorship', budget: '$15,000', hired: 3, applicants: 14, status: 'ACTIVE', statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    { id: 2, title: 'Summer Ergonomic Desk Setup Reel', budget: '$8,000', hired: 2, applicants: 9, status: 'ACTIVE', statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    { id: 3, title: 'Holiday Wireless Audio Launch', budget: '$25,000', hired: 0, applicants: 0, status: 'DRAFT', statusColor: 'bg-slate-800 text-slate-400 border-white/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-purple-400" />
            <span>Brand Campaigns</span>
          </h2>
          <p className="text-xs text-slate-400">Manage live sponsorships, applicant rosters & campaign budgets</p>
        </div>

        <button className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105 text-xs font-black text-white flex items-center gap-1.5 transition-all shadow-lg shadow-purple-950/50">
          <Plus className="w-4 h-4" />
          <span>Create Campaign</span>
        </button>
      </div>

      <div className="space-y-4">
        {campaigns.map((c) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4 hover:border-purple-500/30 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${c.statusColor}`}>
                  {c.status}
                </span>
                <h3 className="text-base font-black text-white mt-1">{c.title}</h3>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 block">Total Allocated Budget</span>
                <span className="text-base font-black text-emerald-400">{c.budget}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-xl border border-white/5 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Creators Hired</span>
                <span className="font-black text-purple-400">{c.hired} Creators</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Pitches Received</span>
                <span className="font-black text-white">{c.applicants} Applicants</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Escrow Protection</span>
                <span className="font-bold text-emerald-400">100% Guaranteed</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors">
                View Roster
              </button>
              <button className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-all shadow-md">
                Manage Deliverables
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
