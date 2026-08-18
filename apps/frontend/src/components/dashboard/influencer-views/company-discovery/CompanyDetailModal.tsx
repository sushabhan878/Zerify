'use client';

import React from 'react';
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

interface CompanyDetailModalProps {
  company: CompanyItem | null;
  onClose: () => void;
  onPitch: (company: CompanyItem) => void;
}

export default function CompanyDetailModal({ company, onClose, onPitch }: CompanyDetailModalProps) {
  if (!company) return null;

  const logoLetter = company.companyName ? company.companyName.charAt(0).toUpperCase() : 'B';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-3xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-start gap-4">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.companyName}
                className="w-16 h-16 rounded-2xl object-cover border border-white/10 bg-slate-800 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center font-black text-white text-2xl shadow-xl shrink-0">
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
                  className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:underline pt-1 font-semibold"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{company.website}</span>
                </a>
              )}
            </div>
          </div>

          {/* Match Score Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-purple-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-extrabold text-purple-300 block">Zerify Match Score</span>
                <span className="text-lg font-black text-white">{company.matchScore}% Overall Compatibility</span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onPitch(company);
              }}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-black text-white flex items-center gap-2 shadow-lg shadow-purple-950/60"
            >
              <Send className="w-4 h-4" />
              <span>Pitch This Brand</span>
            </button>
          </div>

          {/* Match Score Components */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Match Score Deep Dive</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/50 border border-white/5 space-y-1">
                <span className="text-slate-400 block text-[11px]">Audience Match</span>
                <span className="text-base font-black text-emerald-400">{company.audienceMatchScore}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/50 border border-white/5 space-y-1">
                <span className="text-slate-400 block text-[11px]">Niche Fit</span>
                <span className="text-base font-black text-purple-300">{company.nicheMatchScore}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/50 border border-white/5 space-y-1">
                <span className="text-slate-400 block text-[11px]">Brand Fit</span>
                <span className="text-base font-black text-blue-300">{company.brandFitScore}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/50 border border-white/5 space-y-1">
                <span className="text-slate-400 block text-[11px]">Budget Fit</span>
                <span className="text-base font-black text-teal-300">{company.budgetFitScore}%</span>
              </div>
            </div>
          </div>

          {/* Company Description & Values */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">About The Brand</h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-white/5">
              {company.description || 'No detailed description provided.'}
            </p>

            {company.brandValues && company.brandValues.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-xs font-bold text-slate-400">Brand Values:</span>
                {company.brandValues.map((v, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-full bg-slate-800 border border-white/10 text-xs text-slate-300 font-semibold"
                  >
                    {v}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Campaign Goals & Preferences */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5 space-y-2">
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

            <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5 space-y-2">
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
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-4 h-4 text-purple-400" />
                <span>Products & Services ({company.products.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {company.products.map((prod: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-white/10 flex gap-3">
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
    </AnimatePresence>
  );
}
