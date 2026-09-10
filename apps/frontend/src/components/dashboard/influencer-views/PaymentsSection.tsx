'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, Search, Download } from 'lucide-react';
import PaymentsKpiBar from './subcomponents/PaymentsKpiBar';
import TransactionCardItem, { TransactionItem } from './subcomponents/TransactionCardItem';
import { useCurrency } from '@/context/CurrencyContext';
import LinkPayoutCredentialsModal from '../payment-views/LinkPayoutCredentialsModal';
import ClaimPayoutModal from '../payment-views/ClaimPayoutModal';
import RaiseDisputeModal from '../payment-views/RaiseDisputeModal';
import DisputesListCard from '../payment-views/DisputesListCard';

export default function PaymentsSection() {
  const { currency, format } = useCurrency();
  const [activeTab, setActiveTab] = useState<'ALL' | 'COMPLETED' | 'PENDING_APPROVAL' | 'DISPUTES'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeOpen] = useState(false);
  const [selectedDisputePayment, setSelectedDisputePayment] = useState<{ id: string; title: string } | null>(null);

  // Beneficiary credentials & balances state
  const [beneficiary, setBeneficiary] = useState<any>(null);
  const [availableBalance, setAvailableBalance] = useState(705575);
  const [inEscrow, setInEscrow] = useState(1135600);
  const [lifetimeEarnings, setLifetimeEarnings] = useState(4084000);

  const fetchPayoutData = async () => {
    try {
      const token = localStorage.getItem('zerify_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

      // 1. Fetch beneficiary account
      const bRes = await fetch(`${apiUrl}/payout-accounts/me`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      if (bRes.ok) {
        const bData = await bRes.json();
        setBeneficiary(bData);
      } else {
        const cached = localStorage.getItem('zerify_beneficiary_details');
        if (cached) setBeneficiary(JSON.parse(cached));
      }

      // 2. Fetch payable balance
      const pRes = await fetch(`${apiUrl}/payouts/me/payable`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      if (pRes.ok) {
        const pData = await pRes.json();
        if (pData?.payableBalance !== undefined) {
          setAvailableBalance(pData.payableBalance);
        }
      }
    } catch (e) {
      // Local storage fallback
      const cached = localStorage.getItem('zerify_beneficiary_details');
      if (cached) setBeneficiary(JSON.parse(cached));
    }
  };

  useEffect(() => {
    fetchPayoutData();
  }, []);

  const rawTx = [
    {
      id: 'TX-90214',
      brand: 'Sony Audio Systems',
      campaign: 'WH-1000XM5 Wireless Headphones Launch',
      usdAmount: 3500,
      inrAmount: 292250,
      date: 'Jul 26, 2026',
      type: 'PAYOUT_RELEASE' as const,
      status: 'COMPLETED' as const,
    },
    {
      id: 'TX-89420',
      brand: 'Gymshark Apparel',
      campaign: 'Summer Activewear Story Feature',
      usdAmount: 1500,
      inrAmount: 125250,
      date: 'Jul 14, 2026',
      type: 'PAYOUT_RELEASE' as const,
      status: 'COMPLETED' as const,
    },
    {
      id: 'TX-88105',
      brand: 'FlexiSpot Official',
      campaign: 'Ergonomic Desk Setup Showcase',
      usdAmount: 2800,
      inrAmount: 233800,
      date: 'Locked in Escrow',
      type: 'ESCROW_DEPOSIT' as const,
      status: 'PENDING_APPROVAL' as const,
    },
    {
      id: 'TX-87410',
      brand: 'NordVPN Security',
      campaign: 'Tech Sponsorship Integration',
      usdAmount: 1800,
      inrAmount: 150300,
      date: 'Jul 02, 2026',
      type: 'PAYOUT_RELEASE' as const,
      status: 'COMPLETED' as const,
    },
  ];

  const transactions: TransactionItem[] = rawTx.map((t) => ({
    id: t.id,
    brand: t.brand,
    campaign: t.campaign,
    amount: `+${format(currency === 'INR' ? t.inrAmount : t.usdAmount, { showDecimals: true })}`,
    date: t.date,
    type: t.type,
    status: t.status,
  }));

  const availableBalanceStr = format(currency === 'INR' ? availableBalance : availableBalance / 83.5, { showDecimals: true });
  const inEscrowStr = format(currency === 'INR' ? inEscrow : inEscrow / 83.5, { showDecimals: true });
  const lifetimeEarningsStr = format(currency === 'INR' ? lifetimeEarnings : lifetimeEarnings / 83.5, { showDecimals: true });

  const handleOpenDispute = (paymentId: string, campaignTitle: string) => {
    setSelectedDisputePayment({ id: paymentId, title: campaignTitle });
    setIsDisputeOpen(true);
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
          <p className="text-xs text-slate-400">
            Link payout credentials, claim available balances, and resolve escrow disputes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLinkModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-bold text-slate-300 transition-colors"
          >
            {beneficiary ? 'Manage Payout Account' : 'Link Payout Account'}
          </button>
          <button
            onClick={() => alert('Downloading tax summary...')}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-bold text-purple-300 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tax Summary</span>
          </button>
        </div>
      </div>

      {/* 1. Financial KPI Overview Bar */}
      <PaymentsKpiBar
        availableBalance={availableBalanceStr}
        inEscrow={inEscrowStr}
        lifetimeEarnings={lifetimeEarningsStr}
        beneficiaryAccount={beneficiary}
        onWithdraw={() => setIsClaimModalOpen(true)}
        onLinkCredentials={() => setIsLinkModalOpen(true)}
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
            onRaiseNewDispute={() => handleOpenDispute(transactions[0]?.id || 'TX-88105', 'Campaign Escrow')}
          />
        ) : (
          <div className="space-y-3">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => (
                <TransactionCardItem
                  key={tx.id}
                  tx={tx}
                  onDownloadInvoice={(id) => alert(`Downloading invoice for ${id}...`)}
                  onRaiseDispute={handleOpenDispute}
                />
              ))
            ) : (
              <div className="p-8 text-center space-y-2">
                <DollarSign className="w-8 h-8 text-slate-500 mx-auto" />
                <h3 className="text-sm font-bold text-white">No Transactions Found</h3>
                <p className="text-xs text-slate-400">No payment records match your search criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <LinkPayoutCredentialsModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onLinked={() => {
          fetchPayoutData();
        }}
      />

      <ClaimPayoutModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        availableAmount={availableBalance}
        isCredentialsLinked={!!beneficiary}
        onClaimSuccess={() => {
          setAvailableBalance(0);
          fetchPayoutData();
        }}
      />

      <RaiseDisputeModal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeOpen(false)}
        paymentId={selectedDisputePayment?.id || 'TX-88105'}
        campaignTitle={selectedDisputePayment?.title}
        onDisputed={() => {
          setActiveTab('DISPUTES');
          fetchPayoutData();
        }}
      />
    </div>
  );
}
