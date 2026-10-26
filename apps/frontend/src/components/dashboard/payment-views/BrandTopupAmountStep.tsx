'use client';

import React, { useState } from 'react';
import { X, Wallet, ShieldCheck, ArrowRight } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

interface BrandTopupAmountStepProps {
  onContinue: (amount: number) => void;
  onClose: () => void;
  initialAmount?: number;
  campaignId?: string;
  campaignTitle?: string;
  creatorCount?: number;
}

export default function BrandTopupAmountStep({
  onContinue,
  onClose,
  initialAmount = 5000,
  campaignId,
  campaignTitle,
  creatorCount = 1,
}: BrandTopupAmountStepProps) {
  const { format, symbol } = useCurrency();
  const [amount, setAmount] = useState<number>(initialAmount);
  const [customInput, setCustomInput] = useState<string>(initialAmount ? initialAmount.toString() : '');
  const [error, setError] = useState<string | null>(null);

  const currencySymbol = symbol || '₹';
  const isEscrowMode = Boolean(campaignId);

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

  const selectPreset = (presetAmount: number) => {
    setAmount(presetAmount);
    setCustomInput(presetAmount.toString());
    setError(null);
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
    <div className="relative w-full max-w-lg bg-slate-950/95 border border-purple-500/30 rounded-2xl md:rounded-[26px] shadow-2xl shadow-purple-950/60 backdrop-blur-2xl p-6 sm:p-7 text-white animate-in fade-in zoom-in-95 duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 shadow-md shadow-purple-600/20">
            {isEscrowMode ? <ShieldCheck className="w-5 h-5 text-emerald-400" /> : <Wallet className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              {isEscrowMode ? 'Campaign Escrow Reservation' : 'Top Up Brand Wallet'}
            </h2>
            <p className="text-xs text-slate-400 font-medium truncate max-w-[260px] sm:max-w-xs">
              {isEscrowMode
                ? campaignTitle
                  ? `For "${campaignTitle}"`
                  : 'Secure deliverables with protected escrow deposit'
                : 'Enter funds to allocate for campaigns'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {/* For Escrow: Creator Allocation Pricing Snapshot */}
        {isEscrowMode && (
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-purple-500/20 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Agreed Creator Compensation:</span>
              <span className="font-bold text-white">{format(initialAmount, { showDecimals: true })}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Smart Escrow Protection:</span>
              <span className="font-bold text-emerald-400">100% Protected</span>
            </div>
            {creatorCount > 1 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Active Collaborations:</span>
                <span className="font-bold text-purple-300">{creatorCount} Creators</span>
              </div>
            )}
          </div>
        )}

        {/* Amount Input Box */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {isEscrowMode ? 'Escrow Deposit Amount' : 'Amount to Deposit'}
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

        {/* Quick Amount Presets */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            {isEscrowMode ? 'Exact Escrow Fee' : 'Quick Amounts'}
          </span>
          {isEscrowMode ? (
            <button
              type="button"
              onClick={() => selectPreset(initialAmount)}
              className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-between ${
                amount === initialAmount
                  ? 'bg-purple-600/30 border-purple-500 text-white shadow-lg shadow-purple-900/20'
                  : 'bg-slate-900/60 border-white/5 text-slate-300 hover:border-purple-500/30'
              }`}
            >
              <div className="flex flex-col text-left">
                <span className="font-black text-sm text-white">{format(initialAmount)}</span>
                <span className="text-[10px] text-slate-400">Exact Fee</span>
              </div>
              <span
                className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  amount === initialAmount
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-white/5 text-slate-400'
                }`}
              >
                {amount === initialAmount ? 'Selected' : 'Use Exact Fee'}
              </span>
            </button>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {[1000, 5000, 10000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => selectPreset(preset)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                    amount === preset
                      ? 'bg-purple-600/30 border-purple-500 text-white'
                      : 'bg-slate-900/60 border-white/5 text-slate-300 hover:border-purple-500/30'
                  }`}
                >
                  {format(preset)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Security & Reassurance Box */}
        <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-extrabold text-emerald-200">
              {isEscrowMode ? 'Smart Escrow Custody Protection' : 'Zero Platform Fees • 100% Deposited'}
            </p>
            <p className="text-emerald-400/80 text-[11px] mt-0.5 leading-relaxed">
              {isEscrowMode
                ? `Funds are held safely in Smart Escrow and released to creators only upon your final deliverable review and approval.`
                : `The full amount of ${format(amount || 0, { showDecimals: true })} will be credited to your Zerify wallet without any deductions.`}
            </p>
          </div>
        </div>

        {/* Start Escrow Flow / Continue Button */}
        <button
          type="submit"
          disabled={!amount || amount < 100}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:via-indigo-500 hover:to-purple-500 text-white font-black text-sm shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
        >
          <span>
            {isEscrowMode ? 'Start Escrow Flow' : 'Continue to Payment'} ({format(amount || 0, { showDecimals: true })})
          </span>
          <ArrowRight className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
        </button>
      </form>
    </div>
  );
}
