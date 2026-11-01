'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Clock, ArrowRight, Instagram, Youtube, Send } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

export default function RecommendedCampaignsCard() {
  const { formatBudget } = useCurrency();
  const campaigns = [
    {
      title: 'Summer Fitness Apparel Launch',
      brand: 'Aura Fitness',
      budget: '$2,500 - $4,000',
      platforms: ['Instagram', 'YouTube'],
      timeLeft: '3 days left',
    },
    {
      title: 'Next-Gen ANC Earbuds Review',
      brand: 'TechPulse Wearables',
      budget: '$1,800 - $3,000',
      platforms: ['YouTube'],
      timeLeft: '5 days left',
    },
    {
      title: 'Organic Glow Serum Campaign',
      brand: 'Glow Botanicals',
      budget: '$1,200 - $2,200',
      platforms: ['Instagram'],
      timeLeft: '2 days left',
    },
  ];

  return (
    <div className="p-5 rounded-2xl bg-slate-950/45 light:bg-white border border-white/10 light:border-slate-200/90 backdrop-blur-xl shadow-xl light:shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white light:text-slate-900 flex items-center gap-2">
            <Target className="w-4 h-4 text-pink-400 light:text-pink-600" />
            <span>Suggested Campaigns</span>
          </h3>
          <p className="text-xs text-slate-400 light:text-slate-500 mt-0.5">High fit open opportunities accepting applications</p>
        </div>
        <button className="text-xs font-bold text-purple-400 light:text-purple-600 hover:text-purple-300 light:hover:text-purple-800 transition-colors flex items-center gap-1">
          <span>Browse All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-3">
        {campaigns.map((camp, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.07 }}
            className="p-4 rounded-xl bg-slate-950/60 light:bg-slate-50 border border-white/10 light:border-slate-200 hover:border-purple-500/30 light:hover:border-purple-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md light:shadow-sm"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-purple-300 light:text-purple-700 font-semibold">{camp.brand}</span>
                <span className="text-slate-600 light:text-slate-300">•</span>
                <span className="text-[11px] text-slate-400 light:text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500 light:text-slate-400" />
                  {camp.timeLeft}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white light:text-slate-900">{camp.title}</h4>
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs font-black text-emerald-400 light:text-emerald-700">{formatBudget(camp.budget)}</span>
                <div className="flex items-center gap-1.5">
                  {camp.platforms.includes('Instagram') && <Instagram className="w-3.5 h-3.5 text-pink-400 light:text-pink-600" />}
                  {camp.platforms.includes('YouTube') && <Youtube className="w-3.5 h-3.5 text-red-400 light:text-red-600" />}
                </div>
              </div>
            </div>

            <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-xs font-bold text-white keep-white shadow-lg shadow-purple-950/40 hover:scale-105 transition-all flex items-center justify-center gap-1.5 shrink-0">
              <Send className="w-3.5 h-3.5" />
              <span>Apply Now</span>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
