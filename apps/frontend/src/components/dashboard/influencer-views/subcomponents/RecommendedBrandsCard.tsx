'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles, Clock, ArrowRight, Building2 } from 'lucide-react';

export default function RecommendedBrandsCard() {
  const brands = [
    {
      name: 'Aura Fitness',
      industry: 'Health & Apparel',
      matchPct: '98%',
      campaigns: 3,
      responseTime: '< 2 hrs',
      verified: true,
      accent: 'from-purple-500/20 to-pink-500/20',
    },
    {
      name: 'TechPulse Wearables',
      industry: 'Consumer Tech',
      matchPct: '94%',
      campaigns: 2,
      responseTime: '< 4 hrs',
      verified: true,
      accent: 'from-cyan-500/20 to-blue-500/20',
    },
    {
      name: 'Glow Botanicals',
      industry: 'Skincare & Beauty',
      matchPct: '91%',
      campaigns: 5,
      responseTime: '< 1 hr',
      verified: true,
      accent: 'from-emerald-500/20 to-teal-500/20',
    },
  ];

  return (
    <div className="p-5 rounded-2xl bg-slate-950/45 light:bg-white border border-white/10 light:border-slate-200/90 backdrop-blur-xl shadow-xl light:shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white light:text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400 light:text-purple-600" />
            <span>AI Recommended Brands</span>
          </h3>
          <p className="text-xs text-slate-400 light:text-slate-500 mt-0.5">Matched based on your target audience and engagement history</p>
        </div>
        <button className="text-xs font-bold text-purple-400 light:text-purple-600 hover:text-purple-300 light:hover:text-purple-800 transition-colors flex items-center gap-1">
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {brands.map((brand, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="p-4 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-white/10 light:border-slate-200 hover:border-purple-500/30 light:hover:border-purple-300 transition-all flex flex-col justify-between space-y-3 shadow-lg light:shadow-sm"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-purple-950/60 light:from-purple-50 light:to-indigo-50 border border-purple-500/20 light:border-slate-200 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-purple-300 light:text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white light:text-slate-900 flex items-center gap-1.5">
                      <span>{brand.name}</span>
                      {brand.verified && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 light:text-purple-600 shrink-0" />}
                    </h4>
                    <span className="text-[11px] text-slate-400 light:text-slate-500 font-medium">{brand.industry}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/10 light:bg-purple-50 border border-purple-500/20 light:border-purple-200 text-[10px] font-extrabold text-purple-300 light:text-purple-700 shrink-0">
                  {brand.matchPct} Match
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 light:text-slate-500 pt-2 border-t border-white/5 light:border-slate-200">
                <span>{brand.campaigns} Active Campaigns</span>
                <span className="flex items-center gap-1 text-slate-400 light:text-slate-500">
                  <Clock className="w-3 h-3 text-slate-400 light:text-slate-500" />
                  {brand.responseTime}
                </span>
              </div>
            </div>

            <button className="w-full py-2 rounded-xl bg-purple-600/20 light:bg-purple-50 hover:bg-purple-600/30 light:hover:bg-purple-100 border border-purple-500/30 light:border-purple-200 text-xs font-bold text-purple-300 light:text-purple-700 hover:text-white light:hover:text-purple-900 transition-all">
              View Brand
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
