'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Send } from 'lucide-react';

export default function DiscoverView() {
  const creators = [
    { name: 'Sophia Chen', handle: '@sophiastyle', followers: '240K', engagement: '4.8%', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
    { name: 'Marcus Vance', handle: '@marcusvance', followers: '510K', engagement: '6.2%', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
    { name: 'Elena Rostova', handle: '@elenafit', followers: '185K', engagement: '5.4%', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
  ];

  return (
    <motion.div
      key="discover"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      className="bg-slate-900 rounded-2xl p-6 border border-white/10 text-white min-h-[520px] flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div>
            <h3 className="text-2xl font-bold">Creator Discovery Engine</h3>
            <p className="text-xs text-slate-400">Search & filter over 100,000+ verified influencers across platforms</p>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search niche, location..."
              className="bg-slate-950 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {creators.map((creator, i) => (
            <div key={i} className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-4 hover:border-purple-500/50 transition-all">
              <div className="flex items-center gap-3">
                <img src={creator.img} alt={creator.name} className="w-12 h-12 rounded-full object-cover border border-purple-500/40" />
                <div>
                  <h4 className="text-sm font-bold text-white">{creator.name}</h4>
                  <p className="text-xs text-purple-400 font-medium">{creator.handle}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/10">
                <div>
                  <p className="text-[10px] text-slate-400">Followers</p>
                  <p className="font-bold text-white">{creator.followers}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Engagement</p>
                  <p className="font-bold text-emerald-400">{creator.engagement}</p>
                </div>
              </div>
              <button className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors">
                <Send className="w-3.5 h-3.5" /> Direct Invite
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
