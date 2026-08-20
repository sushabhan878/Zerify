'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Globe,
  Building2,
  Sparkles,
  ShieldCheck,
  Package,
  Target,
  DollarSign,
  Send,
  Calendar,
  Layers,
} from 'lucide-react';
import { CompanyItem } from './CompanyCard';
import CompanyAudienceCharts from './CompanyAudienceCharts';

interface CompanyDetailModalProps {
  company: CompanyItem | null;
  onClose: () => void;
  onPitch: (company: CompanyItem) => void;
}

export default function CompanyDetailModal({ company, onClose, onPitch }: CompanyDetailModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!company || !mounted) return null;

  const logoLetter = company.companyName ? company.companyName.charAt(0).toUpperCase() : 'B';

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto no-scrollbar">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl bg-[#0b0819]/90 backdrop-blur-2xl border border-purple-500/25 rounded-3xl shadow-2xl shadow-purple-950/70 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto no-scrollbar selection:bg-purple-500 selection:text-white"
        >
          {/* Ambient Purple Spotlights */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 p-2 rounded-xl bg-purple-950/40 text-slate-400 hover:text-white hover:bg-purple-900/50 transition-colors border border-purple-500/20 z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-start gap-4 relative z-10">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.companyName}
                className="w-16 h-16 rounded-2xl object-cover border border-purple-500/30 bg-purple-950/40 shrink-0 shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center font-black text-white text-2xl shadow-xl shrink-0 border border-purple-400/30">
                {logoLetter}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">{company.companyName}</h2>
                <span title="Verified Brand">
                  <ShieldCheck className="w-5 h-5 text-purple-400" />
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span className="text-purple-300 font-bold">{company.industry}</span>
                {company.location && <span>• {company.location}</span>}
                {company.foundedYear && <span>• Founded {company.foundedYear}</span>}
              </p>

              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 hover:underline pt-1 font-semibold"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{company.website}</span>
                </a>
              )}
            </div>
          </div>

          {/* Match Score Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-purple-900/30 to-indigo-950/40 border border-purple-500/30 backdrop-blur-xl shadow-xl shadow-purple-950/40 flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden group z-10">
            {/* Background Glow Accents */}
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/30 transition-all duration-500" />
            <div className="absolute top-0 left-1/3 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Left: Circular Animated Match Gauge & Text Info */}
            <div className="flex items-center gap-4 w-full sm:w-auto">
              {/* Radial Dial / Mini Gauge */}
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
                    stroke="url(#purpleGradient)"
                    strokeWidth="4.5"
                    strokeDasharray={`${(company.matchScore / 100) * 119.38} 119.38`}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#c084fc" />
                      <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs font-black text-white">{company.matchScore}%</span>
                </div>
              </div>

              {/* Text Info */}
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-purple-300 bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 rounded-md">
                    <Sparkles className="w-3 h-3 text-purple-300" />
                    AI Compatibility Fit
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold hidden sm:inline">
                    • Exceptional Match
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-black text-white tracking-tight">
                  {company.matchScore >= 90 ? 'High Resonance Match' : 'Strong Profile Alignment'}
                </h4>
                <p className="text-[11px] text-slate-300/90 line-clamp-1">
                  Audience demographics and content style align in the top 2% of brand campaigns.
                </p>
              </div>
            </div>

            {/* Right: Pitch Button */}
            <button
              onClick={() => {
                onClose();
                onPitch(company);
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-extrabold text-white flex items-center justify-center gap-2 shadow-lg shadow-purple-950/60 border border-purple-400/30 shrink-0 transition-all hover:scale-[1.03] active:scale-[0.98]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Pitch This Brand</span>
            </button>
          </div>

          {/* Match Score Components */}
          <div className="space-y-2 relative z-10">
            <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Match Score Deep Dive</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-1">
                <span className="text-slate-400 block text-[11px]">Audience Match</span>
                <span className="text-base font-black text-emerald-400">{company.audienceMatchScore}%</span>
              </div>
              <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-1">
                <span className="text-slate-400 block text-[11px]">Niche Fit</span>
                <span className="text-base font-black text-purple-300">{company.nicheMatchScore}%</span>
              </div>
              <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-1">
                <span className="text-slate-400 block text-[11px]">Brand Fit</span>
                <span className="text-base font-black text-indigo-300">{company.brandFitScore}%</span>
              </div>
              <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-1">
                <span className="text-slate-400 block text-[11px]">Budget Fit</span>
                <span className="text-base font-black text-teal-300">{company.budgetFitScore}%</span>
              </div>
            </div>
          </div>

          {/* Company Description & Values */}
          <div className="space-y-3 relative z-10">
            <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">About The Brand</h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-purple-950/20 p-4 rounded-xl border border-purple-500/15">
              {company.description || 'No detailed description provided.'}
            </p>

            {company.brandValues && company.brandValues.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-xs font-bold text-slate-400">Brand Values:</span>
                {company.brandValues.map((v, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-xs text-purple-200 font-semibold"
                  >
                    {v}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Audience Demographics Charts & Regional Intelligence */}
          <div className="relative z-10">
            <CompanyAudienceCharts />
          </div>

          {/* Campaign Goals & Preferences */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-2">
              <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                <Target className="w-4 h-4 text-purple-400" />
                <span>Campaign Goals & Platforms</span>
              </h4>
              <p className="text-xs text-slate-300">
                Primary Goals: <strong className="text-white">{company.primaryGoals?.join(', ') || 'N/A'}</strong>
              </p>
              <p className="text-xs text-slate-300">
                Target Platforms:{' '}
                <strong className="text-purple-300">{company.targetPlatforms?.join(', ') || 'N/A'}</strong>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-2">
              <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Budget & Collaboration Terms</span>
              </h4>
              <p className="text-xs text-slate-300">
                Est. Budget:{' '}
                <strong className="text-emerald-400 font-black">{company.campaignBudget || 'Negotiable'}</strong>
              </p>
              <p className="text-xs text-slate-300">
                Target Tiers:{' '}
                <strong className="text-white">{company.creatorTiers?.join(', ') || 'Nano, Micro, Mid'}</strong>
              </p>
            </div>
          </div>

          {/* Products & Services Showcase */}
          {company.products && company.products.length > 0 && (
            <div className="space-y-3 relative z-10">
              <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-4 h-4 text-purple-400" />
                <span>Products & Services ({company.products.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {company.products.map((prod: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-purple-950/25 border border-purple-500/20 flex gap-3">
                    {prod.imageUrl && (
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-14 h-14 rounded-lg object-cover bg-slate-900 border border-white/5 shrink-0"
                      />
                    )}
                    <div className="space-y-0.5 min-w-0">
                      <h5 className="text-xs font-bold text-white truncate">{prod.name}</h5>
                      <span className="text-[10px] text-emerald-400 font-extrabold block">{prod.price}</span>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{prod.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
