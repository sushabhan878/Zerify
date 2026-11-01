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
    <div className="p-6 rounded-2xl bg-slate-950/60 light:bg-white border border-white/10 light:border-slate-200/90 hover:border-purple-500/40 light:hover:border-purple-300 backdrop-blur-xl transition-all shadow-xl light:shadow-sm hover:shadow-purple-950/20 group flex flex-col justify-between space-y-5">
      {/* Top Bar: Icon, Title & Status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${isBank
                ? 'bg-gradient-to-tr from-purple-900/60 via-indigo-900/40 to-slate-900 light:from-purple-100 light:via-indigo-50 light:to-white text-purple-300 light:text-purple-700 border-purple-500/30 light:border-purple-200'
                : 'bg-gradient-to-tr from-pink-900/60 via-purple-900/40 to-slate-900 light:from-pink-100 light:via-purple-50 light:to-white text-pink-300 light:text-pink-700 border-pink-500/30 light:border-pink-200'
              }`}
          >
            <Icon className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-white light:text-slate-900 tracking-tight">{title}</h4>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 light:bg-emerald-50 text-emerald-400 light:text-emerald-700 border border-emerald-500/30 light:border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 light:text-emerald-600" />
                <span>{status}</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 light:text-slate-600 font-medium">
              {isBank ? 'Direct IMPS / NEFT Bank Payout' : 'Instant UPI Settlement'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          title="Copy identifier"
          className="p-1.5 rounded-lg bg-white/5 light:bg-slate-100 hover:bg-white/10 light:hover:bg-slate-200 border border-white/5 light:border-slate-200 text-slate-400 light:text-slate-600 hover:text-white light:hover:text-slate-900 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 light:text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Account Number / VPA Display Box */}
      <div className="px-4 py-3 rounded-xl bg-slate-900/80 light:bg-slate-50 border border-white/5 light:border-slate-200/80 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 light:text-slate-500 block mb-0.5">
            {isBank ? 'Account Number' : 'Virtual Payment Address'}
          </span>
          <span className="text-sm font-mono font-bold text-white light:text-slate-900 tracking-wider">
            {accountIdentifier}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 light:text-slate-500 block mb-0.5">
            Settlement Engine
          </span>
          <span className="text-xs font-semibold text-purple-300 light:text-purple-700 flex items-center gap-1 justify-end">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400 light:text-purple-600" />
            <span>Cashfree</span>
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/5 light:border-slate-100 text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 light:text-slate-500 block mb-0.5">
            Account Holder
          </span>
          <span className="font-semibold text-slate-200 light:text-slate-800 truncate block">
            {accountHolder || 'Verified Creator'}
          </span>
        </div>

        {secondaryDetail ? (
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 light:text-slate-500 block mb-0.5">
              {secondaryDetail.label}
            </span>
            <span className="font-mono font-semibold text-slate-200 light:text-slate-800 truncate block">
              {secondaryDetail.value}
            </span>
          </div>
        ) : (
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 light:text-slate-500 block mb-0.5">
              Processing Mode
            </span>
            <span className="font-semibold text-slate-200 light:text-slate-800 truncate block">Instant Transfer</span>
          </div>
        )}
      </div>

      {/* Action CTA */}
      {onManage && (
        <button
          type="button"
          onClick={onManage}
          className="w-full py-2 px-3 rounded-xl bg-slate-900/90 light:bg-slate-100 hover:bg-slate-800 light:hover:bg-slate-200 border border-white/10 light:border-slate-200/90 hover:border-purple-500/40 light:hover:border-purple-300 text-xs font-bold text-slate-300 light:text-slate-700 hover:text-white light:hover:text-slate-900 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Manage Account</span>
        </button>
      )}
    </div>
  );
}
