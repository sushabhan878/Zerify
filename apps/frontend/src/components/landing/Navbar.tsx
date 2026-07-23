'use client';

import React from 'react';
import Image from 'next/image';

export default function Navbar() {
  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-6xl transition-all duration-300">
      <div className="px-5 py-3 rounded-full bg-slate-950/75 border border-white/10 backdrop-blur-xl shadow-2xl shadow-purple-950/30 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-3 group" aria-label="Zerify Home">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-300">
            <Image
              src="/logo.png"
              alt="Zerify Logo"
              width={48}
              height={48}
              className="object-contain w-full h-full"
            />
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-300">
          <a href="#features" className="hover:text-white transition-colors duration-200">
            For Brands
          </a>
          <a href="#creators" className="hover:text-white transition-colors duration-200">
            For Influencers
          </a>
          <a href="#why-zerify" className="hover:text-white transition-colors duration-200">
            Why Zerify
          </a>
          <a href="#faq" className="hover:text-white transition-colors duration-200">
            FAQ
          </a>
        </nav>

        {/* Coming Soon Tag */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[11px] font-medium text-purple-300">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
            <span>Coming Soon</span>
          </div>
        </div>
      </div>
    </header>
  );
}
