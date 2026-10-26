'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface DealsLoadingSkeletonProps {
  count?: number;
}

export default function DealsLoadingSkeleton({ count = 4 }: DealsLoadingSkeletonProps) {
  const skeletons = Array.from({ length: count });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pt-2">
      {skeletons.map((_, idx) => (
        <div
          key={idx}
          className="relative p-5 sm:p-6 rounded-2xl bg-slate-900/40 border border-white/[0.06] overflow-hidden flex flex-col sm:flex-row gap-5 items-center select-none"
        >
          {/* Subtle Shimmer Sweep */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent pointer-events-none -skew-x-12"
            animate={{ x: ['-150%', '150%'] }}
            transition={{
              repeat: Infinity,
              duration: 1.8,
              ease: 'easeInOut',
              delay: idx * 0.15,
            }}
          />

          {/* Simple Thumbnail Placeholder */}
          <div className="w-full sm:w-28 h-28 rounded-xl bg-white/[0.05] shrink-0" />

          {/* Clean Content Lines */}
          <div className="flex-1 w-full space-y-3 min-w-0">
            <div className="h-4 w-1/3 rounded bg-white/[0.08]" />
            <div className="h-3.5 w-3/4 rounded bg-white/[0.05]" />
            <div className="h-3 w-1/2 rounded bg-white/[0.03]" />
            <div className="pt-2 flex items-center justify-between">
              <div className="h-3.5 w-20 rounded bg-white/[0.05]" />
              <div className="h-3.5 w-24 rounded bg-white/[0.04]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
