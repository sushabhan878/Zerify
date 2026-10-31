'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, RotateCcw, ChevronDown } from 'lucide-react';
import { CreatorQuickFilterState } from './CreatorQuickFilters';
import { PRIMARY_CATEGORY_NAMES } from '@/constants/categories';

export interface CreatorAdvancedFilterState extends CreatorQuickFilterState {
  minEngagementRate: number;
  location: string;
  audienceGender: string;
  audienceAge: string;
  contentType: string;
  isVerifiedOnly: boolean;
  escrowOnly: boolean;
  topRatedOnly: boolean;
}

interface CreatorAdvancedFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: CreatorAdvancedFilterState;
  onApplyFilters: (newFilters: CreatorAdvancedFilterState) => void;
  onResetFilters: () => void;
}

const INDUSTRIES = ['All', ...PRIMARY_CATEGORY_NAMES];

const BUDGET_RANGES = [
  'Any Budget',
  'Under $500',
  '$500 - $1K',
  '$1K - $3K',
  '$3K - $5K',
  '$5K - $10K',
  '$10K - $25K',
  '$25K+',
];

const PLATFORMS = ['All Platforms', 'Instagram', 'YouTube', 'TikTok', 'LinkedIn', 'Twitter', 'Twitch'];

const CAMPAIGN_TYPES = [
  'All Types',
  'Sponsored Post',
  'Instagram Reel',
  'TikTok Video',
  'YouTube Video',
  'UGC Creation',
  'Brand Ambassador',
  'Product Review',
];

const GENDER_OPTIONS = ['All', 'Female', 'Male', 'Non-Binary'];
const AGE_OPTIONS = ['All', '18-24', '25-34', '35-44', '45+'];

interface FilterDropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
}

