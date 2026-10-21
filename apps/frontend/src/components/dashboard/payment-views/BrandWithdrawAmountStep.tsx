'use client';

import React, { useState } from 'react';
import { X, ArrowDownRight, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

interface BrandWithdrawAmountStepProps {
  availableBalance: number;
  initialAmount?: number;
  onContinue: (amount: number) => void;
  onClose: () => void;
}

export default function BrandWithdrawAmountStep({
  availableBalance,
  initialAmount,
  onContinue,
  onClose,
}: BrandWithdrawAmountStepProps) {
  const { format, symbol } = useCurrency();
  const defaultAmount = initialAmount && initialAmount <= availableBalance
    ? initialAmount
    : Math.min(5000, Math.floor(availableBalance));

  const [amount, setAmount] = useState<number>(defaultAmount);
  const [customInput, setCustomInput] = useState<string>(defaultAmount > 0 ? defaultAmount.toString() : '');
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
      setError('Minimum withdrawal amount is ₹100');
    } else if (parsed > availableBalance) {
      setAmount(parsed);
      setError(`Cannot exceed available balance of ${format(availableBalance, { showDecimals: true })}`);
    } else {
      setAmount(parsed);
      setError(null);
    }
  };

  const handleSetMax = () => {
    const maxVal = Math.floor(availableBalance);
    setAmount(maxVal);
    setCustomInput(maxVal.toString());
    if (maxVal < 100) {
      setError('Minimum withdrawal amount is ₹100');
    } else {
      setError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount < 100) {
      setError('Minimum withdrawal amount is ₹100');
      return;
    }
    if (amount > availableBalance) {
      setError(`Cannot exceed available balance of ${format(availableBalance, { showDecimals: true })}`);
      return;
    }
    onContinue(amount);
  };

  return (
    <div className="relative w-full max-w-md bg-slate-950/95 border border-white/10 rounded-2xl md:rounded-[24px] shadow-2xl shadow-purple-950/50 backdrop-blur-xl p-6 sm:p-7 text-white animate-in fade-in zoom-in-95 duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-md shadow-amber-500/20">
            <ArrowDownRight className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white tracking-tight">Withdraw Brand Funds</h2>
            <p className="text-xs text-slate-400 font-medium">Transfer wallet balance to Bank or UPI</p>
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
              Amount to Withdraw
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400">
                Available: <span className="text-emerald-400 font-bold">{format(availableBalance, { showDecimals: true })}</span>
              </span>
              {availableBalance >= 100 && (
                <button
                  type="button"
                  onClick={handleSetMax}
                  className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-600/30 text-purple-300 hover:bg-purple-600/50 border border-purple-500/30 transition-all"
                >
                  Max
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-amber-400">
              {currencySymbol}
            </span>
            <input
              type="number"
              min={100}
              max={availableBalance}
              step={100}
              value={customInput}
              onChange={handleCustomChange}
              placeholder="e.g. 5000"
              autoFocus
              className={`w-full h-12 pl-11 pr-4 bg-slate-900/90 border rounded-xl text-base font-bold text-white placeholder-slate-500 transition-all focus:outline-none ${
                error
                  ? 'border-rose-500/80 bg-rose-950/20 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-white/10 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
              }`}
              required
            />
          </div>

          {error && <p className="mt-1.5 text-xs font-bold text-rose-400">{error}</p>}
        </div>

        {/* 0% Fee & Full Transfer Guarantee Box */}
        <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-extrabold text-emerald-200">Zero Platform Fees • Instant Payout</p>
            <p className="text-emerald-400/80 text-[11px] mt-0.5">
              The full amount of {format(amount || 0, { showDecimals: true })} will be transferred directly to your bank account or UPI without deductions.
            </p>
          </div>
        </div>

        {/* Quick Amount Suggestion Pills */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          {[1000, 2500, 5000, 10000].map((preset) => {
            const isClickable = preset <= availableBalance;
            const isSelected = amount === preset;
            return (
              <button
                key={preset}
                type="button"
                disabled={!isClickable}
                onClick={() => {
                  setAmount(preset);
                  setCustomInput(preset.toString());
                  setError(null);
                }}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all text-center truncate ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm ring-1 ring-amber-500/30'
                    : isClickable
                    ? 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/10'
                    : 'opacity-30 border-white/5 text-slate-600 cursor-not-allowed'
                }`}
              >
                ₹{preset.toLocaleString('en-IN')}
              </button>
            );
          })}
        </div>

        {/* Continue to Destination Button */}
        <button
          type="submit"
          disabled={!amount || amount < 100 || amount > availableBalance}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-purple-600 hover:from-amber-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <span>Continue to Withdrawal ({format(amount || 0, { showDecimals: true })})</span>
          <ArrowRight className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
        </button>
      </form>
    </div>
  );
}
