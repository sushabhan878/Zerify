'use client';

import React, { useState } from 'react';
import { DollarSign, Search, ShieldCheck, CheckCircle2, Lock, AlertTriangle, ArrowDownLeft, Download, Check } from 'lucide-react';
import DisputesListCard from './DisputesListCard';

export interface BrandEscrowTransaction {
  id: string;
  creator: string;
  campaign: string;
  amount: string;
  date: string;
  status: 'IN_ESCROW' | 'COMPLETED' | 'DISPUTED';
  milestoneTitle?: string;
}

interface BrandEscrowTransactionListProps {
  transactions: BrandEscrowTransaction[];
  onApproveRelease: (txId: string) => void;
  onRaiseDispute: (txId: string, campaign: string) => void;
  onWithdrawRefund: (txId: string, amount: string) => void;
  onExportInvoices: () => void;
}

export default function BrandEscrowTransactionList({
  transactions,
  onApproveRelease,
  onRaiseDispute,
  onWithdrawRefund,
  onExportInvoices,
}: BrandEscrowTransactionListProps) {
  const [activeTab, setActiveTab] = useState<'ALL' | 'IN_ESCROW' | 'COMPLETED' | 'DISPUTES'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = transactions.filter((tx) => {
    if (activeTab === 'IN_ESCROW' && tx.status !== 'IN_ESCROW') return false;
    if (activeTab === 'COMPLETED' && tx.status !== 'COMPLETED') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        tx.creator.toLowerCase().includes(q) ||
        tx.campaign.toLowerCase().includes(q) ||
        tx.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-5 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
      {/* Search and Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-xl bg-slate-950/60 border border-white/10">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by creator, campaign, or payment ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-950/80 border border-white/10 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-900/80 border border-white/5 overflow-x-auto no-scrollbar">
          {[
            { id: 'ALL', label: 'All Activity' },
            { id: 'IN_ESCROW', label: 'Locked in Escrow' },
            { id: 'COMPLETED', label: 'Released & Paid' },
            { id: 'DISPUTES', label: 'Disputes' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'DISPUTES' ? (
        <DisputesListCard
          onRaiseNewDispute={() => onRaiseDispute(transactions[0]?.id || 'PAY-GENERAL', 'Campaign Deal')}
        />
      ) : (
        <div className="space-y-3">
          {filtered.length > 0 ? (
            filtered.map((tx) => (
              <div
                key={tx.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-purple-500/30 transition-all shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl border shrink-0 ${
                      tx.status === 'COMPLETED'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}
                  >
                    {tx.status === 'COMPLETED' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="text-xs font-black text-white">{tx.creator}</h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          tx.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {tx.status === 'COMPLETED' ? 'Settled to Creator' : 'Locked in Escrow'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-purple-300">{tx.campaign}</p>
                    <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">
                      Ref: {tx.id} • {tx.date}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  <div className="text-right mr-2">
                    <span
                      className={`text-base font-black ${
                        tx.status === 'COMPLETED' ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {tx.amount}
                    </span>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">INR Escrow</span>
                  </div>

                  {tx.status === 'IN_ESCROW' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onApproveRelease(tx.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition-all shadow-md shadow-emerald-600/20"
                        title="Approve deliverable and release funds to creator"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Release</span>
                      </button>

                      <button
                        onClick={() => onRaiseDispute(tx.id, tx.campaign)}
                        className="px-2 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center gap-1 transition-colors"
                        title="Halt payment & open formal dispute"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Dispute</span>
                      </button>

                      <button
                        onClick={() => onWithdrawRefund(tx.id, tx.amount)}
                        className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10 transition-colors"
                        title="Withdraw funds back if campaign canceled"
                      >
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {tx.status === 'COMPLETED' && (
                    <button
                      onClick={onExportInvoices}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10 transition-colors"
                      title="Download Tax Invoice"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center space-y-2">
              <DollarSign className="w-8 h-8 text-slate-500 mx-auto" />
              <h3 className="text-sm font-bold text-white">No Escrow Activity Found</h3>
              <p className="text-xs text-slate-400">No payment records match your filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
