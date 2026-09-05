'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ShieldCheck,
  Send,
  Eye,
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
  const { formatBudget } = useCurrency();

  const getMatchColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400';
    if (score >= 70) return 'bg-purple-500/15 border-purple-500/40 text-purple-300';
    return 'bg-blue-500/15 border-blue-500/40 text-blue-300';
  };

  const logoLetter = company.companyName ? company.companyName.charAt(0).toUpperCase() : 'B';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.008 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`relative p-5 rounded-2xl bg-slate-950/60 border border-white/10 backdrop-blur-xl shadow-xl hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-950/40 hover:bg-slate-950/85 transition-all flex flex-col justify-between group ${
        viewMode === 'list' ? 'md:flex-row md:items-center gap-4' : 'space-y-4'
      }`}
    >
      {/* Top-Right Match Score Badge */}
      <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-10">
        <div
          className={`px-3 py-1 rounded-full border text-xs font-black flex items-center gap-1.5 ${getMatchColor(
            company.matchScore
          )}`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{company.matchScore}% Match</span>
        </div>
      </div>

      <div className="space-y-3 flex-1 pr-24 md:pr-0">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
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

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-extrabold text-white group-hover:text-purple-300 transition-colors">
                  {company.companyName}
                </h3>
                {company.isVerified !== false && (
                  <span title="Verified Brand">
                    <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="font-bold text-slate-300">{company.industry || 'General Industry'}</span>
                {company.location && <span>• {company.location}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Short Campaign Goal / Description */}
        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
          {company.description ||
            `Looking for content creators for ${
              company.primaryGoals?.join(', ') || 'brand promotion & product showcase'
            }.`}
        </p>

        {/* Budget Highlight */}
        <div className="pt-1">
          <span className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight">
            {formatBudget(company.campaignBudget)}
          </span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className={`pt-3 border-t border-white/5 flex items-center justify-between gap-2 shrink-0 ${
        viewMode === 'list' ? 'md:border-t-0 md:pt-0 md:self-end md:mt-2' : ''
      }`}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewDetails(company)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Details</span>
          </button>
        </div>

        <button
          onClick={() => onPitchBrand(company)}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-extrabold text-white flex items-center gap-1.5 shadow-lg shadow-purple-950/50 hover:shadow-purple-900/60 transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Pitch Brand</span>
        </button>
      </div>
    </motion.div>
  );
}
