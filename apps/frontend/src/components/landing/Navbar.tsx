'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';

export default function Navbar() {
  const [platformOpen, setPlatformOpen] = useState(false);

  return (
    <header className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-6xl transition-all duration-300">
      {/* 3D Glass Pill Container with Full-Width Bottom Lighting & Downward Shadow */}
      <div className="relative px-6 py-3.5 rounded-full bg-white/[0.05] border-none backdrop-blur-xl shadow-[0_8px_16px_-2px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.15)] flex items-center justify-between transition-all duration-300 hover:bg-white/[0.08]">

        {/* Full-Width Bottom Ambient Lighting Rim */}
        <div className="absolute -bottom-0.5 left-4 right-4 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-[2px] rounded-full pointer-events-none" />

        {/* Brand Logo */}
        <div className="flex items-center gap-3 z-10">
          <a href="#waitlist" className="flex items-center gap-3 group" aria-label="Zerify Home">
            <div className="relative w-10 h-10 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Image
                src="/logo.png"
                alt="Zerify Logo"
                width={56}
                height={56}
                className="object-contain w-full h-full scale-125 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
              />
            </div>
          </a>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-white/90 z-10">
          <div className="relative">
            <button
              onClick={() => setPlatformOpen(!platformOpen)}
              className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors duration-200 focus:outline-none py-1 drop-shadow-sm"
            >
              <span>Platform</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${platformOpen ? 'rotate-180 text-white' : 'text-white/70'}`} />
            </button>

            {platformOpen && (
              <div className="absolute top-full left-0 mt-3 w-56 rounded-2xl bg-slate-950/90 border border-white/25 backdrop-blur-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.3)] flex flex-col gap-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <a
                  href="#platform"
                  className="px-3.5 py-2 text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                  onClick={() => setPlatformOpen(false)}
                >
                  Platform Showcase &amp; Dashboards
                </a>
                <a
                  href="#features"
                  className="px-3.5 py-2 text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                  onClick={() => setPlatformOpen(false)}
                >
                  AI Match &amp; Campaign Tools
                </a>
                <a
                  href="#how-it-works"
                  className="px-3.5 py-2 text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                  onClick={() => setPlatformOpen(false)}
                >
                  3-Step Workflow
                </a>
                <a
                  href="#why-zerify"
                  className="px-3.5 py-2 text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                  onClick={() => setPlatformOpen(false)}
                >
                  Why Zerify vs Agencies
                </a>
              </div>
            )}
          </div>

          <a href="#features" className="hover:text-white transition-colors duration-200 py-1 drop-shadow-sm">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-white transition-colors duration-200 py-1 drop-shadow-sm">
            How It Works
          </a>
          <a href="#success-stories" className="hover:text-white transition-colors duration-200 py-1 drop-shadow-sm">
            Success Stories
          </a>
          <a href="#why-zerify" className="hover:text-white transition-colors duration-200 py-1 drop-shadow-sm">
            Why Zerify
          </a>
          <a href="#faq" className="hover:text-white transition-colors duration-200 py-1 drop-shadow-sm">
            FAQ
          </a>
        </nav>

        {/* Right Actions - Coming Soon & Early Access Button */}
        <div className="flex items-center gap-3 z-10">
          <a
            href="#waitlist"
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/15 border border-purple-400/30 hover:bg-purple-500/25 text-xs font-semibold text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shadow-[0_0_8px_rgba(192,132,252,0.8)]"></span>
            <span>Early Access</span>
          </a>
        </div>

      </div>
    </header>
  );
}
