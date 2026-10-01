'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Globe,
  ExternalLink,
  Target,
  DollarSign,
  Send,
  Calendar,
  Layers,
  Package,
  Users,
  CheckCircle2,
  Check,
  Clock,
  Briefcase,
  Flame,
  Award,
} from 'lucide-react';
import { CompanyItem } from './CompanyCard';
import CompanyAudienceCharts from './CompanyAudienceCharts';
import { useCurrency } from '@/context/CurrencyContext';

interface CompanyDetailViewProps {
  company: CompanyItem;
  onBack: () => void;
  onPitch: (company: CompanyItem) => void;
}

export default function CompanyDetailView({
  company,
  onBack,
  onPitch,
}: CompanyDetailViewProps) {
  const { formatBudget } = useCurrency();
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [company.id]);

  const logoLetter = company.companyName ? company.companyName.charAt(0).toUpperCase() : 'B';

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 pb-16"
    >
      {/* 1. Top Navigation Bar */}
      <div className="flex items-center justify-between gap-4 pb-1">
        <button
          onClick={onBack}
          type="button"
          className="group inline-flex items-center gap-2 text-slate-300 hover:text-purple-300 text-xs font-bold transition-colors w-fit py-1.5 px-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/10"
        >
          <ArrowLeft className="w-4 h-4 text-purple-400 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Discover Companies</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span>Share Profile</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onPitch(company)}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-extrabold text-white flex items-center gap-1.5 shadow-lg shadow-purple-950/60 transition-all active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Pitch Brand</span>
          </button>
        </div>
      </div>

      {/* 2. Hero Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950/70 border border-purple-500/20 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl shadow-purple-950/40">
        {/* Ambient Gradient Highlights */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.companyName}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-purple-500/30 bg-purple-950/40 shrink-0 shadow-2xl"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center font-black text-white text-3xl shadow-2xl shrink-0 border-2 border-purple-400/40">
                {logoLetter}
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {company.companyName}
                </h1>
                {company.isVerified !== false && (
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold"
                    title="Verified Zerify Brand Partner"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                    Verified Partner
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-white/10 text-xs font-semibold text-slate-300">
                  {company.industry || 'Technology & Brands'}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                {company.location && <span>📍 {company.location}</span>}
                {company.foundedYear && <span>• Est. {company.foundedYear}</span>}
                {company.campaignFrequency && (
                  <span className="text-purple-300 font-semibold">• {company.campaignFrequency}</span>
                )}
              </div>

              {company.website && (
                <div className="pt-0.5">
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 hover:underline font-semibold"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{company.website.replace(/^https?:\/\//, '')}</span>
                    <ExternalLink className="w-3 h-3 text-purple-400/70" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics / Payout Highlight */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t border-white/5 md:border-t-0 gap-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Allocated Creator Budget
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
              {formatBudget(company.campaignBudget)}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-purple-300 font-semibold bg-purple-500/10 border border-purple-500/25 px-2.5 py-1 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>100% Escrow Protected</span>
            </div>
          </div>
        </div>

        {/* AI Compatibility Resonance Banner */}
        <div className="mt-7 pt-6 border-t border-purple-500/15 flex flex-col sm:flex-row items-center justify-between gap-5 bg-gradient-to-r from-purple-950/40 via-purple-900/20 to-indigo-950/30 p-5 rounded-2xl border border-purple-500/20">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Radial Dial Indicator */}
            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 48 48">
                <circle
                  cx="24"
                  cy="24"
                  r="19"
                  className="text-purple-950/80"
                  strokeWidth="4.5"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="19"
                  stroke="url(#compGradient)"
                  strokeWidth="4.5"
                  strokeDasharray={`${(company.matchScore / 100) * 119.38} 119.38`}
                  strokeLinecap="round"
                  fill="transparent"
                />
                <defs>
                  <linearGradient id="compGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-black text-white">{company.matchScore}%</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-purple-300 bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 rounded-md">
                  <Sparkles className="w-3 h-3 text-purple-300" />
                  Profile Compatibility
                </span>
                <span className="text-[11px] text-emerald-400 font-bold">
                  • Top 2% Creator Fit
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                {company.matchScore >= 90 ? 'Exceptional Profile & Audience Resonance' : 'High Alignment Collaboration'}
              </h3>
              <p className="text-xs text-slate-300">
                Audience demographics, geographic distribution, and content aesthetic match this brand’s campaign benchmarks.
              </p>
            </div>
          </div>

          <button
            onClick={() => onPitch(company)}
            type="button"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-black text-white flex items-center justify-center gap-2 shadow-xl shadow-purple-950/60 border border-purple-400/30 shrink-0 transition-transform active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Submit Collaboration Pitch</span>
          </button>
        </div>
      </div>

      {/* 3. Deep-Dive Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-purple-500/20 backdrop-blur-xl space-y-1.5 shadow-lg">
          <span className="text-slate-400 text-xs font-semibold block">Audience Alignment</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-emerald-400">{company.audienceMatchScore}%</span>
            <span className="text-[10px] text-slate-400">Match</span>
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-1">Demographics overlap</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/60 border border-purple-500/20 backdrop-blur-xl space-y-1.5 shadow-lg">
          <span className="text-slate-400 text-xs font-semibold block">Niche Resonance</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-purple-300">{company.nicheMatchScore}%</span>
            <span className="text-[10px] text-slate-400">Category</span>
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-1">Industry relevance</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/60 border border-purple-500/20 backdrop-blur-xl space-y-1.5 shadow-lg">
          <span className="text-slate-400 text-xs font-semibold block">Brand Fit</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-indigo-300">{company.brandFitScore}%</span>
            <span className="text-[10px] text-slate-400">Values</span>
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-1">Tone & creative ethos</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/60 border border-purple-500/20 backdrop-blur-xl space-y-1.5 shadow-lg">
          <span className="text-slate-400 text-xs font-semibold block">Budget Fit</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-teal-300">{company.budgetFitScore}%</span>
            <span className="text-[10px] text-slate-400">Offer</span>
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-1">Rate accommodation</p>
        </div>
      </div>

      {/* 4. Two-Column Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Intelligence (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* About The Brand */}
          <div className="p-6 rounded-2xl bg-slate-950/60 border border-white/10 backdrop-blur-xl space-y-4 shadow-xl">
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-400" />
              <span>About {company.companyName}</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-purple-950/20 p-4 rounded-xl border border-purple-500/15">
              {company.description ||
                'This brand partners with authentic content creators to build high-converting storytelling campaigns, showcase product features, and connect with engaged niche audiences.'}
            </p>

            {company.brandValues && company.brandValues.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold text-slate-400 block">Core Brand Values:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {company.brandValues.map((val, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-xs font-semibold text-purple-200"
                    >
                      {val}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {company.matchReasons && company.matchReasons.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/5">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Why you are a strong match:
                </span>
                <ul className="space-y-1.5 pl-2">
                  {company.matchReasons.map((reason, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-purple-400 font-bold">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Products & Services Showcase */}
          {company.products && company.products.length > 0 && (
            <div className="p-6 rounded-2xl bg-slate-950/60 border border-white/10 backdrop-blur-xl space-y-4 shadow-xl">
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Package className="w-4 h-4 text-purple-400" />
                <span>Featured Products & Services ({company.products.length})</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {company.products.map((prod: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 flex gap-3.5 items-start hover:border-purple-500/40 transition-colors"
                  >
                    {prod.imageUrl ? (
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-16 h-16 rounded-xl object-cover bg-slate-900 border border-white/10 shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-center shrink-0">
                        <Package className="w-6 h-6 text-purple-400" />
                      </div>
                    )}
                    <div className="space-y-1 min-w-0 flex-1">
                      <h3 className="text-xs font-bold text-white truncate">{prod.name}</h3>
                      {prod.price && (
                        <span className="text-xs text-emerald-400 font-extrabold block">{prod.price}</span>
                      )}
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audience Demographics Charts */}
          <div className="p-6 rounded-2xl bg-slate-950/60 border border-white/10 backdrop-blur-xl shadow-xl">
            <CompanyAudienceCharts />
          </div>
        </div>

        {/* Right Column: Campaign Requirements & Pitch CTA (1 col) */}
        <div className="space-y-6">
          {/* Pitch CTA Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-950/80 via-slate-950 to-indigo-950/70 border border-purple-500/30 backdrop-blur-xl shadow-2xl shadow-purple-950/50 space-y-5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 block mb-1">
                Direct Brand Collaboration
              </span>
              <h3 className="text-lg font-black text-white">Ready to Pitch?</h3>
              <p className="text-xs text-slate-300 mt-1">
                Send a custom campaign proposal, propose your rate, or request sample products directly.
              </p>
            </div>

            <div className="space-y-2.5 p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/25">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Campaign Payout:</span>
                <span className="text-emerald-400 font-extrabold">{formatBudget(company.campaignBudget)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Response Rate:</span>
                <span className="text-white font-bold">&lt; 24 Hours</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Escrow Security:</span>
                <span className="text-purple-300 font-bold">100% Guaranteed</span>
              </div>
            </div>

            <button
              onClick={() => onPitch(company)}
              type="button"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-black text-white flex items-center justify-center gap-2 shadow-xl shadow-purple-950/70 border border-purple-400/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Send className="w-4 h-4" />
              <span>Pitch Brand Now</span>
            </button>
          </div>

          {/* Campaign Preferences & Requirements */}
          <div className="p-6 rounded-2xl bg-slate-950/60 border border-white/10 backdrop-blur-xl space-y-4 shadow-xl">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              <span>Collaboration Guidelines</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 block font-semibold">Primary Campaign Goals:</span>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {company.primaryGoals && company.primaryGoals.length > 0 ? (
                    company.primaryGoals.map((g, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-300 font-medium"
                      >
                        {g}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-300">Brand awareness & sales</span>
                  )}
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-white/5">
                <span className="text-slate-400 block font-semibold">Target Platforms:</span>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {company.targetPlatforms && company.targetPlatforms.length > 0 ? (
                    company.targetPlatforms.map((plat, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-md bg-slate-800 border border-white/10 text-white font-medium"
                      >
                        {plat}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-300">Instagram, YouTube, TikTok</span>
                  )}
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-white/5">
                <span className="text-slate-400 block font-semibold">Preferred Creator Tiers:</span>
                <p className="text-white font-medium">
                  {company.creatorTiers?.join(', ') || 'Nano, Micro & Mid Creators'}
                </p>
              </div>

              {company.creatorLocations && company.creatorLocations.length > 0 && (
                <div className="space-y-1 pt-2 border-t border-white/5">
                  <span className="text-slate-400 block font-semibold">Eligible Creator Locations:</span>
                  <p className="text-slate-300 font-medium">
                    {company.creatorLocations.join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Zerify Safety & Trust Badge */}
          <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/20 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Direct Collaboration</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Zerify holds all campaign payments in smart escrow before creator work begins. You are 100% protected against non-payment.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
