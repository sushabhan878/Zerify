'use client';

import React from 'react';
import { CreditCard } from 'lucide-react';

export default function CashfreeNoticeBanner() {
  return (
    <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/50 via-indigo-950/40 to-slate-900/80 border border-purple-500/30 backdrop-blur-xl shadow-xl space-y-2">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/30 shrink-0">
          <CreditCard className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white flex items-center gap-2">
            <span>Cashfree Payments Partner Integration</span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[9.5px] font-semibold uppercase">
              Active Escrow Ready
            </span>
          </h4>
          <p className="text-[11.5px] text-slate-300/90 leading-relaxed pt-0.5">
            Zerify utilizes Cashfree Payment Gateway to manage secure escrow releases and automated payouts directly to your bank account or UPI address.
          </p>
        </div>
      </div>
    </div>
  );
}
