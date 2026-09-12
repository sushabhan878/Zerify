'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, PlusCircle, Loader2 } from 'lucide-react';
import LinkedPaymentAccountCard from './subcomponents/LinkedPaymentAccountCard';
import NoPaymentAccountsCard from './subcomponents/NoPaymentAccountsCard';
import CashfreeNoticeBanner from './subcomponents/CashfreeNoticeBanner';

interface PaymentSettingsTabProps {
  initialData?: any;
  userName?: string;
  onNavigate?: (routeId: string) => void;
  onSaveSuccess?: () => void;
}

export default function PaymentSettingsTab({
  initialData,
  userName,
  onNavigate,
  onSaveSuccess,
}: PaymentSettingsTabProps) {
  const [loading, setLoading] = useState(true);
  const [beneficiary, setBeneficiary] = useState<any>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  const fetchPayoutDetails = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('zerify_token') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

      // 1. Check beneficiary credentials in Cashfree engine
      const bRes = await fetch(`${apiUrl}/payout-accounts/me`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      if (bRes.ok) {
        const bData = await bRes.json();
        if (bData && (bData.accountLast4 || bData.accountHolderName || bData.bankName)) {
          setBeneficiary(bData);
        }
      } else {
        const cached = localStorage.getItem('zerify_beneficiary_details');
        if (cached) {
          try {
            setBeneficiary(JSON.parse(cached));
          } catch (e) {}
        }
      }

      // 2. Check profile payment details
      if (initialData?.paymentDetails) {
        setPaymentDetails(initialData.paymentDetails);
      } else {
        const cachedProfile = localStorage.getItem('zerify_influencer_profile_cache');
        if (cachedProfile) {
          try {
            const parsed = JSON.parse(cachedProfile);
            if (parsed?.paymentDetails) {
              setPaymentDetails(parsed.paymentDetails);
            }
          } catch (e) {}
        }
      }
    } catch (e) {
      console.warn('Could not fetch payout credentials:', e);
      const cached = typeof window !== 'undefined' ? localStorage.getItem('zerify_beneficiary_details') : null;
      if (cached) {
        try {
          setBeneficiary(JSON.parse(cached));
        } catch (err) {}
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayoutDetails();
  }, [initialData]);

  const handleRedirectToPayments = () => {
    try {
      sessionStorage.setItem('zerify_open_link_payout', 'true');
    } catch (e) {}

    if (onNavigate) {
      onNavigate('payments');
    } else if (typeof window !== 'undefined') {
      window.location.href = '/dashboard?tab=payments';
    }
  };

  // Build the list of active linked payment accounts
  const linkedAccounts: Array<{
    type: 'BANK' | 'UPI';
    title: string;
    accountIdentifier: string;
    accountHolder?: string;
    secondaryDetail?: { label: string; value: string };
    status: string;
  }> = [];

  // Bank Account Detection
  const hasBankAccount = Boolean(
    (beneficiary && (beneficiary.accountLast4 || beneficiary.bankName)) ||
    (paymentDetails && (paymentDetails.accountNumber || paymentDetails.bankName))
  );

  if (hasBankAccount) {
    const rawLast4 =
      beneficiary?.accountLast4 ||
      (paymentDetails?.accountNumber ? paymentDetails.accountNumber.replace(/\s+/g, '').slice(-4) : '••••');
    const bankName = beneficiary?.bankName || paymentDetails?.bankName || 'Direct Bank Account';
    const ifsc = beneficiary?.ifscCode || paymentDetails?.ifscCode;

    linkedAccounts.push({
      type: 'BANK',
      title: bankName,
      accountIdentifier: `•••• •••• •••• ${rawLast4}`,
      accountHolder: beneficiary?.accountHolderName || paymentDetails?.accountHolderName || userName || 'Verified Creator',
      secondaryDetail: ifsc ? { label: 'IFSC Code', value: ifsc } : undefined,
      status: beneficiary?.kycStatus === 'VERIFIED' ? 'KYC Verified' : 'Active',
    });
  }

  // UPI Account Detection
  const hasUpi = Boolean(
    (beneficiary && beneficiary.upiId) ||
    (paymentDetails && paymentDetails.upiId)
  );

  if (hasUpi) {
    const upiId = beneficiary?.upiId || paymentDetails?.upiId;
    linkedAccounts.push({
      type: 'UPI',
      title: 'UPI Virtual Payment Address',
      accountIdentifier: upiId,
      accountHolder: beneficiary?.accountHolderName || paymentDetails?.accountHolderName || userName || 'Verified Creator',
      secondaryDetail: { label: 'Settlement Mode', value: 'Instant Payout' },
      status: 'Active',
    });
  }

  if (loading) {
    return (
      <div className="p-12 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl flex flex-col items-center justify-center min-h-[360px] gap-3">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        <span className="text-xs font-semibold text-slate-400">Loading payout details...</span>
      </div>
    );
  }

  if (linkedAccounts.length === 0) {
    return <NoPaymentAccountsCard onAddAccount={handleRedirectToPayments} />;
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl">
        <div>
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-400" />
            <span>Linked Payout Methods</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
              {linkedAccounts.length} Active
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Your verified accounts for direct IMPS/NEFT transfers and automated Escrow payouts
          </p>
        </div>

        <button
          type="button"
          onClick={handleRedirectToPayments}
          className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-bold text-purple-300 hover:text-white transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-purple-400" />
          <span>Manage Payout Account</span>
        </button>
      </div>

      {/* Linked Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {linkedAccounts.map((account, idx) => (
          <LinkedPaymentAccountCard
            key={`${account.type}-${idx}`}
            type={account.type}
            title={account.title}
            accountIdentifier={account.accountIdentifier}
            accountHolder={account.accountHolder}
            secondaryDetail={account.secondaryDetail}
            status={account.status}
            onManage={handleRedirectToPayments}
          />
        ))}
      </div>

      {/* Cashfree Notice Banner */}
      <CashfreeNoticeBanner />
    </div>
  );
}
