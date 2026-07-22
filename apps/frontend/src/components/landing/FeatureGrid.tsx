'use client';

import React from 'react';
import { Sparkles, ShieldCheck, Zap, Video, BarChart3, Users, DollarSign, Bot } from 'lucide-react';

export default function FeatureGrid() {
  const features = [
    {
      icon: Bot,
      color: 'from-purple-500 to-indigo-500',
      title: 'AI Smart Creator Matching',
      description: 'Our AI engine analyzes millions of creator data points, past ROAS, engagement rates, and audience demographics to instantly match your brand with top-converting influencers.',
    },
    {
      icon: Video,
      color: 'from-pink-500 to-rose-500',
      title: 'Turnkey UGC Video Production',
      description: 'Order authentic 15-60 second video ads tailored for TikTok, Instagram Reels, YouTube Shorts, and Meta Ads. Delivered in high resolution within 5 days.',
    },
    {
      icon: ShieldCheck,
      color: 'from-emerald-500 to-teal-500',
      title: 'Escrow Payments & Usage Rights',
      description: 'Funds are securely held in Stripe Escrow until you approve the final video. All videos come with full commercial rights and whitelisting support.',
    },
    {
      icon: BarChart3,
      color: 'from-amber-500 to-orange-500',
      title: 'Real-Time ROAS & Analytics',
      description: 'Track ad engagement, click-through rates, and conversion metrics in your unified Zerify dashboard. Double down on winning creator videos.',
    },
  ];

  return (
    <section id="features" className="py-24 relative overflow-hidden bg-[#07090E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-400 mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>Built for Modern eCommerce & Creators</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Everything You Need to Scale <br className="hidden sm:block" />
            <span className="text-gradient-accent">Creator Content on Autopilot</span>
          </h2>
          <p className="mt-4 text-slate-400 text-base sm:text-lg">
            Say goodbye to endless DMs, agency markups, and unvetted creators. Zerify automates the entire UGC workflow from brief to high-ROAS ad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative rounded-3xl p-8 glass-card glass-card-hover border border-white/10 hover:border-purple-500/30 transition-all"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${feature.color} p-0.5 shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
