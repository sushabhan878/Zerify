'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle2, Clock, ShieldCheck, Download } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

export default function ActiveDealsSection() {
  const { formatBudget } = useCurrency();
  const deals = [
    { id: 'CNT-901', creator: 'Sarah Jenkins (@sarah_creativ)', campaign: 'Q3 Enterprise SaaS', deliverable: 'YouTube Dedicated Video Draft', stage: 'Draft Review Required', amount: formatBudget('$3,500'), releaseEscrow: true },
    { id: 'CNT-882', creator: 'Marcus Vance (@marcus_vfit)', campaign: 'Summer Desk Showcase', deliverable: '2x IG Reels & Story', stage: 'Published & Verifying Stats', amount: formatBudget('$2,200'), releaseEscrow: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            <span>Active Deals & Contracts</span>
          </h2>
          <p className="text-xs text-slate-400">Review creator content submissions and release escrow milestone funds</p>
        </div>
      </div>

      <div className="space-y-4">
        {deals.map((deal) => (
          <motion.div
            key={deal.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4 hover:border-purple-500/30 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">{deal.id} • {deal.campaign}</span>
                <h3 className="text-base font-black text-white">{deal.creator}</h3>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-purple-400 block">{deal.stage}</span>
                <span className="text-lg font-black text-emerald-400">{deal.amount}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-slate-300 flex items-center justify-between">
              <div>
                <strong className="text-white block">Submitted Deliverable:</strong>
                <span>{deal.deliverable}</span>
              </div>

              <button className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors flex items-center gap-1">
                <Download className="w-3.5 h-3.5 text-purple-400" />
                <span>Preview Draft</span>
              </button>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Funds Secured in Zerify Escrow</span>
              </span>

              <div className="flex items-center gap-2">
                <button className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors">
                  Request Edits
                </button>
                <button className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-black text-white transition-all shadow-md shadow-emerald-950/40">
                  Approve & Release Payment
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
