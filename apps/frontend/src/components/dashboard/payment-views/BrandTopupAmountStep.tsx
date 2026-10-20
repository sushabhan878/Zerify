'use client';

import React, { useState } from 'react';
import { X, Wallet, ShieldCheck, ArrowRight } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

interface BrandTopupAmountStepProps {
  onContinue: (amount: number) => void;
  onClose: () => void;
  initialAmount?: number;
}

export default function BrandTopupAmountStep({
  onContinue,
  onClose,
  initialAmount = 5000,
}: BrandTopupAmountStepProps) {
  const { format, symbol } = useCurrency();
  const [amount, setAmount] = useState<number>(initialAmount);
  const [customInput, setCustomInput] = useState<string>(initialAmount ? initialAmount.toString() : '');
  const [error, setError] = useState<string | null>(null);

  const currencySymbol = symbol || '₹';

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setCustomInput(raw);
    const parsed = parseFloat(raw);
    if (isNaN(parsed) || parsed <= 0) {
      setAmount(0);
      setError('Please enter a valid amount');
    } else if (parsed < 100) {
      setAmount(parsed);
      setError('Minimum deposit amount is ₹100');
    } else {
      setAmount(parsed);
      setError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount < 100) {
      setError('Minimum deposit amount is ₹100');
      return;
    }
    onContinue(amount);
  };

  return (
    <div className="relative w-full max-w-md bg-slate-950/95 border border-white/10 rounded-2xl md:rounded-[24px] shadow-2xl shadow-purple-950/50 backdrop-blur-xl p-6 sm:p-7 text-white animate-in fade-in zoom-in-95 duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 shadow-md shadow-purple-600/20">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white tracking-tight">Top Up Brand Wallet</h2>
            <p className="text-xs text-slate-400 font-medium">Enter funds to allocate for campaigns</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {/* Amount Input Box */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Amount to Deposit
            </label>
            <span className="text-[11px] font-semibold text-purple-400">Min ₹100</span>
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-purple-400">
              {currencySymbol}
            </span>
            <input
              type="number"
              min={100}
              step={100}
              value={customInput}
              onChange={handleCustomChange}
              placeholder="e.g. 5000"
              autoFocus
              className={`w-full h-12 pl-11 pr-4 bg-slate-900/90 border rounded-xl text-base font-bold text-white placeholder-slate-500 transition-all focus:outline-none ${
                error
                  ? 'border-rose-500/80 bg-rose-950/20 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
              }`}
              required
            />
          </div>

          {error && <p className="mt-1.5 text-xs font-bold text-rose-400">{error}</p>}
        </div>

        {/* 0% Fee & Full Credit Transparency Box */}
        <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-extrabold text-emerald-200">Zero Platform Fees • 100% Deposited</p>
            <p className="text-emerald-400/80 text-[11px] mt-0.5">
              The full amount of {format(amount || 0, { showDecimals: true })} will be credited to your Zerify wallet without any deductions.
            </p>
          </div>
        </div>

        {/* Continue to Payment Button */}
        <button
          type="submit"
          disabled={!amount || amount < 100}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <span>Continue to Payment ({format(amount || 0, { showDecimals: true })})</span>
          <ArrowRight className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
        </button>
      </form>
    </div>
  );
}
