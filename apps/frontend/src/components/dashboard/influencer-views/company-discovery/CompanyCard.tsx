'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ShieldCheck,
  Send,
  Heart,
  Globe,
  DollarSign,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
} from 'lucide-react';

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
  isSaved: boolean;
  onToggleSave: (id: string) => void;
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
  const [showMatchDetails, setShowMatchDetails] = useState(false);

  const getMatchColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400';
    if (score >= 70) return 'bg-purple-500/15 border-purple-500/40 text-purple-300';
    return 'bg-blue-500/15 border-blue-500/40 text-blue-300';
  };

  const logoLetter = company.companyName ? company.companyName.charAt(0).toUpperCase() : 'B';

  const audienceText = company.targetAudience?.gender
    ? `${company.targetAudience.gender} | ${company.targetAudience.ageRanges?.join(', ') || 'All Ages'}`
    : 'All Demographics';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-5 rounded-2xl bg-slate-950/60 border border-white/10 backdrop-blur-xl shadow-xl hover:border-purple-500/40 transition-all flex flex-col justify-between group ${
        viewMode === 'list' ? 'md:flex-row md:items-center gap-4' : 'space-y-4'
      }`}
    >
      <div className="space-y-3 flex-1">
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

          {/* Match Score Badge */}
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={() => setShowMatchDetails(!showMatchDetails)}
              className={`px-3 py-1 rounded-full border text-xs font-black flex items-center gap-1.5 transition-all hover:scale-105 ${getMatchColor(
                company.matchScore
              )}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{company.matchScore}% Match</span>
              {showMatchDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Short Campaign Goal / Description */}
        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
          {company.description ||
            `Looking for content creators for ${
              company.primaryGoals?.join(', ') || 'brand promotion & product showcase'
            }.`}
        </p>

        {/* Match Breakdown Expandable Section */}
        {showMatchDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="p-3 rounded-xl bg-slate-900/90 border border-purple-500/20 text-xs space-y-2"
          >
            <div className="font-extrabold text-white text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Match Component Scores:</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-slate-300 font-medium">
              <div className="p-1.5 rounded-lg bg-slate-950/60 border border-white/5">
                <span className="text-slate-400 block">Audience</span>
                <span className="font-extrabold text-emerald-400">{company.audienceMatchScore}%</span>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-950/60 border border-white/5">
                <span className="text-slate-400 block">Niche Fit</span>
                <span className="font-extrabold text-purple-300">{company.nicheMatchScore}%</span>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-950/60 border border-white/5">
                <span className="text-slate-400 block">Brand Fit</span>
                <span className="font-extrabold text-blue-300">{company.brandFitScore}%</span>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-950/60 border border-white/5">
                <span className="text-slate-400 block">Budget Fit</span>
                <span className="font-extrabold text-teal-300">{company.budgetFitScore}%</span>
              </div>
            </div>

            <div className="space-y-1 pt-1">
              {company.matchReasons.map((reason, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[11px] text-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{reason}</span>
                </div>
              ))}
              {company.matchWarnings?.map((warning, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[11px] text-amber-300">
                  <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Key Target Signals */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-slate-300 flex items-center gap-1 font-medium">
            <DollarSign className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400 font-extrabold">
              {company.campaignBudget || '$5,000 – $20,000'}
            </span>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-slate-300 font-medium truncate max-w-[200px]">
            Target: <strong className="text-white">{audienceText}</strong>
          </div>

          {company.targetPlatforms && company.targetPlatforms.length > 0 && (
            <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-slate-300 font-medium flex items-center gap-1">
              <span>Platforms:</span>
              <strong className="text-purple-300">{company.targetPlatforms.join(', ')}</strong>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5 pt-1">
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400">
            Paid Campaign
          </span>
          <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-300">
            Escrow Available
          </span>
          <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-300">
            Verified Brand
          </span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleSave(company.id)}
            className={`p-2 rounded-xl border transition-all ${
              isSaved
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
            }`}
            title={isSaved ? 'Saved to bookmarks' : 'Save opportunity'}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={() => onViewDetails(company)}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1"
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
