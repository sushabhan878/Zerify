'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

interface KycUpiFormProps {
  upiId: string;
  setUpiId: (val: string) => void;
  panNumber: string;
  setPanNumber: (val: string) => void;
  payoutSchedule: string;
  setPayoutSchedule: (val: string) => void;
}

export default function KycUpiForm({
  upiId,
  setUpiId,
  panNumber,
  setPanNumber,
  payoutSchedule,
  setPayoutSchedule,
}: KycUpiFormProps) {
  const frequencies = ['Instant Automated', 'Weekly Bulk Settlement'];

  return (
    <div className="p-5 rounded-xl bg-slate-900/70 border border-white/10 backdrop-blur-xl space-y-4 shadow-xl">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-purple-400" />
        <span>UPI Address & Tax KYC Verification</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[11px] font-semibold text-slate-400/80 uppercase tracking-wider block mb-1.5">
            UPI Virtual Payment Address (VPA)
          </label>
          <input
            type="text"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="username@upi"
            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950/70 border border-white/10 text-xs text-white placeholder:text-slate-600/70 focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20 transition-all font-medium shadow-inner"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-400/80 uppercase tracking-wider block mb-1.5">
            PAN Card / Tax Registration ID
          </label>
          <div className="relative">
            <input
              type="text"
              value={panNumber}
              onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
              placeholder="ABCDE1234F"
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950/70 border border-white/10 text-xs text-white placeholder:text-slate-600/70 focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20 transition-all font-semibold uppercase tracking-wider shadow-inner"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> KYC Verified
            </span>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <label className="text-[11px] font-semibold text-slate-400/80 uppercase tracking-wider block mb-1.5">
          Cashfree Payout Settlement Frequency
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {frequencies.map((freq) => (
            <button
              key={freq}
              type="button"
              onClick={() => setPayoutSchedule(freq)}
              className={`p-3 rounded-lg border text-xs font-semibold transition-all flex items-center justify-between ${
                payoutSchedule === freq
                  ? 'bg-purple-600/20 border-purple-500/50 text-white shadow-md'
                  : 'bg-slate-950/60 border-white/10 text-slate-400/90 hover:text-white'
              }`}
            >
              <span>{freq}</span>
              {payoutSchedule === freq && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
