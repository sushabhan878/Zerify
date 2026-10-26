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
  grossAmount?: number;
  zerifyFee?: number;
  isEscrow?: boolean;
  baseEscrowAmount?: number;
  platformFee?: number;
  gstTax?: number;
}

export default function OrderSummaryBreakdown({
  campaignAmount,
  campaignTitle,
  onChangeAmount,
  mode = 'DEPOSIT',
  availableBalance,
  grossAmount,
  zerifyFee,
  isEscrow = false,
  baseEscrowAmount,
  platformFee,
  gstTax,
}: OrderSummaryBreakdownProps) {
  const { format } = useCurrency();

  const isInfluencerWithdrawal = mode === 'WITHDRAW' && zerifyFee !== undefined && zerifyFee > 0;
  const effectiveGross = grossAmount ?? (isInfluencerWithdrawal ? campaignAmount + zerifyFee : campaignAmount);

  return (
    <div className="space-y-2 text-left border-t border-slate-100 pt-3">
      {/* For Campaign Escrow: Breakdown with 7% Platform Fee + 18% GST */}
      {isEscrow && (
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
          {campaignTitle && (
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70 text-[11px]">
              <span className="text-slate-500 font-medium">Campaign</span>
              <span className="font-semibold text-slate-800 truncate max-w-[200px]">{campaignTitle}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-slate-600 font-medium">Creator Escrow Allocation</span>
            <span className="font-bold text-slate-900">{format(baseEscrowAmount ?? campaignAmount, { showDecimals: true })}</span>
          </div>
          <div className="flex items-center justify-between text-slate-500 text-[11.5px]">
            <span>Zerify Platform Fee (7%)</span>
            <span>+{format(platformFee || 0, { showDecimals: true })}</span>
          </div>
          <div className="flex items-center justify-between text-slate-500 text-[11.5px]">
            <span>GST / Tax (18% on Platform Fee)</span>
            <span>+{format(gstTax || 0, { showDecimals: true })}</span>
          </div>
        </div>
      )}

      {/* For Withdrawal: Clear balance calculations */}
      {mode === 'WITHDRAW' && availableBalance !== undefined && (
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 font-medium">
            <span>Available Balance</span>
            <span className="font-bold text-slate-800">{format(availableBalance, { showDecimals: true })}</span>
          </div>
          {isInfluencerWithdrawal ? (
            <>
              <div className="flex items-center justify-between text-slate-500 font-medium">
                <span>Gross Withdrawal</span>
                <span className="font-bold text-slate-800">{format(effectiveGross, { showDecimals: true })}</span>
              </div>
              <div className="flex items-center justify-between text-amber-600 font-medium">
                <span>Zerify Platform Fee (7%)</span>
                <span className="font-bold">-{format(zerifyFee, { showDecimals: true })}</span>
              </div>
              <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between font-bold text-slate-900">
                <span>Net Payout to Receive</span>
                <span className="text-emerald-600 font-black">{format(campaignAmount, { showDecimals: true })}</span>
              </div>
              <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>Remaining Balance</span>
                <span>{format(Math.max(0, availableBalance - effectiveGross), { showDecimals: true })}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between text-slate-500 font-medium">
                <span>Withdrawal Amount</span>
                <span className="font-bold text-amber-600">-{format(campaignAmount, { showDecimals: true })}</span>
              </div>
              <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between font-bold text-slate-900">
                <span>Remaining Balance</span>
                <span>{format(Math.max(0, availableBalance - campaignAmount), { showDecimals: true })}</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Free Transaction Notice / Influencer Fee Notice / Escrow Trust Notice */}
      {isEscrow ? (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-[11px] text-emerald-800 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Smart Escrow Custody • Released only upon your approval</span>
          </div>
          <span className="font-bold text-emerald-700">Protected</span>
        </div>
      ) : isInfluencerWithdrawal ? (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-purple-50/70 border border-purple-200/60 text-[11px] text-purple-800 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span>7% Zerify Fee Deducted • Direct Payout via Cashfree</span>
          </div>
          <span className="font-bold text-purple-700">7% Fee</span>
        </div>
      ) : (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-[11px] text-emerald-800 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Zero Processing Fee & 0% GST</span>
          </div>
          <span className="font-bold text-emerald-700">₹0 Extra</span>
        </div>
      )}
    </div>
  );
}
