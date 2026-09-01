'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, Download, Lock, CheckCircle2, Building2, FileText } from 'lucide-react';

export interface TransactionItem {
  id: string;
  brand: string;
  campaign: string;
  amount: string;
  date: string;
  type: 'PAYOUT_RELEASE' | 'ESCROW_DEPOSIT' | 'WITHDRAWAL';
  status: 'COMPLETED' | 'PENDING_APPROVAL' | 'PROCESSING';
}

interface TransactionCardItemProps {
  tx: TransactionItem;
  onDownloadInvoice: (id: string) => void;
}

export default function TransactionCardItem({ tx, onDownloadInvoice }: TransactionCardItemProps) {
  const getStatusBadge = (status: TransactionItem['status']) => {
    switch (status) {
      case 'COMPLETED':
        return { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'PENDING_APPROVAL':
        return { label: 'In Escrow', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
      case 'PROCESSING':
        return { label: 'Processing Payout', color: 'bg-purple-500/10 text-purple-300 border-purple-500/30' };
    }
  };

  const badge = getStatusBadge(tx.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-slate-950/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-purple-500/30 transition-all shadow-md"
    >
      <div className="flex items-center gap-3.5">
        <div
          className={`p-2.5 rounded-xl border shrink-0 ${
            tx.status === 'COMPLETED'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}
        >
          {tx.status === 'COMPLETED' ? <ArrowDownRight className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="text-xs font-black text-white">{tx.brand}</h4>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${badge.color}`}>
              {badge.label}
            </span>
          </div>
          <p className="text-xs font-semibold text-purple-300">{tx.campaign}</p>
          <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">
            Ref ID: {tx.id} • {tx.date}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
        <div className="text-right">
          <span className={`text-base font-black ${tx.status === 'COMPLETED' ? 'text-emerald-400' : 'text-amber-400'}`}>
            {tx.amount}
          </span>
          <span className="text-[10px] text-slate-500 block uppercase font-bold">USD Currency</span>
        </div>

        <button
          onClick={() => onDownloadInvoice(tx.id)}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10 transition-colors"
          title="Download Receipt / Invoice"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
