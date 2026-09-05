'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Globe, ArrowRight, Loader2, DollarSign } from 'lucide-react';
import AuthAlert from './AuthAlert';

interface RegisterBrandStepProps {
  website: string;
  setWebsite: (val: string) => void;
  budget: number;
  setBudget: (val: number) => void;
  currency: 'INR' | 'USD';
  setCurrency: (curr: 'INR' | 'USD') => void;
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
  const handleCurrencyChange = (newCurr: 'INR' | 'USD') => {
    if (newCurr === currency) return;
    if (newCurr === 'USD') {
      // Convert INR (e.g. 500000) to USD (~6000)
      const converted = Math.round(budget / 83.5);
      setBudget(Math.max(0, Math.min(converted, 25000)));
    } else {
      // Convert USD (e.g. 7000) to INR (~580000)
      const converted = Math.round((budget * 83.5) / 25000) * 25000;
      setBudget(Math.max(0, Math.min(converted, 2500000)));
    }
    setCurrency(newCurr);
  };

  const formatBudget = (val: number) => {
    if (val === 0) return `${currency === 'INR' ? '₹0' : '$0'} / month`;
    if (currency === 'INR') {
      if (val >= 2500000) return '₹25,00,000+ / month';
      return `₹${val.toLocaleString('en-IN')} / month`;
    } else {
      if (val >= 25000) return '$25,000+ / month';
      return `$${val.toLocaleString()} / month`;
    }
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
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3.5">
          {/* Header Row: Label & Currency Segmented Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-purple-400" />
              <span>Monthly Creator Budget</span>
            </label>

            {/* Currency Selector Pill */}
            <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-white/10">
              <button
                type="button"
                onClick={() => handleCurrencyChange('INR')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                  currency === 'INR'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ₹ INR
              </button>
              <button
                type="button"
                onClick={() => handleCurrencyChange('USD')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                  currency === 'USD'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                $ USD
              </button>
            </div>
          </div>

          {/* Budget Badge Display */}
          <div className="flex justify-end">
            <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
              {formatBudget(budget)}
            </span>
          </div>

          {/* Dynamic Range Slider (INR / USD) */}
          <input
            type="range"
            min={0}
            max={currency === 'INR' ? 2500000 : 25000}
            step={currency === 'INR' ? 25000 : 500}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-all"
          />

          {/* Slider Axis Ticks */}
          <div className="flex justify-between text-[10px] text-slate-500 font-semibold px-0.5">
            {currency === 'INR' ? (
              <>
                <span>₹0</span>
                <span>₹5,00,000</span>
                <span>₹15,00,000</span>
                <span>₹25,00,000+</span>
              </>
            ) : (
              <>
                <span>$0</span>
                <span>$5,000</span>
                <span>$15,000</span>
                <span>$25,000+</span>
              </>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Account...</span>
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
