'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Upload, CheckSquare, FileText, Sparkles, Wand2 } from 'lucide-react';

export default function ActionCenterCard() {
  const actions = [
    { title: 'Reply to Aura Fitness', desc: 'Brand requested revised delivery timeline', icon: MessageSquare, badge: 'High Priority', color: 'text-purple-400' },
    { title: 'Upload Nordic Audio Draft', desc: 'Reel script & rough cut ready for review', icon: Upload, badge: 'Draft Ready', color: 'text-indigo-400' },
    { title: 'Review Glow Botanicals Contract', desc: 'Contract awaiting e-signature', icon: FileText, badge: 'Contract', color: 'text-pink-400' },
  ];

  return (
    <div className="p-5 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span>Action Center</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Tasks requiring your attention to keep collaborations moving</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 hover:border-purple-500/30 transition-all flex items-center justify-between gap-3 shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl bg-slate-900 border border-white/10 ${act.color} shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{act.title}</h4>
                  <p className="text-[11px] text-slate-400">{act.desc}</p>
                </div>
              </div>
              <button className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-xs font-bold text-purple-300 transition-colors shrink-0">
                Action
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
