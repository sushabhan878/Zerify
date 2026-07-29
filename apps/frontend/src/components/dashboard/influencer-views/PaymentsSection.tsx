'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Wallet, ArrowDownRight, ArrowUpRight, Download, CheckCircle2 } from 'lucide-react';

export default function PaymentsSection() {
  const transactions = [
    { id: 'TX-9021', brand: 'CyberPulse AI', campaign: 'SaaS Video Integration', amount: '+$3,200', date: 'Jul 20, 2026', status: 'COMPLETED' },
    { id: 'TX-8942', brand: 'Apex Gear', campaign: 'Fitness Wear Reel', amount: '+$1,500', date: 'Jul 14, 2026', status: 'COMPLETED' },
    { id: 'TX-8810', brand: 'Soundcore Audio', campaign: 'Headphones Review', amount: '+$2,800', date: 'In Escrow', status: 'PENDING' },
  ];

  return (
    <div className="space-y-6">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-tr from-purple-900/40 to-slate-900 border border-purple-500/30 backdrop-blur-xl">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Available Balance</span>
          <div className="text-2xl font-black text-white mb-2">$8,450.00</div>
          <button className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-md">
            <Wallet className="w-3.5 h-3.5" />
            <span>Withdraw to Bank</span>
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl">
          <span className="text-xs font-semibold text-slate-400">Available Balance</span>
          <div className="text-2xl font-black text-white mt-1">$4,850.00</div>
          <span className="text-[11px] font-bold text-purple-400 mt-1 block">Ready for payout</span>
        </div>
        <div className="p-5 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl">
          <span className="text-xs font-semibold text-slate-400">In Escrow</span>
          <div className="text-2xl font-black text-white mt-1">$13,600.00</div>
          <span className="text-[11px] font-bold text-slate-400 mt-1 block">Pending deliverable approval</span>
        </div>
      </div>

      {/* Transaction History */}
      <div className="p-5 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-purple-400" />
            <span>Recent Payment Transactions</span>
          </h3>

          <button className="text-xs text-purple-400 hover:underline flex items-center gap-1 font-bold">
            <Download className="w-3.5 h-3.5" />
            <span>Export Tax Summary</span>
          </button>
        </div>

        <div className="space-y-2">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${tx.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  {tx.status === 'COMPLETED' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{tx.brand} - {tx.campaign}</h4>
                  <span className="text-[10px] text-slate-500">{tx.id} • {tx.date}</span>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-sm font-black ${tx.status === 'COMPLETED' ? 'text-emerald-400' : 'text-amber-400'}`}>{tx.amount}</span>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">{tx.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