function FilterDropdown({ label, value, options, onChange }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-1.5 relative">
      <label className="text-xs font-bold text-slate-200 light:text-slate-700 block">{label}</label>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setIsOpen(false)}
        />
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-900/90 light:bg-white border border-white/10 light:border-slate-200/80 hover:border-purple-500/40 light:hover:border-purple-300 text-xs font-semibold text-white light:text-slate-900 transition-all relative z-40 light:shadow-sm"
      >
        <span className="truncate">{value}</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 light:text-slate-500 transition-transform ${
            isOpen ? 'rotate-180 text-purple-400 light:text-purple-600' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-slate-950 light:bg-white border border-purple-500/30 light:border-slate-200 rounded-2xl shadow-2xl light:shadow-xl p-1.5 z-50 space-y-0.5 backdrop-blur-xl">
          {options.map((opt) => {
            const isSelected = value === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-purple-500/20 light:bg-purple-100 text-purple-200 light:text-purple-700 font-bold border border-purple-500/30 light:border-purple-300'
                    : 'text-slate-300 light:text-slate-700 hover:bg-slate-800/80 light:hover:bg-purple-50 hover:text-white light:hover:text-purple-900'
                }`}
              >
                <span className="truncate">{opt}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-purple-400 light:text-purple-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function CreatorAdvancedFiltersModal({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}: CreatorAdvancedFiltersModalProps) {
  const [localState, setLocalState] = useState<CreatorAdvancedFilterState>(filters);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setLocalState(filters);
  }, [filters, isOpen]);

  if (!isOpen || !mounted) return null;

  const handleFieldChange = (key: keyof CreatorAdvancedFilterState, val: any) => {
    setLocalState((prev) => ({ ...prev, [key]: val }));
  };

  const handleApply = () => {
    onApplyFilters(localState);
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Dark Blurred Backdrop Overlay covering full viewport */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Right Slide-Over Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="relative z-50 w-full max-w-md h-screen bg-[#07090E] light:bg-[#FAFBFD] border-l border-white/10 light:border-slate-200 shadow-2xl flex flex-col overflow-hidden selection:bg-purple-500 selection:text-white"
          >
            {/* Minimal Floating Close Button at Top Right */}
            <button
              onClick={onClose}
              type="button"
              aria-label="Close filters"
              className="absolute top-4 right-4 z-30 p-2 rounded-xl bg-slate-900/80 light:bg-white hover:bg-slate-800 light:hover:bg-slate-100 border border-white/10 light:border-slate-200 text-slate-400 light:text-slate-600 hover:text-white light:hover:text-slate-900 transition-colors backdrop-blur-md light:shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Scrollable Filter Form Body (Starts cleanly from top without bulky header box) */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 pt-5 pb-28 space-y-6 text-xs">
              {/* 1. Primary Industry Category */}
              <FilterDropdown
                label="Primary Industry Category"
                value={localState.category}
                options={INDUSTRIES}
                onChange={(val) => handleFieldChange('category', val)}
              />

              {/* 2. Campaign Budget Range */}
              <div className="pt-3 border-t border-white/5 light:border-slate-200/80">
                <FilterDropdown
                  label="Campaign Budget Range"
                  value={localState.rateRange === 'Any Rate' ? 'Any Budget' : localState.rateRange}
                  options={BUDGET_RANGES}
                  onChange={(val) =>
                    handleFieldChange('rateRange', val === 'Any Budget' ? 'Any Rate' : val)
                  }
                />
              </div>

              {/* 3. Target Social Platform */}
              <div className="space-y-3 pt-3 border-t border-white/5 light:border-slate-200/80">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-200 light:text-slate-700 block">
                    Target Social Platform
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {PLATFORMS.map((p) => {
                      const isSelected = localState.platform === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => handleFieldChange('platform', p)}
                          className={`px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all ${
                            isSelected
                              ? 'bg-purple-600/30 light:bg-purple-100 text-purple-200 light:text-purple-700 border-purple-500 light:border-purple-300 shadow-sm'
                              : 'bg-slate-900/90 light:bg-white border-white/10 light:border-slate-200/80 text-slate-400 light:text-slate-700 hover:text-white light:hover:text-slate-900 hover:border-white/20 light:hover:border-purple-200 light:shadow-xs'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Deliverable Format / Campaign Type */}
                <FilterDropdown
                  label="Deliverable Format / Campaign Type"
                  value={localState.contentType}
                  options={CAMPAIGN_TYPES}
                  onChange={(val) => handleFieldChange('contentType', val)}
                />
              </div>

              {/* 5. Minimum Zerify Match Score Slider */}
              <div className="space-y-2.5 pt-3 border-t border-white/5 light:border-slate-200/80">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-200 light:text-slate-700">Minimum Zerify Match Score</span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-purple-500/20 light:bg-purple-100 border border-purple-500/40 light:border-purple-300 text-purple-300 light:text-purple-700 text-xs font-black">
                    {localState.minMatchScore > 0 ? `${localState.minMatchScore}%+` : 'Any Match'}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={90}
                  step={10}
                  value={localState.minMatchScore}
                  onChange={(e) => handleFieldChange('minMatchScore', parseInt(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-900 light:bg-slate-200 rounded-lg"
                />
              </div>

              {/* 6. Target Audience Demographic */}
              <div className="space-y-2.5 pt-3 border-t border-white/5 light:border-slate-200/80">
                <label className="text-xs font-bold text-slate-200 light:text-slate-700 block">
                  Target Audience Demographic
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <FilterDropdown
                    label="Gender"
                    value={localState.audienceGender}
                    options={GENDER_OPTIONS}
                    onChange={(val) => handleFieldChange('audienceGender', val)}
                  />
                  <FilterDropdown
                    label="Age Range"
                    value={localState.audienceAge}
                    options={AGE_OPTIONS}
                    onChange={(val) => handleFieldChange('audienceAge', val)}
                  />
                </div>
              </div>

              {/* 7. Trust & Verification Signals */}
              <div className="space-y-2 pt-3 border-t border-white/5 light:border-slate-200/80">
                <label className="text-xs font-bold text-slate-200 light:text-slate-700 block">
                  Trust & Verification
                </label>
                <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/80 light:bg-white border border-white/5 light:border-slate-200/80 hover:border-purple-500/30 light:hover:border-purple-200 cursor-pointer text-slate-300 light:text-slate-700 transition-all light:shadow-xs">
                  <input
                    type="checkbox"
                    checked={localState.isVerifiedOnly}
                    onChange={(e) => handleFieldChange('isVerifiedOnly', e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 light:border-slate-300 accent-purple-500 bg-slate-950 light:bg-white cursor-pointer"
                  />
                  <span className="font-bold text-white light:text-slate-900 text-xs">Verified Brands Only</span>
                </label>
                <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/80 light:bg-white border border-white/5 light:border-slate-200/80 hover:border-purple-500/30 light:hover:border-purple-200 cursor-pointer text-slate-300 light:text-slate-700 transition-all light:shadow-xs">
                  <input
                    type="checkbox"
                    checked={localState.escrowOnly}
                    onChange={(e) => handleFieldChange('escrowOnly', e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 light:border-slate-300 accent-purple-500 bg-slate-950 light:bg-white cursor-pointer"
                  />
                  <span className="font-bold text-white light:text-slate-900 text-xs">Escrow Protection Available</span>
                </label>
              </div>
            </div>

            {/* Floating Glass Bottom Action Bar */}
            <div className="absolute bottom-4 left-4 right-4 z-40 p-2.5 rounded-2xl bg-slate-900/95 light:bg-white/95 border border-white/15 light:border-slate-200/80 backdrop-blur-2xl shadow-2xl light:shadow-xl flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  onResetFilters();
                  onClose();
                }}
                type="button"
                className="px-4 py-2.5 rounded-xl bg-slate-800/90 light:bg-slate-100 hover:bg-slate-700 light:hover:bg-slate-200 border border-white/10 light:border-slate-200 text-slate-300 light:text-slate-700 hover:text-white light:hover:text-slate-900 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All</span>
              </button>

              <button
                onClick={handleApply}
                type="button"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-purple-950/50 transition-all flex items-center justify-center gap-1.5 border border-purple-400/20 active:scale-[0.98] keep-white"
              >
                <Check className="w-4 h-4 stroke-[3] text-white keep-white" />
                <span className="text-white keep-white">Apply Filters</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
