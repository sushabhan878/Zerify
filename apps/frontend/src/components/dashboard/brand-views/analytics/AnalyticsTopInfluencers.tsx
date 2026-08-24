'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Star, Eye, ExternalLink } from 'lucide-react';

interface TopCreatorItem {
  id: string;
  name: string;
  handle: string;
  platform: string;
  er: string;
  reach: string;
  avatarBg: string;
  avatarInitial: string;
}

export default function AnalyticsTopInfluencers() {
  const influencers: TopCreatorItem[] = [
    {
      id: 'creator-a',
      name: 'Sarah Jenkins',
      handle: '@sarah_creativ',
      platform: 'YouTube',
      er: '9.2% ER',
      reach: '485K',
      avatarBg: 'bg-purple-600',
      avatarInitial: 'S',
    },
    {
      id: 'creator-b',
      name: 'Marcus Vance',
      handle: '@marcus_vfit',
      platform: 'Instagram',
      er: '8.7% ER',
      reach: '620K',
      avatarBg: 'bg-pink-600',
      avatarInitial: 'M',
    },
    {
      id: 'creator-c',
      name: 'Elena Rostova',
      handle: '@elena_glow',
      platform: 'TikTok',
      er: '8.1% ER',
      reach: '290K',
      avatarBg: 'bg-indigo-600',
      avatarInitial: 'E',
    },
    {
      id: 'creator-d',
      name: 'Alex Rivera',
      handle: '@alex_tech',
      platform: 'YouTube',
      er: '7.5% ER',
      reach: '810K',
      avatarBg: 'bg-cyan-600',
      avatarInitial: 'A',
    },
  ];

  return (
    <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400 border border-pink-500/30">
            <Users className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black text-white">Top Performing Influencers</h3>
        </div>
        <span className="text-xs font-bold text-slate-400">By engagement output</span>
      </div>

      <div className="space-y-2.5">
        {influencers.map((creator, idx) => (
          <motion.div
            key={creator.id}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 hover:border-pink-500/30 transition-all flex items-center justify-between gap-3 group"
          >
            {/* Creator Info */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-full ${creator.avatarBg} text-white font-black text-xs flex items-center justify-center border border-white/20 shrink-0`}
              >
                {creator.avatarInitial}
              </div>
              <div className="truncate">
                <h4 className="text-xs font-bold text-white group-hover:text-pink-300 transition-colors truncate">
                  {creator.name}
                </h4>
                <span className="text-[10.5px] text-slate-400 truncate block">
                  {creator.handle} · {creator.platform}
                </span>
              </div>
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
                  <Eye className="w-2.5 h-2.5" /> Reach
                </span>
                <span className="text-xs font-bold text-slate-300">{creator.reach}</span>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  {creator.er}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
