'use client';

import React from 'react';
import { Building2, Smartphone, ShieldCheck, Zap } from 'lucide-react';

export default function SupportedPayoutMethodsCard() {
  return (
    <div className="w-full max-w-2xl mx-auto p-6 sm:p-8 rounded-2xl bg-slate-950/40 border border-white/10 space-y-5 shadow-lg">
      <div>
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Supported Payout Methods
        </h4>
        <p className="text-xs text-slate-400 mt-1">
          Choose from verified direct bank transfers or instant UPI address settlements.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Bank Account */}
        <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-3 flex flex-col justify-between hover:border-white/10 transition-colors">
          <div className="space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white">Direct Bank Account</h5>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                Direct bank transfers to your verified savings or current account via NEFT & IMPS.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pt-2 border-t border-white/5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/5 text-slate-300 border border-white/5">
              <ShieldCheck className="w-3 h-3 text-purple-400" />
              <span>All Major Indian Banks</span>
            </span>
          </div>
        </div>

        {/* UPI ID */}
        <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-3 flex flex-col justify-between hover:border-white/10 transition-colors">
          <div className="space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white">UPI Virtual Address (VPA)</h5>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                Instant settlement directly to your UPI ID via Google Pay, PhonePe, Paytm, or BHIM.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pt-2 border-t border-white/5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/5 text-slate-300 border border-white/5">
              <Zap className="w-3 h-3 text-purple-400" />
              <span>Instant • 0% Platform Fee</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
