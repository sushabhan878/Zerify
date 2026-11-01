'use client';

import React, { useState } from 'react';
import { X, ArrowDownRight, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

interface InfluencerWithdrawAmountStepProps {
  availableBalance: number;
  initialAmount?: number;
  onContinue: (grossAmount: number, netAmount: number, zerifyFee: number) => void;
  onClose: () => void;
}

export default function InfluencerWithdrawAmountStep({
  availableBalance,
  initialAmount,
  onContinue,
  onClose,
}: InfluencerWithdrawAmountStepProps) {
  const { format, symbol } = useCurrency();
  
  // Default to full available balance as requested by user
  const defaultGross = initialAmount && initialAmount <= availableBalance
    ? initialAmount
    : Math.max(0, Math.floor(availableBalance));

  const [amount, setAmount] = useState<number>(defaultGross);
  const [customInput, setCustomInput] = useState<string>(defaultGross > 0 ? defaultGross.toString() : '');
  const [error, setError] = useState<string | null>(null);

  const currencySymbol = symbol || '₹';

  // 7% Zerify platform fee calculation
  const zerifyFee = Number(((amount || 0) * 0.07).toFixed(2));
  const netAmount = Math.max(0, Number(((amount || 0) - zerifyFee).toFixed(2)));

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

  const handlePresetSelect = (ratio: number) => {
    const target = Math.floor(availableBalance * ratio);
    setAmount(target);
    setCustomInput(target.toString());
    if (target < 100) {
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
    onContinue(amount, netAmount, zerifyFee);
  };

  return (
    <div className="relative w-full max-w-md bg-slate-950/95 light:bg-white border border-white/10 light:border-slate-200 rounded-2xl md:rounded-[24px] shadow-2xl light:shadow-xl shadow-purple-950/50 backdrop-blur-xl p-6 sm:p-7 text-white light:text-slate-900 animate-in fade-in zoom-in-95 duration-200">
      {/* Top Header - Identical to Brand Side */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 light:border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 light:bg-amber-50 light:border-amber-200 light:text-amber-600 shadow-md shadow-amber-500/20">
            <ArrowDownRight className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white light:text-slate-900 tracking-tight">Withdraw Creator Earnings</h2>
            <p className="text-xs text-slate-400 light:text-slate-500 font-medium">Transfer wallet balance to Bank, UPI, or Card</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 light:text-slate-500 hover:text-white light:hover:text-slate-900 hover:bg-white/10 light:hover:bg-slate-100 transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {/* Amount Input Box */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 light:text-slate-700">
              Amount to Withdraw
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400 light:text-slate-500">
                Available: <span className="text-emerald-400 light:text-emerald-600 font-bold">{format(availableBalance, { showDecimals: true })}</span>
              </span>
              {availableBalance >= 100 && (
                <button
                  type="button"
                  onClick={handleSetMax}
                  className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-600/30 light:bg-purple-50 text-purple-300 light:text-purple-700 hover:bg-purple-600/50 light:hover:bg-purple-100 border border-purple-500/30 light:border-purple-200 transition-all cursor-pointer"
                >
                  Max
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-amber-400 light:text-amber-600">
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
              className={`w-full h-12 pl-11 pr-4 bg-slate-900/90 light:bg-slate-50 border rounded-xl text-base font-bold text-white light:text-slate-900 placeholder-slate-500 light:placeholder-slate-400 transition-all focus:outline-none ${
                error
                  ? 'border-rose-500/80 bg-rose-950/20 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-white/10 light:border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 light:focus:border-purple-500 light:shadow-sm'
              }`}
              required
            />
          </div>

          {error && <p className="mt-1.5 text-xs font-bold text-rose-400 light:text-rose-600">{error}</p>}
        </div>

        {/* 7% Zerify Fee Deduction & Net Payout Box */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 light:bg-slate-50 border border-white/10 light:border-slate-200 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-400 light:text-slate-600">
            <span>Gross Withdrawal</span>
            <span className="font-bold text-white light:text-slate-900">{format(amount || 0, { showDecimals: true })}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400 light:text-slate-600">
            <span className="flex items-center gap-1.5 text-amber-300 light:text-amber-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 light:text-amber-600" />
              <span>Zerify Platform Fee (7%)</span>
            </span>
            <span className="font-bold text-amber-400 light:text-amber-600">-{format(zerifyFee, { showDecimals: true })}</span>
          </div>
          <div className="pt-2 border-t border-white/10 light:border-slate-200 flex items-center justify-between font-extrabold text-white light:text-slate-900">
            <span className="text-slate-300 light:text-slate-700">Net Amount to Receive</span>
            <span className="text-emerald-400 light:text-emerald-600 text-sm font-black">{format(netAmount, { showDecimals: true })}</span>
          </div>
          <div className="pt-1 text-[10px] text-slate-400 light:text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 light:text-emerald-600 shrink-0" />
            <span>Instant payout to your UPI, Card, or Bank Account via Cashfree</span>
          </div>
        </div>

        {/* Quick Amount Suggestion Percentage Pills */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          {[
            { label: '25%', ratio: 0.25 },
            { label: '50%', ratio: 0.5 },
            { label: '75%', ratio: 0.75 },
            { label: '100% (Max)', ratio: 1.0 },
          ].map((preset) => {
            const calculatedVal = Math.floor(availableBalance * preset.ratio);
            const isClickable = calculatedVal >= 100 && availableBalance >= 100;
            const isSelected = amount === calculatedVal && amount > 0;
            return (
              <button
                key={preset.label}
                type="button"
                disabled={!isClickable}
                onClick={() => handlePresetSelect(preset.ratio)}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all text-center truncate cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/20 light:bg-amber-50 border-amber-500 light:border-amber-400 text-amber-300 light:text-amber-800 shadow-sm ring-1 ring-amber-500/30'
                    : isClickable
                    ? 'bg-white/5 light:bg-white border-white/10 light:border-slate-200 text-slate-300 light:text-slate-700 hover:border-white/20 light:hover:border-slate-300 hover:bg-white/10 light:hover:bg-slate-50'
                    : 'opacity-30 border-white/5 light:border-slate-100 text-slate-600 light:text-slate-400 cursor-not-allowed'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Continue to Destination Button */}
        <button
          type="submit"
          disabled={!amount || amount < 100 || amount > availableBalance}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-purple-600 hover:from-amber-500 hover:to-purple-500 text-white keep-white font-extrabold text-sm shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
        >
          <span>Continue to Withdrawal ({format(netAmount, { showDecimals: true })})</span>
          <ArrowRight className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
        </button>
      </form>
    </div>
  );
}
