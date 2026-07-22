'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';

const NOTIFICATIONS = [
  { text: '🎉 Sarah (Fashion Creator) joined the VIP Waitlist!', time: '2 mins ago' },
  { text: '⚡ GlowSkin Co. (eCommerce Brand) requested early access!', time: '5 mins ago' },
  { text: '🔥 TechReviewer_99 joined the Creator Network!', time: '12 mins ago' },
  { text: '🚀 Apex Fitness reserved 5 UGC Video Campaign slots!', time: '18 mins ago' },
];

export default function NotificationToast() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show toast every 10 seconds
    const interval = setInterval(() => {
      setVisible(true);
      setIndex((prev) => (prev + 1) % NOTIFICATIONS.length);
      setTimeout(() => {
        setVisible(false);
      }, 5000);
    }, 12000);

    // Initial show after 3 seconds
    const initialTimer = setTimeout(() => {
      setVisible(true);
      setTimeout(() => setVisible(false), 5000);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimer);
    };
  }, []);

  if (!visible) return null;

  const current = NOTIFICATIONS[index];

  return (
    <div className="fixed bottom-6 left-6 z-50 max-w-sm rounded-2xl glass-card p-4 border border-purple-500/30 shadow-2xl shadow-purple-950/40 animate-slide-up flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center shrink-0 text-white font-bold text-xs">
        <Sparkles className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-semibold text-white leading-snug">{current.text}</p>
        <span className="text-[10px] text-purple-400 font-medium">{current.time}</span>
      </div>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="text-slate-400 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
