'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AtSign, Phone, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import AuthAlert from './AuthAlert';

interface RegisterInfluencerStepProps {
  handle: string;
  setHandle: (val: string) => void;
  platform: string;
  setPlatform: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  gender: string;
  setGender: (val: string) => void;
  openToAffiliate: boolean;
  setOpenToAffiliate: (val: boolean) => void;
  openToUgc: boolean;
  setOpenToUgc: (val: boolean) => void;
  contactInfo: string;
  setContactInfo: (val: string) => void;
  pricingRange: string;
  setPricingRange: (val: string) => void;
  loading: boolean;
  errorMessage: string;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

export default function RegisterInfluencerStep({
  handle,
  setHandle,
  platform,
  setPlatform,
  category,
  setCategory,
  gender,
  setGender,
  openToAffiliate,
  setOpenToAffiliate,
  openToUgc,
  setOpenToUgc,
  contactInfo,
  setContactInfo,
  pricingRange,
  setPricingRange,
  loading,
  errorMessage,
  onSubmit,
  onBack,
}: RegisterInfluencerStepProps) {
  return (
    <motion.div
      key="step3-influencer"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Creator Profile Details</h2>
          <p className="text-xs text-slate-400">Help brands discover your media kit</p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-white/10 hover:border-white/20 text-xs font-semibold text-slate-300 hover:text-white transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
      </div>

      <AuthAlert message={errorMessage} />

      <form onSubmit={onSubmit} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Social Handle</label>
            <div className="relative">
              <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@username"
                className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white outline-none"
            >
              <option value="Instagram">Instagram</option>
              <option value="YouTube">YouTube</option>
              <option value="TikTok">TikTok</option>
              <option value="X (Twitter)">X (Twitter)</option>
              <option value="LinkedIn">LinkedIn</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Niche Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white outline-none"
            >
              <option value="Fashion & Beauty">Fashion & Beauty</option>
              <option value="Tech & Gaming">Tech & Gaming</option>
              <option value="Fitness & Health">Fitness & Health</option>
              <option value="Travel & Food">Travel & Food</option>
              <option value="Lifestyle & Vlog">Lifestyle & Vlog</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Rate Range</label>
            <select
              value={pricingRange}
              onChange={(e) => setPricingRange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white outline-none"
            >
              <option value="Under $100">Under $100</option>
              <option value="$100 - $500">$100 - $500</option>
              <option value="$500 - $1,500">$500 - $1,500</option>
              <option value="$1,500+">$1,500+</option>
            </select>
          </div>
        </div>

        <div className="pt-1">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Collaboration Preferences</label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={openToAffiliate}
                onChange={(e) => setOpenToAffiliate(e.target.checked)}
                className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500"
              />
              <span>Affiliate Deals</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={openToUgc}
                onChange={(e) => setOpenToUgc(e.target.checked)}
                className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500"
              />
              <span>UGC Content</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
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
