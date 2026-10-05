'use client';

import React, { useState } from 'react';
import { X, ArrowUpRight, ShieldCheck, CheckCircle2, Loader2, AlertCircle, Building2, Wallet } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useCurrency } from '@/context/CurrencyContext';

interface ClaimPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onClaimSuccess?: () => void;
  payableAmount?: number;
  availableAmount?: number;
  currencyCode?: string;
  beneficiary?: any;
  isCredentialsLinked?: boolean;
  onOpenLinkModal?: () => void;
}

export default function ClaimPayoutModal({
  isOpen,
  onClose,
  onSuccess,
  onClaimSuccess,
  payableAmount,
  availableAmount,
  currencyCode = 'INR',
  beneficiary,
  isCredentialsLinked,
  onOpenLinkModal,
}: ClaimPayoutModalProps) {
  const { toastSuccess, toastError } = useToast();
  const { format } = useCurrency();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  const [claimAmount, setClaimAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const effectivePayable = payableAmount ?? availableAmount ?? 0;
  const hasLinkedAccount = beneficiary
    ? Boolean(beneficiary.accountLast4 || beneficiary.upiId || beneficiary.accountHolderName)
    : Boolean(isCredentialsLinked);

  if (!isOpen) return null;

  const parsedAmount = parseFloat(claimAmount) || 0;
  const tdsPercent = 1; // 1% TDS under Section 194-O / 194J for e-commerce / creator marketplaces
  const estimatedTds = Number(((parsedAmount * tdsPercent) / 100).toFixed(2));
  const netPayable = Math.max(0, parsedAmount - estimatedTds);

  const hasBeneficiary = hasLinkedAccount || Boolean(
    beneficiary &&
    (beneficiary.accountLast4 || beneficiary.accountHolderName || beneficiary.upiId)
  );

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!hasBeneficiary) {
      setErrorMsg('Please link your payout bank account or UPI ID first.');
      return;
    }

    if (parsedAmount <= 0 || parsedAmount > effectivePayable) {
      setErrorMsg(`Claim amount must be between ₹1 and ${format(effectivePayable, { showDecimals: true })}`);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const token = localStorage.getItem('zerify_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      };

      const res = await fetch(`${apiUrl}/payouts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          amount: parsedAmount,
          currency: currencyCode,
          purpose: 'INFLUENCER_EARNINGS_WITHDRAWAL',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Payout claim dispatch failed');
      }

      toastSuccess(`Payout request for ${format(parsedAmount, { showDecimals: true })} submitted!`);
      onSuccess?.();
      onClaimSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Payout claim error:', err);
      setErrorMsg(err.message || 'Failed to claim payout. Please try again later.');
      toastError(err.message || 'Failed to process payout claim');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Claim Available Earnings</h3>
              <p className="text-[11px] text-slate-400">Withdraw unlocked milestone escrow funds to your account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Beneficiary Destination Preview */}
        {hasBeneficiary ? (
          <div className="p-3 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Payout Destination</span>
                <span className="text-xs font-bold text-white">
                  {beneficiary.bankName ? `${beneficiary.bankName} •••• ${beneficiary.accountLast4 || ''}` : beneficiary.upiId || 'Linked Account'}
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Verified
            </span>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>No payout account linked yet</span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenLinkModal?.();
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all"
            >
              Link Now
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleClaim} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-300">Amount to Claim ({currencyCode})</label>
              <button
                type="button"
                onClick={() => setClaimAmount(String(effectivePayable))}
                className="text-[10px] font-bold text-purple-400 hover:text-purple-300 underline"
              >
                Max: {format(effectivePayable, { showDecimals: true })}
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
              <input
                type="number"
                min={1}
                max={effectivePayable}
                step="any"
                value={claimAmount}
                onChange={(e) => setClaimAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-900/90 border border-white/10 rounded-xl pl-8 pr-3.5 py-2 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                required
              />
            </div>
          </div>

          {/* Breakdown Box */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-white/5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Gross Claim Amount</span>
              <span className="font-semibold text-white">{format(parsedAmount, { showDecimals: true })}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1">
                <span>TDS Deduction ({tdsPercent}%)</span>
                <span className="text-[10px] text-slate-500">(Section 194-O)</span>
              </span>
              <span className="font-semibold text-amber-400">-{format(estimatedTds, { showDecimals: true })}</span>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between font-bold text-white">
              <span>Estimated Net Transfer</span>
              <span className="text-emerald-400 text-sm">{format(netPayable, { showDecimals: true })}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-start gap-2 text-[10px] text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
            <p>Direct bank transfers are processed automatically within 2–24 business hours via Cashfree Payout rails.</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !hasBeneficiary || parsedAmount <= 0}
              className="px-5 py-2 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Initiating Transfer...</span>
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Confirm & Claim Payout</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
