'use client';

import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Lock,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Check,
  CreditCard,
  Wallet,
} from 'lucide-react';
import DisputesListCard from './DisputesListCard';

export type TransactionCategory =
  | 'WALLET_TOPUP'
  | 'WITHDRAWAL'
  | 'CAMPAIGN_ALLOCATION'
  | 'CREATOR_SETTLEMENT'
  | 'REFUND'
  | 'DISPUTE';

export interface BrandEscrowTransaction {
  id: string;
  creator: string;
  campaign: string;
  amount: string;
  rawAmount?: number;
  date: string;
  status: 'IN_ESCROW' | 'COMPLETED' | 'DISPUTED';
  milestoneTitle?: string;
  category?: TransactionCategory;
  campaignTitle?: string;
}

interface BrandEscrowTransactionListProps {
  transactions: BrandEscrowTransaction[];
  isLoading?: boolean;
  onApproveRelease: (txId: string) => void;
  onRaiseDispute: (txId: string, campaign: string) => void;
  onWithdrawRefund: (txId: string, amount: string) => void;
  onExportInvoices: () => void;
  onDeposit?: () => void;
}

export default function BrandEscrowTransactionList({
  transactions,
  isLoading = false,
  onApproveRelease,
  onRaiseDispute,
  onWithdrawRefund,
  onExportInvoices,
  onDeposit,
}: BrandEscrowTransactionListProps) {
  const [activeTab, setActiveTab] = useState<'ALL' | 'IN_ESCROW' | 'COMPLETED' | 'DISPUTES'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const getTransactionDetails = (tx: BrandEscrowTransaction) => {
    const desc = (tx.campaign || '').toLowerCase();
    const creator = (tx.creator || '').toLowerCase();

    const isWithdrawal =
      tx.category === 'WITHDRAWAL' ||
      desc.includes('withdrawal') ||
      desc.includes('payout') ||
      creator.includes('withdrawal');

    const isTopUp =
      tx.category === 'WALLET_TOPUP' ||
      desc.includes('top-up') ||
      desc.includes('deposit') ||
      desc.includes('add money') ||
      (creator.includes('wallet') && !isWithdrawal);

    const isAllocated =
      tx.status === 'IN_ESCROW' ||
      tx.category === 'CAMPAIGN_ALLOCATION' ||
      desc.includes('allocated') ||
      desc.includes('escrow deposit');

    const isDisputed = tx.status === 'DISPUTED' || tx.category === 'DISPUTE';

    if (isWithdrawal) {
      return {
        tag: 'Withdrawal',
        tagStyle: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
        title: 'Zerify Wallet Withdrawal',
        icon: ArrowUpRight,
        iconBoxStyle: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        amountStyle: 'text-slate-200',
        amountPrefix: '-',
        subLabel: 'Bank / UPI Payout',
      };
    }

    if (isTopUp) {
      return {
        tag: 'Top-up to wallet',
        tagStyle: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        title: 'Zerify Wallet (Self Top-up)',
        icon: Wallet,
        iconBoxStyle: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        amountStyle: 'text-emerald-400',
        amountPrefix: '+',
        subLabel: 'Wallet Credited',
      };
    }

    if (isAllocated) {
      const campaignName = tx.campaignTitle || tx.campaign.replace(/^(campaign:\s*|campaign\s*#?)/i, '') || 'Campaign';
      return {
        tag: `Allocated to ${campaignName}`,
        tagStyle: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
        title: tx.creator && !tx.creator.includes('Wallet') ? tx.creator : `Campaign Escrow: ${campaignName}`,
        icon: Lock,
        iconBoxStyle: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        amountStyle: 'text-amber-400',
        amountPrefix: '',
        subLabel: 'Locked in Escrow',
      };
    }

    if (isDisputed) {
      return {
        tag: 'Under Dispute',
        tagStyle: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
        title: tx.creator,
        icon: AlertTriangle,
        iconBoxStyle: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        amountStyle: 'text-rose-400',
        amountPrefix: '',
        subLabel: 'Escrow Frozen',
      };
    }

    // Default: Settled / Paid to Creator
    const creatorName = tx.creator && !tx.creator.includes('Wallet') ? tx.creator : 'Creator';
    return {
      tag: `Paid to ${creatorName}`,
      tagStyle: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      title: creatorName,
      icon: CheckCircle2,
      iconBoxStyle: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      amountStyle: 'text-emerald-400',
      amountPrefix: '',
      subLabel: 'Deliverable Approved',
    };
  };

  const filtered = transactions.filter((tx) => {
    if (activeTab === 'IN_ESCROW' && tx.status !== 'IN_ESCROW') return false;
    if (activeTab === 'COMPLETED' && tx.status !== 'COMPLETED') return false;
    if (activeTab === 'DISPUTES' && tx.status !== 'DISPUTED') return false;
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
    <div className="space-y-4">
      {/* Controls Bar: Search & Filter Tabs */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by transaction, creator, or campaign..."
            className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/90 border border-white/10 rounded-xl overflow-x-auto no-scrollbar shrink-0">
          {(
            [
              { id: 'ALL', label: 'All Activity' },
              { id: 'IN_ESCROW', label: 'Locked in Escrow' },
              { id: 'COMPLETED', label: 'Settled & Wallet' },
              { id: 'DISPUTES', label: 'Disputes' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
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
          onRaiseNewDispute={() => onRaiseDispute('DISP-NEW', 'General Campaign')}
        />
      ) : (
        <div className="space-y-2.5">
          {isLoading ? (
            <div className="p-12 text-center space-y-2">
              <CreditCard className="w-6 h-6 text-purple-400 animate-pulse mx-auto" />
              <p className="text-xs text-slate-400 font-medium">Checking payment and escrow records...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-12 px-6 rounded-2xl border border-white/5 bg-slate-900/30 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
                <CreditCard className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-sm font-bold text-white">No Payment History Yet</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your wallet deposits, campaign allocations, and payout withdrawals will appear here automatically.
                </p>
              </div>
              {onDeposit && (
                <div className="pt-2">
                  <button
                    onClick={onDeposit}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 cursor-pointer"
                  >
                    <span>Deposit Funds</span>
                  </button>
                </div>
              )}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center space-y-1.5">
              <Search className="w-6 h-6 text-slate-500 mx-auto" />
              <h3 className="text-xs font-bold text-white">No Matching Transactions</h3>
              <p className="text-[11px] text-slate-400">No records match your search or filter selection.</p>
            </div>
          ) : (
            filtered.map((tx) => {
              const meta = getTransactionDetails(tx);
              const Icon = meta.icon;

              return (
                <div
                  key={tx.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-white/10 hover:border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-200 shadow-md backdrop-blur-md"
                >
                  {/* Left Column: Icon + Details */}
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div className={`p-2.5 rounded-xl border shrink-0 ${meta.iconBoxStyle}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-xs font-extrabold text-white truncate max-w-xs sm:max-w-md">
                          {meta.title}
                        </h4>

                        {/* Status Tag */}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${meta.tagStyle}`}
                        >
                          {meta.tag}
                        </span>
                      </div>

                      {/* Clean slate description (Purple text removed) */}
                      <p className="text-xs text-slate-300 font-medium leading-relaxed truncate max-w-sm sm:max-w-lg">
                        {tx.campaign}
                      </p>

                      <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 pt-0.5">
                        <span className="font-mono">{tx.id}</span>
                        <span>•</span>
                        <span>{tx.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Amount + Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5 shrink-0">
                    <div className="text-left sm:text-right">
                      <span className={`text-sm sm:text-base font-black tracking-tight ${meta.amountStyle}`}>
                        {meta.amountPrefix} {tx.amount}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
                        {meta.subLabel}
                      </span>
                    </div>

                    {/* In-Escrow Specific Actions */}
                    {tx.status === 'IN_ESCROW' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onApproveRelease(tx.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                          title="Release funds to creator"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Release</span>
                        </button>

                        <button
                          onClick={() => onRaiseDispute(tx.id, tx.campaign)}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Open formal dispute"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Dispute</span>
                        </button>
                      </div>
                    )}

                    {/* Invoice Download Action */}
                    {tx.status === 'COMPLETED' && (
                      <button
                        onClick={onExportInvoices}
                        className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5 hover:border-white/20 transition-colors cursor-pointer"
                        title="Download Receipt / Tax Invoice"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
