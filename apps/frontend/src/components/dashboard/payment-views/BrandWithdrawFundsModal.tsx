'use client';

import React, { useState } from 'react';
import { X, ArrowDownRight, ShieldCheck, CheckCircle2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useCurrency } from '@/context/CurrencyContext';

interface BrandWithdrawFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (amount?: number) => void;
  availableBalance: number;
  currencyCode?: string;
  paymentId?: string;
}

const WITHDRAWAL_REASONS = [
  'Campaign Completed / Unused Balance',
  'Campaign Cancelled / Not Continuing',
  'Pausing Creator Outreach',
  'Budget Reallocation',
  'Other',
];

export default function BrandWithdrawFundsModal({
  isOpen,
  onClose,
  onSuccess,
  availableBalance,
  currencyCode = 'INR',
  paymentId,
}: BrandWithdrawFundsModalProps) {
  const { toastSuccess, toastError } = useToast();
  const { format } = useCurrency();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  const [withdrawAmount, setWithdrawAmount] = useState<string>(availableBalance > 0 ? String(availableBalance) : '');
  const [reason, setReason] = useState(WITHDRAWAL_REASONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const parsedAmount = parseFloat(withdrawAmount) || 0;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (parsedAmount <= 0 || parsedAmount > availableBalance) {
      setErrorMsg(`Withdrawal amount must be between ₹1 and ${format(availableBalance, { showDecimals: true })}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('zerify_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      };

      // 1. Find a refundable payment record if not provided directly
      let activePaymentId = paymentId;
      if (!activePaymentId) {
        const paymentsRes = await fetch(`${apiUrl}/payments/me`, { headers });
        if (paymentsRes.ok) {
          const paymentsList = await paymentsRes.json();
          const refundable = Array.isArray(paymentsList)
            ? paymentsList.find((p: any) => p.status === 'PAID' || p.status === 'ESCROW_FUNDED')
            : null;
          if (refundable) activePaymentId = refundable.id;
        }
      }

      if (activePaymentId) {
        const refundRes = await fetch(`${apiUrl}/payments/${activePaymentId}/refund`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            amount: parsedAmount,
            reason,
            idempotencyKey: `wd-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          }),
        });

        if (!refundRes.ok) {
          const data = await refundRes.json();
          throw new Error(data.message || 'Refund processing failed');
        }
      }

      toastSuccess(`Withdrawal of ${format(parsedAmount, { showDecimals: true })} initiated! Funds will credit within 1-2 business days.`);
      onSuccess?.(parsedAmount);
      onClose();
    } catch (err: any) {
      console.error('Withdrawal error:', err);
      setErrorMsg(err.message || 'Failed to process balance withdrawal. Please contact support.');
      toastError(err.message || 'Withdrawal failed');
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
            <div className="p-2 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Withdraw Escrow Balance</h3>
              <p className="text-[11px] text-slate-400">Refund uncommitted funds back to your original payment source</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleWithdraw} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-300">Amount to Withdraw ({currencyCode})</label>
              <button
                type="button"
                onClick={() => setWithdrawAmount(String(availableBalance))}
                className="text-[10px] font-bold text-amber-400 hover:text-amber-300 underline"
              >
                Max: {format(availableBalance, { showDecimals: true })}
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
              <input
                type="number"
                min={1}
                max={availableBalance}
                step="any"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-900/90 border border-white/10 rounded-xl pl-8 pr-3.5 py-2 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">Reason for Withdrawal</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {WITHDRAWAL_REASONS.map((r) => (
                <option key={r} value={r} className="bg-slate-950 text-white">
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-white/5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Current Available Escrow</span>
              <span className="font-semibold text-white">{format(availableBalance, { showDecimals: true })}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Withdrawal Amount</span>
              <span className="font-semibold text-amber-400">-{format(parsedAmount, { showDecimals: true })}</span>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between font-bold text-white">
              <span>Remaining Escrow Balance</span>
              <span className="text-white text-sm">{format(Math.max(0, availableBalance - parsedAmount), { showDecimals: true })}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-2 text-[10px] text-blue-300">
            <RefreshCw className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <p>Refunds are automatically processed by Cashfree back to your original funding source (Bank / Card / UPI) within 3–5 business days.</p>
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
              disabled={isSubmitting || parsedAmount <= 0}
              className="px-5 py-2 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing Refund...</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>Confirm Withdrawal</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
