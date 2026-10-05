'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  ShieldCheck,
  Percent,
  Gift,
  Scale,
  MessageSquareQuote,
  Sliders,
  TrendingUp,
  Layers,
  ChevronDown,
  Check,
  Sparkles,
  Package,
  Activity,
  Info,
} from 'lucide-react';

const PAYMENT_MODELS = [
  {
    value: 'FIXED',
    label: 'Fixed Fee',
    icon: DollarSign,
    desc: 'Equal set compensation for each hired creator',
  },
  {
    value: 'NEGOTIABLE',
    label: 'Negotiable / Pitch',
    icon: MessageSquareQuote,
    desc: 'Creators propose their custom rate when applying',
  },
  {
    value: 'RANGE',
    label: 'Budget Range',
    icon: Sliders,
    desc: 'Min and Max target payout per creator',
  },
  {
    value: 'PERFORMANCE_BASED',
    label: 'Performance / CPM',
    icon: TrendingUp,
    desc: 'Compensation tied to verified views or sales conversions',
  },
  {
    value: 'BARTER',
    label: 'Product Barter',
    icon: Gift,
    desc: 'Free product gifting in exchange for deliverables',
  },
  {
    value: 'HYBRID',
    label: 'Hybrid (Fee + Product)',
    icon: Layers,
    desc: 'Base financial payout plus free product shipment',
  },
];

const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'INR - Indian Rupee (Default)' },
  { code: 'USD', symbol: '$', label: 'USD - US Dollar' },
  { code: 'EUR', symbol: '€', label: 'EUR - Euro' },
  { code: 'GBP', symbol: '£', label: 'GBP - British Pound' },
  { code: 'CAD', symbol: 'C$', label: 'CAD - Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'AUD - Australian Dollar' },
];

const PERFORMANCE_METRICS = [
  { id: 'CPM', label: 'Per 1,000 Verified Views (CPM)' },
  { id: 'CPC', label: 'Per Verified Click / Lead (CPC)' },
  { id: 'CPA', label: 'Per Product Sale / Conversion (CPA)' },
  { id: 'COMMISSION', label: 'Affiliate Revenue Share (%)' },
];

interface BudgetStepProps {
  formData: any;
  onChange: (field: string, val: any) => void;
}

