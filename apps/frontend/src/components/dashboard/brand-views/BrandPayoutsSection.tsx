'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, Download, Plus, ArrowDownLeft } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import BrandEscrowKpiBar from '../payment-views/BrandEscrowKpiBar';
import BrandEscrowTransactionList, { BrandEscrowTransaction } from '../payment-views/BrandEscrowTransactionList';
import BrandDepositFundsModal from '../payment-views/BrandDepositFundsModal';
import BrandWithdrawFundsModal from '../payment-views/BrandWithdrawFundsModal';
import BrandBillingDetailsModal from '../payment-views/BrandBillingDetailsModal';
import RaiseDisputeModal from '../payment-views/RaiseDisputeModal';

export default function BrandPayoutsSection() {
  const { format } = useCurrency();

  // Modals state
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [selectedTxForAction, setSelectedTxForAction] = useState<{ id: string; campaign: string; amount: string } | null>(null);

  // Brand data state
  const [availableBalance, setAvailableBalance] = useState(1845000); // in paise/cents or INR standard
  const [inEscrow, setInEscrow] = useState(570000);
  const [totalSettled, setTotalSettled] = useState(6420000);
  const [hasBillingDetails, setHasBillingDetails] = useState(false);

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

  const [transactions, setTransactions] = useState<BrandEscrowTransaction[]>([
    {
      id: 'ESC-4012',
      creator: 'Sarah Jenkins',
      campaign: 'YouTube Video Integration & Product Unboxing',
      amount: format(35000, { showDecimals: true }),
      date: 'Jul 22, 2026',
      status: 'IN_ESCROW',
    },
    {
      id: 'ESC-3910',
      creator: 'Marcus Vance',
      campaign: 'Desk Showcase & Reel Promotion',
      amount: format(22000, { showDecimals: true }),
      date: 'Jul 18, 2026',
      status: 'IN_ESCROW',
    },
    {
      id: 'SET-1002',
      creator: 'Priya Sharma',
      campaign: 'Instagram Carousel Feature Launch',
      amount: format(45000, { showDecimals: true }),
      date: 'Jul 10, 2026',
      status: 'COMPLETED',
    },
    {
      id: 'SET-0941',
      creator: 'Alex Rivera',
      campaign: 'Tech Podcast Audio Sponsorship Integration',
      amount: format(28000, { showDecimals: true }),
      date: 'Jun 28, 2026',
      status: 'COMPLETED',
    },
  ]);

  const handleApproveRelease = (txId: string) => {
    const target = transactions.find((t) => t.id === txId);
    if (!target) return;
    if (confirm(`Approve deliverable and release ${target.amount} from Escrow to ${target.creator}? This action triggers immediate payout.`)) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === txId ? { ...t, status: 'COMPLETED' as const } : t))
      );
      setInEscrow((prev) => Math.max(0, prev - 30000));
      setTotalSettled((prev) => prev + 30000);
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
        onApproveRelease={handleApproveRelease}
        onRaiseDispute={handleOpenDispute}
        onWithdrawRefund={handleOpenWithdraw}
        onExportInvoices={() => alert('Downloading tax invoice...')}
      />

      {/* Modals */}
      <BrandDepositFundsModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onSuccess={(depositedAmount) => {
          if (depositedAmount) {
            setAvailableBalance((prev) => prev + depositedAmount);
          }
        }}
      />

      <BrandWithdrawFundsModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        availableBalance={availableBalance}
        paymentId={selectedTxForAction?.id}
        onSuccess={(amount) => {
          if (amount) {
            setAvailableBalance((prev) => Math.max(0, prev - amount));
          }
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
