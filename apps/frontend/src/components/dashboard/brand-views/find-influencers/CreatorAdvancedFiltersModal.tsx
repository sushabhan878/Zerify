'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, RotateCcw, SlidersHorizontal, Sparkles, ChevronDown } from 'lucide-react';
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

const CATEGORIES = ['All', ...PRIMARY_CATEGORY_NAMES];

const RATE_RANGES = [
  'Any Rate',
  'Under $250',
  '$250 - $500',
  '$500 - $1K',
  '$1K - $2.5K',
  '$2.5K - $5K',
  '$5K+',
];

const CREATOR_TIERS = [
  'All Tiers',
  'Nano (1K - 10K)',
  'Micro (10K - 100K)',
  'Mid-Tier (100K - 500K)',
  'Macro (500K - 1M)',
  'Mega (1M+)',
];

const PLATFORMS = ['All Platforms', 'Instagram', 'YouTube', 'TikTok', 'LinkedIn', 'Twitter', 'Twitch'];

const CONTENT_TYPES = [
  'All Types',
  'Instagram Reels / Shorts',
  'Dedicated YouTube Video',
  'TikTok Video',
  'Static Feed Post',
  'Story Sequence',
  'UGC Video Package',
  'Live Stream Placement',
];

const GENDER_OPTIONS = ['All', 'Female', 'Male', 'Non-Binary'];
const AGE_OPTIONS = ['All', '18-24', '25-34', '35-44', '45+'];
const LOCATIONS = ['All', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'India', 'Global'];

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-300 block">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer pr-8"
        >
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-slate-950 text-white">
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
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
  const [mounted, setMounted] = useState(false);
  const [localState, setLocalState] = useState<CreatorAdvancedFilterState>(filters);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setLocalState(filters);
  }, [filters, isOpen]);

  if (!mounted) return null;

  const handleFieldChange = (key: keyof CreatorAdvancedFilterState, value: any) => {
    setLocalState((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApplyFilters(localState);
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Sliding Panel from Right */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative z-50 w-full max-w-md h-full bg-slate-950 border-l border-white/10 shadow-2xl flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-slate-950/80 backdrop-blur-xl">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">All Influencer Filters</h3>
                  <p className="text-[11px] text-slate-400">Refine creators with granular targeting</p>
                </div>
              </div>

              <button
                onClick={onClose}
                type="button"
                className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Filters Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-5 text-slate-200">
              {/* 1. Category */}
              <FilterSelect
                label="Primary Niche / Category"
                value={localState.category}
                options={CATEGORIES}
                onChange={(val) => handleFieldChange('category', val)}
              />

              {/* 2. Creator Tier */}
              <FilterSelect
                label="Creator Tier & Audience Size"
                value={localState.creatorTier}
                options={CREATOR_TIERS}
                onChange={(val) => handleFieldChange('creatorTier', val)}
              />

              {/* 3. Rate Range */}
              <FilterSelect
                label="Estimated Rate per Post"
                value={localState.rateRange}
                options={RATE_RANGES}
                onChange={(val) => handleFieldChange('rateRange', val)}
              />

              {/* 4. Platform */}
              <FilterSelect
                label="Primary Social Platform"
                value={localState.platform}
                options={PLATFORMS}
                onChange={(val) => handleFieldChange('platform', val)}
              />

              {/* 5. Content Format */}
              <FilterSelect
                label="Content Format & Deliverable Type"
                value={localState.contentType}
                options={CONTENT_TYPES}
                onChange={(val) => handleFieldChange('contentType', val)}
              />

              {/* 6. Minimum Match Score */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Minimum AI Match Score
                  </label>
                  <span className="font-black text-purple-400">
                    {localState.minMatchScore === 0 ? 'Any' : `${localState.minMatchScore}%+`}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[0, 50, 70, 80, 90].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => handleFieldChange('minMatchScore', score)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        localState.minMatchScore === score
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {score === 0 ? 'Any' : `${score}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* 7. Minimum Engagement Rate */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-300">Minimum Engagement Rate</label>
                  <span className="font-black text-emerald-400">
                    {localState.minEngagementRate === 0 ? 'Any' : `${localState.minEngagementRate}%+`}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[0, 3, 5, 7, 10].map((er) => (
                    <button
                      key={er}
                      type="button"
                      onClick={() => handleFieldChange('minEngagementRate', er)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        localState.minEngagementRate === er
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {er === 0 ? 'Any' : `${er}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* 8. Audience Demographics */}
              <div className="space-y-3 pt-3 border-t border-white/5">
                <label className="text-xs font-bold text-slate-300 block">Audience Demographics</label>
                <FilterSelect
                  label="Top Audience Location"
                  value={localState.location}
                  options={LOCATIONS}
                  onChange={(val) => handleFieldChange('location', val)}
                />
                <div className="grid grid-cols-2 gap-2.5">
                  <FilterSelect
                    label="Target Gender"
                    value={localState.audienceGender}
                    options={GENDER_OPTIONS}
                    onChange={(val) => handleFieldChange('audienceGender', val)}
                  />
                  <FilterSelect
                    label="Target Age Range"
                    value={localState.audienceAge}
                    options={AGE_OPTIONS}
                    onChange={(val) => handleFieldChange('audienceAge', val)}
                  />
                </div>
              </div>

              {/* 9. Trust & Verification Signals */}
              <div className="space-y-2 pt-3 border-t border-white/5">
                <label className="text-xs font-bold text-slate-300 block">Trust & Verification</label>
                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-purple-500/30 cursor-pointer text-slate-300 transition-all">
                  <input
                    type="checkbox"
                    checked={localState.isVerifiedOnly}
                    onChange={(e) => handleFieldChange('isVerifiedOnly', e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 accent-purple-500 bg-slate-950 cursor-pointer"
                  />
                  <span className="font-semibold text-white text-xs">Verified Creators Only</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-purple-500/30 cursor-pointer text-slate-300 transition-all">
                  <input
                    type="checkbox"
                    checked={localState.topRatedOnly}
                    onChange={(e) => handleFieldChange('topRatedOnly', e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 accent-purple-500 bg-slate-950 cursor-pointer"
                  />
                  <span className="font-semibold text-white text-xs">Top Rated Creators (4.8★+)</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-purple-500/30 cursor-pointer text-slate-300 transition-all">
                  <input
                    type="checkbox"
                    checked={localState.escrowOnly}
                    onChange={(e) => handleFieldChange('escrowOnly', e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 accent-purple-500 bg-slate-950 cursor-pointer"
                  />
                  <span className="font-semibold text-white text-xs">Escrow Milestone Payouts Ready</span>
                </label>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-white/10 flex items-center justify-between gap-3 bg-slate-950 shrink-0">
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
