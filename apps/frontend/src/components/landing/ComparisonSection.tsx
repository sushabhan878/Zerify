'use client';

import React from 'react';
import { Check, X, Sparkles } from 'lucide-react';

export default function ComparisonSection() {
  const comparisons = [
    {
      feature: 'Collaboration Model',
      agency: 'Opaque Middleman & High Retainers',
      zerify: 'Direct Brand & Creator Platform',
    },
    {
      feature: 'Campaign Setup',
      agency: 'Manual Email Chains & PDF Decks',
      zerify: 'Structured Automated Briefing',
    },
    {
      feature: 'Turnaround Time',
      agency: '3 to 6 Weeks per Campaign',
      zerify: 'Under 5 Days Direct Delivery',
    },
    {
      feature: 'Payment Safety',
      agency: 'Upfront Non-Refundable Invoices',
      zerify: 'Secure Escrow (Release on Approval)',
    },
    {
      feature: 'Usage & Rights',
      agency: 'Restricted 30-Day Ad Rights',
      zerify: 'Full Digital & Commercial Licensing',
    },
    {
      feature: 'Analytics & Tracking',
      agency: 'Static Monthly PDF Reports',
      zerify: 'Real-Time ROAS & Reach Dashboard',
    },
  ];

  return (
    <section id="why-zerify" className="py-24 relative overflow-hidden bg-[#0A0E17]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Why Brands & Influencers Choose Zerify</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Traditional Agency Overhead vs.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              The Zerify Platform
            </span>
          </h2>
          <p className="mt-4 text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
            See how Zerify eliminates agency fees while enabling transparent, direct collaborations and 5x faster content execution.
          </p>
        </div>

        <div className="rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-3 bg-slate-950/90 border-b border-white/10 p-4 sm:p-6 font-bold text-xs sm:text-sm text-slate-300">
            <div>Core Capabilities</div>
            <div className="text-slate-400">Traditional Ad Agencies</div>
            <div className="text-purple-400 flex items-center gap-1.5">
              <span>Zerify Platform</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-[10px] text-purple-300 font-semibold">DIRECT</span>
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
