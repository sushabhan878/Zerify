'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Construction, Clock, ShieldAlert } from 'lucide-react';

/**
 * Determines whether the current execution context represents a production deployment.
 * Supports:
 * - Direct build mode: process.env.NODE_ENV === 'production'
 * - Hosting platforms: process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' / process.env.NEXT_PUBLIC_ENV === 'production'
 * - Manual flag override: process.env.NEXT_PUBLIC_PAYMENT_UNDER_CONSTRUCTION
 * - Dev testing overrides: URL query parameter (?preview_construction=true) or localStorage
 * - Live deployment domain detection (any non-localhost hostname)
 */
export function isProductionDeployment(): boolean {
  // 1. Explicit override via public env variable
  if (process.env.NEXT_PUBLIC_PAYMENT_UNDER_CONSTRUCTION === 'true') {
    return true;
  }
  if (process.env.NEXT_PUBLIC_PAYMENT_UNDER_CONSTRUCTION === 'false') {
    return false;
  }

  // 2. Next.js standard production build
  if (process.env.NODE_ENV === 'production') {
    return true;
  }

  // 3. Hosting environment indicators
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ||
    process.env.NEXT_PUBLIC_ENV === 'production'
  ) {
    return true;
  }

  // 4. Client-side runtime checks
  if (typeof window !== 'undefined') {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('preview_construction') === 'true') {
        return true;
      }

      const storedOverride = localStorage.getItem('zerify_payments_construction_preview');
      if (storedOverride === 'true') {
        return true;
      }

      // Hostname check: non-localhost domain indicates live/staging/prod deployment
      const hostname = window.location.hostname;
      if (
        hostname &&
        hostname !== 'localhost' &&
        hostname !== '127.0.0.1' &&
        !hostname.endsWith('.local')
      ) {
        return true;
      }
    } catch {
      // In case window/localStorage is restricted
    }
  }

  return false;
}

interface PaymentUnderConstructionNoticeProps {
  className?: string;
  customMessage?: string;
}

export default function PaymentUnderConstructionNotice({
  className = '',
  customMessage,
}: PaymentUnderConstructionNoticeProps) {
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    setIsProduction(isProductionDeployment());
  }, []);

  // Display only for production deployment
  if (!isProduction) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      role="status"
      aria-live="polite"
      className={`relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-purple-950/20 to-slate-950/70 p-4 sm:p-5 backdrop-blur-xl shadow-xl shadow-amber-950/10 ${className}`}
    >
      {/* Subtle background ambient glows */}
      <div className="absolute -top-12 -right-12 h-28 w-28 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 left-1/3 h-20 w-40 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />

      <div className="flex items-start sm:items-center gap-3.5 relative z-10">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-inner">
          <Construction className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-wide">
              This feature is under construction
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold text-amber-300 uppercase tracking-wider">
              <Clock className="w-2.5 h-2.5" />
              Production Notice
            </span>
          </div>

          <p className="text-xs text-slate-300/90 leading-relaxed">
            {customMessage ||
              'Live payment processing, automated escrow settlements, and payout disbursements are currently undergoing compliance audits and final integration for production deployment. Full banking services will be active soon.'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
