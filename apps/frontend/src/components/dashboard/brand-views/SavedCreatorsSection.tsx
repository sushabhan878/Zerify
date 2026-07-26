'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Send, Trash2, Tag } from 'lucide-react';

export default function SavedCreatorsSection() {
  const saved = [
    { id: 1, name: 'Sarah Jenkins', handle: '@sarah_creativ', tag: 'Tech Launch', reach: '485K', eng: '6.8%' },
    { id: 2, name: 'Marcus Vance', handle: '@marcus_vfit', tag: 'Q3 Fitness', reach: '620K', eng: '8.1%' },
    { id: 3, name: 'David Kim', handle: '@tech_dk', tag: 'Software Demo', reach: '320K', eng: '7.2%' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-purple-400" />
            <span>Saved Creators Library</span>
          </h2>
          <p className="text-xs text-slate-400">Creators bookmarked for upcoming campaign rosters</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {saved.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-3 hover:border-purple-500/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center border border-white/20 shrink-0">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white truncate">{item.name}</h3>
                  <span className="text-[11px] text-purple-400 font-semibold block">{item.handle}</span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-[10px] font-bold text-purple-300 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                <span>{item.tag}</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/40 p-2 rounded-xl border border-white/5">
              <span>Reach: <strong className="text-white">{item.reach}</strong></span>
              <span>Eng: <strong className="text-emerald-400">{item.eng}</strong></span>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow-md">
                <Send className="w-3.5 h-3.5" />
                <span>Pitch</span>
              </button>
              <button className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/30 text-slate-400 hover:text-rose-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
