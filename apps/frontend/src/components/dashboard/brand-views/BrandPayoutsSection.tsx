'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Wallet, ShieldCheck, Download, Plus } from 'lucide-react';

export default function BrandPayoutsSection() {
  const transactions = [
    { id: 'PAY-4012', creator: 'Sarah Jenkins', description: 'YouTube Video Integration Release', amount: '-$3,500', date: 'Jul 22, 2026', status: 'PAID' },
    { id: 'ESC-3910', creator: 'Marcus Vance', description: 'Desk Showcase Escrow Hold', amount: '$2,200', date: 'Jul 18, 2026', status: 'IN ESCROW' },
    { id: 'DEP-1002', creator: 'Stripe Deposit', description: 'Campaign Fund Top-up', amount: '+$25,000', date: 'Jul 10, 2026', status: 'COMPLETED' },
  ];

  return (
    <div className="space-y-6">
      {/* Financial Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-tr from-purple-900/40 to-slate-900 border border-purple-500/30 backdrop-blur-xl">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Available Campaign Balance</span>
          <div className="text-2xl font-black text-white mb-2">$18,450.00</div>
          <button className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-md">
            <Plus className="w-3.5 h-3.5" />
            <span>Deposit Campaign Funds</span>
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Funds in Active Escrow</span>
          <div className="text-2xl font-black text-amber-400 mb-2">$5,700.00</div>
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Protected by Zerify Smart Contracts</span>
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Total Creator Payouts</span>
          <div className="text-2xl font-black text-emerald-400 mb-2">$64,200.00</div>
          <span className="text-[11px] text-emerald-400 font-bold">48 Creator Contracts Settled</span>
        </div>
      </div>

      {/* History */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-purple-400" />
            <span>Billing & Escrow Activity</span>
          </h3>

          <button className="text-xs text-purple-400 hover:underline flex items-center gap-1 font-bold">
            <Download className="w-3.5 h-3.5" />
            <span>Export Invoices</span>
          </button>
        </div>

        <div className="space-y-2">
          {transactions.map((tx) => (
            <div key={tx.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">{tx.creator} - {tx.description}</h4>
                <span className="text-[10px] text-slate-500">{tx.id} • {tx.date}</span>
              </div>

              <div className="text-right">
                <span className={`text-sm font-black ${tx.status === 'PAID' ? 'text-white' : tx.status === 'IN ESCROW' ? 'text-amber-400' : 'text-emerald-400'}`}>{tx.amount}</span>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">{tx.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
