'use client';

import React from 'react';
import { ShieldCheck, Zap, Users, BarChart3, MessageSquare, Handshake } from 'lucide-react';

export default function FeatureGrid() {
  const features = [
    {
      icon: Handshake,
      color: 'from-purple-500 to-indigo-500',
      title: 'Direct Creator Collaboration',
      description: 'Connect directly with verified influencers and eCommerce brands. No middleman ad agencies or manual outreach required.',
    },
    {
      icon: MessageSquare,
      color: 'from-pink-500 to-rose-500',
      title: 'Structured Campaign Briefs',
      description: 'Brands send clear campaign conditions and product details directly to creators. Creators accept and submit content within set timelines.',
    },
    {
      icon: ShieldCheck,
      color: 'from-emerald-500 to-teal-500',
      title: 'Escrow Protection & Usage Rights',
      description: 'Campaign funds are held securely until content is reviewed and approved. Includes full commercial usage and digital licensing rights.',
    },
    {
      icon: BarChart3,
      color: 'from-purple-500 to-pink-500',
      title: 'Verified Performance Analytics',
      description: 'Track reach, engagements, and ROAS metrics directly within your unified Zerify dashboard to scale successful partnerships.',
    },
  ];

  return (
    <section id="features" className="py-24 relative overflow-hidden bg-[#07090E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400 mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>Built for Direct Brand & Creator Partnerships</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            A Platform Built for Collaboration, <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
              Not Agency Markups
            </span>
          </h2>
          <p className="mt-4 text-slate-400 text-base sm:text-lg">
            Zerify provides the infrastructure for brands and creators to discover each other, send briefs, verify performance, and manage payouts directly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative rounded-3xl p-8 bg-slate-900/80 border border-white/10 backdrop-blur-xl hover:border-purple-500/40 transition-all duration-300 shadow-xl"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${feature.color} p-0.5 shadow-lg mb-6 group-hover:scale-105 transition-transform duration-300`}>
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
