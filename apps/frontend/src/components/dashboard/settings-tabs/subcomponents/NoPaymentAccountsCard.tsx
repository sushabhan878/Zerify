'use client';

import React from 'react';
import { CreditCard, Plus } from 'lucide-react';

interface NoPaymentAccountsCardProps {
  onAddAccount: () => void;
}

export default function NoPaymentAccountsCard({ onAddAccount }: NoPaymentAccountsCardProps) {
  return (
    <div className="w-full max-w-xl mx-auto p-8 sm:p-12 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl text-center flex flex-col items-center justify-center space-y-6 shadow-xl">
      {/* Payment Icon */}
      <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shadow-inner">
        <CreditCard className="w-7 h-7" />
      </div>

      {/* Heading & Description */}
      <div className="space-y-2 max-w-sm">
        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          No Saved Payment Methods
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Link a bank account or UPI ID to receive campaign payouts directly and securely.
        </p>
      </div>

      {/* Primary Action (No Arrow Icon) */}
      <div>
        <button
          type="button"
          onClick={onAddAccount}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-600/20 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Add New Payment Method</span>
        </button>
      </div>
    </div>
  );
}

