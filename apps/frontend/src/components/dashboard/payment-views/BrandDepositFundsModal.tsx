'use client';

import React, { useState } from 'react';
import { X, Plus, CreditCard, ShieldCheck, CheckCircle2, Loader2, AlertCircle, Smartphone, Building2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useCurrency } from '@/context/CurrencyContext';

interface BrandDepositFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (amount?: number) => void;
  campaignId?: string;
  campaignTitle?: string;
}

export default function BrandDepositFundsModal({
  isOpen,
  onClose,
  onSuccess,
  campaignId,
  campaignTitle,
}: BrandDepositFundsModalProps) {
  const { toastSuccess, toastError } = useToast();
  const { format } = useCurrency();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  const [depositAmount, setDepositAmount] = useState<string>('25000');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const parsedAmount = parseFloat(depositAmount) || 0;
  const numericAmount = parsedAmount;
  const platformFeeRate = 0.05; // 5% Zerify platform escrow fee
  const platformFee = Math.round(parsedAmount * platformFeeRate);
  const gst = Math.round(platformFee * 0.18); // 18% GST on platform fee
  const totalAmountToPay = parsedAmount + platformFee + gst;

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (parsedAmount < 500) {
      setErrorMsg('Minimum deposit amount is ₹500');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('zerify_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      };

      const endpoint = campaignId
        ? `${apiUrl}/campaigns/${campaignId}/payments`
        : `${apiUrl}/payments/orders`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          amount: totalAmountToPay,
          currency: 'INR',
          idempotencyKey: `dep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          returnUrl: `${window.location.origin}/dashboard?payment_success=true`,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to initialize Cashfree payment order');
      }

      const paymentOrder = await res.json();

      // Automatically verify payment status on the server
      if (paymentOrder.id) {
        await fetch(`${apiUrl}/payments/${paymentOrder.id}/verify`, {
          method: 'POST',
          headers,
        }).catch(() => {});
      }

      toastSuccess(`Successfully deposited ${format(parsedAmount, { showDecimals: true })} into Campaign Escrow!`);
      onSuccess?.(parsedAmount);
      onClose();
    } catch (err: any) {
      console.error('Deposit error:', err);
      setErrorMsg(err.message || 'Payment initiation failed. Please try again.');
      toastError(err.message || 'Deposit failed');
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
            <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Deposit Campaign Escrow Funds</h3>
              <p className="text-[11px] text-slate-400">
                {campaignTitle ? `Campaign: ${campaignTitle}` : 'Fund your campaign balance to hire creators'}
              </p>
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

        <form onSubmit={handleDeposit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">Campaign Budget Amount (INR)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
              <input
                type="number"
                min={500}
                step={500}
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="25000"
                className="w-full bg-slate-900/90 border border-white/10 rounded-xl pl-8 pr-3.5 py-2 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {[10000, 25000, 50000, 100000].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setDepositAmount(String(preset))}
                  className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-purple-900/30 text-[10px] font-bold text-slate-400 hover:text-purple-300 border border-white/5 transition-colors"
                >
                  +{format(preset)}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1.5">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'UPI', label: 'UPI (0% fee)', icon: Smartphone },
                { id: 'CARD', label: 'Card', icon: CreditCard },
                { id: 'NETBANKING', label: 'NetBanking', icon: Building2 },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-2.5 rounded-xl border text-[10px] font-bold flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === m.id
                        ? 'bg-purple-600/20 border-purple-500 text-purple-200 shadow-md'
                        : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quotation Fee Breakdown */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-white/5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Creator Campaign Budget</span>
              <span className="font-semibold text-white">{format(parsedAmount, { showDecimals: true })}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Zerify Platform Escrow Fee (5%)</span>
              <span className="font-semibold text-white">{format(platformFee, { showDecimals: true })}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>GST on Platform Fee (18%)</span>
              <span className="font-semibold text-white">{format(gst, { showDecimals: true })}</span>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between font-bold text-white">
              <span>Total Payable</span>
              <span className="text-purple-400 text-sm">{format(totalAmountToPay, { showDecimals: true })}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2 text-[10px] text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <p>100% Escrow Protection: Funds remain in escrow and are only released upon your explicit approval of delivered content.</p>
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
              disabled={isSubmitting || parsedAmount < 500}
              className="px-5 py-2 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Pay & Deposit {format(totalAmountToPay)}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
