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

      const [paymentsRes, walletRes, campaignsRes] = await Promise.all([
        fetch(`${apiUrl}/payments/me`, { headers }).catch(() => null),
        fetch(`${apiUrl}/wallet`, { headers }).catch(() => null),
        fetch(`${apiUrl}/campaigns`, { headers }).catch(() => null),
      ]);

      const campaignMap = new Map<string, string>();
      if (campaignsRes && campaignsRes.ok) {
        const campaignsData = await campaignsRes.json().catch(() => []);
        if (Array.isArray(campaignsData)) {
          campaignsData.forEach((c: any) => {
            if (c.id && c.title) campaignMap.set(c.id, c.title);
          });
        }
      }

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
              desc.includes('allocation') ||
              desc.includes('escrow');

            const rawAmt = Number(tx.amount) || (tx.amountPaise ? Number(tx.amountPaise) / 100 : 0);
            const formattedAmt = `₹${rawAmt.toLocaleString('en-IN')}`;

            let matchedCampaignTitle: string | undefined;
            if (isCampaignDebit) {
              const match = (tx.description || '').match(/(?:campaign|for|to):\s*([^,-]+)/i);
              if (match && match[1]) {
                matchedCampaignTitle = match[1].trim();
              }
            }

            return {
              id: tx.id ? (tx.id.length > 12 ? `WAL-${tx.id.slice(-8).toUpperCase()}` : tx.id) : 'WAL-TOPUP',
              creator: isWithdrawal
                ? 'Wallet Withdrawal'
                : (isCampaignDebit
                  ? (matchedCampaignTitle ? `Campaign: ${matchedCampaignTitle}` : 'Campaign Escrow Allocation')
                  : 'Zerify Wallet (Self Top-up)'),
              campaign: tx.description || (isWithdrawal ? 'Funds transfer to bank / UPI' : (isCampaignDebit ? 'Escrow allocation for campaign' : 'Wallet Top-up via Cashfree')),
              campaignTitle: matchedCampaignTitle,
              amount: formattedAmt,
              rawAmount: rawAmt,
              date: tx.createdAt
                ? new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Recent',
              rawCreatedAt: tx.createdAt ? new Date(tx.createdAt).getTime() : 0,
              status: isCampaignDebit ? ('IN_ESCROW' as const) : ('COMPLETED' as const),
              category: isWithdrawal
                ? ('WITHDRAWAL' as const)
                : (isCampaignDebit ? ('ESCROW_DEPOSIT' as const) : ('WALLET_TOPUP' as const)),
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
            const isReleased = p.status === 'RELEASED';
            const isDisputed = p.status === 'REFUNDED' || p.status === 'FAILED' || p.status === 'DISPUTED';

            const resolvedCampaignTitle =
              p.campaignTitle ||
              p.campaign?.title ||
              (p.campaignId ? campaignMap.get(p.campaignId) : null) ||
              'Campaign Escrow';

            const creatorName =
              p.creator ||
              p.creatorName ||
              `Campaign: ${resolvedCampaignTitle}`;

            return {
              id: p.id ? (p.id.length > 12 ? `ESC-${p.id.slice(0, 8).toUpperCase()}` : p.id) : 'ESC-UNKNOWN',
              creator: creatorName,
              campaign: `Campaign Escrow: ${resolvedCampaignTitle}`,
              campaignTitle: resolvedCampaignTitle,
              campaignId: p.campaignId,
              amount: formattedAmt,
              rawAmount: raw,
              date: p.createdAt
                ? new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Recent',
              rawCreatedAt: p.createdAt ? new Date(p.createdAt).getTime() : 0,
              status: isReleased ? ('COMPLETED' as const) : (isDisputed ? ('DISPUTED' as const) : ('IN_ESCROW' as const)),
              milestoneTitle: p.milestoneTitle,
              category: isReleased ? ('CREATOR_SETTLEMENT' as const) : ('ESCROW_DEPOSIT' as const),
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

      // Sort all transactions chronologically descending (newest first)
      const combined = [...walletTxList, ...escrowMapped].sort(
        (a, b) => (b.rawCreatedAt || 0) - (a.rawCreatedAt || 0)
      );
      setTransactions(combined);
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
          <h2 className="text-xl font-extrabold text-white light:text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-purple-400 light:text-purple-600" />
            <span>Campaign Escrow & Creator Payments</span>
          </h2>
          <p className="text-xs text-slate-400 light:text-slate-500">
            Deposit funds upfront before hiring creators. Withdraw unspent balances anytime.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBillingOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-bold text-slate-300 light:bg-white light:border-slate-200/80 light:text-slate-700 light:hover:bg-slate-50 light:shadow-sm transition-colors cursor-pointer"
          >
            Billing Profile (Optional)
          </button>
          <button
            onClick={() => alert('Exporting tax invoices & GST receipts...')}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-bold text-purple-300 light:bg-purple-50 light:border-purple-200 light:text-purple-700 light:hover:bg-purple-100 flex items-center gap-1.5 transition-colors cursor-pointer"
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
