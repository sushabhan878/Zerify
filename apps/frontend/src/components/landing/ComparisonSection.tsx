'use client';

import React from 'react';
import { Check, X, Sparkles } from 'lucide-react';

export default function ComparisonSection() {
  const comparisons = [
    {
      feature: 'Content Delivery Time',
      agency: '3 - 6 Weeks',
      zerify: 'Under 5 Days',
    },
    {
      feature: 'Creator Matching',
      agency: 'Manual Email Outreach',
      zerify: 'Instant AI Matching',
    },
    {
      feature: 'Pricing & Cost',
      agency: '$5,000+ Agency Management Retainer',
      zerify: 'Pay-Per-Video (Starting $59/video)',
    },
    {
      feature: 'Payment Security',
      agency: 'Upfront Invoices with zero guarantee',
      zerify: 'Stripe Escrow (Pay only on approval)',
    },
    {
      feature: 'Ad Usage & Whitelisting Rights',
      agency: '30-Day Limited Rights (Extra Fee)',
      zerify: 'Full Commercial & Digital Ad Rights Included',
    },
    {
      feature: 'Performance Tracking',
      agency: 'Monthly PDF Reports',
      zerify: 'Live Real-Time Dashboard & ROAS Sync',
    },
  ];

  return (
    <section id="why-zerify" className="py-24 relative overflow-hidden bg-[#0A0E17]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-xs font-bold text-pink-400 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Why Brands Choose Zerify</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Old Agency Overhead vs. <span className="text-gradient-accent">The Zerify Engine</span>
          </h2>
          <p className="mt-4 text-slate-400 text-base sm:text-lg">
            See how Zerify saves you thousands of dollars while delivering 5x faster video ad turnarounds.
          </p>
        </div>

        <div className="rounded-3xl glass-card overflow-hidden border border-white/10 shadow-2xl">
          <div className="grid grid-cols-3 bg-slate-900/90 border-b border-white/10 p-4 sm:p-6 font-bold text-xs sm:text-sm text-slate-300">
            <div>Key Capabilities</div>
            <div className="text-slate-400">Traditional Agencies</div>
            <div className="text-purple-400 flex items-center gap-1">
              <span>Zerify Platform</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-[10px] text-pink-300 uppercase">V1</span>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {comparisons.map((item, index) => (
              <div key={index} className="grid grid-cols-3 p-4 sm:p-6 text-xs sm:text-sm items-center hover:bg-white/[0.02] transition-colors">
                <div className="font-semibold text-white">{item.feature}</div>
                <div className="text-slate-400 flex items-center gap-2">
                  <X className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{item.agency}</span>
                </div>
                <div className="font-bold text-emerald-400 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{item.zerify}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
