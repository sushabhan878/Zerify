'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Building2, Sparkles, Send, Globe, Filter } from 'lucide-react';

export default function CompanyDiscoverySection() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const categories = ['All', 'Tech & AI', 'Fashion & Apparel', 'Fitness & Wellness', 'Gaming & Hardware'];

  const companies = [
    { id: 1, name: 'Apex Gear', category: 'Fitness & Wellness', match: '98%', budget: '$2.5K - $5K', desc: 'Looking for creators in fitness & tech for Q3 apparel launch.', logoBg: 'bg-emerald-500/20 text-emerald-400' },
    { id: 2, name: 'CyberPulse AI', category: 'Tech & AI', match: '96%', budget: '$4K - $10K', desc: 'Seeking tech reviewers for SaaS platform video sponsorships.', logoBg: 'bg-purple-500/20 text-purple-400' },
    { id: 3, name: 'Aura Skincare', category: 'Fashion & Apparel', match: '92%', budget: '$1.5K - $3K', desc: 'Beauty & lifestyle creators for Instagram reels product showcase.', logoBg: 'bg-pink-500/20 text-pink-400' },
    { id: 4, name: 'HyperDrive Gaming', category: 'Gaming & Hardware', match: '91%', budget: '$3K - $7K', desc: 'Custom gaming setups and headset unboxing stream integrations.', logoBg: 'bg-cyan-500/20 text-cyan-400' },
  ];

  const filtered = companies.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.desc.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === 'All' || c.category === category;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Search & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-400" />
            <span>Company Discovery Directory</span>
          </h2>
          <p className="text-xs text-slate-400">Find brands looking for creators matching your profile niche</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search brands or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-slate-500 shrink-0 mr-1" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all shrink-0 ${
              category === cat
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
                : 'bg-slate-900 border border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Companies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((company) => (
          <motion.div
            key={company.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between space-y-4 hover:border-purple-500/40 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${company.logoBg} flex items-center justify-center font-black text-sm`}>
                    {company.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">{company.name}</h3>
                    <span className="text-[11px] text-slate-400">{company.category}</span>
                  </div>
                </div>

                <div className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-[10px] font-black text-purple-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>{company.match} Match</span>
                </div>
              </div>

              <p className="text-xs text-slate-300">{company.desc}</p>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-bold">Est. Budget Range</span>
                <span className="text-xs font-black text-emerald-400">{company.budget}</span>
              </div>

              <button className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-purple-600 border border-white/10 hover:border-purple-500 text-xs font-extrabold text-white flex items-center gap-1.5 transition-all">
                <Send className="w-3.5 h-3.5" />
                <span>Pitch Brand</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
