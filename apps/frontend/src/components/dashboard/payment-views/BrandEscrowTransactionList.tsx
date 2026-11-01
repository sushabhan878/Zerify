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
  ShieldCheck,
} from 'lucide-react';
import DisputesListCard from './DisputesListCard';

export type TransactionCategory =
  | 'WALLET_TOPUP'
  | 'WITHDRAWAL'
  | 'CAMPAIGN_ALLOCATION'
  | 'CREATOR_SETTLEMENT'
  | 'REFUND'
  | 'DISPUTE'
  | 'ESCROW_DEPOSIT';

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
  campaignId?: string;
  rawCreatedAt?: number;
}

interface BrandEscrowTransactionListProps {
  transactions: BrandEscrowTransaction[];
  isLoading?: boolean;
  onApproveRelease?: (txId: string) => void;
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

    const isEscrowPayout =
      tx.category === 'CREATOR_SETTLEMENT' ||
      (tx.status === 'COMPLETED' &&
        (desc.includes('payout to creator') ||
          desc.includes('milestone release') ||
          desc.includes('settled') ||
          desc.includes('paid to')));

    const isEscrowDeposit =
      !isEscrowPayout &&
      (tx.category === 'ESCROW_DEPOSIT' ||
        tx.category === 'CAMPAIGN_ALLOCATION' ||
        tx.status === 'IN_ESCROW' ||
        Boolean(tx.campaignTitle) ||
        desc.includes('escrow') ||
        creator.includes('escrow') ||
        desc.includes('allocated to campaign') ||
        desc.includes('campaign escrow'));

    const isTopUp =
      !isEscrowDeposit &&
      !isEscrowPayout &&
      (tx.category === 'WALLET_TOPUP' ||
        desc.includes('top-up') ||
        desc.includes('wallet top-up') ||
        desc.includes('add money') ||
        (creator.includes('wallet') && !isWithdrawal));

    const isDisputed = tx.status === 'DISPUTED' || tx.category === 'DISPUTE';

    // 1. Withdrawal -> Gray or White
    if (isWithdrawal) {
      return {
        cardStyle:
          'p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-white/10 hover:border-white/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-200 shadow-md backdrop-blur-md light:bg-white light:hover:bg-slate-50/80 light:border-slate-200/80 light:shadow-sm',
        tag: 'Withdrawal',
        tagStyle: 'bg-white/10 text-slate-200 border-white/20 font-bold light:bg-slate-100 light:text-slate-700 light:border-slate-200',
        title: 'Zerify Wallet Withdrawal',
        icon: ArrowUpRight,
        iconBoxStyle: 'bg-white/5 text-slate-200 border-white/10 light:bg-slate-100 light:text-slate-700 light:border-slate-200',
        amountStyle: 'text-white light:text-slate-900 font-black',
        amountPrefix: '-',
        subLabel: 'BANK / UPI PAYOUT',
        isEscrow: false,
        isEscrowPayout: false,
        campaignName: '',
      };
    }

