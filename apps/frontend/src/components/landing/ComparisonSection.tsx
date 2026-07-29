'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Sparkles, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ComparisonSection() {
  const comparisons = [
    {
      feature: 'Collaboration Model',
      agency: 'Opaque Middleman & 50%+ Retainers',
      zerify: 'Direct Brand & Creator Platform',
    },
    {
      feature: 'Campaign Setup',
      agency: 'Manual Email Chains & PDF Decks',
      zerify: 'Structured Automated AI Briefing',
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
    <section id="why-zerify" className="py-28 relative overflow-hidden bg-[#07090E]">
      {/* Background Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-purple-600/15 rounded-full blur-[170px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[350px] bg-pink-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-300 uppercase tracking-widest backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Why Brands &amp; Creators Choose Zerify</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-[1.15] [font-family:'Playfair_Display',Georgia,serif]">
            Traditional Agency Overhead vs.{' '}
            <span className="italic font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300">
              The Zerify Platform
            </span>
          </h2>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            See how Zerify eliminates traditional middleman fees while enabling direct collaboration and 5x faster campaign execution.
          </p>
        </div>

        {/* 2-Column Side-by-Side Overlapping Card Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Column 1: Traditional Agency (Sluggish / Outdated) */}
          <div className="lg:col-span-5 rounded-3xl bg-slate-950/70 border border-white/10 p-6 sm:p-8 backdrop-blur-xl flex flex-col justify-between space-y-6">
            <div className="space-y-3 pb-4 border-b border-white/10">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                Old Agency Model
              </span>
              <h3 className="text-xl font-bold text-slate-300">Traditional Ad Agencies</h3>
              <p className="text-xs text-slate-400">High overhead, slow turnarounds, zero direct communication.</p>
            </div>

            <div className="space-y-5 flex-1">
              {comparisons.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{item.feature}</p>
                  <p className="text-xs font-medium text-slate-300 flex items-center gap-2">
                    <X className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>{item.agency}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: The Zerify Platform (Elevated Glowing Hero Card) */}
          <div className="lg:col-span-7 relative">
            {/* Spinning Conic Gradient Border Wrapper */}
            <div className="relative p-[1.5px] rounded-[2.2rem] overflow-hidden shadow-[0_25px_60px_rgba(168,85,247,0.3)] h-full">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-[200%] bg-[conic-gradient(from_0deg,#c084fc,#f472b6,#818cf8,#38bdf8,#c084fc)] opacity-85 blur-[2px]"
              />

              <div className="relative z-10 rounded-[2.1rem] bg-[#0b0f19]/95 p-6 sm:p-8 backdrop-blur-2xl h-full flex flex-col justify-between space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/15">
                  <div>
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-purple-400" /> Zerify Direct Platform
                    </span>
                    <h3 className="text-2xl font-bold text-white mt-1">Direct Brand &amp; Creator Network</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-extrabold border border-emerald-500/30">
                    5x Faster Execution
                  </span>
                </div>

                {/* Zerify Advantage Items with Smooth Hover Animations */}
                <div className="space-y-4 flex-1">
                  {comparisons.map((item, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ x: 6 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/30 flex items-center justify-between shadow-lg hover:border-purple-500/60 transition-colors"
                    >
                      <div>
                        <p className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">{item.feature}</p>
                        <p className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 stroke-[3]" />
                          <span>{item.zerify}</span>
                        </p>
                      </div>
                      <ShieldCheck className="w-4 h-4 text-purple-400 opacity-60 shrink-0" />
                    </motion.div>
                  ))}
                </div>

                {/* Bottom CTA Pill */}
                <div className="pt-2 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>No agency cut. Pure direct value.</span>
                  </div>
                  <a
                    href="#waitlist"
                    className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white text-xs font-extrabold shadow-lg shadow-purple-500/30 transition-all flex items-center gap-2 group whitespace-nowrap"
                  >
                    <span>Register for early access</span>
                    <ArrowRight className="w-3.5 h-3.5 transform transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
