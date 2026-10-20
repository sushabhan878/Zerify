'use client';

import React from 'react';
import { ShieldCheck, Lock, Edit2 } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

interface OrderSummaryBreakdownProps {
  campaignAmount: number;
  campaignTitle?: string;
  creatorName?: string;
  onChangeAmount?: () => void;
}

export default function OrderSummaryBreakdown({
  campaignAmount,
  campaignTitle,
  onChangeAmount,
}: OrderSummaryBreakdownProps) {
  const { format } = useCurrency();

  return (
    <div className="space-y-2 text-left border-t border-slate-100 pt-3">
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
