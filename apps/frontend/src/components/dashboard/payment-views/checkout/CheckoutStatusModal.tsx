'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Loader2, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

interface CheckoutStatusModalProps {
  status: 'IDLE' | 'PROCESSING' | 'AWAITING_APPROVAL' | 'SUCCESS' | 'FAILURE';
  errorMessage?: string | null;
  amount: number;
  orderId?: string | null;
  isWalletTopup?: boolean;
  mode?: 'DEPOSIT' | 'WITHDRAW';
  upiId?: string;
  timeLeftSeconds?: number;
  onRetry: () => void;
  onFinish: () => void;
}

export default function CheckoutStatusModal({
  status,
  errorMessage,
  amount,
  orderId,
  isWalletTopup = true,
  mode = 'DEPOSIT',
  upiId,
  timeLeftSeconds = 300,
  onRetry,
  onFinish,
}: CheckoutStatusModalProps) {
  const { format } = useCurrency();

  if (status === 'IDLE') return null;

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const timerDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="absolute inset-0 z-50 rounded-[28px] bg-white/95 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center animate-in fade-in duration-200">
      {status === 'AWAITING_APPROVAL' && (
        <div className="space-y-4 max-w-sm w-full animate-in zoom-in-95 duration-200">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-2xl bg-purple-500/20 animate-ping" />
            <div className="relative w-16 h-16 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          </div>

          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[11px] font-bold uppercase tracking-wider mb-1.5">
              Awaiting UPI PIN Authorization
            </span>
            <h3 className="text-base font-extrabold text-slate-900">
              Check Your Phone
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Payment request of <span className="font-bold text-purple-700">{format(amount, { showDecimals: true })}</span> sent to:
            </p>
            {upiId && (
              <div className="mt-1 px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-mono font-bold text-slate-800 inline-block border border-slate-200">
                {upiId}
              </div>
            )}
          </div>

          {/* Action guidance */}
          <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200/70 text-left space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
              <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">1</span>
              <span>Open Google Pay, PhonePe, or Paytm</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
              <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">2</span>
              <span>Approve the collect request from Zerify</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
              <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">3</span>
              <span>Enter your UPI PIN to complete</span>
            </div>
          </div>

          {/* Countdown & Security */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Auto-verifying live...</span>
            </span>
            <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              Expires in {timerDisplay}
            </span>
          </div>
        </div>
      )}

      {status === 'PROCESSING' && (
        <div className="flex flex-col items-center justify-between h-full w-full max-w-sm py-2">
          <div className="my-auto flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
            <p className="text-xs text-slate-500 text-center max-w-xs leading-relaxed">
              Communicating securely with Cashfree Payment Gateway and confirming transaction...
            </p>
          </div>

          <p className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1.5 mt-auto">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Do not refresh or close this window</span>
          </p>
        </div>
      )}

      {status === 'SUCCESS' && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="space-y-4 max-w-sm"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600 shadow-md">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              {mode === 'WITHDRAW' ? 'Withdrawal Completed!' : 'Payment Verified!'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {format(amount, { showDecimals: true })} has been successfully{' '}
              {mode === 'WITHDRAW'
                ? 'withdrawn from your Zerify Wallet.'
                : isWalletTopup
                ? 'added to your Zerify Wallet.'
                : 'deposited into Campaign Escrow.'}
            </p>
          </div>

          {orderId && (
            <div className="p-2.5 rounded-xl bg-slate-100 text-[11px] text-slate-600 font-mono">
              Ref ID: <span className="font-bold text-slate-800">{orderId}</span>
            </div>
          )}

          <button
            type="button"
            onClick={onFinish}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-1.5"
          >
            <span>Return to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {status === 'FAILURE' && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="space-y-4 max-w-sm"
        >
          <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto text-rose-600 shadow-md">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Payment Unsuccessful</h3>
            <p className="text-xs text-rose-600 mt-1 font-medium">
              {errorMessage || 'The payment could not be completed. Your funds were not debited.'}
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onFinish}
              className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onRetry}
              className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-md shadow-purple-600/20 transition-all"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
