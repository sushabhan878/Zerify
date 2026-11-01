'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface DealsLoadingSkeletonProps {
  count?: number;
}

export default function DealsLoadingSkeleton({ count = 4 }: DealsLoadingSkeletonProps) {
  const skeletons = Array.from({ length: count });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pt-4">
      {skeletons.map((_, idx) => (
        <div
          key={idx}
          className="relative p-5 sm:p-6 lg:p-7 rounded-[26px] bg-slate-900/60 light:bg-white border border-white/[0.08] light:border-slate-200/80 overflow-visible flex flex-col md:flex-row gap-5 lg:gap-6 items-stretch select-none shadow-xl shadow-purple-950/10 light:shadow-sm mt-3"
        >
          {/* Subtle Shimmer Sweep */}
          <div className="absolute inset-0 rounded-[26px] overflow-hidden pointer-events-none">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] light:via-purple-200/30 to-transparent pointer-events-none -skew-x-12"
              animate={{ x: ['-150%', '150%'] }}
              transition={{
                repeat: Infinity,
                duration: 1.8,
                ease: 'easeInOut',
                delay: idx * 0.15,
              }}
            />
          </div>

          {/* Floating Top-Right Badge Placeholder */}
          <div className="absolute -top-3.5 right-6 sm:right-8 z-30 pointer-events-none">
            <div className="h-7 w-28 rounded-full bg-slate-800/80 light:bg-purple-100/80 border border-white/10 light:border-purple-200/80 ring-4 ring-[#090C15] light:ring-[#F1F3F7] animate-pulse" />
          </div>

          {/* LEFT COLUMN: Portrait Image Placeholder with Overlapping Rosette */}
          <div className="relative w-full md:w-[180px] lg:w-[195px] h-[240px] sm:h-[260px] md:h-auto min-h-[240px] lg:min-h-[260px] shrink-0 rounded-2xl border border-white/10 light:border-slate-200/90 bg-slate-800/40 light:bg-slate-100 flex flex-col justify-between p-3.5 overflow-hidden">
            {/* Top-left rosette badge placeholder */}
            <div className="w-8 h-9 rounded-lg bg-slate-700/50 light:bg-purple-200/50 animate-pulse" />

            {/* Bottom social icons placeholder row */}
            <div className="flex items-center -space-x-1.5 pt-2">
              <div className="w-6 h-6 rounded-full bg-slate-700/70 light:bg-white border border-white/10 light:border-slate-200/80 shadow-sm" />
              <div className="w-6 h-6 rounded-full bg-slate-700/70 light:bg-white border border-white/10 light:border-slate-200/80 shadow-sm" />
              <div className="w-6 h-6 rounded-full bg-slate-700/70 light:bg-white border border-white/10 light:border-slate-200/80 shadow-sm" />
            </div>
          </div>

          {/* RIGHT COLUMN: Info, Pitch, Quote & CTA Actions */}
          <div className="flex-1 flex flex-col justify-between space-y-4 relative z-10 min-w-0 pt-1">
            <div className="space-y-3">
              {/* Top Campaign Badge Skeleton */}
              <div className="h-6 w-32 rounded-xl bg-slate-800/60 light:bg-purple-50 border border-white/5 light:border-purple-200/60 animate-pulse" />

              {/* Creator Name & Category */}
              <div className="space-y-1.5">
                <div className="h-6 w-44 rounded-lg bg-slate-800/80 light:bg-slate-200 animate-pulse" />
                <div className="h-3.5 w-24 rounded bg-slate-800/50 light:bg-slate-200/70" />
              </div>

              {/* Deliverable Scope Description */}
              <div className="space-y-1.5 pt-1">
                <div className="h-3 w-full rounded bg-slate-800/40 light:bg-slate-100" />
                <div className="h-3 w-4/5 rounded bg-slate-800/30 light:bg-slate-100/80" />
              </div>
            </div>

            {/* Amount Display & Action */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between py-2 px-1 border-t border-white/[0.08] light:border-slate-200">
                <div className="h-3 w-20 rounded bg-slate-800/50 light:bg-slate-200/80" />
                <div className="h-7 w-28 rounded-lg bg-slate-800/70 light:bg-purple-100/70 animate-pulse" />
              </div>

              <div className="flex items-center justify-end">
                <div className="h-4 w-36 rounded-md bg-slate-800/40 light:bg-purple-100/60" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
