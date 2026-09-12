'use client';

import React from 'react';
import { CreditCard, ArrowRight, ShieldCheck, Lock, Sparkles, PlusCircle } from 'lucide-react';

interface NoPaymentAccountsCardProps {
  onAddAccount: () => void;
}

export default function NoPaymentAccountsCard({ onAddAccount }: NoPaymentAccountsCardProps) {
  return (
    <div className="p-8 sm:p-12 rounded-2xl bg-slate-950/50 border border-white/10 backdrop-blur-xl space-y-8 shadow-2xl text-center flex flex-col items-center justify-center min-h-[380px] relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Animated Glowing Icon Badge */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 rounded-2xl blur-lg opacity-40 animate-pulse" />
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-900 via-indigo-900 to-slate-900 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-2xl">
          <CreditCard className="w-8 h-8 drop-shadow-[0_4px_8px_rgba(168,85,247,0.5)]" />
        </div>
      </div>

      {/* Explanation Text */}
      <div className="max-w-md space-y-2 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-bold tracking-wide mb-1">
          <span>NO PAYOUT DESTINATION LINKED</span>
        </div>
        <h3 className="text-xl font-extrabold text-white tracking-tight">
          Link Your Payout Account
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          You haven&apos;t added any bank accounts or UPI IDs yet. Link your credentials to receive automated Cashfree escrow payouts and 100% brand deal earnings.
        </p>
      </div>

      {/* Action Button: Redirects to Payments Page */}
      <div className="relative z-10">
        <button
          type="button"
          onClick={onAddAccount}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:via-indigo-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50 hover:shadow-purple-900/60 transition-all flex items-center gap-2 group cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-200" />
          <span>Add Payout Account</span>
          <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg pt-2 relative z-10">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-left space-y-1">
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
            <Lock className="w-3 h-3 text-purple-400" />
            <span>Escrow Protected</span>
          </span>
          <span className="text-xs font-semibold text-slate-300 block">
            Funds held safely until deliverable approval.
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-left space-y-1">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Direct Payouts</span>
          </span>
          <span className="text-xs font-semibold text-slate-300 block">
            Direct IMPS/NEFT bank transfers & UPI ID.
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-left space-y-1">
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
