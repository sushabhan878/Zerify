'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Check } from 'lucide-react';
import { SUPPORTED_CURRENCIES } from '@/utils/currency';
import { useToast } from '@/components/ui/Toast';

interface AuthCurrencySelectorProps {
  value: string;
  onChange: (newCurrency: string) => void;
}

export default function AuthCurrencySelector({
  value,
  onChange,
}: AuthCurrencySelectorProps) {
  const { toastError } = useToast();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currencyList = useMemo(() => Object.values(SUPPORTED_CURRENCIES), []);

  const activeCurrency = useMemo(() => {
    return (
      SUPPORTED_CURRENCIES[value] || {
        code: value,
        symbol: value,
        name: value,
      }
    );
  }, [value]);

  const filtered = useMemo(() => {
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
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Trigger Button: Only shows the currency term (e.g. INR) and dropdown arrow, no icon or flag code */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950/90 light:bg-white hover:bg-slate-900 light:hover:bg-slate-50 border border-white/10 light:border-slate-200 hover:border-white/20 light:hover:border-slate-300 text-xs font-semibold text-white light:text-slate-800 transition-all shadow-sm cursor-pointer"
      >
        <span className="font-semibold text-xs tracking-wider uppercase text-slate-200 light:text-slate-700">
          {activeCurrency.code}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 light:text-slate-500 transition-transform duration-200 ${
            open ? 'rotate-180 text-white light:text-slate-900' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1.5 z-50 w-60 rounded-2xl bg-[#090d16] light:bg-white border border-white/15 light:border-slate-200 shadow-2xl light:shadow-xl p-2 backdrop-blur-2xl"
          >
            {/* Search Input */}
            <div className="relative mb-1.5">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 light:text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search currency..."
                autoFocus
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950/80 light:bg-slate-50 border border-white/10 light:border-slate-200 text-xs text-white light:text-slate-900 placeholder-slate-500 light:placeholder-slate-400 outline-none focus:border-white/20 light:focus:border-purple-300"
              />
            </div>

            {/* Currency Options List */}
            <div className="max-h-48 overflow-y-auto space-y-0.5 pr-0.5 custom-scrollbar">
              {filtered.map((c) => {
                const isSelected = c.code === value;
                const isAvailable = c.code === 'INR';
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      if (!isAvailable) {
                        toastError(
                          `${c.code} (${c.name}) is coming soon! Zerify platform billing & escrow currently operates exclusively in INR (₹).`,
                          'Coming Soon',
                        );
                        return;
                      }
                      onChange(c.code);
                      setOpen(false);
                      setSearch('');
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600/25 light:bg-purple-50 text-purple-200 light:text-purple-700 font-bold'
                        : isAvailable
                        ? 'text-slate-300 light:text-slate-700 hover:text-white light:hover:text-slate-900 hover:bg-white/5 light:hover:bg-slate-100'
                        : 'text-slate-400 light:text-slate-500 hover:bg-white/5 light:hover:bg-slate-100 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white light:text-slate-900">{c.code}</span>
                      <span className="text-[11px] text-slate-400 light:text-slate-500 truncate max-w-[90px]">
                        {c.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {!isAvailable && (
                        <span className="text-[9px] font-bold text-amber-300 light:text-amber-700 bg-amber-500/15 light:bg-amber-100 border border-amber-500/30 light:border-amber-200 px-1.5 py-0.5 rounded-md">
                          Coming Soon
                        </span>
                      )}
                      <span className="font-mono text-slate-400 light:text-slate-500 text-xs">
                        {c.symbol}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-purple-400 light:text-purple-600" />}
                    </div>
                  </button>
                );
              })}

              {filtered.length === 0 && (
                <div className="py-3 text-center text-xs text-slate-500">
                  No currencies match "{search}"
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
