'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, Filter, Sparkles, Send, Star, Instagram, Youtube, Globe, Heart } from 'lucide-react';

export default function SearchCreatorsSection() {
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('All');

  const creators = [
    { id: 1, name: 'Sarah Jenkins', handle: '@sarah_creativ', category: 'Tech & Lifestyle', reach: '485K', eng: '6.8%', rating: 4.9, platform: 'YouTube', avatarBg: 'bg-purple-600' },
    { id: 2, name: 'Marcus Vance', handle: '@marcus_vfit', category: 'Fitness & Apparel', reach: '620K', eng: '8.1%', rating: 5.0, platform: 'Instagram', avatarBg: 'bg-pink-600' },
    { id: 3, name: 'Elena Rostova', handle: '@elena_glow', category: 'Beauty & Skincare', reach: '290K', eng: '7.4%', rating: 4.8, platform: 'TikTok', avatarBg: 'bg-indigo-600' },
    { id: 4, name: 'Alex Rivera', handle: '@alex_tech', category: 'Gaming & Hardware', reach: '810K', eng: '5.9%', rating: 4.9, platform: 'YouTube', avatarBg: 'bg-cyan-600' },
  ];

  const filtered = creators.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase());
    const matchesPlat = platform === 'All' || c.platform === platform;
    return matchesSearch && matchesPlat;
  });

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            <span>Search & Discover Creators</span>
          </h2>
          <p className="text-xs text-slate-400">Explore vetted influencers across YouTube, Instagram, and TikTok</p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, handle, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Platform Filters */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-500 shrink-0 mr-1" />
        {['All', 'YouTube', 'Instagram', 'TikTok'].map((plat) => (
          <button
            key={plat}
            onClick={() => setPlatform(plat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all shrink-0 ${
              platform === plat
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
                : 'bg-slate-900 border border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {plat}
          </button>
        ))}
      </div>

      {/* Grid of Creators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((creator) => (
          <motion.div
            key={creator.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between space-y-4 hover:border-purple-500/40 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full ${creator.avatarBg} text-white font-black text-base flex items-center justify-center border border-white/20 shrink-0`}>
                  {creator.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">{creator.name}</h3>
                  <span className="text-[11px] text-purple-400 font-semibold block">{creator.handle}</span>
                  <span className="text-[10px] text-slate-400">{creator.category}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                <Star className="w-3 h-3 fill-amber-400" />
                <span>{creator.rating}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-white/5 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Reach</span>
                <span className="font-black text-white">{creator.reach}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Engagement Rate</span>
                <span className="font-black text-emerald-400">{creator.eng}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-950/40">
                <Send className="w-3.5 h-3.5" />
                <span>Invite to Campaign</span>
              </button>
              <button className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-pink-400 transition-colors" title="Bookmark Creator">
                <Heart className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
