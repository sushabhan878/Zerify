'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown, Check } from 'lucide-react';

interface TimeframeOption {
  value: string;
  label: string;
  subtext?: string;
}

const TIMEFRAME_OPTIONS: TimeframeOption[] = [
  { value: '7d', label: 'Last 7 Days', subtext: 'Past week metrics' },
  { value: '30d', label: 'Last 30 Days', subtext: 'Past month metrics' },
  { value: '90d', label: 'Last 90 Days', subtext: 'Quarterly analytics' },
];

interface TimeframeDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TimeframeDropdown({ value, onChange }: TimeframeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption =
    TIMEFRAME_OPTIONS.find((opt) => opt.value === value) || TIMEFRAME_OPTIONS[1];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all duration-200 border cursor-pointer select-none backdrop-blur-xl ${
          isOpen
            ? 'bg-slate-900 border-purple-500/60 text-white shadow-lg shadow-purple-950/30'
            : 'bg-slate-950/70 hover:bg-slate-900/90 border-white/10 hover:border-purple-500/40 text-slate-200 hover:text-white shadow-sm'
        }`}
      >
        <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
        <span className="whitespace-nowrap">{selectedOption.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-purple-400' : ''
          }`}
        />
      </button>

      {/* Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-slate-950/95 border border-white/15 p-1.5 shadow-2xl backdrop-blur-2xl z-50 space-y-1"
          >
            <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Select Timeframe
            </div>
            {TIMEFRAME_OPTIONS.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between text-left transition-all ${
                    isSelected
                      ? 'bg-purple-600/20 text-purple-200 font-bold border border-purple-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/5 font-medium'
                  }`}
                >
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    {option.subtext && (
                      <span className="text-[10px] text-slate-400 font-normal">
                        {option.subtext}
                      </span>
                    )}
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 ml-2" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
