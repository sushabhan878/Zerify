'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Check, AlertTriangle, X, Coins } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import { SUPPORTED_CURRENCIES, SupportedCurrency } from '@/utils/currency';

interface CurrencySelectorProps {
  className?: string;
  placement?: 'bottom' | 'top';
  showWarningModal?: boolean;
}

export default function CurrencySelector({
  className = '',
  placement = 'bottom',
  showWarningModal = true,
}: CurrencySelectorProps) {
  const { currency, setCurrency, currencies } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [pendingCurrency, setPendingCurrency] = useState<SupportedCurrency | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currencyList = useMemo(() => {
    if (currencies && currencies.length > 0) return currencies;
    return Object.values(SUPPORTED_CURRENCIES);
  }, [currencies]);

  const activeCurrency = useMemo(() => {
    return currencyList.find((c) => c.code === currency) || {
      code: currency,
      name: currency,
      symbol: currency,
      decimalDigits: 2,
      flag: '🌐',
    };
  }, [currencyList, currency]);

  const filteredCurrencies = useMemo(() => {
    if (!search.trim()) return currencyList;
    const q = search.toLowerCase().trim();
    return currencyList.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
    );
  }, [currencyList, search]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSelect = (code: string) => {
    setIsOpen(false);
    setSearch('');
    if (code === currency) return;

    if (showWarningModal) {
      setPendingCurrency(code);
    } else {
      setCurrency(code);
    }
  };

  const handleConfirmChange = () => {
    if (pendingCurrency) {
      setCurrency(pendingCurrency);
      setPendingCurrency(null);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-purple-500/40 text-xs text-white transition-all shadow-inner font-semibold cursor-pointer"
        aria-label={`Current currency: ${activeCurrency.name}, ${activeCurrency.code}`}
      >
        <span className="text-sm">{activeCurrency.flag || '🌐'}</span>
        <span className="font-bold">{activeCurrency.code}</span>
        <span className="text-slate-400">({activeCurrency.symbol})</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-purple-400' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: placement === 'top' ? 6 : -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: placement === 'top' ? 6 : -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 ${
              placement === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
            } right-0 w-64 bg-slate-900/95 border border-purple-500/35 rounded-xl shadow-2xl backdrop-blur-2xl p-1.5 max-h-72 overflow-hidden flex flex-col`}
          >
            {/* Search Input */}
            <div className="relative mb-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search currency or country..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950/70 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/80 transition-all font-medium"
              />
            </div>

            {/* Currencies List */}
            <div className="overflow-y-auto space-y-0.5 max-h-56 pr-0.5 [scrollbar-width:thin] [scrollbar-color:rgba(168,85,247,0.4)_rgba(15,23,42,0.6)]">
              {filteredCurrencies.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-500">No currency found</div>
              ) : (
                filteredCurrencies.map((c) => {
                  const isSelected = c.code === currency;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleSelect(c.code)}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between text-left transition-colors ${
                        isSelected
                          ? 'bg-purple-600/30 text-white font-bold border border-purple-500/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-sm shrink-0">{c.flag || '🌐'}</span>
                        <span className="font-bold">{c.code}</span>
                        <span className="text-slate-400 text-[11px] truncate">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-1">
                        <span className="text-xs text-purple-300 font-semibold">{c.symbol}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-purple-400" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation & Reassurance Modal (PRD §115) */}
      <AnimatePresence>
        {pendingCurrency && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-5 sm:p-6 rounded-2xl bg-slate-900 border border-purple-500/30 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5 text-amber-400">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <Coins className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Change Dashboard Currency?</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingCurrency(null)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                <p>
                  You are switching your display currency to{' '}
                  <strong className="text-white">
                    {SUPPORTED_CURRENCIES[pendingCurrency]?.name || pendingCurrency} ({pendingCurrency})
                  </strong>
                  .
                </p>
                <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-[11px] text-purple-200">
                  <p className="font-semibold text-purple-300 mb-0.5">Presentation Only (PRD §115):</p>
                  This updates how monetary values are displayed throughout your dashboard using live exchange rates.
                  It does <strong>not</strong> modify existing payments, contracts, invoices, or settlement currencies.
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setPendingCurrency(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmChange}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-purple-950/50 transition-all hover:scale-[1.02]"
                >
                  Confirm & Switch to {pendingCurrency}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
