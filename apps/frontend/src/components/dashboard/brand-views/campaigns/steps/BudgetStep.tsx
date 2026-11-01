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
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

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
  {
    value: 'CUSTOM_PACKAGE',
    label: 'Custom Package',
    icon: Package,
    desc: 'Tailored milestone or enterprise creator package',
  },
];

const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'INR - Indian Rupee (Default)', isAvailable: true },
  { code: 'USD', symbol: '$', label: 'USD - US Dollar', isAvailable: false },
  { code: 'EUR', symbol: '€', label: 'EUR - Euro', isAvailable: false },
  { code: 'GBP', symbol: '£', label: 'GBP - British Pound', isAvailable: false },
  { code: 'CAD', symbol: 'C$', label: 'CAD - Canadian Dollar', isAvailable: false },
  { code: 'AUD', symbol: 'A$', label: 'AUD - Australian Dollar', isAvailable: false },
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
  const { toastError } = useToast();
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isMetricOpen, setIsMetricOpen] = useState(false);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);
  const metricDropdownRef = useRef<HTMLDivElement>(null);

  const selectedModel = formData.budgetPaymentModel || '';

  // Ensure default currency is strictly INR
  useEffect(() => {
    if (!formData.budgetCurrency || formData.budgetCurrency !== 'INR') {
      onChange('budgetCurrency', 'INR');
    }
  }, [formData.budgetCurrency, onChange]);

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

  const selectedCurrency = CURRENCIES.find((c) => c.code === (formData.budgetCurrency || 'INR')) || CURRENCIES[0];
  const selectedMetric = PERFORMANCE_METRICS.find((m) => m.id === formData.performanceMetric);

  // Validate that total budget pool is strictly higher than per-creator fee/cap
  const totalAmount = Number(formData.budgetTotalAmount || 0);
  const minPerCreator = Number(formData.budgetMinPerInfluencer || 0);
  const maxPerCreator = Number(formData.budgetMaxPerInfluencer || 0);

  let budgetPoolError: string | null = null;
  if (selectedModel === 'FIXED' && totalAmount > 0 && minPerCreator > 0 && totalAmount <= minPerCreator) {
    budgetPoolError = 'Total campaign budget pool must be higher than the per-creator fixed fee.';
  } else if (selectedModel === 'NEGOTIABLE' && totalAmount > 0 && maxPerCreator > 0 && totalAmount <= maxPerCreator) {
    budgetPoolError = 'Estimated total budget pool must be higher than the maximum payout cap per creator.';
  } else if (selectedModel === 'PERFORMANCE_BASED' && totalAmount > 0 && maxPerCreator > 0 && totalAmount <= maxPerCreator) {
    budgetPoolError = 'Total budget pool must be higher than the max payout cap per creator.';
  } else if (selectedModel === 'HYBRID' && totalAmount > 0 && minPerCreator > 0 && totalAmount <= minPerCreator) {
    budgetPoolError = 'Total financial budget must be higher than the guaranteed cash payout per creator.';
  }

  return (
    <div className="space-y-6">
      {/* Payment Model Selection */}
      <div className="space-y-2.5">
        <label className="block text-xs font-bold text-purple-200 light:text-slate-700 uppercase tracking-wider">
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
                    ? 'bg-gradient-to-b from-purple-950/40 to-slate-900/90 border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.15)] ring-1 ring-purple-400/30 light:bg-none light:bg-purple-50/90 light:border-purple-400 light:shadow-sm light:ring-2 light:ring-purple-400/30'
                    : 'bg-slate-900/60 border-white/10 hover:border-purple-400/30 hover:bg-slate-900/90 hover:-translate-y-0.5 light:bg-white light:border-slate-200 light:hover:border-purple-300 light:hover:bg-purple-50/30'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent light:via-purple-500" />
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-purple-500/25 text-purple-200 border border-purple-400/40 shadow-[0_0_10px_rgba(192,132,252,0.25)] light:bg-purple-100 light:text-purple-700 light:border-purple-300'
                          : 'bg-slate-800/80 text-slate-400 border border-white/5 group-hover:text-purple-300 group-hover:border-purple-400/20 light:bg-slate-100 light:text-slate-600 light:border-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-purple-500 text-white keep-white shadow-sm'
                          : 'border border-white/15 light:border-slate-300 light:bg-slate-50 group-hover:border-purple-400/30'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white keep-white stroke-[3]" />}
                    </div>
                  </div>

                  <span className="block text-xs font-bold text-white light:text-slate-900 tracking-tight">
                    {pm.label}
                  </span>
                </div>

                <span className="block text-[11px] text-slate-400 light:text-slate-600 mt-2 leading-relaxed">
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
        <div className="flex items-center justify-between border-b border-purple-400/10 light:border-slate-200 pb-3">
          <span className="text-xs font-bold text-purple-200 light:text-slate-700 uppercase tracking-wider">
            Campaign Budget Configuration
          </span>
          <div className="relative" ref={currencyDropdownRef}>
            <button
              type="button"
              onClick={() => setIsCurrencyOpen((prev) => !prev)}
              className="px-3 py-1.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white light:bg-white light:border-slate-300 light:text-slate-900 flex items-center gap-2 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors cursor-pointer"
            >
              <span className="font-bold text-purple-300 light:text-purple-700">{selectedCurrency.symbol}</span>
              <span className="font-medium text-white light:text-slate-900">{selectedCurrency.code}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isCurrencyOpen ? 'rotate-180 text-purple-300 light:text-purple-600' : ''}`} />
            </button>

            <AnimatePresence>
              {isCurrencyOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-50 right-0 mt-1.5 bg-slate-900 border border-white/10 light:bg-white light:border-slate-200 light:shadow-2xl rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl max-h-56 overflow-y-auto p-1.5 space-y-0.5 w-56 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                  {CURRENCIES.map((c) => {
                    const isSelected = selectedCurrency.code === c.code;
                    const isAvailable = c.code === 'INR';
                    return (
                      <button
                        type="button"
                        key={c.code}
                        onClick={() => {
                          if (!isAvailable) {
                            toastError(
                              `${c.code} (${c.label.split(' - ')[1] || c.code}) is coming soon! Campaign budget, escrow, and creator payouts currently operate exclusively in INR (₹).`,
                              'Coming Soon',
                            );
                            return;
                          }
                          onChange('budgetCurrency', 'INR');
                          setIsCurrencyOpen(false);
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-left text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-purple-500/20 text-purple-200 font-bold light:bg-purple-50 light:text-purple-700'
                            : isAvailable
                            ? 'text-slate-300 hover:bg-slate-800 hover:text-white light:text-slate-700 light:hover:bg-slate-100 light:hover:text-slate-900'
                            : 'text-slate-400 hover:bg-slate-800/60 opacity-80 hover:opacity-100 light:text-slate-400 light:hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-purple-300 light:text-purple-700 w-4">{c.symbol}</span>
                          <span className="text-white light:text-slate-900 font-medium">{c.code}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {!isAvailable && (
                            <span className="text-[9px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 light:bg-amber-50 light:border-amber-200 light:text-amber-800 px-1.5 py-0.5 rounded-md">
                              Coming Soon
                            </span>
                          )}
                          {isSelected && <Check className="w-3.5 h-3.5 text-purple-300 light:text-purple-700 stroke-[2.5]" />}
                        </div>
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
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-slate-900/60 border border-dashed border-purple-400/20 light:bg-white light:border-slate-200/80 light:shadow-sm text-center space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-400/20 text-purple-300 light:bg-purple-50 light:border-purple-200 light:text-purple-700 flex items-center justify-center mx-auto">
              <DollarSign className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-white light:text-slate-900">
              No Payment Model Selected
            </p>
            <p className="text-[11px] text-slate-400 light:text-slate-500 max-w-md mx-auto">
              Choose a payment and compensation model above (e.g. Fixed Fee, Budget Range, Negotiable, Barter) to configure creator payout rates and budget pools.
            </p>
          </motion.div>
        )}

        {/* 1. FIXED FEE FIELDS */}
        {selectedModel === 'FIXED' && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-purple-200 light:text-slate-700 uppercase tracking-wider mb-1.5">
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
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 light:bg-white light:border-slate-300 light:text-slate-900 light:placeholder-slate-400 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                  />
                  <span className="text-purple-300/70 light:text-slate-500 font-bold text-xs absolute left-3.5 top-3">
                    {selectedCurrency.symbol}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-200 light:text-slate-700 uppercase tracking-wider mb-1.5">
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
                    className={`w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border rounded-xl text-xs text-white placeholder-slate-500 light:bg-white light:text-slate-900 light:placeholder-slate-400 focus:outline-none transition-colors ${
                      budgetPoolError ? 'border-rose-500/80 bg-rose-500/5' : 'border-purple-400/20 light:border-slate-300 focus:border-white/20'
                    }`}
                  />
                  <span className="text-purple-300/70 light:text-slate-500 font-bold text-xs absolute left-3.5 top-3">
                    {selectedCurrency.symbol}
                  </span>
                </div>
                {budgetPoolError && (
                  <p className="text-[11px] text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{budgetPoolError}</span>
                  </p>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-400 light:text-slate-500">
              Each accepted creator will receive this exact fixed payout held in secure escrow.
            </p>
          </motion.div>
        )}

        {/* 2. NEGOTIABLE / PITCH FIELDS */}
        {selectedModel === 'NEGOTIABLE' && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-purple-200 light:text-slate-700 uppercase tracking-wider mb-1.5">
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
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 light:bg-white light:border-slate-300 light:text-slate-900 light:placeholder-slate-400 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                  />
                  <span className="text-purple-300/70 light:text-slate-500 font-bold text-xs absolute left-3.5 top-3">
                    {selectedCurrency.symbol}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-200 light:text-slate-700 uppercase tracking-wider mb-1.5">
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
                    className={`w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border rounded-xl text-xs text-white placeholder-slate-500 light:bg-white light:text-slate-900 light:placeholder-slate-400 focus:outline-none transition-colors ${
                      budgetPoolError ? 'border-rose-500/80 bg-rose-500/5' : 'border-purple-400/20 light:border-slate-300 focus:border-white/20'
                    }`}
                  />
                  <span className="text-purple-300/70 light:text-slate-500 font-bold text-xs absolute left-3.5 top-3">
                    {selectedCurrency.symbol}
                  </span>
                </div>
                {budgetPoolError && (
                  <p className="text-[11px] text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{budgetPoolError}</span>
                  </p>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-400 light:text-slate-500">
              Creators will propose their custom fee when submitting proposals. You can counter-offer or accept upon review.
            </p>
          </motion.div>
        )}

        {/* 6. CUSTOM PACKAGE FIELDS (COMING SOON) */}
        {selectedModel === 'CUSTOM_PACKAGE' && (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 light:bg-white light:border-slate-200/80 light:shadow-sm text-center space-y-1.5">
            <p className="text-sm font-semibold text-white light:text-slate-900">Custom Package is Coming Soon</p>
            <p className="text-xs text-slate-400 light:text-slate-500">
              Custom milestone-based contracts and enterprise creator packages will be available in an upcoming release.
            </p>
          </div>
        )}

        {/* 4. PERFORMANCE / CPM FIELDS */}
        {selectedModel === 'PERFORMANCE_BASED' && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Performance Metric Selector */}
              <div className="relative" ref={metricDropdownRef}>
                <label className="block text-xs font-bold text-purple-200 light:text-slate-700 uppercase tracking-wider mb-1.5">
                  Performance Metric
                </label>
                <button
                  type="button"
                  onClick={() => setIsMetricOpen((prev) => !prev)}
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white light:bg-white light:border-slate-300 light:text-slate-900 flex items-center justify-between focus:outline-none focus:ring-0 focus:border-white/20 transition-colors cursor-pointer"
                >
                  <span className={selectedMetric ? 'font-medium text-white light:text-slate-900 truncate' : 'text-slate-500 light:text-slate-400 truncate'}>
                    {selectedMetric ? selectedMetric.label : 'Select performance metric...'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isMetricOpen ? 'rotate-180 text-purple-300 light:text-purple-600' : ''}`} />
                </button>

                <AnimatePresence>
                  {isMetricOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-50 left-0 right-0 mt-1.5 bg-slate-900 border border-white/10 light:bg-white light:border-slate-200 light:shadow-2xl rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl max-h-56 overflow-y-auto p-1.5 space-y-0.5 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
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
                            className={`w-full px-3 py-2 rounded-xl text-left text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? 'bg-purple-500/20 text-purple-200 font-bold light:bg-purple-50 light:text-purple-700'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white light:text-slate-700 light:hover:bg-slate-100 light:hover:text-slate-900'
                            }`}
                          >
                            <span>{m.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-purple-300 light:text-purple-700 stroke-[2.5]" />}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-200 light:text-slate-700 uppercase tracking-wider mb-1.5">
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
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 light:bg-white light:border-slate-300 light:text-slate-900 light:placeholder-slate-400 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                  />
                  <span className="text-purple-300/70 light:text-slate-500 font-bold text-xs absolute left-3.5 top-3">
                    {selectedCurrency.symbol}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-200 light:text-slate-700 uppercase tracking-wider mb-1.5">
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
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 light:bg-white light:border-slate-300 light:text-slate-900 light:placeholder-slate-400 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                  />
                  <span className="text-purple-300/70 light:text-slate-500 font-bold text-xs absolute left-3.5 top-3">
                    {selectedCurrency.symbol}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-purple-200 light:text-slate-700 uppercase tracking-wider mb-1.5">
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
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 light:bg-white light:border-slate-300 light:text-slate-900 light:placeholder-slate-400 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                  />
                  <span className="text-purple-300/70 light:text-slate-500 font-bold text-xs absolute left-3.5 top-3">
                    {selectedCurrency.symbol}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-200 light:text-slate-700 uppercase tracking-wider mb-1.5">
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
                    className={`w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border rounded-xl text-xs text-white placeholder-slate-500 light:bg-white light:text-slate-900 light:placeholder-slate-400 focus:outline-none transition-colors ${
                      budgetPoolError ? 'border-rose-500/80 bg-rose-500/5' : 'border-purple-400/20 light:border-slate-300 focus:border-white/20'
                    }`}
                  />
                  <span className="text-purple-300/70 light:text-slate-500 font-bold text-xs absolute left-3.5 top-3">
                    {selectedCurrency.symbol}
                  </span>
                </div>
                {budgetPoolError && (
                  <p className="text-[11px] text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{budgetPoolError}</span>
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* 5. PRODUCT BARTER FIELDS */}
        {selectedModel === 'BARTER' && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-purple-200 light:text-slate-700 uppercase tracking-wider mb-1.5">
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
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 light:bg-white light:border-slate-300 light:text-slate-900 light:placeholder-slate-400 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                  />
                  <span className="text-purple-300/70 light:text-slate-500 font-bold text-xs absolute left-3.5 top-3">
                    {selectedCurrency.symbol}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-200 light:text-slate-700 uppercase tracking-wider mb-1.5">
                  Gift Package Details / Items Included
                </label>
                <input
                  type="text"
                  placeholder="e.g. Full 3-piece Skincare Set + Branded Hoodie"
                  value={formData.barterItems || ''}
                  onChange={(e) => onChange('barterItems', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 light:bg-white light:border-slate-300 light:text-slate-900 light:placeholder-slate-400 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
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
                <div className="w-10 h-5 bg-slate-800 light:bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
              </label>
              <div>
                <span className="text-xs font-bold text-white light:text-slate-900 block">Brand Covers Shipping & Customs</span>
                <span className="text-[10px] text-slate-400 light:text-slate-500 block">Creators will not be charged any delivery fees</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* 6. HYBRID (FEE + PRODUCT) FIELDS */}
        {selectedModel === 'HYBRID' && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-purple-200 light:text-slate-700 uppercase tracking-wider mb-1.5">
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
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 light:bg-white light:border-slate-300 light:text-slate-900 light:placeholder-slate-400 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                  />
                  <span className="text-purple-300/70 light:text-slate-500 font-bold text-xs absolute left-3.5 top-3">
                    {selectedCurrency.symbol}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-200 light:text-slate-700 uppercase tracking-wider mb-1.5">
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
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 light:bg-white light:border-slate-300 light:text-slate-900 light:placeholder-slate-400 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                  />
                  <span className="text-purple-300/70 light:text-slate-500 font-bold text-xs absolute left-3.5 top-3">
                    {selectedCurrency.symbol}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-200 light:text-slate-700 uppercase tracking-wider mb-1.5">
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
                    className={`w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border rounded-xl text-xs text-white placeholder-slate-500 light:bg-white light:text-slate-900 light:placeholder-slate-400 focus:outline-none transition-colors ${
                      budgetPoolError ? 'border-rose-500/80 bg-rose-500/5' : 'border-purple-400/20 light:border-slate-300 focus:border-white/20'
                    }`}
                  />
                  <span className="text-purple-300/70 light:text-slate-500 font-bold text-xs absolute left-3.5 top-3">
                    {selectedCurrency.symbol}
                  </span>
                </div>
                {budgetPoolError && (
                  <p className="text-[11px] text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{budgetPoolError}</span>
                  </p>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-400 light:text-slate-500">
              Creators receive both the guaranteed cash payment in Escrow and the free product shipped to their door.
            </p>
          </motion.div>
        )}

      </div>

      {/* Escrow Guarantee Banner */}
      <div className="pt-6 border-t border-purple-400/10 light:border-slate-200 flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-400/25 text-emerald-400 light:bg-emerald-50 light:border-emerald-200 light:text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h5 className="text-xs font-bold text-white light:text-slate-900 flex items-center gap-1.5">
            <span>Escrow Payment Protection</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 light:bg-emerald-50 light:border-emerald-200 light:text-emerald-700">
              Automated & Secure
            </span>
          </h5>
          <p className="text-[11px] text-slate-400 light:text-slate-500 mt-1 leading-relaxed">
            Campaign funds are held safely in Zerify Escrow upon offer acceptance and only released to creators after you review and approve their submitted deliverables.
          </p>
        </div>
      </div>
    </div>
  );
}
