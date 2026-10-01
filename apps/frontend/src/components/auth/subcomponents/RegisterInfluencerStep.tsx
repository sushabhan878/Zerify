'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, Sparkles, Search, X, Plus } from 'lucide-react';
import AuthAlert from './AuthAlert';
import AuthCurrencySelector from './AuthCurrencySelector';
import { SUPPORTED_CURRENCIES } from '@/utils/currency';

interface RegisterInfluencerStepProps {
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
  pricePerReel: number;
  setPricePerReel: (val: number) => void;
  currency: string;
  setCurrency: (curr: string) => void;
  loading: boolean;
  errorMessage: string;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

const PRESET_CATEGORIES = [
  'Fashion & Beauty',
  'Tech & Gadgets',
  'Fitness & Wellness',
  'Travel & Adventure',
  'Food & Culinary',
  'Lifestyle & Vlogging',
  'Business & Finance',
  'Gaming & Esports',
  'Music & Audio',
  'Education & EdTech',
  'Parenting & Family',
  'Art & Design',
  'Crypto & Web3',
  'Automotive & Cars',
  'Comedy & Entertainment',
  'Home & Interior Design',
  'Photography & Videography',
  'Books & Literature',
  'Sports & Outdoors',
  'Healthcare & Medicine',
];

export default function RegisterInfluencerStep({
  selectedCategories,
  setSelectedCategories,
  pricePerReel,
  setPricePerReel,
  currency,
  setCurrency,
  loading,
  errorMessage,
  onSubmit,
}: RegisterInfluencerStepProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addCategoryTag = (cat: string) => {
    const trimmed = cat.trim();
    if (!trimmed) return;
    if (!selectedCategories.includes(trimmed)) {
      setSelectedCategories([...selectedCategories, trimmed]);
    }
    setSearchQuery('');
    setDropdownOpen(false);
  };

  const removeCategoryTag = (cat: string) => {
    setSelectedCategories(selectedCategories.filter((c) => c !== cat));
  };

  // Show all available categories on focus/click, and filter when typing
  const filteredCategories = useMemo(() => {
    const available = PRESET_CATEGORIES.filter((c) => !selectedCategories.includes(c));
    const q = searchQuery.trim().toLowerCase();
    if (!q) return available;
    return available.filter((c) => c.toLowerCase().includes(q));
  }, [searchQuery, selectedCategories]);

  // Currency & Rate calculations
  const currDetails = useMemo(() => {
    return SUPPORTED_CURRENCIES[currency] || {
      code: currency,
      symbol: currency,
      exchangeRateToUSD: 1,
    };
  }, [currency]);

  const maxSliderRate = useMemo(() => {
    const rate = currDetails.exchangeRateToUSD || 1;
    if (currency === 'INR') return 500000;
    if (currency === 'USD') return 5000;
    const raw = 5000 * rate;
    if (raw > 50000) return Math.round(raw / 10000) * 10000;
    if (raw > 5000) return Math.round(raw / 1000) * 1000;
    return Math.round(raw / 100) * 100;
  }, [currency, currDetails]);

  const sliderStep = useMemo(() => {
    if (maxSliderRate >= 100000) return 5000;
    if (maxSliderRate >= 10000) return 500;
    return 50;
  }, [maxSliderRate]);

  const handleCurrencyChange = (newCurr: string) => {
    if (newCurr === currency) return;
    const oldRate = currDetails.exchangeRateToUSD || 1;
    const newDetails = SUPPORTED_CURRENCIES[newCurr];
    const newRate = newDetails?.exchangeRateToUSD || 1;

    // Convert existing price to target currency
    const inUSD = pricePerReel / oldRate;
    const converted = Math.round(inUSD * newRate);
    setPricePerReel(converted);
    setCurrency(newCurr);
  };

  const formatReelPrice = (val: number) => {
    const symbol = currDetails.symbol || currency;
    if (val === 0) return `${symbol}0 (Product Gifting)`;
    if (val >= maxSliderRate) return `${symbol}${maxSliderRate.toLocaleString()} / reel`;
    return `${symbol}${val.toLocaleString()} / reel`;
  };

  return (
    <motion.div
      key="step3-influencer"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      {/* Title Centered with Landing Page Serif Typography */}
      <div className="text-center mb-3">
        <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight [font-family:'Playfair_Display',Georgia,serif]">
          Creator Profile <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300">Details</span>
        </h2>
        <p className="text-xs text-slate-300 mt-1">Help brands discover your media kit and campaign rates</p>
      </div>

      <AuthAlert message={errorMessage} />

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Searchable Multi-Select Niche Category Tags */}
        <div className="space-y-2" ref={containerRef}>
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>Search Niche Categories</span>
            </label>
            {selectedCategories.length > 0 && (
              <span className="text-[10px] text-slate-400 font-medium">
                {selectedCategories.length} tag{selectedCategories.length === 1 ? '' : 's'} added
              </span>
            )}
          </div>

          {/* Selected Tag Badges Container (Only shown when tags are added) */}
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-2 rounded-2xl bg-slate-900/60 border border-white/10 min-h-[44px]">
              <AnimatePresence>
                {selectedCategories.map((cat) => (
                  <motion.span
                    key={cat}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 border border-pink-500/50 text-xs font-semibold text-white shadow-inner"
                  >
                    <span>{cat}</span>
                    <button
                      type="button"
                      onClick={() => removeCategoryTag(cat)}
                      className="hover:text-pink-300 transition-colors p-0.5 rounded-full hover:bg-white/10 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Search Input Bar (No purple border on focus/click) */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setDropdownOpen(true)}
              onClick={() => setDropdownOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setDropdownOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  e.preventDefault();
                  addCategoryTag(searchQuery);
                }
              }}
              placeholder="Search category tag (e.g. Gaming, Beauty, Tech)..."
              className="w-full pl-10 pr-16 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 focus:border-white/20 focus:ring-0 text-xs text-white placeholder-slate-500 outline-none transition-all"
            />
            {searchQuery.trim() && (
              <button
                type="button"
                onClick={() => addCategoryTag(searchQuery)}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-pink-600/30 text-pink-200 hover:bg-pink-600/50 border border-pink-500/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            )}

            {/* Categories Dropdown (Opens on click showing all categories, filters as user types) */}
            {dropdownOpen && filteredCategories.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-30 max-h-52 overflow-y-auto rounded-xl bg-[#090d16] border border-white/15 shadow-2xl p-1.5 space-y-1 backdrop-blur-xl custom-scrollbar">
                {filteredCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => addCategoryTag(cat)}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center justify-between cursor-pointer"
                  >
                    <span>{cat}</span>
                    <Plus className="w-3.5 h-3.5 text-pink-400" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 2. Rate Per Reel / Video - Borderless, clean slider without outer card div */}
        <div className="space-y-3 pt-1">
          {/* Header Row: Label (no video icon) & Full Platform Currency Selector */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Rate Per Reel / Video
            </span>

            {/* Currency Selector (shows only currency term e.g. INR) */}
            <AuthCurrencySelector
              value={currency}
              onChange={handleCurrencyChange}
            />
          </div>

          {/* Rate Badge Display */}
          <div className="flex justify-end">
            <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 shadow-inner">
              {formatReelPrice(pricePerReel)}
            </span>
          </div>

          {/* Dynamic Slider */}
          <input
            type="range"
            min={0}
            max={maxSliderRate}
            step={sliderStep}
            value={Math.min(pricePerReel, maxSliderRate)}
            onChange={(e) => setPricePerReel(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500 hover:accent-pink-400 transition-all"
          />

          {/* Slider Axis Ticks */}
          <div className="flex justify-between text-[10px] text-slate-500 font-semibold px-0.5">
            <span>{currDetails.symbol}0</span>
            <span>{currDetails.symbol}{Math.round(maxSliderRate * 0.1).toLocaleString()}</span>
            <span>{currDetails.symbol}{Math.round(maxSliderRate * 0.5).toLocaleString()}</span>
            <span>{currDetails.symbol}{maxSliderRate.toLocaleString()}+</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || selectedCategories.length === 0}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-pink-600/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Creator Account...</span>
            </>
          ) : (
            <>
              <span>Complete Creator Setup</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
