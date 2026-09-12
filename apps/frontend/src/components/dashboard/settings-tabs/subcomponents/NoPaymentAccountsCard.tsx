'use client';

import React from 'react';
import { CreditCard, Plus, ArrowRight, ArrowDown, Building2, Smartphone, Lock } from 'lucide-react';

interface NoPaymentAccountsCardProps {
  onAddAccount: () => void;
}

const STEPS = [
  'Choose a payout method',
  'Verify your details',
  'Receive your payouts',
];

const SUPPORTED_METHODS = [
  {
    icon: Building2,
    title: 'Bank Account',
    description: 'Direct bank transfers to your verified account.',
  },
  {
    icon: Smartphone,
    title: 'UPI ID',
    description: 'Receive eligible payouts directly through your UPI ID.',
  },
];

export default function NoPaymentAccountsCard({ onAddAccount }: NoPaymentAccountsCardProps) {
  return (
    <div className="w-full max-w-2xl mx-auto p-6 sm:p-10 rounded-2xl bg-slate-950/40 border border-white/10 text-center flex flex-col items-center space-y-7 shadow-lg">
      {/* 1. Payment Icon */}
      <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
        <CreditCard className="w-6 h-6" />
      </div>

      {/* 2. Small Status Label, Heading & Description */}
      <div className="space-y-2 max-w-lg">
        <span className="inline-block px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          NO PAYOUT METHOD LINKED
        </span>
        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Add a Payout Method
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Link a bank account or UPI ID to receive your payouts securely and automatically.
        </p>
      </div>

      {/* 3. Primary Action */}
      <div>
        <button
          type="button"
          onClick={onAddAccount}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/40"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Add Payout Method</span>
          <ArrowRight className="w-3.5 h-3.5 text-white/80" />
        </button>
      </div>

      {/* 4. Instructions Section ("How payouts work") */}
      <div className="w-full pt-6 border-t border-white/5 space-y-3">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider text-center">
          How payouts work
        </h4>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-xs text-slate-300">
          {STEPS.map((step, idx) => (
            <React.Fragment key={step}>
              <span className="font-medium text-slate-300">{step}</span>
              {idx < STEPS.length - 1 && (
                <>
                  <ArrowRight className="hidden sm:block w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <ArrowDown className="sm:hidden w-3.5 h-3.5 text-purple-400 shrink-0" />
                </>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 5. Supported Methods */}
      <div className="w-full space-y-3">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider text-center">
          Supported payout methods
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          {SUPPORTED_METHODS.map((method) => {
            const Icon = method.icon;
            return (
              <div
                key={method.title}
                className="p-3.5 rounded-xl bg-slate-900/30 border border-white/5 flex items-start gap-3 text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800/60 border border-white/5 flex items-center justify-center shrink-0 text-purple-400">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h5 className="text-xs font-semibold text-slate-200">{method.title}</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{method.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Security / Trust Message */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
        <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <span>Your payout details are encrypted and securely stored.</span>
      </div>
    </div>
  );
}