export default function BudgetStep({ formData, onChange }: BudgetStepProps) {
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isMetricOpen, setIsMetricOpen] = useState(false);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);
  const metricDropdownRef = useRef<HTMLDivElement>(null);

  const selectedModel = formData.budgetPaymentModel || '';

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target as Node)) {
        setIsCurrencyOpen(false);
      }
      if (metricDropdownRef.current && !metricDropdownRef.current.contains(event.target as Node)) {
        setIsMetricOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const preferredCurrency = typeof window !== 'undefined' ? localStorage.getItem('zerify_preferred_currency') || 'INR' : 'INR';
  const selectedCurrency = CURRENCIES.find((c) => c.code === (formData.budgetCurrency || preferredCurrency)) || CURRENCIES[0];
  const selectedMetric = PERFORMANCE_METRICS.find((m) => m.id === formData.performanceMetric);

  return (
    <div className="space-y-6">
      {/* Payment Model Selection */}
      <div className="space-y-2.5">
        <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider">
          Payment & Compensation Model <span className="text-pink-400">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {PAYMENT_MODELS.map((pm) => {
            const isSelected = selectedModel === pm.value;
            const Icon = pm.icon;

            return (
              <button
                type="button"
                key={pm.value}
                onClick={() => onChange('budgetPaymentModel', pm.value === selectedModel ? '' : pm.value)}
                className={`relative p-4 rounded-2xl text-left border transition-all duration-200 group flex flex-col justify-between overflow-hidden cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-b from-purple-950/40 to-slate-900/90 border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.15)] ring-1 ring-purple-400/30'
                    : 'bg-slate-900/60 border-white/10 hover:border-purple-400/30 hover:bg-slate-900/90 hover:-translate-y-0.5'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-purple-500/25 text-purple-200 border border-purple-400/40 shadow-[0_0_10px_rgba(192,132,252,0.25)]'
                          : 'bg-slate-800/80 text-slate-400 border border-white/5 group-hover:text-purple-300 group-hover:border-purple-400/20'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-purple-500 text-white shadow-sm'
                          : 'border border-white/15 group-hover:border-purple-400/30'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>

                  <span className="block text-xs font-bold text-white tracking-tight">
                    {pm.label}
                  </span>
                </div>

                <span className="block text-[11px] text-slate-400 mt-2 leading-relaxed">
                  {pm.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Model Specific Dynamic Input Fields */}
      <div className="pt-2 space-y-4">
        {/* Currency Dropdown Component */}
        <div className="flex items-center justify-between border-b border-purple-400/10 pb-3">
          <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">
            Campaign Budget Configuration
          </span>
          <div className="relative" ref={currencyDropdownRef}>
            <button
              type="button"
              onClick={() => setIsCurrencyOpen((prev) => !prev)}
              className="px-3 py-1.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white flex items-center gap-2 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
            >
              <span className="font-bold text-purple-300">{selectedCurrency.symbol}</span>
              <span className="font-medium text-white">{selectedCurrency.code}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isCurrencyOpen ? 'rotate-180 text-purple-300' : ''}`} />
            </button>

            <AnimatePresence>
              {isCurrencyOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-50 right-0 mt-1.5 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl max-h-56 overflow-y-auto p-1.5 space-y-0.5 w-48 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                  {CURRENCIES.map((c) => {
                    const isSelected = selectedCurrency.code === c.code;
                    return (
                      <button
                        type="button"
                        key={c.code}
                        onClick={() => {
                          onChange('budgetCurrency', c.code);
                          setIsCurrencyOpen(false);
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-left text-xs font-medium transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'bg-purple-500/20 text-purple-200 font-bold'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <span>{c.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-purple-300 stroke-[2.5]" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 0. NO MODEL SELECTED EMPTY STATE */}
        {!selectedModel && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-slate-900/60 border border-dashed border-purple-400/20 text-center space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-400/20 text-purple-300 flex items-center justify-center mx-auto">
              <DollarSign className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-white">
              No Payment Model Selected
            </p>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto">
              Choose a payment and compensation model above (e.g. Fixed Fee, Budget Range, Negotiable, Barter) to configure creator payout rates and budget pools.
            </p>
          </motion.div>
        )}

        {/* 1. FIXED FEE FIELDS */}
        {selectedModel === 'FIXED' && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
                  Fixed Fee Payout Per Creator ({selectedCurrency.code}) <span className="text-pink-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 1000"
                    value={formData.budgetMinPerInfluencer || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, '');
                      onChange('budgetMinPerInfluencer', val ? Number(val) : undefined);
                      onChange('budgetMaxPerInfluencer', val ? Number(val) : undefined);
                    }}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                  />
                  <span className="text-purple-300/70 font-bold text-xs absolute left-3.5 top-3">
                    {selectedCurrency.symbol}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
                  Total Campaign Budget Pool ({selectedCurrency.code}) <span className="text-pink-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 5000"
                    value={formData.budgetTotalAmount || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, '');
                      onChange('budgetTotalAmount', val ? Number(val) : undefined);
                    }}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                  />
                  <span className="text-purple-300/70 font-bold text-xs absolute left-3.5 top-3">
                    {selectedCurrency.symbol}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Each accepted creator will receive this exact fixed payout held in secure escrow.
            </p>
          </motion.div>
        )}

        {/* 2. NEGOTIABLE / PITCH FIELDS */}
        {selectedModel === 'NEGOTIABLE' && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
                  Maximum Payout Cap Per Creator ({selectedCurrency.code})
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 2500"
                    value={formData.budgetMaxPerInfluencer || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, '');
                      onChange('budgetMaxPerInfluencer', val ? Number(val) : undefined);
                    }}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                  />
                  <span className="text-purple-300/70 font-bold text-xs absolute left-3.5 top-3">
                    {selectedCurrency.symbol}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
                  Estimated Total Budget Pool ({selectedCurrency.code}) <span className="text-pink-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 10000"
                    value={formData.budgetTotalAmount || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, '');
                      onChange('budgetTotalAmount', val ? Number(val) : undefined);
                    }}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                  />
                  <span className="text-purple-300/70 font-bold text-xs absolute left-3.5 top-3">
                    {selectedCurrency.symbol}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Creators will propose their custom fee when submitting proposals. You can counter-offer or accept upon review.
            </p>
          </motion.div>
        )}

        {/* 3. BUDGET RANGE FIELDS */}
        {selectedModel === 'RANGE' && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
                  Minimum Payout ({selectedCurrency.code}) <span className="text-pink-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 500"
                    value={formData.budgetMinPerInfluencer || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, '');
                      onChange('budgetMinPerInfluencer', val ? Number(val) : undefined);
                    }}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                  />
                  <span className="text-purple-300/70 font-bold text-xs absolute left-3.5 top-3">
                    {selectedCurrency.symbol}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
                  Maximum Payout ({selectedCurrency.code}) <span className="text-pink-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 2000"
                    value={formData.budgetMaxPerInfluencer || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, '');
                      onChange('budgetMaxPerInfluencer', val ? Number(val) : undefined);
                    }}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                  />
                  <span className="text-purple-300/70 font-bold text-xs absolute left-3.5 top-3">
                    {selectedCurrency.symbol}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
                  Total Budget Pool ({selectedCurrency.code}) <span className="text-pink-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 8000"
                    value={formData.budgetTotalAmount || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, '');
                      onChange('budgetTotalAmount', val ? Number(val) : undefined);
                    }}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                  />
                  <span className="text-purple-300/70 font-bold text-xs absolute left-3.5 top-3">
                    {selectedCurrency.symbol}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Creators will see this range and know expected compensation boundaries for this campaign.
            </p>
          </motion.div>
        )}

        {/* 4. PERFORMANCE / CPM FIELDS */}
        {selectedModel === 'PERFORMANCE_BASED' && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Performance Metric Selector */}
              <div className="relative" ref={metricDropdownRef}>
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
                  Performance Metric
                </label>
                <button
                  type="button"
                  onClick={() => setIsMetricOpen((prev) => !prev)}
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white flex items-center justify-between focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                >
                  <span className={selectedMetric ? 'font-medium text-white truncate' : 'text-slate-500 truncate'}>
                    {selectedMetric ? selectedMetric.label : 'Select performance metric...'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isMetricOpen ? 'rotate-180 text-purple-300' : ''}`} />
                </button>

                <AnimatePresence>
                  {isMetricOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-50 left-0 right-0 mt-1.5 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl max-h-56 overflow-y-auto p-1.5 space-y-0.5 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                    >
                      {PERFORMANCE_METRICS.map((m) => {
                        const isSelected = formData.performanceMetric === m.id;
                        return (
                          <button
                            type="button"
                            key={m.id}
                            onClick={() => {
                              onChange('performanceMetric', m.id);
                              setIsMetricOpen(false);
                            }}
                            className={`w-full px-3 py-2 rounded-xl text-left text-xs font-medium transition-colors flex items-center justify-between ${
                              isSelected
                                ? 'bg-purple-500/20 text-purple-200 font-bold'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            <span>{m.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-purple-300 stroke-[2.5]" />}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
                  Payout Rate per Unit ({selectedCurrency.code})
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 25"
                    value={formData.performanceRate || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, '');
                      onChange('performanceRate', val ? Number(val) : undefined);
                    }}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                  />
                  <span className="text-purple-300/70 font-bold text-xs absolute left-3.5 top-3">
                    {selectedCurrency.symbol}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
                  Guaranteed Base Fee (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 200"
                    value={formData.budgetMinPerInfluencer || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, '');
                      onChange('budgetMinPerInfluencer', val ? Number(val) : undefined);
                    }}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                  />
                  <span className="text-purple-300/70 font-bold text-xs absolute left-3.5 top-3">
                    {selectedCurrency.symbol}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
                  Max Payout Cap Per Creator ({selectedCurrency.code})
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 3000"
                    value={formData.budgetMaxPerInfluencer || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, '');
                      onChange('budgetMaxPerInfluencer', val ? Number(val) : undefined);
                    }}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                  />
                  <span className="text-purple-300/70 font-bold text-xs absolute left-3.5 top-3">
                    {selectedCurrency.symbol}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
                  Total Budget Pool ({selectedCurrency.code}) <span className="text-pink-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 12000"
                    value={formData.budgetTotalAmount || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, '');
                      onChange('budgetTotalAmount', val ? Number(val) : undefined);
                    }}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                  />
                  <span className="text-purple-300/70 font-bold text-xs absolute left-3.5 top-3">
                    {selectedCurrency.symbol}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 5. PRODUCT BARTER FIELDS */}
        {selectedModel === 'BARTER' && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
                  Estimated Retail Value of Gifting Package ({selectedCurrency.code}) <span className="text-pink-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 15000"
                    value={formData.freeProductValue || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, '');
                      onChange('freeProductValue', val ? Number(val) : undefined);
                    }}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                  />
                  <span className="text-purple-300/70 font-bold text-xs absolute left-3.5 top-3">
                    {selectedCurrency.symbol}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
                  Gift Package Details / Items Included
                </label>
                <input
                  type="text"
                  placeholder="e.g. Full 3-piece Skincare Set + Branded Hoodie"
                  value={formData.barterItems || ''}
                  onChange={(e) => onChange('barterItems', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.shippingCovered ?? true}
                  onChange={(e) => onChange('shippingCovered', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
              </label>
              <div>
                <span className="text-xs font-bold text-white block">Brand Covers Shipping & Customs</span>
                <span className="text-[10px] text-slate-400 block">Creators will not be charged any delivery fees</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* 6. HYBRID (FEE + PRODUCT) FIELDS */}
        {selectedModel === 'HYBRID' && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
                  Guaranteed Cash Payout ({selectedCurrency.code}) <span className="text-pink-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 5000"
                    value={formData.budgetMinPerInfluencer || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, '');
                      onChange('budgetMinPerInfluencer', val ? Number(val) : undefined);
                      onChange('budgetMaxPerInfluencer', val ? Number(val) : undefined);
                    }}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                  />
                  <span className="text-purple-300/70 font-bold text-xs absolute left-3.5 top-3">
                    {selectedCurrency.symbol}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
                  Product Sample Value ({selectedCurrency.code}) <span className="text-pink-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 2000"
                    value={formData.freeProductValue || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, '');
                      onChange('freeProductValue', val ? Number(val) : undefined);
                    }}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                  />
                  <span className="text-purple-300/70 font-bold text-xs absolute left-3.5 top-3">
                    {selectedCurrency.symbol}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
                  Total Financial Budget ({selectedCurrency.code}) <span className="text-pink-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 50000"
                    value={formData.budgetTotalAmount || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, '');
                      onChange('budgetTotalAmount', val ? Number(val) : undefined);
                    }}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                  />
                  <span className="text-purple-300/70 font-bold text-xs absolute left-3.5 top-3">
                    {selectedCurrency.symbol}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Creators receive both the guaranteed cash payment in Escrow and the free product shipped to their door.
            </p>
          </motion.div>
        )}

      </div>

      {/* Escrow Guarantee Banner */}
      <div className="pt-6 border-t border-purple-400/10 flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-400/25 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
            <span>Escrow Payment Protection</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
              Automated & Secure
            </span>
          </h5>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Campaign funds are held safely in Zerify Escrow upon offer acceptance and only released to creators after you review and approve their submitted deliverables.
          </p>
        </div>
      </div>
    </div>
  );
}
