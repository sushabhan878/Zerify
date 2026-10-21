'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, Download, Plus, ArrowDownLeft } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import LottieLoader from '@/components/ui/LottieLoader';
import BrandEscrowKpiBar from '../payment-views/BrandEscrowKpiBar';
import BrandEscrowTransactionList, { BrandEscrowTransaction } from '../payment-views/BrandEscrowTransactionList';
import BrandDepositFundsModal from '../payment-views/BrandDepositFundsModal';
import BrandWithdrawFundsModal from '../payment-views/BrandWithdrawFundsModal';
import BrandBillingDetailsModal from '../payment-views/BrandBillingDetailsModal';
import RaiseDisputeModal from '../payment-views/RaiseDisputeModal';
import PaymentUnderConstructionNotice from '../payment-views/PaymentUnderConstructionNotice';

export default function BrandPayoutsSection() {
  const { format } = useCurrency();

  // Modals state
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [selectedTxForAction, setSelectedTxForAction] = useState<{ id: string; campaign: string; amount: string } | null>(null);

  // Brand data state
  const [availableBalance, setAvailableBalance] = useState(0);
  const [inEscrow, setInEscrow] = useState(0);
  const [totalSettled, setTotalSettled] = useState(0);
  const [hasBillingDetails, setHasBillingDetails] = useState(false);
  const [transactions, setTransactions] = useState<BrandEscrowTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Check cached brand billing details on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem('zerify_brand_billing_details') || localStorage.getItem('zerify_brand_profile_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.taxId || parsed?.escrowSetup?.taxId || parsed?.billingEmail) {
          setHasBillingDetails(true);
        }
      }
    } catch (e) {}
  }, []);

  const fetchBrandPayments = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('zerify_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const headers = { Authorization: token ? `Bearer ${token}` : '' };

      const [paymentsRes, walletRes] = await Promise.all([
        fetch(`${apiUrl}/payments/me`, { headers }).catch(() => null),
        fetch(`${apiUrl}/wallet`, { headers }).catch(() => null),
      ]);

      let walletTxList: BrandEscrowTransaction[] = [];

      if (walletRes && walletRes.ok) {
        const walletData = await walletRes.json();
        const walletBal = Number(walletData.balance) || 0;
        setAvailableBalance(walletBal);

        if (Array.isArray(walletData.transactions)) {
          walletTxList = walletData.transactions.map((tx: any) => {
            const desc = (tx.description || '').toLowerCase();
            const isWithdrawal =
              tx.type === 'REFUND' ||
              desc.includes('withdrawal') ||
              desc.includes('payout');
            const isCampaignDebit =
              tx.type === 'CAMPAIGN_DEBIT' ||
              desc.includes('campaign') ||
              desc.includes('allocation');

            const rawAmt = Number(tx.amount) || (tx.amountPaise ? Number(tx.amountPaise) / 100 : 0);
            const formattedAmt = `₹${rawAmt.toLocaleString('en-IN')}`;

            return {
              id: tx.id ? (tx.id.length > 12 ? `WAL-${tx.id.slice(-8).toUpperCase()}` : tx.id) : 'WAL-TOPUP',
              creator: isWithdrawal ? 'Wallet Withdrawal' : 'Zerify Wallet (Self Top-up)',
              campaign: tx.description || (isWithdrawal ? 'Funds transfer to bank / UPI' : 'Wallet Top-up via Cashfree'),
              amount: formattedAmt,
              rawAmount: rawAmt,
              date: tx.createdAt
                ? new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Recent',
              status: 'COMPLETED' as const,
              category: isWithdrawal ? 'WITHDRAWAL' as const : (isCampaignDebit ? 'CAMPAIGN_ALLOCATION' as const : 'WALLET_TOPUP' as const),
            };
          });
        }
      }

      let escrowMapped: BrandEscrowTransaction[] = [];
      if (paymentsRes && paymentsRes.ok) {
        const data = await paymentsRes.json();
        if (Array.isArray(data) && data.length > 0) {
          escrowMapped = data.map((p: any) => {
            const raw = Number(p.amount) || 0;
            const formattedAmt = `₹${raw.toLocaleString('en-IN')}`;
            const isSettled = p.status === 'SUCCESSFUL' || p.status === 'RELEASED';
            const isDisputed = p.status === 'REFUNDED' || p.status === 'FAILED' || p.status === 'DISPUTED';

            const creatorName = p.creator || p.creatorName || (p.campaignTitle ? `Campaign: ${p.campaignTitle}` : 'Zerify Escrow');
            const campaignName = p.campaignTitle || (p.campaignId ? `Campaign #${p.campaignId.slice(0, 8)}` : 'Platform Escrow Deposit');

            return {
              id: p.id ? (p.id.length > 12 ? `ESC-${p.id.slice(0, 8).toUpperCase()}` : p.id) : 'ESC-UNKNOWN',
              creator: creatorName,
              campaign: campaignName,
              campaignTitle: p.campaignTitle,
              amount: formattedAmt,
              rawAmount: raw,
              date: p.createdAt
                ? new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Recent',
              status: isSettled ? 'COMPLETED' as const : (isDisputed ? 'DISPUTED' as const : 'IN_ESCROW' as const),
              milestoneTitle: p.milestoneTitle,
              category: isSettled ? 'CREATOR_SETTLEMENT' as const : (isDisputed ? 'DISPUTE' as const : 'CAMPAIGN_ALLOCATION' as const),
            };
          });

          const settledSum = escrowMapped.filter((t) => t.status === 'COMPLETED').reduce((acc, t) => acc + (t.rawAmount || 0), 0);
          const escrowSum = escrowMapped.filter((t) => t.status === 'IN_ESCROW').reduce((acc, t) => acc + (t.rawAmount || 0), 0);
          setTotalSettled(settledSum);
          setInEscrow(escrowSum);
        } else {
          setTotalSettled(0);
          setInEscrow(0);
        }
      }

      setTransactions([...walletTxList, ...escrowMapped]);
    } catch (e) {
      console.error('Failed to load wallet & payments:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrandPayments();
  }, []);

  const handleApproveRelease = (txId: string) => {
    const target = transactions.find((t) => t.id === txId);
    if (!target) return;
    if (confirm(`Approve deliverable and release ${target.amount} from Escrow to ${target.creator}? This action triggers immediate payout.`)) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === txId ? { ...t, status: 'COMPLETED' as const } : t))
      );
      setInEscrow((prev) => Math.max(0, prev - (target.rawAmount || 0)));
      setTotalSettled((prev) => prev + (target.rawAmount || 0));
    }
  };

  const handleOpenDispute = (txId: string, campaign: string) => {
    setSelectedTxForAction({ id: txId, campaign, amount: '' });
    setIsDisputeOpen(true);
  };

  const handleOpenWithdraw = (txId: string, amount: string) => {
    setSelectedTxForAction({ id: txId, campaign: 'Escrow Refund', amount });
    setIsWithdrawOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-[500px] h-full flex flex-col items-center justify-center py-28 animate-in fade-in duration-300">
        <LottieLoader size={160} message="Loading Zerify Payments & Escrow..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-purple-400" />
            <span>Campaign Escrow & Creator Payments</span>
          </h2>
          <p className="text-xs text-slate-400">
            Deposit funds upfront before hiring creators. Withdraw unspent balances anytime.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBillingOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-bold text-slate-300 transition-colors"
          >
            Billing Profile (Optional)
          </button>
          <button
            onClick={() => alert('Exporting tax invoices & GST receipts...')}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-bold text-purple-300 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Invoices</span>
          </button>
        </div>
      </div>

      {/* Production Deployment Under Construction Notice */}
      <PaymentUnderConstructionNotice />

      {/* KPI Bar */}
      <BrandEscrowKpiBar
        availableBalanceStr={format(availableBalance, { showDecimals: true })}
        inEscrowStr={format(inEscrow, { showDecimals: true })}
        totalSettledStr={format(totalSettled, { showDecimals: true })}
        contractsCount={transactions.filter((t) => t.status === 'COMPLETED').length}
        hasBillingDetails={hasBillingDetails}
        onDeposit={() => setIsDepositOpen(true)}
        onWithdraw={() => {
          setSelectedTxForAction({ id: 'GENERAL_WITHDRAW', campaign: 'Unallocated Escrow', amount: format(availableBalance) });
          setIsWithdrawOpen(true);
        }}
        onManageBilling={() => setIsBillingOpen(true)}
      />

      {/* Escrow Activity List */}
      <BrandEscrowTransactionList
        transactions={transactions}
        isLoading={isLoading}
        onApproveRelease={handleApproveRelease}
        onRaiseDispute={handleOpenDispute}
        onWithdrawRefund={handleOpenWithdraw}
        onExportInvoices={() => alert('Downloading tax invoice...')}
        onDeposit={() => setIsDepositOpen(true)}
      />

      {/* Modals */}
      <BrandDepositFundsModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onSuccess={(depositedAmount) => {
          if (depositedAmount) {
            setAvailableBalance((prev) => prev + depositedAmount);
          }
          fetchBrandPayments();
        }}
      />

      <BrandWithdrawFundsModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        availableBalance={availableBalance}
        onSuccess={(amount) => {
          if (amount) {
            setAvailableBalance((prev) => Math.max(0, prev - amount));
          }
          fetchBrandPayments();
        }}
      />

      <BrandBillingDetailsModal
        isOpen={isBillingOpen}
        onClose={() => setIsBillingOpen(false)}
        onSaved={() => setHasBillingDetails(true)}
      />

      <RaiseDisputeModal
        isOpen={isDisputeOpen}
        onClose={() => setIsDisputeOpen(false)}
        paymentId={selectedTxForAction?.id || 'PAY-GENERAL'}
        campaignTitle={selectedTxForAction?.campaign}
        onDisputed={() => {
          if (selectedTxForAction?.id) {
            setTransactions((prev) =>
              prev.map((t) => (t.id === selectedTxForAction.id ? { ...t, status: 'DISPUTED' as const } : t))
            );
          }
        }}
      />
    </div>
  );
}
