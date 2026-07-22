'use client';

import React from 'react';
import { Video, Heart, ArrowUp } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="py-12 bg-[#05070B] border-t border-white/10 relative overflow-hidden text-slate-400 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 via-pink-500 to-indigo-600 p-[1px]">
            <div className="w-full h-full bg-[#07090E] rounded-[7px] flex items-center justify-center">
              <Video className="w-4 h-4 text-pink-400" />
            </div>
          </div>
          <span className="font-extrabold text-white text-base tracking-tight">
            ZERIFY<span className="text-pink-500">.</span>
          </span>
        </div>

        {/* Copyright */}
        <div className="flex items-center gap-1 text-slate-400">
          <span>© 2026 Zerify Inc. All rights reserved. Designed for Brands & Creators with</span>
          <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500 inline" />
        </div>

        {/* Back to top */}
        <button
          type="button"
          onClick={scrollToTop}
          className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>
    </footer>
  );
}
