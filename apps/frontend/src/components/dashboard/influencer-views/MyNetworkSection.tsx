'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, MessageCircle, Sparkles } from 'lucide-react';

export default function MyNetworkSection() {
  const members = [
    { id: 1, name: 'David Kim', handle: '@tech_dk', role: 'Tech & Gaming Creator', followers: '320K', mutuals: '12 Mutual Creators' },
    { id: 2, name: 'Sophia Chen', handle: '@sophiastyle', role: 'Fashion & Lifestyle', followers: '510K', mutuals: '8 Mutual Creators' },
    { id: 3, name: 'Liam O\'Connor', handle: '@liamvlogs', role: 'Travel & Vlogger', followers: '190K', mutuals: '15 Mutual Creators' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            <span>My Creator Network</span>
          </h2>
          <p className="text-xs text-slate-400">Connect with fellow influencers for co-creations & brand referrals</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-3 hover:border-purple-500/30 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 text-white font-black text-sm flex items-center justify-center border border-white/20 shrink-0">
                {m.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <h3 className="text-sm font-bold text-white truncate">{m.name}</h3>
                <span className="text-[11px] text-purple-400 font-semibold truncate block">{m.handle}</span>
              </div>
            </div>

            <div className="text-xs text-slate-300 space-y-1 bg-slate-950/40 p-2.5 rounded-xl border border-white/5">
              <p className="font-semibold text-slate-200">{m.role}</p>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{m.followers} Followers</span>
                <span>{m.mutuals}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white flex items-center justify-center gap-1 transition-all shadow-md">
                <UserPlus className="w-3.5 h-3.5" />
                <span>Connect</span>
              </button>
              <button className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
