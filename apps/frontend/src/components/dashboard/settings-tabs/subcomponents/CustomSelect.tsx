'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  triggerLabel?: string;
  icon?: React.ReactNode;
  keywords?: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (val: string) => void;
  iconLeft?: React.ReactNode;
  className?: string;
  triggerClassName?: string;
  showCheckmark?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  dropdownHeight?: string;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  iconLeft,
  className = '',
  triggerClassName = '',
  showCheckmark = true,
  searchable = false,
  searchPlaceholder = 'Search...',
  dropdownHeight = 'max-h-48',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Normalize currency symbol / value matching
  const selectedOption = useMemo(() => {
    if (!value) return options[0];
    const valLower = String(value).toLowerCase().trim();
    const match = options.find((opt) => {
      const optValLower = opt.value.toLowerCase().trim();
      const optLabelLower = opt.label.toLowerCase().trim();
      if (optValLower === valLower) return true;
      if (valLower === 'inr' || valLower === '₹') return optValLower === 'inr';
      if (valLower === 'usd' || valLower === '$') return optValLower === 'usd';
      if (valLower === 'eur' || valLower === '€') return optValLower === 'eur';
      if (valLower === 'gbp' || valLower === '£') return optValLower === 'gbp';
      return optLabelLower.includes(valLower);
    });
    return match || options[0];
  }, [options, value]);

  const normalizedSearch = search.trim().toLowerCase();
  const filteredOptions = useMemo(() => {
    if (!searchable || !normalizedSearch) return options;
    return options.filter((option) => {
      const haystack = `${option.label} ${option.value} ${option.keywords ?? ''}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [options, normalizedSearch, searchable]);

  useEffect(() => {
    if (isOpen && searchable) {
      const id = requestAnimationFrame(() => searchInputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [isOpen, searchable]);

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

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen((prev) => {
      if (prev) {
        setSearch('');
      }
      return !prev;
    });
  };

  const handleSelect = (optionValue: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(optionValue);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleOpen}
        className={`w-full relative flex items-center justify-between rounded-lg bg-slate-950/80 border border-white/15 text-xs text-white hover:border-purple-500/50 focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20 transition-all font-semibold shadow-inner cursor-pointer text-left ${
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
          {selectedOption?.triggerLabel ?? selectedOption?.label}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-purple-400' : ''
          }`}
        />
      </button>

      {/* Dropdown Options List with Custom Scrollbar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute left-0 right-0 top-full mt-1.5 bg-slate-900/95 border border-purple-500/30 rounded-lg shadow-2xl z-50 backdrop-blur-2xl p-1 ${dropdownHeight} overflow-y-auto space-y-0.5 [scrollbar-width:thin] [scrollbar-color:rgba(168,85,247,0.4)_rgba(15,23,42,0.6)]`}
          >
            {searchable && (
              <div className="sticky top-0 z-10 px-1.5 pt-1 pb-1.5 bg-slate-900/95">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full pl-8 pr-7 py-1.5 rounded-md bg-slate-950/70 border border-white/10 text-xs text-white placeholder:text-slate-600/70 focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20 transition-all font-medium"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setIsOpen(false);
                        setSearch('');
                      }
                    }}
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch('');
                        searchInputRef.current?.focus();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      tabIndex={-1}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {filteredOptions.length === 0 ? (
              <div className="px-2.5 py-2 text-xs text-slate-500 text-center">No options found</div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selectedOption?.value === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={(e) => handleSelect(option.value, e)}
                    className={`w-full px-3 py-2 rounded-md text-xs transition-colors flex items-center justify-between text-left font-medium ${
                      isSelected
                        ? 'bg-purple-600/30 text-white font-bold border border-purple-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {option.icon}
                      {option.label}
                    </span>
                    {showCheckmark && isSelected && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                  </button>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
