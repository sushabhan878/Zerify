'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

interface OrderSummaryBreakdownProps {
  campaignAmount: number;
  setCampaignAmount: (amount: number) => void;
  campaignTitle?: string;
  creatorName?: string;
}

export default function OrderSummaryBreakdown({
  campaignAmount,
  setCampaignAmount,
  campaignTitle,
}: OrderSummaryBreakdownProps) {
  const { format } = useCurrency();

  return (
    <div className="space-y-2 text-left border-t border-slate-100 pt-3">
      {/* Campaign Amount Input (No presets) */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-slate-700">
            Amount to Add (INR) <span className="text-purple-600 font-bold">*</span>
          </label>
          {campaignTitle && (
            <span className="text-[10px] font-bold text-purple-600 truncate max-w-[160px]">
              {campaignTitle}
            </span>
          )}
        </div>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
          <input
            type="number"
            min={100}
            step={100}
            value={campaignAmount || ''}
            onChange={(e) => setCampaignAmount(Math.max(0, parseFloat(e.target.value) || 0))}
            placeholder="25000"
            className="w-full h-10 pl-8 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20 transition-all"
            required
          />
        </div>
      </div>

      {/* Free Transaction Notice */}
      <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-50/70 border border-emerald-200/60 text-[11px] text-emerald-800 font-medium">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Zero Processing Fee & No GST</span>
        </div>
        <span className="font-bold text-emerald-700">₹0 Extra</span>
      </div>
    </div>
  );
}
