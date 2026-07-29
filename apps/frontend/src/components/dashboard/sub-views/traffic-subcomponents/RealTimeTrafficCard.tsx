'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Radio, Users, MousePointer, Send, MessageSquare } from 'lucide-react';

export default function RealTimeTrafficCard() {
  const liveStats = [
    { label: 'Active Live Visitors', val: '42', change: 'Live Now', icon: Users, color: 'text-purple-400' },
    { label: 'Current Link Clicks', val: '128', change: 'Past hour', icon: MousePointer, color: 'text-pink-400' },
    { label: 'Live Applications', val: '6', change: 'Active today', icon: Send, color: 'text-emerald-400' },
    { label: 'Unread Brand Messages', val: '3', change: 'Needs reply', icon: MessageSquare, color: 'text-indigo-400' },
  ];

  return (
    <div className="p-5 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <h3 className="text-base font-bold text-white">Real-Time Activity</h3>
        </div>
        <span className="text-xs font-semibold text-slate-400">Updates every 5s</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {liveStats.map((st, idx) => {
          const Icon = st.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 space-y-1 shadow-md"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>{st.label}</span>
                <Icon className={`w-3.5 h-3.5 ${st.color}`} />
              </div>
              <div className="text-xl font-black text-white">{st.val}</div>
              <span className="text-[10px] font-bold text-emerald-400">{st.change}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
