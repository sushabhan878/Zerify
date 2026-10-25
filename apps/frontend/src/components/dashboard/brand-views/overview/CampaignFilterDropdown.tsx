'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, ChevronDown, Check, Sparkles } from 'lucide-react';

export interface CampaignFilterOption {
  id: string;
  title: string;
  status?: string;
}

interface CampaignFilterDropdownProps {
  value: string;
  onChange: (value: string) => void;
  campaigns: CampaignFilterOption[];
  disabled?: boolean;
}

export default function CampaignFilterDropdown({
  value,
  onChange,
  campaigns,
  disabled = false,
}: CampaignFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCampaign = campaigns.find((c) => c.id === value);
  const selectedLabel = value === 'all' || !selectedCampaign ? 'All campaigns' : selectedCampaign.title;

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
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between gap-2.5 transition-all duration-200 border cursor-pointer select-none backdrop-blur-xl disabled:opacity-50 disabled:pointer-events-none min-w-[200px] sm:min-w-[240px] max-w-xs ${
          isOpen
            ? 'bg-slate-900 border-purple-500/60 text-white shadow-lg shadow-purple-950/40 ring-2 ring-purple-500/20'
            : 'bg-slate-950/70 hover:bg-slate-900/90 border-white/10 hover:border-purple-500/40 text-slate-200 hover:text-white shadow-sm'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Layers className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="truncate tracking-tight font-medium">{selectedLabel}</span>
        </div>
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
            className="absolute left-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-slate-950/95 border border-purple-500/30 p-1.5 shadow-2xl backdrop-blur-2xl z-50 space-y-1 max-h-72 overflow-y-auto"
            role="listbox"
          >
            <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-white/5">
              <span>Filter by Campaign</span>
              <span className="text-purple-300 font-semibold">{campaigns.length} campaigns</span>
            </div>

            {/* "All campaigns" option */}
            <button
              type="button"
              onClick={() => {
                onChange('all');
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between text-left transition-all cursor-pointer ${
                value === 'all'
                  ? 'bg-purple-600/25 text-purple-200 font-bold border border-purple-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5 font-medium'
              }`}
              role="option"
              aria-selected={value === 'all'}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>All campaigns</span>
              </div>
              {value === 'all' && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
            </button>

            {/* Individual campaign options */}
            {campaigns.map((c) => {
              const isSelected = c.id === value;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    onChange(c.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600/25 text-purple-200 font-bold border border-purple-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/5 font-medium'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="truncate pr-2">{c.title}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
