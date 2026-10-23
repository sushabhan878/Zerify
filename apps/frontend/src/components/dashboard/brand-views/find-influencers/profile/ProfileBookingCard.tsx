'use client';

import React from 'react';
import { Send, ShieldCheck, Zap } from 'lucide-react';
import { CreatorItem } from '../CreatorCard';
import { useCurrency } from '@/context/CurrencyContext';

interface ProfileBookingCardProps {
  creator: CreatorItem;
  onInvite: (creator: CreatorItem) => void;
}

export default function ProfileBookingCard({
  creator,
  onInvite,
}: ProfileBookingCardProps) {
  const { format, convert, formatBudget, currency } = useCurrency();

  const startingRateDisplay = React.useMemo(() => {
    // 1. If rawPrice is available (fetched directly from DB influencerProfile.minPricePerReel)
    if (typeof creator.rawPrice === 'number' && !isNaN(creator.rawPrice) && creator.rawPrice > 0) {
      const srcCurr = creator.sourceCurrency || 'USD';
      const converted = convert(creator.rawPrice, srcCurr);
      return format(converted);
    }

    // 2. If rateNumber is available
    if (typeof creator.rateNumber === 'number' && !isNaN(creator.rateNumber) && creator.rateNumber > 0) {
      const srcCurr = creator.sourceCurrency || (creator.startingRate?.includes('$') ? 'USD' : 'INR');
      const converted = convert(creator.rateNumber, srcCurr);
      return format(converted);
    }

    // 3. Fallback using budget string with detected or source currency
    if (creator.startingRate) {
      return formatBudget(creator.startingRate, creator.sourceCurrency);
    }

    return format(convert(200, 'USD'));
  }, [creator.rawPrice, creator.rateNumber, creator.sourceCurrency, creator.startingRate, convert, format, formatBudget, currency]);

  return (
    <div className="sticky top-20 rounded-2xl sm:rounded-3xl bg-[#090C15]/95 border border-white/10 p-5 sm:p-6 space-y-4 shadow-2xl backdrop-blur-xl">
      {/* Starting Rate Header */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {startingRateDisplay}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-slate-400">
            starting rate
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Send a custom collaboration offer with your proposed deliverables and budget for {creator.name}.
        </p>
      </div>

      {/* Trust & Guarantee Row */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Avg. reply &lt; 24h</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Escrow Protected</span>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onInvite(creator)}
        type="button"
        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-purple-950/60 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer border border-purple-400/30"
      >
        <Send className="w-3.5 h-3.5" />
        <span>Send an Offer</span>
      </button>
    </div>
  );
}
