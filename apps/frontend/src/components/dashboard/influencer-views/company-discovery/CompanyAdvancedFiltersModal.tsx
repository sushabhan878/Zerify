'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, Building2, Target, Users, Sparkles, RotateCcw, Check, ShieldCheck, DollarSign, Globe, Award } from 'lucide-react';
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

const CREATOR_TIERS = ['All', 'Nano (1K - 10K)', 'Micro (10K - 50K)', 'Mid (50K - 250K)', 'Macro (250K - 1M)', 'Mega (1M+)'];
const GENDER_OPTIONS = ['All', 'Female', 'Male', 'Non-Binary'];
const AGE_OPTIONS = ['All', '18-24', '25-34', '35-44', '45+'];

export default function CompanyAdvancedFiltersModal({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}: CompanyAdvancedFiltersModalProps) {
  const [localState, setLocalState] = useState<AdvancedFilterState>(filters);

  useEffect(() => {
    setLocalState(filters);
  }, [filters, isOpen]);

  if (!isOpen) return null;

  const handleFieldChange = (key: keyof AdvancedFilterState, val: any) => {
    setLocalState((prev) => ({ ...prev, [key]: val }));
  };

  const handleApply = () => {
    onApplyFilters(localState);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Dark Blurred Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Right Slide-Over Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="relative z-50 w-full max-w-md h-full bg-slate-950 border-l border-white/10 shadow-2xl flex flex-col justify-between overflow-hidden selection:bg-purple-500 selection:text-white"
          >
            {/* Drawer Top Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/60 backdrop-blur-xl shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 shadow-md">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white tracking-tight">Directory Filters</h2>
                  <p className="text-[11px] text-slate-400">Refine brands by specs, budget & match scores</p>
                </div>
              </div>

              <button
                onClick={onClose}
                type="button"
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Filter Form Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar text-xs">
              {/* 1. Category / Industry */}
              <div className="space-y-2">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Primary Industry Category</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto p-1.5 rounded-xl bg-slate-900 border border-white/10">
                  {INDUSTRIES.map((ind) => {
                    const isSelected = localState.industry === ind;
                    return (
                      <button
                        key={ind}
                        type="button"
                        onClick={() => handleFieldChange('industry', ind)}
                        className={`px-2.5 py-1.5 rounded-lg text-left text-[11px] font-semibold transition-all truncate flex items-center justify-between ${
                          isSelected
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span className="truncate">{ind}</span>
                        {isSelected && <Check className="w-3 h-3 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Budget Range & Compensation */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Campaign Budget Range</span>
                </label>
                <select
                  value={localState.budgetRange}
                  onChange={(e) => handleFieldChange('budgetRange', e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-medium focus:outline-none focus:border-purple-500"
                >
                  {BUDGET_RANGES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>

                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-white/5 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={localState.paidOnly}
                    onChange={(e) => handleFieldChange('paidOnly', e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 text-purple-600 focus:ring-purple-500 bg-slate-950"
                  />
                  <div>
                    <span className="font-bold text-white block">Paid Campaigns Only</span>
                    <span className="text-[10px] text-slate-400 block">Filter out barter/product exchange deals</span>
                  </div>
                </label>
              </div>

              {/* 3. Platform & Campaign Type */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>Target Social Platform</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PLATFORMS.map((p) => {
                    const isSelected = localState.platform === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handleFieldChange('platform', p)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                            : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="font-bold text-slate-300">Deliverable Format / Campaign Type</label>
                  <select
                    value={localState.campaignType}
                    onChange={(e) => handleFieldChange('campaignType', e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-medium focus:outline-none focus:border-purple-500"
                  >
                    {CAMPAIGN_TYPES.map((ct) => (
                      <option key={ct} value={ct}>
                        {ct}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 4. Match Score Threshold Slider */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Min Zerify Match Score</span>
                  </span>
                  <span className="text-purple-400 font-black text-sm">{localState.minMatchScore}%+</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={90}
                  step={10}
                  value={localState.minMatchScore}
                  onChange={(e) => handleFieldChange('minMatchScore', parseInt(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer h-2 bg-slate-900 rounded-lg"
                />
              </div>

              {/* 5. Creator Tier Requirement */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-pink-400" />
                  <span>Creator Tier Eligibility</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {CREATOR_TIERS.map((tier) => {
                    const isSelected = localState.creatorTier === tier;
                    return (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => handleFieldChange('creatorTier', tier)}
                        className={`px-3 py-2 rounded-xl text-[11px] font-bold text-left border transition-all ${
                          isSelected
                            ? 'bg-pink-600 text-white border-pink-500 shadow-md'
                            : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {tier}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6. Target Audience Demographic */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Target Audience Demographic</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">Gender</span>
                    <select
                      value={localState.targetGender}
                      onChange={(e) => handleFieldChange('targetGender', e.target.value)}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-white/10 text-white text-[11px]"
                    >
                      {GENDER_OPTIONS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">Age Range</span>
                    <select
                      value={localState.targetAge}
                      onChange={(e) => handleFieldChange('targetAge', e.target.value)}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-white/10 text-white text-[11px]"
                    >
                      {AGE_OPTIONS.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 7. Trust & Verification Signals */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Trust & Security Signals</span>
                </label>
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-white/5 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={localState.isVerifiedOnly}
                    onChange={(e) => handleFieldChange('isVerifiedOnly', e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 text-purple-600 focus:ring-purple-500 bg-slate-950"
                  />
                  <span>Verified Brands Only</span>
                </label>
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-white/5 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={localState.escrowOnly}
                    onChange={(e) => handleFieldChange('escrowOnly', e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 text-purple-600 focus:ring-purple-500 bg-slate-950"
                  />
                  <span>Escrow Protection Available</span>
                </label>
              </div>
            </div>

            {/* Fixed Drawer Footer Controls */}
            <div className="p-4 border-t border-white/10 bg-slate-900/90 backdrop-blur-xl shrink-0 flex items-center justify-between gap-3">
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
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-black shadow-lg shadow-purple-950/50 transition-all flex items-center justify-center gap-1.5 border border-purple-400/20"
              >
                <Check className="w-4 h-4" />
                <span>Apply Filters</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
