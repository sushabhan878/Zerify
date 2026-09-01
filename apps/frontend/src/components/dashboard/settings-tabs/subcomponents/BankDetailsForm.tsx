'use client';

import React from 'react';
import { Building2, Lock } from 'lucide-react';

interface BankDetailsFormProps {
  accountHolder: string;
  setAccountHolder: (val: string) => void;
  ifscCode: string;
  setIfscCode: (val: string) => void;
  accountNumber: string;
  setAccountNumber: (val: string) => void;
}

export default function BankDetailsForm({
  accountHolder,
  setAccountHolder,
  ifscCode,
  setIfscCode,
  accountNumber,
  setAccountNumber,
}: BankDetailsFormProps) {
  return (
    <div className="p-5 rounded-xl bg-slate-900/70 border border-white/10 backdrop-blur-xl space-y-4 shadow-xl">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
        <Building2 className="w-4 h-4 text-purple-400" />
        <span>Bank Account Details</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[11px] font-semibold text-slate-400/80 uppercase tracking-wider block mb-1.5">
            Account Holder Name
          </label>
          <input
            type="text"
            value={accountHolder}
            onChange={(e) => setAccountHolder(e.target.value)}
            placeholder="Full name as on bank account"
            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950/70 border border-white/10 text-xs text-white placeholder:text-slate-600/70 focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20 transition-all font-medium shadow-inner"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-400/80 uppercase tracking-wider block mb-1.5">
            IFSC / Swift Code
          </label>
          <input
            type="text"
            value={ifscCode}
            onChange={(e) => setIfscCode(e.target.value)}
            placeholder="e.g. HDFC0001234"
            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950/70 border border-white/10 text-xs text-white placeholder:text-slate-600/70 focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20 transition-all font-semibold uppercase tracking-wider shadow-inner"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-[11px] font-semibold text-slate-400/80 uppercase tracking-wider block mb-1.5">
            Bank Account Number
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Enter account number"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-slate-950/70 border border-white/10 text-xs text-white placeholder:text-slate-600/70 focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20 transition-all font-semibold tracking-widest shadow-inner"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
