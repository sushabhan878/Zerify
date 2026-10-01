'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';

const NOTIFICATIONS = [
  { text: 'Sarah (Fashion Creator) joined the VIP Waitlist', time: '2 mins ago' },
  { text: 'GlowSkin Co. requested early platform access', time: '5 mins ago' },
  { text: 'TechReviewer_99 joined the Creator Network', time: '12 mins ago' },
  { text: 'Apex Brands reserved campaign collaboration slots', time: '18 mins ago' },
];

export default function NotificationToast() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(true);
      setIndex((prev) => (prev + 1) % NOTIFICATIONS.length);
      setTimeout(() => {
        setVisible(false);
      }, 5000);
    }, 12000);

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
    <div className="fixed bottom-6 left-6 z-50 max-w-sm rounded-2xl bg-slate-950/90 p-4 border border-purple-500/30 backdrop-blur-xl shadow-2xl flex items-start gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center shrink-0 text-white font-bold text-xs">
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
        <X className="w-4 h-4 text-xs" />
      </button>
    </div>
  );
}
