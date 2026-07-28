'use client';

import React from 'react';
import { CreditCard, Clock, ShieldCheck, Sparkles, Lock } from 'lucide-react';

interface PaymentSettingsTabProps {
  onSaveSuccess?: () => void;
}

export default function PaymentSettingsTab({ onSaveSuccess }: PaymentSettingsTabProps) {
  return (
    <div className="p-8 sm:p-12 rounded-xl bg-slate-950/45 border border-white/10 backdrop-blur-xl space-y-8 shadow-xl text-center flex flex-col items-center justify-center min-h-[380px]">
      {/* Animated Glowing Icon Badge */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-40 animate-pulse" />
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-900 via-indigo-900 to-slate-900 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-2xl">
          <CreditCard className="w-8 h-8 drop-shadow-[0_4px_8px_rgba(168,85,247,0.5)]" />
        </div>
      </div>

      {/* Coming Soon Text */}
      <div className="max-w-md space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold tracking-wide mb-1">
          <Clock className="w-3.5 h-3.5 text-purple-400 animate-spin" />
          <span>FEATURE COMING SOON</span>
        </div>
        <h3 className="text-xl font-extrabold text-white tracking-tight">
          Direct Payments & Payouts
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Cashfree direct bank transfers, automated Escrow payments & UPI payouts are currently undergoing final verification. Payout features will be live shortly!
        </p>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg pt-2">
        <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5 text-left space-y-1">
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
            <Lock className="w-3 h-3 text-purple-400" />
            <span>Escrow Protected</span>
          </span>
          <span className="text-xs font-semibold text-slate-300 block">
            Funds held safely until deliverable approval.
          </span>
        </div>

        <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5 text-left space-y-1">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Direct Payouts</span>
          </span>
          <span className="text-xs font-semibold text-slate-300 block">
            Direct IMPS/NEFT bank transfers & UPI ID.
          </span>
        </div>

        <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5 text-left space-y-1">
          <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>0% Fee Deal</span>
          </span>
          <span className="text-xs font-semibold text-slate-300 block">
            Keep 100% of your earnings from brand deals.
          </span>
        </div>
      </div>
    </div>
  );
}
