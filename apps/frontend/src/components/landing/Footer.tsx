'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#07090E] border-t border-white/10 text-slate-300 text-sm pt-16 pb-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main Grid: Left 4 Navigation Columns + Right Brand / CTA Column */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 items-start">

          {/* Left Section: 4 Columns (Span 8) */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {/* Column 1: By Business Type & By Feature */}
            <div className="space-y-6">
              <div className="space-y-2.5">
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">By business type</h5>
                <ul className="space-y-2 font-medium text-slate-200 text-sm">
                  <li><a href="/#waitlist" className="hover:text-purple-400 transition-colors">For brands</a></li>
                  <li>
                    <a
                      href="https://agency.zerify.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-purple-400 transition-colors flex items-center gap-1 text-purple-300 font-semibold"
                    >
                      <span>For agencies</span>
                      <span className="text-[10px]">↗</span>
                    </a>
                  </li>
                </ul>
              </div>

              <div className="space-y-2.5">
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">By feature</h5>
                <ul className="space-y-2 font-medium text-slate-200 text-sm">
                  <li><a href="/#showcase" className="hover:text-purple-400 transition-colors">Partnerships hub</a></li>
                  <li><a href="/#showcase" className="hover:text-purple-400 transition-colors">CreativeOps</a></li>
                </ul>
              </div>
            </div>

            {/* Column 2: Resources */}
            <div className="space-y-2.5">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Resources</h5>
              <ul className="space-y-2 font-medium text-slate-200 text-sm">
                <li><a href="/#waitlist" className="hover:text-purple-400 transition-colors">Creators</a></li>
                <li><a href="/#waitlist" className="hover:text-purple-400 transition-colors">Help center</a></li>
                <li><a href="/#waitlist" className="hover:text-purple-400 transition-colors">Success stories</a></li>
                <li><a href="/#waitlist" className="hover:text-purple-400 transition-colors">Creative insider</a></li>
              </ul>
            </div>

            {/* Column 3: Blog */}
            <div className="space-y-2.5">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <span>Blog</span>
                <span className="text-[10px]">↗</span>
              </h5>
              <ul className="space-y-2 font-medium text-slate-200 text-sm">
                <li><a href="/#waitlist" className="hover:text-purple-400 transition-colors">Ad performance</a></li>
                <li><a href="/#waitlist" className="hover:text-purple-400 transition-colors">Zerify news</a></li>
                <li><a href="/#waitlist" className="hover:text-purple-400 transition-colors">Creator resources</a></li>
                <li><a href="/#waitlist" className="hover:text-purple-400 transition-colors">eCommerce marketing</a></li>
                <li><a href="/#waitlist" className="hover:text-purple-400 transition-colors">Influencer marketing</a></li>
                <li><a href="/#waitlist" className="hover:text-purple-400 transition-colors">Paid social news</a></li>
                <li><a href="/#waitlist" className="hover:text-purple-400 transition-colors">Social media marketing</a></li>
                <li><a href="/#waitlist" className="hover:text-purple-400 transition-colors">User-generated content</a></li>
              </ul>
            </div>

            {/* Column 4: Company & Contact us */}
            <div className="space-y-6">
              <div className="space-y-2.5">
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Company</h5>
                <ul className="space-y-2 font-medium text-slate-200 text-sm">
                  <li><a href="/#waitlist" className="hover:text-purple-400 transition-colors">About us</a></li>
                  <li><a href="/#waitlist" className="hover:text-purple-400 transition-colors">Careers</a></li>
                  <li>
                    <Link href="/privacy" className="hover:text-purple-400 transition-colors font-medium">
                      Privacy Policy
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-2.5">
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Contact us</h5>
                <ul className="space-y-2 font-medium text-slate-200 text-sm">
                  <li><a href="mailto:info@zerify.in" className="hover:text-purple-400 transition-colors">info@zerify.in</a></li>
                  <li><a href="tel:+919732550799" className="hover:text-purple-400 transition-colors">+91 9732550799</a></li>
                  <li>
                    <a
                      href="https://agency.zerify.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-purple-400 transition-colors flex items-center gap-1 font-bold text-white"
                    >
                      <span>Agency Website</span>
                      <span className="text-[10px]">↗</span>
                    </a>
                  </li>
                  <li><a href="/#waitlist" className="hover:text-purple-400 transition-colors">Book a call</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Section: Brand & Apps (Span 4) */}
          <div className="lg:col-span-4 space-y-6 lg:pl-6 border-t lg:border-t-0 border-white/10 pt-8 lg:pt-0">
            {/* Logo & Pitch */}
            <div className="space-y-3">
              <Link href="/" className="flex items-center gap-2.5 group">
                <Image
                  src="/logo.png"
                  alt="Zerify Logo"
                  width={36}
                  height={36}
                  className="object-contain"
                />
                <span className="font-extrabold text-white text-2xl tracking-tight">
                  ZERIFY<span className="text-purple-500">.</span>
                </span>
              </Link>
              <p className="text-slate-300 text-base font-medium leading-snug">
                Turn creator marketing into your most profitable growth channel
              </p>
            </div>

            <div className="h-[1px] bg-white/10 w-full" />

            {/* Platform Partners Badges */}
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span>Experts in</span>
              <span className="font-bold text-white flex items-center gap-1">
                <span>∞ Meta</span>
              </span>
              <span className="font-bold text-white flex items-center gap-1">
                <span>🎵 TikTok</span>
              </span>
            </div>

            {/* Become a creator link */}
            <div>
              <a href="/#waitlist" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1">
                <span>Become a creator</span>
                <span>↗</span>
              </a>
            </div>

            {/* App Store & Play Store Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="/#waitlist"
                className="px-4 py-2.5 rounded-full bg-slate-900 border border-white/15 hover:border-purple-400 text-white text-xs font-bold transition-all flex items-center gap-2"
              >
                <span> App store</span>
              </a>
              <a
                href="/#waitlist"
                className="px-4 py-2.5 rounded-full bg-slate-900 border border-white/15 hover:border-purple-400 text-white text-xs font-bold transition-all flex items-center gap-2"
              >
                <span>▶ Play store</span>
              </a>
            </div>
          </div>

        </div>

        <div className="h-[1px] bg-white/10 w-full" />

        {/* Bottom Bar: Social Icons + Legal & Address */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-2 text-xs text-slate-400">
          {/* Social Icons Stack */}
          <div className="flex items-center gap-3">
            {['in', 'IG', 'TT', '𝕏', 'f', '▶'].map((icon, idx) => (
              <a
                key={idx}
                href="#"
                className="w-8 h-8 rounded-full bg-slate-900 border border-white/10 hover:border-purple-400 flex items-center justify-center font-bold text-xs text-slate-300 hover:text-white transition-all"
              >
                {icon}
              </a>
            ))}
          </div>

          {/* Legal & Copyright */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-4 gap-y-2 text-center md:text-right">
            <a href="/#waitlist" className="hover:text-white transition-colors">Terms of service</a>
            <span>•</span>
            <Link href="/privacy" className="hover:text-white transition-colors font-medium">
              Privacy policy
            </Link>
            <span className="hidden sm:inline">•</span>
            <span>IIT Kharagpur, Kharagpur, West Bengal, 721302</span>
            <span>•</span>
            <span>© 2026 By Zerify Inc. All Rights Reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
