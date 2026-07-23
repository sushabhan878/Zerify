'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowUp } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="py-12 bg-[#05070B] border-t border-white/10 relative overflow-hidden text-slate-400 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Zerify Logo"
            width={28}
            height={28}
            className="object-contain"
          />
          <span className="font-extrabold text-white text-base tracking-tight">
            ZERIFY<span className="text-purple-500">.</span>
          </span>
        </div>

        {/* Copyright */}
        <div className="text-slate-400 text-center sm:text-left">
          © 2026 Zerify Inc. All rights reserved. Direct Collaboration Platform for Brands & Influencers.
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
