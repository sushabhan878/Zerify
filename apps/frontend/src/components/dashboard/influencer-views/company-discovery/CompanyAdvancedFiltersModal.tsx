'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, RotateCcw } from 'lucide-react';
import { QuickFilterState } from './CompanyQuickFilters';

export interface AdvancedFilterState extends QuickFilterState {
  companySize: string;
  companyStage: string;
  isVerifiedOnly: boolean;
  escrowOnly: boolean;
  creatorTier: string;
  targetGender: string;
  targetAge: string;
  minNicheScore: number;
  minAudienceScore: number;
}

interface CompanyAdvancedFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: AdvancedFilterState;
  onApplyFilters: (newFilters: AdvancedFilterState) => void;
  onResetFilters: () => void;
}

const INDUSTRIES = [
  'All',
  'Software & SaaS',
  'Beauty & Personal Care',
  'Fashion & Apparel',
  'Food & Beverage',
  'Fitness & Wellness',
  'Consumer Electronics & Hardware',
  'Fintech & Digital Payments',
  'Luxury & Designer Goods',
  'Healthcare & Pharmaceuticals',
  'Web3, Crypto & Blockchain',
  'Real Estate & Property Development',
  'Automotive & EV',
];

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
      <label className="text-xs font-bold text-slate-300 block">{label}</label>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setIsOpen(false)}
        />
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:border-purple-500/40 text-xs font-semibold text-white transition-all relative z-40"
      >
        <span className="truncate">{value}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-purple-400' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-slate-950 border border-purple-500/30 rounded-xl shadow-2xl p-1.5 z-50 space-y-0.5 backdrop-blur-xl">
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
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${isSelected
                    ? 'bg-purple-500/20 text-purple-200 font-semibold border border-purple-500/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
              >
                <span className="truncate">{opt}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function CompanyAdvancedFiltersModal({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}: CompanyAdvancedFiltersModalProps) {
  const [localState, setLocalState] = useState<AdvancedFilterState>(filters);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setLocalState(filters);
  }, [filters, isOpen]);

  if (!isOpen || !mounted) return null;

  const handleFieldChange = (key: keyof AdvancedFilterState, val: any) => {
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
          {/* Dark Blurred Backdrop Overlay covering 100% of viewport and sidebar */}
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
            className="relative z-50 w-full max-w-md h-screen bg-slate-950 border-l border-white/10 shadow-2xl flex flex-col overflow-hidden selection:bg-purple-500 selection:text-white"
          >
            {/* Scrollable Filter Form Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
              {/* 1. Category / Industry Dropdown */}
              <FilterDropdown
                label="Primary Industry Category"
                value={localState.industry}
                options={INDUSTRIES}
                onChange={(val) => handleFieldChange('industry', val)}
              />

              {/* 2. Budget Range Dropdown */}
              <div className="pt-3 border-t border-white/5">
                <FilterDropdown
                  label="Campaign Budget Range"
                  value={localState.budgetRange}
                  options={BUDGET_RANGES}
                  onChange={(val) => handleFieldChange('budgetRange', val)}
                />
              </div>

              {/* 3. Platform & Campaign Type */}
              <div className="space-y-3 pt-3 border-t border-white/5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Target Social Platform</label>
                  <div className="flex flex-wrap gap-1.5">
                    {PLATFORMS.map((p) => {
                      const isSelected = localState.platform === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => handleFieldChange('platform', p)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${isSelected
                              ? 'bg-purple-500/20 text-purple-200 border-purple-500/40 shadow-sm'
                              : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                            }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <FilterDropdown
                  label="Deliverable Format / Campaign Type"
                  value={localState.campaignType}
                  options={CAMPAIGN_TYPES}
                  onChange={(val) => handleFieldChange('campaignType', val)}
                />
              </div>

              {/* 4. Match Score Threshold Slider */}
              <div className="space-y-2.5 pt-3 border-t border-white/5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-300">Minimum Zerify Match Score</span>
                  <span className="px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-black">
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
                  className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-900 rounded-lg"
                />
              </div>

              {/* 5. Target Audience Demographic */}
              <div className="space-y-2.5 pt-3 border-t border-white/5">
                <label className="text-xs font-bold text-slate-300 block">Target Audience Demographic</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <FilterDropdown
                    label="Gender"
                    value={localState.targetGender}
                    options={GENDER_OPTIONS}
                    onChange={(val) => handleFieldChange('targetGender', val)}
                  />
                  <FilterDropdown
                    label="Age Range"
                    value={localState.targetAge}
                    options={AGE_OPTIONS}
                    onChange={(val) => handleFieldChange('targetAge', val)}
                  />
                </div>
              </div>

              {/* 7. Trust & Verification Signals */}
              <div className="space-y-2 pt-3 border-t border-white/5">
                <label className="text-xs font-bold text-slate-300 block">Trust & Verification</label>
                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-purple-500/30 cursor-pointer text-slate-300 transition-all">
                  <input
                    type="checkbox"
                    checked={localState.isVerifiedOnly}
                    onChange={(e) => handleFieldChange('isVerifiedOnly', e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 accent-purple-500 bg-slate-950 cursor-pointer"
                  />
                  <span className="font-semibold text-white text-xs">Verified Brands Only</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-purple-500/30 cursor-pointer text-slate-300 transition-all">
                  <input
                    type="checkbox"
                    checked={localState.escrowOnly}
                    onChange={(e) => handleFieldChange('escrowOnly', e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 accent-purple-500 bg-slate-950 cursor-pointer"
                  />
                  <span className="font-semibold text-white text-xs">Escrow Protection Available</span>
                </label>
              </div>

              {/* Action Buttons (Inline at bottom of scrollable content) */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    onResetFilters();
                    onClose();
                  }}
                  type="button"
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All</span>
                </button>

                <button
                  onClick={handleApply}
                  type="button"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold shadow-lg shadow-purple-950/50 transition-all flex items-center justify-center gap-1.5 border border-purple-400/20"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply Filters</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
