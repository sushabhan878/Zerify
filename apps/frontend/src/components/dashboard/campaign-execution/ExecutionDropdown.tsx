'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface ExecutionDropdownProps {
  label: string;
  options: DropdownOption[];
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export default function ExecutionDropdown({
  label,
  options,
  value,
  onChange,
  disabled = false,
}: ExecutionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div className="relative space-y-1.5" ref={dropdownRef}>
      <label className="text-xs font-bold text-slate-300 block">{label}</label>

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full px-3.5 py-2.5 rounded-xl border transition-all duration-200 flex items-center justify-between gap-2.5 text-left text-xs sm:text-sm font-semibold select-none ${
          disabled
            ? 'border-white/5 bg-slate-900/40 text-slate-500 cursor-not-allowed opacity-60'
            : isOpen
            ? 'border-purple-500 ring-2 ring-purple-500/20 bg-slate-950 text-white shadow-lg shadow-purple-950/30 cursor-pointer'
            : 'border-white/10 hover:border-purple-500/40 bg-slate-950/80 hover:bg-slate-950 text-white backdrop-blur-xl cursor-pointer'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {selectedOption?.icon && (
            <span className="text-purple-400 shrink-0">{selectedOption.icon}</span>
          )}
          <span className="truncate">{selectedOption?.label}</span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-purple-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-purple-300' : ''
          }`}
        />
      </button>

      {/* Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl bg-slate-950/95 border border-purple-500/30 p-1.5 shadow-2xl shadow-purple-950/50 backdrop-blur-2xl space-y-1 overflow-hidden"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-left text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600/25 border border-purple-500/40 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-purple-600/15 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {opt.icon && (
                      <span className={`${isSelected ? 'text-purple-300' : 'text-purple-400/80'}`}>
                        {opt.icon}
                      </span>
                    )}
                    <div className="min-w-0">
                      <span className="block truncate">{opt.label}</span>
                      {opt.description && (
                        <span className="block text-[11px] font-normal text-slate-400 truncate">
                          {opt.description}
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