    // 2. Escrow Payout (Released / paid to creator) -> Yellow
    if (isEscrowPayout) {
      const resolvedCampaignName =
        tx.campaignTitle ||
        tx.campaign.replace(/^(campaign:\s*|campaign\s*#?|platform escrow deposit:?\s*|escrow:\s*)/i, '').trim() ||
        'Campaign Escrow';

      const creatorName =
        tx.creator &&
        !tx.creator.includes('Wallet') &&
        !tx.creator.includes('Zerify Escrow') &&
        !tx.creator.includes('Campaign Escrow Deposit')
          ? tx.creator
          : 'Influencer Payout';

      return {
        cardStyle:
          'p-3.5 sm:p-4 rounded-2xl bg-slate-900/70 hover:bg-slate-900/90 border border-amber-500/30 hover:border-amber-500/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-200 shadow-md shadow-amber-950/20 backdrop-blur-md light:bg-white light:hover:bg-slate-50/80 light:border-amber-200/80 light:shadow-sm',
        tag: 'Escrow Payout',
        tagStyle: 'bg-amber-500/15 text-amber-300 border-amber-500/30 font-bold light:bg-amber-50 light:text-amber-700 light:border-amber-200',
        title: `Escrow Payout: ${creatorName}`,
        icon: CheckCircle2,
        iconBoxStyle: 'bg-amber-500/10 text-amber-400 border-amber-500/20 light:bg-amber-50 light:text-amber-600 light:border-amber-200',
        amountStyle: 'text-amber-400 light:text-amber-600 font-black',
        amountPrefix: '-',
        subLabel: 'ESCROW PAYOUT',
        isEscrow: true,
        isEscrowPayout: true,
        campaignName: resolvedCampaignName,
      };
    }

    // 3. User adds money to escrow -> Green with distinct "Deposited to Escrow" tag
    if (isEscrowDeposit) {
      const resolvedCampaignName =
        tx.campaignTitle ||
        tx.campaign.replace(/^(campaign:\s*|campaign\s*#?|platform escrow deposit:?\s*|escrow:\s*)/i, '').trim() ||
        'Campaign Escrow';

      return {
        cardStyle:
          'p-3.5 sm:p-4 rounded-2xl bg-slate-900/70 hover:bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-500/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-200 shadow-md shadow-emerald-950/20 backdrop-blur-md light:bg-white light:hover:bg-slate-50/80 light:border-emerald-200/80 light:shadow-sm',
        tag: 'Deposited to Escrow',
        tagStyle: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-bold light:bg-emerald-50 light:text-emerald-700 light:border-emerald-200',
        title:
          tx.creator &&
          !tx.creator.includes('Wallet') &&
          !tx.creator.includes('Zerify Escrow') &&
          !tx.creator.includes('Campaign Escrow Deposit')
            ? tx.creator
            : 'Campaign Escrow Deposit',
        icon: ShieldCheck,
        iconBoxStyle: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 light:bg-emerald-50 light:text-emerald-600 light:border-emerald-200',
        amountStyle: 'text-emerald-400 light:text-emerald-600 font-black',
        amountPrefix: '+',
        subLabel: 'LOCKED IN ESCROW',
        isEscrow: true,
        isEscrowPayout: false,
        campaignName: resolvedCampaignName,
      };
    }

    // 4. User adds money to Zerify wallet -> Green with distinct "Top-up to wallet" tag
    if (isTopUp) {
      return {
        cardStyle:
          'p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-white/10 hover:border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-200 shadow-md backdrop-blur-md light:bg-white light:hover:bg-slate-50/80 light:border-emerald-200/80 light:shadow-sm',
        tag: 'Top-up to wallet',
        tagStyle: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-bold light:bg-emerald-50 light:text-emerald-700 light:border-emerald-200',
        title: 'Zerify Wallet (Self Top-up)',
        icon: Wallet,
        iconBoxStyle: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 light:bg-emerald-50 light:text-emerald-600 light:border-emerald-200',
        amountStyle: 'text-emerald-400 light:text-emerald-600 font-black',
        amountPrefix: '+',
        subLabel: 'WALLET CREDITED',
        isEscrow: false,
        isEscrowPayout: false,
        campaignName: '',
      };
    }

    // 5. Dispute -> Rose
    if (isDisputed) {
      return {
        cardStyle:
          'p-3.5 sm:p-4 rounded-2xl bg-rose-950/20 hover:bg-rose-950/30 border border-rose-500/30 hover:border-rose-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-200 shadow-md backdrop-blur-md light:bg-white light:hover:bg-slate-50/80 light:border-rose-200/80 light:shadow-sm',
        tag: 'Under Dispute',
        tagStyle: 'bg-rose-500/15 text-rose-300 border-rose-500/30 font-bold light:bg-rose-50 light:text-rose-700 light:border-rose-200',
        title: tx.creator,
        icon: AlertTriangle,
        iconBoxStyle: 'bg-rose-500/10 text-rose-400 border-rose-500/20 light:bg-rose-50 light:text-rose-600 light:border-rose-200',
        amountStyle: 'text-rose-400 light:text-rose-600 font-black',
        amountPrefix: '',
        subLabel: 'ESCROW FROZEN',
        isEscrow: false,
        isEscrowPayout: false,
        campaignName: '',
      };
    }

    // Default: Paid to Creator -> Yellow
    const creatorName = tx.creator && !tx.creator.includes('Wallet') ? tx.creator : 'Creator';
    return {
      cardStyle:
        'p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-amber-500/25 hover:border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-200 shadow-md backdrop-blur-md light:bg-white light:hover:bg-slate-50/80 light:border-amber-200/80 light:shadow-sm',
      tag: `Paid to ${creatorName}`,
      tagStyle: 'bg-amber-500/15 text-amber-300 border-amber-500/30 font-bold light:bg-amber-50 light:text-amber-700 light:border-amber-200',
      title: creatorName,
      icon: CheckCircle2,
      iconBoxStyle: 'bg-amber-500/10 text-amber-400 border-amber-500/20 light:bg-amber-50 light:text-amber-600 light:border-amber-200',
      amountStyle: 'text-amber-400 light:text-amber-600 font-black',
      amountPrefix: '-',
      subLabel: 'ESCROW PAYOUT',
      isEscrow: false,
      isEscrowPayout: true,
      campaignName: '',
    };
  };

  const filtered = transactions.filter((tx) => {
    if (activeTab === 'IN_ESCROW' && tx.status !== 'IN_ESCROW' && tx.category !== 'ESCROW_DEPOSIT') return false;
    if (activeTab === 'COMPLETED' && tx.status !== 'COMPLETED') return false;
    if (activeTab === 'DISPUTES' && tx.status !== 'DISPUTED') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        tx.creator.toLowerCase().includes(q) ||
        tx.campaign.toLowerCase().includes(q) ||
        (tx.campaignTitle && tx.campaignTitle.toLowerCase().includes(q)) ||
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
            className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 light:bg-white light:border-slate-200/80 light:text-slate-900 light:placeholder-slate-400 light:shadow-sm transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/90 border border-white/10 rounded-xl overflow-x-auto no-scrollbar shrink-0 light:bg-white light:border-slate-200/80 light:shadow-sm">
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
                  ? 'bg-purple-600 text-white keep-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-100'
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
              <p className="text-xs text-slate-400 light:text-slate-500 font-medium">Checking payment and escrow records...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-12 px-6 rounded-2xl border border-white/5 bg-slate-900/30 light:bg-white light:border-slate-200/80 light:shadow-sm text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
                <CreditCard className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-sm font-bold text-white light:text-slate-900">No Payment History Yet</h3>
                <p className="text-xs text-slate-400 light:text-slate-500 leading-relaxed">
                  Your wallet deposits, campaign allocations, and payout withdrawals will appear here automatically.
                </p>
              </div>
              {onDeposit && (
                <div className="pt-2">
                  <button
                    onClick={onDeposit}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white keep-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 cursor-pointer"
                  >
                    <span>Deposit Funds</span>
                  </button>
                </div>
              )}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center space-y-1.5">
              <Search className="w-6 h-6 text-slate-500 mx-auto" />
              <h3 className="text-xs font-bold text-white light:text-slate-900">No Matching Transactions</h3>
              <p className="text-[11px] text-slate-400 light:text-slate-500">No records match your search or filter selection.</p>
            </div>
          ) : (
            filtered.map((tx) => {
              const meta = getTransactionDetails(tx);
              const Icon = meta.icon;

              return (
                <div key={tx.id} className={meta.cardStyle}>
                  {/* Left Column: Icon + Details */}
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div className={`p-2.5 rounded-xl border shrink-0 ${meta.iconBoxStyle}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-xs font-extrabold text-white light:text-slate-900 truncate max-w-xs sm:max-w-md">
                          {meta.title}
                        </h4>

                        {/* Status Tag */}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] border ${meta.tagStyle}`}
                        >
                          {meta.tag}
                        </span>
                      </div>

                      {/* Campaign Indicator or Transaction Description */}
                      {meta.isEscrow ? (
                        <div className="flex items-center gap-2 flex-wrap pt-0.5">
                          <div
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border shadow-sm ${
                              meta.isEscrowPayout
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 light:bg-amber-50 light:border-amber-200/80 light:text-amber-700'
                                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 light:bg-purple-50 light:border-purple-200/80 light:text-purple-700'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                                meta.isEscrowPayout ? 'bg-amber-400' : 'bg-emerald-400 light:bg-purple-500'
                              }`}
                            />
                            <span className="text-[11px] font-semibold">Campaign:</span>
                            <span className="text-xs font-bold text-white light:text-slate-900 max-w-xs sm:max-w-md truncate">
                              {meta.campaignName}
                            </span>
                          </div>

                          {tx.milestoneTitle && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-semibold text-slate-300 light:bg-slate-100 light:border-slate-200 light:text-slate-700">
                              <span className="text-slate-400 light:text-slate-500">Milestone:</span>
                              <span className="text-white light:text-slate-900">{tx.milestoneTitle}</span>
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-300 light:text-slate-600 font-medium leading-relaxed truncate max-w-sm sm:max-w-lg">
                          {tx.campaign}
                        </p>
                      )}

                      <div className="text-[10px] text-slate-500 light:text-slate-400 font-medium flex items-center gap-1.5 pt-0.5">
                        <span className="font-mono">{tx.id}</span>
                        <span>•</span>
                        <span>{tx.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Amount + Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5 light:border-slate-100 shrink-0">
                    <div className="text-left sm:text-right">
                      <span className={`text-sm sm:text-base tracking-tight ${meta.amountStyle}`}>
                        {meta.amountPrefix} {tx.amount}
                      </span>
                      <span className="text-[10px] text-slate-400 light:text-slate-500 block font-semibold uppercase tracking-wider">
                        {meta.subLabel}
                      </span>
                    </div>

                    {/* In-Escrow Specific Actions: Only show dispute button, no release button */}
                    {tx.status === 'IN_ESCROW' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onRaiseDispute(tx.id, tx.campaignTitle || tx.campaign)}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 light:bg-rose-50 light:hover:bg-rose-100 light:text-rose-700 light:border-rose-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
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
                        className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5 hover:border-white/20 light:bg-slate-100 light:hover:bg-slate-200 light:text-slate-600 light:hover:text-slate-900 light:border-slate-200 transition-colors cursor-pointer"
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
