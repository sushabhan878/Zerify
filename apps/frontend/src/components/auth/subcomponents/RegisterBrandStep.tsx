'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Globe, ArrowRight, Loader2, DollarSign } from 'lucide-react';
import AuthAlert from './AuthAlert';
import AuthCurrencySelector from './AuthCurrencySelector';
import { SUPPORTED_CURRENCIES } from '@/utils/currency';

interface RegisterBrandStepProps {
  website: string;
  setWebsite: (val: string) => void;
  budget: number;
  setBudget: (val: number) => void;
  currency: string;
  setCurrency: (curr: string) => void;
  loading: boolean;
  errorMessage: string;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

export default function RegisterBrandStep({
  website,
  setWebsite,
  budget,
  setBudget,
  currency,
  setCurrency,
  loading,
  errorMessage,
  onSubmit,
}: RegisterBrandStepProps) {
  const currDetails = useMemo(() => {
    return SUPPORTED_CURRENCIES[currency] || {
      code: currency,
      symbol: currency,
      exchangeRateToUSD: 1,
    };
  }, [currency]);

  const maxBudget = useMemo(() => {
    const rate = currDetails.exchangeRateToUSD || 1;
    if (currency === 'INR') return 2500000;
    if (currency === 'USD') return 25000;
    const raw = 25000 * rate;
    if (raw > 500000) return Math.round(raw / 100000) * 100000;
    if (raw > 50000) return Math.round(raw / 10000) * 10000;
    return Math.round(raw / 1000) * 1000;
  }, [currency, currDetails]);

  const sliderStep = useMemo(() => {
    if (maxBudget >= 500000) return 25000;
    if (maxBudget >= 50000) return 2500;
    return 250;
  }, [maxBudget]);

  const handleCurrencyChange = (newCurr: string) => {
    if (newCurr === currency) return;
    const oldRate = currDetails.exchangeRateToUSD || 1;
    const newDetails = SUPPORTED_CURRENCIES[newCurr];
    const newRate = newDetails?.exchangeRateToUSD || 1;

    const inUSD = budget / oldRate;
    const converted = Math.round(inUSD * newRate);
    setBudget(converted);
    setCurrency(newCurr);
  };

  const formatBudget = (val: number) => {
    const symbol = currDetails.symbol || currency;
    if (val === 0) return `${symbol}0 / month`;
    if (val >= maxBudget) return `${symbol}${maxBudget.toLocaleString()}+ / month`;
    return `${symbol}${val.toLocaleString()} / month`;
  };

  return (
    <motion.div
      key="step3-brand"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      {/* Title Centered with Landing Page Typography */}
      <div className="text-center mb-4">
        <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight [font-family:'Playfair_Display',Georgia,serif]">
          Brand &amp; Agency <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300">Profile</span>
        </h2>
        <p className="text-xs text-slate-300 mt-1">Tell creators about your brand and campaign scope</p>
      </div>

      <AuthAlert message={errorMessage} />

      <form onSubmit={onSubmit} className="space-y-4">
        {/* 1. Website URL (Optional) */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Website URL (Optional)</label>
          <div className="relative">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://acmebrand.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs text-white placeholder-slate-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* 2. Campaign Budget Slider with Currency Selector */}
        <div className="space-y-3 pt-1">
          {/* Header Row: Label & Currency Selector */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-purple-400" />
              <span>Monthly Creator Budget</span>
            </label>

            {/* Platform Currency Selector */}
            <AuthCurrencySelector
              value={currency}
              onChange={handleCurrencyChange}
            />
          </div>

          {/* Budget Badge Display */}
          <div className="flex justify-end">
            <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 shadow-inner">
              {formatBudget(budget)}
            </span>
          </div>

          {/* Dynamic Range Slider */}
          <input
            type="range"
            min={0}
            max={maxBudget}
            step={sliderStep}
            value={Math.min(budget, maxBudget)}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-all"
          />

          {/* Slider Axis Ticks */}
          <div className="flex justify-between text-[10px] text-slate-500 font-semibold px-0.5">
            <span>{currDetails.symbol}0</span>
            <span>{currDetails.symbol}{Math.round(maxBudget * 0.2).toLocaleString()}</span>
            <span>{currDetails.symbol}{Math.round(maxBudget * 0.5).toLocaleString()}</span>
            <span>{currDetails.symbol}{maxBudget.toLocaleString()}+</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 mt-4 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Brand Account...</span>
            </>
          ) : (
            <>
              <span>Complete Brand Setup</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
