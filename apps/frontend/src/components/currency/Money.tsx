'use client';

import React, { useState } from 'react';
import { useCurrency } from '@/context/CurrencyContext';
import { normalizeCurrency, formatCurrency } from '@/utils/currency';

export interface MoneyProps {
  amount: number | string | null | undefined;
  currency?: string | null;
  compact?: boolean;
  showDecimals?: boolean;
  showOriginal?: boolean;
  className?: string;
  subTextClassName?: string;
}

/**
 * Universal Money Component (PRD §77, §78, §114)
 * Displays converted amount in the viewer's preferred dashboard currency,
 * while preserving and optionally showing the original authoritative currency.
 */
export default function Money({
  amount,
  currency: originalCurrency = 'USD',
  compact = false,
  showDecimals = false,
  showOriginal = true,
  className = '',
  subTextClassName = '',
}: MoneyProps) {
  const { currency: viewerCurrency, convert, format, rates, lastUpdated } = useCurrency();
  const [showTooltip, setShowTooltip] = useState(false);

  const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]+/g, '')) : (amount ?? 0);
  const cleanOriginal = isNaN(num) ? 0 : num;

  const origNorm = normalizeCurrency(originalCurrency || 'USD');
  const viewerNorm = normalizeCurrency(viewerCurrency);

  // If viewer currency is identical to original currency, no conversion needed (PRD §21)
  const isSameCurrency = origNorm === viewerNorm;

  // Converted value in viewer's preferred currency
  const convertedAmount = isSameCurrency ? cleanOriginal : convert(cleanOriginal, origNorm);
  const displayString = format(convertedAmount, { compact, showDecimals });

  // Original formatted value
  const originalString = formatCurrency(cleanOriginal, origNorm, { compact: false, showDecimals: true });

  // Calculate conversion rate for tooltip
  const origRate = rates[origNorm] || 1;
  const viewerRate = rates[viewerNorm] || 1;
  const fxRate = (viewerRate / origRate).toFixed(4);

  return (
    <span
      className={`relative inline-flex items-baseline gap-1 group ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className="font-semibold text-inherit">{displayString}</span>

      {/* Subtle indicator if value is cross-currency converted */}
      {!isSameCurrency && showOriginal && (
        <span
          className={`text-[10px] text-slate-400 font-medium tracking-tight cursor-help underline decoration-dotted decoration-purple-400/40 select-none ${subTextClassName}`}
          title={`Original: ${originalString} (${origNorm})`}
        >
          ≈
        </span>
      )}

      {/* Floating Rich Tooltip (PRD §78 & §114) */}
      {!isSameCurrency && showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 pointer-events-none min-w-[210px] p-2.5 rounded-xl bg-slate-950/95 border border-purple-500/40 shadow-2xl backdrop-blur-xl text-left animate-in fade-in zoom-in-95 duration-150">
          <p className="text-[11px] font-bold text-white flex items-center justify-between gap-2 border-b border-white/10 pb-1">
            <span>Original Amount</span>
            <span className="text-purple-300 font-extrabold">{originalString}</span>
          </p>
          <div className="pt-1.5 space-y-0.5 text-[10px] text-slate-300">
            <p className="flex justify-between">
              <span className="text-slate-400">FX Rate:</span>
              <span className="font-semibold text-slate-200">
                1 {origNorm} = {fxRate} {viewerNorm}
              </span>
            </p>
            {lastUpdated && (
              <p className="flex justify-between text-[9px] text-slate-400 pt-0.5">
                <span>Updated:</span>
                <span>{new Date(lastUpdated).toLocaleDateString()}</span>
              </p>
            )}
          </div>
        </div>
      )}
    </span>
  );
}
