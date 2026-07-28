'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (val: string) => void;
  iconLeft?: React.ReactNode;
  className?: string;
  triggerClassName?: string;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  iconLeft,
  className = '',
  triggerClassName = '',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full relative flex items-center justify-between rounded-lg bg-slate-950/70 border border-white/10 text-xs text-white placeholder:text-slate-600/70 focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20 transition-all font-semibold shadow-inner cursor-pointer text-left ${
          iconLeft ? 'pl-10' : 'px-3.5'
        } pr-10 py-2.5 ${triggerClassName}`}
      >
        {iconLeft && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none">
            {iconLeft}
          </div>
        )}
        <span className="truncate flex items-center gap-2">
          {selectedOption?.icon}
          {selectedOption?.label}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Options List */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900/95 border border-white/10 rounded-lg shadow-2xl z-50 backdrop-blur-xl p-1 max-h-48 overflow-y-auto no-scrollbar space-y-0.5"
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className="w-full px-2.5 py-2 rounded-md text-xs text-slate-300 hover:text-white hover:bg-purple-600/20 flex items-center justify-between transition-colors text-left font-medium"
              >
                <span className="flex items-center gap-2 truncate">
                  {option.icon}
                  {option.label}
                </span>
                {value === option.value && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
