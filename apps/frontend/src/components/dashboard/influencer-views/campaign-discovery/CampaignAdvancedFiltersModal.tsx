'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, RotateCcw, Check, Sparkles, ShieldCheck } from 'lucide-react';
import { CAMPAIGN_CATEGORIES, CAMPAIGN_TYPES } from './CampaignQuickFilters';
import { useCurrency } from '@/context/CurrencyContext';

export interface CampaignAdvancedFilterState {
  category: string;
  deliverableType: string;
  payoutModel: string;
  budgetRange: string;
  platform: string;
  creatorTier: string;
  minMatchScore: number;
  isVerifiedOnly: boolean;
  isEscrowOnly: boolean;
}

interface CampaignAdvancedFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: CampaignAdvancedFilterState;
  onApplyFilters: (newFilters: CampaignAdvancedFilterState) => void;
  onResetFilters: () => void;
}

const BUDGET_RANGES_INR = [
  'Any Budget',
  'Under ₹50,000',
  '₹50,000 - ₹2,00,000',
  '₹2,00,000 - ₹5,00,000',
  '₹5,00,000 - ₹10,00,000',
  '₹10,00,000 - ₹25,00,000',
  '₹25,00,000+',
];

const BUDGET_RANGES_USD = [
  'Any Budget',
  'Under $500',
  '$500 - $1K',
  '$1K - $3K',
  '$3K - $5K',
  '$5K - $10K',
  '$10K - $25K',
  '$25K+',
];

export const BUDGET_RANGES = BUDGET_RANGES_INR;

export const PLATFORM_OPTIONS = [
  'All Platforms',
  'Instagram',
  'YouTube',
  'TikTok',
  'LinkedIn',
  'Twitter',
];

export const CREATOR_TIER_OPTIONS = ['All', 'Nano (1K-10K)', 'Micro (10K-50K)', 'Mid (50K-250K)', 'Macro (250K+)'];

export default function CampaignAdvancedFiltersModal({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}: CampaignAdvancedFiltersModalProps) {
  const { currency } = useCurrency();
  const budgetRanges = currency === 'INR' ? BUDGET_RANGES_INR : BUDGET_RANGES_USD;
  const [localFilters, setLocalFilters] = React.useState<CampaignAdvancedFilterState>(filters);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters);
    }
  }, [isOpen, filters]);

  if (!isOpen || !mounted) return null;

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    onResetFilters();
    onClose();
  };

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl max-h-[85vh] bg-slate-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-purple-400" />
              <h2 className="text-base font-bold text-white">Advanced Campaign Filters</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Body */}
          <div className="p-5 overflow-y-auto space-y-6 flex-1 text-xs">
            {/* Category / Subcategory Grid */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Industry Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 border border-white/5 rounded-xl">
                {CAMPAIGN_CATEGORIES.slice(0, 30).map((cat) => {
                  const isSelected = localFilters.category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setLocalFilters({ ...localFilters, category: cat })}
                      className={`p-2 rounded-xl border text-left transition-all truncate font-semibold ${
                        isSelected
                          ? 'bg-purple-500/20 border-purple-500/60 text-purple-300 shadow-sm'
                          : 'bg-slate-950/40 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Budget Range */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Compensation & Budget Range
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {budgetRanges.map((b) => {
                  const isSelected = localFilters.budgetRange === b;
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setLocalFilters({ ...localFilters, budgetRange: b })}
                      className={`p-2 rounded-xl border text-center transition-all font-semibold ${
                        isSelected
                          ? 'bg-purple-500/20 border-purple-500/60 text-purple-300 shadow-sm'
                          : 'bg-slate-950/40 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      {b}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Platform */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Target Platform
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PLATFORM_OPTIONS.map((p) => {
                  const isSelected = localFilters.platform === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setLocalFilters({ ...localFilters, platform: p })}
                      className={`p-2 rounded-xl border text-center transition-all font-semibold ${
                        isSelected
                          ? 'bg-purple-500/20 border-purple-500/60 text-purple-300'
                          : 'bg-slate-950/40 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minimum Match Score Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Minimum AI Match Score
                </label>
                <span className="text-xs font-bold text-purple-400">{localFilters.minMatchScore}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={95}
                step={5}
                value={localFilters.minMatchScore}
                onChange={(e) => setLocalFilters({ ...localFilters, minMatchScore: Number(e.target.value) })}
                className="w-full accent-purple-500 bg-slate-950 cursor-pointer"
              />
            </div>

            {/* Toggles: Verified Brand & Escrow Only */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/50 border border-white/10 cursor-pointer hover:border-white/20 transition-all">
                <input
                  type="checkbox"
                  checked={localFilters.isVerifiedOnly}
                  onChange={(e) => setLocalFilters({ ...localFilters, isVerifiedOnly: e.target.checked })}
                  className="rounded border-white/20 text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
                <div>
                  <span className="text-xs font-bold text-white block">Verified Brands Only</span>
                  <span className="text-[10.5px] text-slate-400 block">Filter for authenticated partners</span>
                </div>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/50 border border-white/10 cursor-pointer hover:border-white/20 transition-all">
                <input
                  type="checkbox"
                  checked={localFilters.isEscrowOnly}
                  onChange={(e) => setLocalFilters({ ...localFilters, isEscrowOnly: e.target.checked })}
                  className="rounded border-white/20 text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
                <div>
                  <span className="text-xs font-bold text-white block">Escrow Protected Only</span>
                  <span className="text-[10.5px] text-slate-400 block">Funds pre-funded into escrow</span>
                </div>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-4 border-t border-white/10 bg-slate-950/40 shrink-0">
            <button
              onClick={handleReset}
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                type="button"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                type="button"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white transition-all shadow-md shadow-purple-950/50"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
