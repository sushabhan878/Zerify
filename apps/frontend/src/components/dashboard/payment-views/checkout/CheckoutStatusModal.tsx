'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Loader2, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

interface CheckoutStatusModalProps {
  status: 'IDLE' | 'PROCESSING' | 'SUCCESS' | 'FAILURE';
  errorMessage?: string | null;
  amount: number;
  orderId?: string | null;
  onRetry: () => void;
  onFinish: () => void;
}

export default function CheckoutStatusModal({
  status,
  errorMessage,
  amount,
  orderId,
  onRetry,
  onFinish,
}: CheckoutStatusModalProps) {
  const { format } = useCurrency();

  if (status === 'IDLE') return null;

  return (
    <div className="absolute inset-0 z-50 rounded-[28px] bg-white/95 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center animate-in fade-in duration-200">
      {status === 'PROCESSING' && (
        <div className="space-y-4 max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto text-purple-600 shadow-md">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Processing Escrow Deposit</h3>
            <p className="text-xs text-slate-500 mt-1">
              Communicating securely with Cashfree Payment Gateway and validating order parameters...
            </p>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 border border-purple-200/60 text-[11px] text-purple-700 font-semibold flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Do not refresh or close this window</span>
          </div>
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
            <h3 className="text-lg font-black text-slate-900">Payment Verified!</h3>
            <p className="text-xs text-slate-500 mt-1">
              {format(amount, { showDecimals: true })} has been successfully deposited into your Zerify Campaign Escrow Vault.
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
