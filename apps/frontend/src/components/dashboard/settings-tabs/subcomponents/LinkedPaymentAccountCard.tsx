'use client';

import React, { useState } from 'react';
import { Building2, Smartphone, CheckCircle2, Copy, Check, ArrowUpRight, ShieldCheck } from 'lucide-react';

interface LinkedPaymentAccountCardProps {
  type: 'BANK' | 'UPI';
  title: string;
  accountIdentifier: string;
  accountHolder?: string;
  secondaryDetail?: { label: string; value: string };
  status?: string;
  provider?: string;
  onManage?: () => void;
}

export default function LinkedPaymentAccountCard({
  type,
  title,
  accountIdentifier,
  accountHolder,
  secondaryDetail,
  status = 'Active',
  provider = 'Cashfree Escrow Engine',
  onManage,
}: LinkedPaymentAccountCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!accountIdentifier) return;
    navigator.clipboard.writeText(accountIdentifier.replace(/\s+/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isBank = type === 'BANK';
  const Icon = isBank ? Building2 : Smartphone;

  return (
    <div className="p-6 rounded-2xl bg-slate-950/60 border border-white/10 hover:border-purple-500/40 backdrop-blur-xl transition-all shadow-xl hover:shadow-purple-950/20 group flex flex-col justify-between space-y-5">
      {/* Top Bar: Icon, Title & Status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
              isBank
                ? 'bg-gradient-to-tr from-purple-900/60 via-indigo-900/40 to-slate-900 text-purple-300 border-purple-500/30'
                : 'bg-gradient-to-tr from-pink-900/60 via-purple-900/40 to-slate-900 text-pink-300 border-pink-500/30'
            }`}
          >
            <Icon className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-white tracking-tight">{title}</h4>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{status}</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {isBank ? 'Direct IMPS / NEFT Bank Payout' : 'Instant UPI Settlement'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          title="Copy identifier"
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Account Number / VPA Display Box */}
      <div className="px-4 py-3 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
            {isBank ? 'Account Number' : 'Virtual Payment Address'}
          </span>
          <span className="text-sm font-mono font-bold text-white tracking-wider">
            {accountIdentifier}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
            Settlement Engine
          </span>
          <span className="text-xs font-semibold text-purple-300 flex items-center gap-1 justify-end">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Cashfree</span>
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/5 text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
            Account Holder
          </span>
          <span className="font-semibold text-slate-200 truncate block">
            {accountHolder || 'Verified Creator'}
          </span>
        </div>

        {secondaryDetail ? (
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
              {secondaryDetail.label}
            </span>
            <span className="font-mono font-semibold text-slate-200 truncate block">
              {secondaryDetail.value}
            </span>
          </div>
        ) : (
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
              Processing Mode
            </span>
            <span className="font-semibold text-slate-200 truncate block">Instant Transfer</span>
          </div>
        )}
      </div>

      {/* Action CTA */}
      {onManage && (
        <button
          type="button"
          onClick={onManage}
          className="w-full py-2 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-purple-500/40 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5"
        >
          <span>Manage in Payments</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-purple-400" />
        </button>
      )}
    </div>
  );
}
