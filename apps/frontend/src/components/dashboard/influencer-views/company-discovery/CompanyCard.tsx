'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ShieldCheck,
  Send,
  ArrowUpRight,
} from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

export interface CompanyItem {
  id: string;
  companyName: string;
  logoUrl?: string;
  website?: string;
  industry: string;
  location?: string;
  description?: string;
  foundedYear?: string;
  brandValues?: string[];
  primaryGoals?: string[];
  targetPlatforms?: string[];
  targetAudience?: any;
  creatorTiers?: string[];
  creatorLocations?: string[];
  campaignBudget?: string;
  campaignFrequency?: string;
  escrowSetup?: any;
  products?: any[];
  matchScore: number;
  audienceMatchScore: number;
  nicheMatchScore: number;
  contentMatchScore: number;
  brandFitScore: number;
  budgetFitScore: number;
  matchReasons: string[];
  matchWarnings?: string[];
  isVerified?: boolean;
  postedDateStr?: string;
}

interface CompanyCardProps {
  company: CompanyItem;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
  onViewDetails: (company: CompanyItem) => void;
  onPitchBrand: (company: CompanyItem) => void;
  viewMode?: 'grid' | 'list';
}

export default function CompanyCard({
  company,
  isSaved,
  onToggleSave,
  onViewDetails,
  onPitchBrand,
  viewMode = 'grid',
}: CompanyCardProps) {
  const { formatBudgetCompact } = useCurrency();

  const logoLetter = company.companyName ? company.companyName.charAt(0).toUpperCase() : 'B';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.008 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`relative mt-4 p-5 rounded-2xl bg-slate-950/70 border border-white/10 backdrop-blur-xl shadow-xl hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-950/40 hover:bg-slate-950/90 transition-all flex flex-col justify-between group overflow-visible ${viewMode === 'list' ? 'md:flex-row md:items-center gap-4' : 'space-y-4'
        }`}
    >
      {/* Background Ambient Glow */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-600/20 transition-all duration-500" />

      {/* Floating Match Rate Badge Overlapping Top-Right Corner */}
      <div
        className="absolute right-6 sm:right-8 z-30 pointer-events-none"
        style={{ top: '-8px', transform: 'translateY(-50%)' }}
      >
        <span
          className={`px-4 sm:px-5 py-2 rounded-full border text-xs sm:text-sm md:text-sm font-black tracking-wide text-white flex items-center gap-2 shadow-2xl ring-4 ring-[#080B14] group-hover:scale-105 transition-all duration-300 ${company.matchScore >= 90
              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 border-emerald-400/50 shadow-emerald-950/80 group-hover:shadow-emerald-600/40'
              : company.matchScore >= 75
                ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 border-purple-400/50 shadow-purple-950/80 group-hover:shadow-purple-600/40'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 border-blue-400/50 shadow-blue-950/80 group-hover:shadow-blue-600/40'
            }`}
        >
          <Sparkles className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white animate-pulse shrink-0" />
          <span>{company.matchScore}% Match</span>
        </span>
      </div>

      <div className="space-y-3 flex-1 min-w-0">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => onViewDetails(company)}
              className="shrink-0 focus:outline-none hover:opacity-85 transition-opacity"
              title="View brand details"
            >
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={company.companyName}
                  className="w-12 h-12 rounded-xl object-cover border border-white/10 bg-slate-900 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center font-black text-white text-lg shadow-lg shrink-0">
                  {logoLetter}
                </div>
              )}
            </button>

            <div className="min-w-0">
              <button
                type="button"
                onClick={() => onViewDetails(company)}
                className="group/brand inline-flex items-center gap-1.5 text-left transition-colors focus:outline-none cursor-pointer max-w-full"
                title="View brand details"
              >
                <h3 className="text-sm font-extrabold text-white group-hover/brand:text-purple-300 group-hover/brand:underline underline-offset-4 decoration-purple-400/60 transition-all truncate">
                  {company.companyName}
                </h3>
                {company.isVerified !== false && (
                  <span title="Verified Brand">
                    <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                  </span>
                )}
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover/brand:text-purple-300 group-hover/brand:scale-125 group-hover/brand:translate-x-0.5 group-hover/brand:-translate-y-0.5 transition-all duration-200 shrink-0" />
              </button>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 truncate">
                <span className="font-bold text-slate-300 truncate">{company.industry || 'General Industry'}</span>
                {company.location && <span className="truncate">• {company.location}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Short Campaign Goal / Description */}
        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
          {company.description ||
            `Looking for content creators for ${company.primaryGoals?.join(', ') || 'brand promotion & product showcase'
            }.`}
        </p>
      </div>

      {/* Footer: Budget & Pitch Action */}
      <div
        className={`pt-3.5 border-t border-white/10 flex items-center justify-between gap-3 shrink-0 ${viewMode === 'list' ? 'md:border-t-0 md:pt-0 md:gap-6' : ''
          }`}
      >
        <div className="min-w-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Budget
          </span>
          <span className="text-base sm:text-lg font-black text-white tracking-tight">
            {formatBudgetCompact(company.campaignBudget)}
          </span>
        </div>

        <button
          onClick={() => onPitchBrand(company)}
          type="button"
          className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98] text-xs sm:text-sm font-extrabold text-white flex items-center gap-2 shadow-lg shadow-purple-950/60 hover:shadow-purple-900/80 hover:scale-[1.02] transition-all shrink-0 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Pitch Brand</span>
        </button>
      </div>
    </motion.div>
  );
}
