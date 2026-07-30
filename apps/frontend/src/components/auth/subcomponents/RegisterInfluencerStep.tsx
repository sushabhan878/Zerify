'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, Video, Sparkles, Search, X, Plus } from 'lucide-react';
import AuthAlert from './AuthAlert';

interface RegisterInfluencerStepProps {
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
  pricePerReel: number;
  setPricePerReel: (val: number) => void;
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
];

export default function RegisterInfluencerStep({
  selectedCategories,
  setSelectedCategories,
  pricePerReel,
  setPricePerReel,
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

  const filteredCategories = PRESET_CATEGORIES.filter(
    (c) =>
      c.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !selectedCategories.includes(c)
  );

  const formatReelPrice = (val: number) => {
    if (val === 0) return '$0 (Product Gifting)';
    if (val >= 5000) return '$5,000+ / reel';
    return `$${val.toLocaleString()} / reel`;
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
            <span className="text-[10px] text-slate-400 font-medium">
              {selectedCategories.length} tag{selectedCategories.length === 1 ? '' : 's'} added
            </span>
          </div>

          {/* Selected Tag Badges Container */}
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
                      className="hover:text-pink-300 transition-colors p-0.5 rounded-full hover:bg-white/10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Search Input Bar with Auto-complete Dropdown */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setDropdownOpen(true)}
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
              placeholder="Search or type a category tag (e.g. Gaming, Beauty)..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 text-xs text-white placeholder-slate-500 outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => addCategoryTag(searchQuery)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 text-[10px] font-bold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            )}

            {/* Filtered Categories Search Dropdown (Excludes already selected categories) */}
            {dropdownOpen && filteredCategories.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-30 max-h-48 overflow-y-auto rounded-xl bg-[#090d16] border border-white/15 shadow-2xl p-1.5 space-y-1 backdrop-blur-xl">
                {filteredCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => addCategoryTag(cat)}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-pink-500/20 transition-all flex items-center justify-between"
                  >
                    <span>{cat}</span>
                    <Plus className="w-3.5 h-3.5 text-pink-400" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Available Preset Category Quick Pills (Excludes Selected Categories) */}
          {PRESET_CATEGORIES.filter((c) => !selectedCategories.includes(c)).length > 0 && (
            <div className="pt-2">
              <span className="block text-[11px] font-medium text-slate-400 mb-1.5">
                Suggested categories:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_CATEGORIES.filter((c) => !selectedCategories.includes(c))
                  .slice(0, 6)
                  .map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => addCategoryTag(cat)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-pink-500/20 border border-white/10 hover:border-pink-500/30 text-[11px] text-slate-300 hover:text-white transition-all flex items-center gap-1"
                    >
                      <span>{cat}</span>
                      <Plus className="w-3 h-3 text-pink-400" />
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. Rate Per Reel Sliding Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-pink-400" />
              <span>Rate Per Reel / Video</span>
            </label>
            <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 px-2.5 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/20">
              {formatReelPrice(pricePerReel)}
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={5000}
            step={50}
            value={pricePerReel}
            onChange={(e) => setPricePerReel(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500 hover:accent-pink-400 transition-all"
          />

          <div className="flex justify-between text-[10px] text-slate-500 font-semibold px-0.5">
            <span>$0</span>
            <span>$500</span>
            <span>$2,500</span>
            <span>$5,000+</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || selectedCategories.length === 0}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-pink-600/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
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
