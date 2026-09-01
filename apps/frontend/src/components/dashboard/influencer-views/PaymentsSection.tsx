'use client';

import React, { useState } from 'react';
import { DollarSign, Search, Download } from 'lucide-react';
import PaymentsKpiBar from './subcomponents/PaymentsKpiBar';
import TransactionCardItem, { TransactionItem } from './subcomponents/TransactionCardItem';

export default function PaymentsSection() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'COMPLETED' | 'PENDING_APPROVAL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [transactions, setTransactions] = useState<TransactionItem[]>([
    {
      id: 'TX-90214',
      brand: 'Sony Audio Systems',
      campaign: 'WH-1000XM5 Wireless Headphones Launch',
      amount: '+$3,500.00',
      date: 'Jul 26, 2026',
      type: 'PAYOUT_RELEASE',
      status: 'COMPLETED',
    },
    {
      id: 'TX-89420',
      brand: 'Gymshark Apparel',
      campaign: 'Summer Activewear Story Feature',
      amount: '+$1,500.00',
      date: 'Jul 14, 2026',
      type: 'PAYOUT_RELEASE',
      status: 'COMPLETED',
    },
    {
      id: 'TX-88105',
      brand: 'FlexiSpot Official',
      campaign: 'Ergonomic Desk Setup Showcase',
      amount: '+$2,800.00',
      date: 'Locked in Escrow',
      type: 'ESCROW_DEPOSIT',
      status: 'PENDING_APPROVAL',
    },
    {
      id: 'TX-87410',
      brand: 'NordVPN Security',
      campaign: 'Tech Sponsorship Integration',
      amount: '+$1,800.00',
      date: 'Jul 02, 2026',
      type: 'PAYOUT_RELEASE',
      status: 'COMPLETED',
    },
  ]);

  const handleWithdraw = () => {
    alert('Withdrawal request of $8,450.00 initiated to connected bank account! Funds will transfer within 24 hours.');
  };

  const handleDownloadInvoice = (id: string) => {
    alert(`Downloading PDF tax invoice & receipt for transaction ${id}...`);
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesTab = activeTab === 'ALL' || tx.status === activeTab;
    const matchesSearch =
      tx.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.campaign.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-purple-400" />
            <span>Earnings & Payment Escrow</span>
          </h2>
          <p className="text-xs text-slate-400">Track balance, milestone escrow holds, tax receipts, and payout history</p>
        </div>

        <button
          onClick={() => handleDownloadInvoice('ALL_TAX_2026')}
          className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-bold text-purple-300 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download 1099/Tax Summary</span>
        </button>
      </div>

      {/* 1. Financial KPI Overview Bar */}
      <PaymentsKpiBar
        availableBalance="$8,450.00"
        inEscrow="$13,600.00"
        lifetimeEarnings="$48,910.00"
        onWithdraw={handleWithdraw}
      />

      {/* 2. Transaction List Box */}
      <div className="p-5 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
        {/* Controls Bar: Search & Status Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-xl bg-slate-950/60 border border-white/10">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search transactions by brand, campaign, or ref ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-950/80 border border-white/10 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-900/80 border border-white/5 overflow-x-auto no-scrollbar">
            {[
              { id: 'ALL', label: 'All Transactions' },
              { id: 'COMPLETED', label: 'Completed Payouts' },
              { id: 'PENDING_APPROVAL', label: 'In Escrow' },
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

        {/* Transaction Cards List */}
        <div className="space-y-3">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx) => (
              <TransactionCardItem key={tx.id} tx={tx} onDownloadInvoice={handleDownloadInvoice} />
            ))
          ) : (
            <div className="p-8 text-center space-y-2">
              <DollarSign className="w-8 h-8 text-slate-500 mx-auto" />
              <h3 className="text-sm font-bold text-white">No Transactions Found</h3>
              <p className="text-xs text-slate-400">No payment records match your search criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
