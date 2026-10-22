'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, Search, Download, CreditCard, Loader2 } from 'lucide-react';
import LottieLoader from '@/components/ui/LottieLoader';
import PaymentsKpiBar from './subcomponents/PaymentsKpiBar';
import TransactionCardItem, { TransactionItem } from './subcomponents/TransactionCardItem';
import { useCurrency } from '@/context/CurrencyContext';
import LinkPayoutCredentialsModal from '../payment-views/LinkPayoutCredentialsModal';
import ClaimPayoutModal from '../payment-views/ClaimPayoutModal';
import RaiseDisputeModal from '../payment-views/RaiseDisputeModal';
import DisputesListCard from '../payment-views/DisputesListCard';
import PaymentUnderConstructionNotice from '../payment-views/PaymentUnderConstructionNotice';

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
  const [availableBalance, setAvailableBalance] = useState(0);
  const [inEscrow, setInEscrow] = useState(0);
  const [lifetimeEarnings, setLifetimeEarnings] = useState(0);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const fetchPayoutData = async () => {
    try {
      setIsLoading(true);
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
        const bal = pData?.payableBalance ?? pData?.payableAmount;
        if (bal !== undefined) {
          setAvailableBalance(Number(bal) || 0);
        }
      }

      // 3. Fetch payouts history from backend
      const txRes = await fetch(`${apiUrl}/payouts`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      if (txRes.ok) {
        const txData = await txRes.json();
        if (Array.isArray(txData)) {
          setPayouts(txData);
          const totalEarned = txData
            .filter((p: any) => p.status === 'COMPLETED')
            .reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
          const pendingEscrow = txData
            .filter((p: any) => p.status === 'PENDING' || p.status === 'PROCESSING')
            .reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
          setLifetimeEarnings(totalEarned);
          setInEscrow(pendingEscrow);
        } else {
          setPayouts([]);
          setLifetimeEarnings(0);
          setInEscrow(0);
        }
      } else {
        setPayouts([]);
        setLifetimeEarnings(0);
        setInEscrow(0);
      }
    } catch (e) {
      setPayouts([]);
      setLifetimeEarnings(0);
      setInEscrow(0);
      const cached = localStorage.getItem('zerify_beneficiary_details');
      if (cached) setBeneficiary(JSON.parse(cached));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayoutData();

    // If navigated from Settings with intent to link payout account
    try {
      const shouldOpen = sessionStorage.getItem('zerify_open_link_payout');
      if (shouldOpen === 'true') {
        sessionStorage.removeItem('zerify_open_link_payout');
        setIsLinkModalOpen(true);
      }
    } catch (e) {}
  }, []);

  const transactions: TransactionItem[] = payouts.map((t: any) => {
    const rawAmt = Number(t.amount) || 0;
    return {
      id: t.id ? (t.id.startsWith('TX-') ? t.id : `TX-${t.id.slice(0, 8).toUpperCase()}`) : 'TX-UNKNOWN',
      brand: t.brandName || (t.campaignTitle ? `Campaign: ${t.campaignTitle}` : 'Brand Partner'),
      campaign: t.campaignTitle || (t.campaignId ? `Campaign #${t.campaignId.slice(0, 8)}` : 'Campaign Payout'),
      amount: `+${format(rawAmt, { showDecimals: true })}`,
      date: t.createdAt
        ? new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Recent',
      type: (t.status === 'COMPLETED' ? 'PAYOUT_RELEASE' : 'ESCROW_DEPOSIT') as TransactionItem['type'],
      status: (t.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING_APPROVAL') as TransactionItem['status'],
    };
  });

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

  if (isLoading) {
    return (
      <div className="min-h-[500px] h-full flex flex-col items-center justify-center py-28 animate-in fade-in duration-300">
        <LottieLoader size={160} message="Loading Zerify Earnings & Escrow..." />
      </div>
    );
  }

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

      {/* Production Deployment Under Construction Notice */}
      <PaymentUnderConstructionNotice />

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
            {isLoading ? (
              <div className="py-14 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-7 h-7 text-purple-400 animate-spin" />
                <p className="text-xs text-slate-400 font-medium">Checking payout and payment records...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-12 px-6 rounded-xl border border-white/5 bg-slate-900/30 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
                  <CreditCard className="w-7 h-7" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h3 className="text-base font-bold text-white">No Payment History Available</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    No payment or payout transactions were found in the backend. When your completed campaign deliverables are approved by brands and payouts are disbursed, your transaction history will appear here.
                  </p>
                </div>
                {!beneficiary && (
                  <div className="pt-2">
                    <button
                      onClick={() => setIsLinkModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20"
                    >
                      <span>Link Payout Account</span>
                    </button>
                  </div>
                )}
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <Search className="w-8 h-8 text-slate-500 mx-auto" />
                <h3 className="text-sm font-bold text-white">No Matching Transactions</h3>
                <p className="text-xs text-slate-400">No payment records match your search criteria.</p>
              </div>
            ) : (
              filteredTransactions.map((tx) => (
                <TransactionCardItem
                  key={tx.id}
                  tx={tx}
                  onDownloadInvoice={(id) => alert(`Downloading invoice for ${id}...`)}
                  onRaiseDispute={handleOpenDispute}
                />
              ))
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
