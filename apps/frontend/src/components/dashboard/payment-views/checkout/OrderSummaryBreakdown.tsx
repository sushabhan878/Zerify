'use client';

import React from 'react';
import { ShieldCheck, Lock, Edit2 } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

interface OrderSummaryBreakdownProps {
  campaignAmount: number;
  campaignTitle?: string;
  creatorName?: string;
  onChangeAmount?: () => void;
  mode?: 'DEPOSIT' | 'WITHDRAW';
  availableBalance?: number;
}

export default function OrderSummaryBreakdown({
  campaignAmount,
  campaignTitle,
  onChangeAmount,
  mode = 'DEPOSIT',
  availableBalance,
}: OrderSummaryBreakdownProps) {
  const { format } = useCurrency();

  return (
    <div className="space-y-2 text-left border-t border-slate-100 pt-3">
      {/* For Withdrawal: Clear balance calculations */}
      {mode === 'WITHDRAW' && availableBalance !== undefined && (
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 font-medium">
            <span>Available Balance</span>
            <span className="font-bold text-slate-800">{format(availableBalance, { showDecimals: true })}</span>
          </div>
          <div className="flex items-center justify-between text-slate-500 font-medium">
            <span>Withdrawal Amount</span>
            <span className="font-bold text-amber-600">-{format(campaignAmount, { showDecimals: true })}</span>
          </div>
          <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between font-bold text-slate-900">
            <span>Remaining Balance</span>
            <span>{format(Math.max(0, availableBalance - campaignAmount), { showDecimals: true })}</span>
          </div>
        </div>
      )}

      {/* Free Transaction Notice */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-[11px] text-emerald-800 font-medium">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Zero Processing Fee & 0% GST</span>
        </div>
        <span className="font-bold text-emerald-700">₹0 Extra</span>
      </div>
    </div>
  );
}
