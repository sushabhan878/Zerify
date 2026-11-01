'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  CheckCircle2,
  Clock,
  MessageSquare,
  ShieldCheck,
  Check,
  X,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { CampaignOfferItem } from '@/services/offer.service';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency, convertCurrency } from '@/utils/currency';

interface OfferReceivedCardProps {
  offer: CampaignOfferItem;
  onAccept: (offerId: string) => void;
  onDecline: (offerId: string) => void;
  onCancelCounter?: (offerId: string) => void;
  onCounterOffer?: (offer: CampaignOfferItem) => void;
  onViewDetails?: (offer: CampaignOfferItem) => void;
  onMessageBrand?: (offer: CampaignOfferItem) => void;
  isAccepting?: boolean;
  isCancellingCounter?: boolean;
  isMessaging?: boolean;
}

export default function OfferReceivedCard({
  offer,
  onAccept,
  onDecline,
  onCancelCounter,
  onCounterOffer,
  onViewDetails,
  onMessageBrand,
  isAccepting,
  isCancellingCounter,
  isMessaging,
}: OfferReceivedCardProps) {
  const { currency: userCurrency, format: formatUserCurrency, rates } = useCurrency();
  const app = offer.application || {};
  const campaign = app.campaign || {};
  const brand = campaign.brandProfile || {};

  const terms = (offer.termsSnapshot as Record<string, any>) || {};
  const isCounter = Boolean(terms.isCounterOffer);
  const counterBy = terms.counterBy || (isCounter ? 'INFLUENCER' : null);
  const isInfluencerCounter = isCounter && counterBy === 'INFLUENCER';
  const isBrandCounter = isCounter && counterBy === 'BRAND';

  const isBrandRejectedCounter =
    isCounter &&
    (terms.counterStatus === 'REJECTED' ||
      offer.status === 'DECLINED' ||
      offer.application?.status === 'REJECTED');

  const rawCompensation =
    isInfluencerCounter && terms.counterRate
      ? Number(terms.counterRate)
      : isBrandCounter && terms.counterRate
      ? Number(terms.counterRate)
      : Number(offer.compensationAmount || 0);

  const sourceCurrency =
    (isInfluencerCounter && terms.counterCurrency) ||
    (isBrandCounter && terms.counterCurrency) ||
    offer.compensationCurrency ||
    campaign.budgetCurrency ||
    'USD';

  const convertedCompensation = convertCurrency(rawCompensation, sourceCurrency, userCurrency, rates);
  const isCrossCurrency = sourceCurrency.toUpperCase() !== userCurrency.toUpperCase();

  const payoutStr = formatUserCurrency(convertedCompensation);
  const originalPayoutStr = isCrossCurrency && rawCompensation > 0
    ? formatCurrency(rawCompensation, sourceCurrency)
    : undefined;

  const deadlineStr = offer.responseDeadline
    ? new Date(offer.responseDeadline).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Rolling Milestone';

  const paymentModel = offer.compensationPaymentModel || 'FIXED';
  const paymentModelLabel =
    paymentModel === 'FIXED'
      ? 'Fixed Payout'
      : paymentModel === 'MILESTONE'
      ? 'Milestone Escrow'
      : paymentModel.replace('_', ' ');

  const campaignDetailsText = campaign.description || offer.customNotes || 'Direct brand collaboration offer with milestone escrow compensation.';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-visible mt-4 p-5 sm:p-6 pr-6 sm:pr-8 rounded-2xl bg-slate-950/45 light:bg-white border border-white/10 light:border-slate-200/90 backdrop-blur-xl shadow-xl light:shadow-sm space-y-4 hover:border-purple-500/40 light:hover:border-purple-300 light:hover:shadow-md transition-all group"
    >
      {/* Floating Offer Status Badge Overlapping Top-Right Corner (50% Overlap) */}
      {offer.status && (
        <div
          className="absolute right-6 sm:right-8 z-20 pointer-events-none"
          style={{ top: '0px', transform: 'translateY(-50%)' }}
        >
          {offer.status === 'ACCEPTED' ? (
            <span className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full border border-emerald-400/50 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white keep-white text-xs sm:text-sm font-black tracking-wide flex items-center gap-1.5 shadow-xl shadow-emerald-950/80 ring-4 ring-[#080B14] light:ring-white">
              <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>Offer Accepted</span>
            </span>
          ) : isBrandRejectedCounter ? (
            <span className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full border border-rose-400/50 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 text-white keep-white text-xs sm:text-sm font-black tracking-wide flex items-center gap-1.5 shadow-xl shadow-rose-950/80 ring-4 ring-[#080B14] light:ring-white">
              <X className="w-4 h-4 text-rose-200 shrink-0" />
              <span>Brand Rejected Counter Offer</span>
            </span>
          ) : offer.status === 'DECLINED' ? (
            <span className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full border border-rose-400/50 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 text-white keep-white text-xs sm:text-sm font-black tracking-wide flex items-center gap-1.5 shadow-xl shadow-rose-950/80 ring-4 ring-[#080B14] light:ring-white">
              <X className="w-4 h-4 text-rose-200 shrink-0" />
              <span>Offer Declined</span>
            </span>
          ) : offer.status === 'PENDING' && isInfluencerCounter ? (
            <span className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full border border-amber-400/50 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white keep-white text-xs sm:text-sm font-black tracking-wide flex items-center gap-1.5 shadow-xl shadow-amber-950/80 ring-4 ring-[#080B14] light:ring-white">
              <Sparkles className="w-4 h-4 text-amber-200 animate-pulse shrink-0" />
              <span>Counter Offer Sent</span>
            </span>
          ) : offer.status === 'PENDING' && isBrandCounter ? (
            <span className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full border border-amber-400/50 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white keep-white text-xs sm:text-sm font-black tracking-wide flex items-center gap-1.5 shadow-xl shadow-amber-950/80 ring-4 ring-[#080B14] light:ring-white">
              <RefreshCw className="w-4 h-4 text-amber-200 animate-spin shrink-0" />
              <span>Counter Offer from Brand</span>
            </span>
          ) : offer.status === 'PENDING' ? (
            <span className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full border border-amber-400/50 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 text-white keep-white text-xs sm:text-sm font-black tracking-wide flex items-center gap-1.5 shadow-xl shadow-amber-950/80 ring-4 ring-[#080B14] light:ring-white">
              <Clock className="w-4 h-4 text-amber-200 animate-pulse shrink-0" />
              <span>Offer Pending</span>
            </span>
          ) : offer.status === 'OFFER_EXPIRED' ? (
            <span className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full border border-slate-500/40 light:border-slate-300 bg-slate-800 light:bg-slate-200 text-slate-300 light:text-slate-700 text-xs sm:text-sm font-bold tracking-wide flex items-center gap-1.5 shadow-xl ring-4 ring-[#080B14] light:ring-white">
              <Clock className="w-4 h-4 text-slate-400 light:text-slate-500 shrink-0" />
              <span>Offer Expired</span>
            </span>
          ) : (
            <span className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full border border-slate-500/40 light:border-slate-300 bg-slate-800 light:bg-slate-200 text-slate-400 light:text-slate-600 text-xs sm:text-sm font-bold tracking-wide flex items-center gap-1.5 shadow-xl ring-4 ring-[#080B14] light:ring-white">
              <X className="w-4 h-4 text-slate-500 light:text-slate-600 shrink-0" />
              <span>{offer.status.replace('_', ' ')}</span>
            </span>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl bg-gradient-to-br from-purple-900/60 to-slate-900 light:from-purple-50 light:to-indigo-50 border border-purple-500/30 light:border-slate-200 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform overflow-hidden">
          {brand.logoUrl ? (
            <img
              src={brand.logoUrl}
              alt={brand.companyName || 'Brand'}
              className="w-full h-full object-cover"
            />
          ) : (
            <Building2 className="w-8 h-8 text-purple-300 light:text-purple-600" />
          )}
        </div>
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-xs font-black text-purple-300 light:text-purple-700">{brand.companyName || 'Verified Brand'}</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 light:bg-purple-50 border border-purple-500/20 light:border-purple-200 text-[10px] font-extrabold text-purple-300 light:text-purple-700">
              <CheckCircle2 className="w-3 h-3 text-purple-400 light:text-purple-600" /> Verified
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 light:bg-emerald-50 border border-emerald-500/25 light:border-emerald-200 text-[10px] font-extrabold text-emerald-400 light:text-emerald-700">
              <ShieldCheck className="w-3 h-3 text-emerald-400 light:text-emerald-600" />
              {paymentModelLabel}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-white light:text-slate-900">{campaign.title || 'Brand Sponsorship'}</h3>
          <span className="text-xs text-slate-400 light:text-slate-500 font-medium">{campaign.industry || brand.industry || 'Technology & Creator'}</span>
        </div>
      </div>

      {/* Middle: Campaign Description & Amount (Just down to the middle of the card) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        <div className="flex-1 min-w-0 pr-0 md:pr-4">
          {campaignDetailsText && (
            <p className="text-xs sm:text-sm text-slate-300 light:text-slate-600 leading-relaxed line-clamp-3">
              {campaignDetailsText}
            </p>
          )}
          {offer.customNotes && campaign.description && (
            <p className="text-[11px] sm:text-xs text-purple-300/90 light:text-purple-700 italic mt-3 sm:mt-3.5">
              &quot;{offer.customNotes}&quot;
            </p>
          )}

          {/* Rejection Notification Banner */}
          {isBrandRejectedCounter && (
            <div className="p-3 rounded-xl bg-rose-950/40 light:bg-rose-50 border border-rose-500/30 light:border-rose-200 flex items-center gap-2 text-xs text-rose-300 light:text-rose-700 font-medium mt-3">
              <X className="w-4 h-4 text-rose-400 light:text-rose-600 shrink-0" />
              <span>The brand has reviewed and rejected your counter offer.</span>
            </div>
          )}

          {/* Counter proposal notes */}
          {isInfluencerCounter && terms.counterNotes && (
            <p className="text-[11px] sm:text-xs text-amber-300/90 light:text-amber-800 italic mt-2.5">
              Your counter proposal note: &quot;{terms.counterNotes}&quot;
            </p>
          )}
          {isBrandCounter && terms.counterNotes && (
            <p className="text-[11px] sm:text-xs text-purple-300/90 light:text-purple-700 italic mt-2.5">
              Brand counter proposal note: &quot;{terms.counterNotes}&quot;
            </p>
          )}
        </div>

        {/* Amount Display (White, right-aligned, aligned with top-right badge) */}
        <div className="shrink-0 text-right self-end md:self-center">
          <span className="text-2xl sm:text-3xl font-black text-white light:text-slate-900 tracking-tight">
            {payoutStr}
          </span>
          {isInfluencerCounter && (
            <span className="block text-[10px] text-amber-400 light:text-amber-700 font-semibold mt-0.5">
              Proposed Counter Rate
            </span>
          )}
        </div>
      </div>

      {/* Footer Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/5 light:border-slate-200">
        {/* Left: Response Due Date & Message Brand */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 light:text-slate-600">
            <Clock className="w-3.5 h-3.5 text-amber-400 light:text-amber-600" />
            Response Due: <strong className="text-white light:text-slate-900 font-bold">{deadlineStr}</strong>
          </span>
          <span className="text-slate-700 light:text-slate-300">|</span>
          <button
            type="button"
            disabled={isMessaging}
            onClick={(e) => {
              e.stopPropagation();
              onMessageBrand?.(offer);
            }}
            className="text-xs font-bold text-purple-400 light:text-purple-600 hover:text-purple-300 light:hover:text-purple-800 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {isMessaging ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400 light:text-purple-600" />
            ) : (
              <MessageSquare className="w-3.5 h-3.5" />
            )}
            <span>{isMessaging ? 'Opening Thread...' : 'Message Brand'}</span>
          </button>
        </div>

        {/* Right: Actions */}
        {offer.status === 'PENDING' && campaign.status !== 'DELETED' && (
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 flex-wrap">
            {isInfluencerCounter ? (
              <>
                {/* Cancel Counter Button (instead of decline) */}
                <button
                  type="button"
                  onClick={() => (onCancelCounter ? onCancelCounter(offer.id) : onDecline(offer.id))}
                  disabled={isAccepting || isCancellingCounter}
                  className="group px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-950/40 to-red-950/30 light:bg-rose-50 hover:from-rose-900/60 hover:to-red-900/50 light:hover:bg-rose-100 text-xs font-bold text-rose-200 light:text-rose-700 hover:text-white light:hover:text-rose-900 border border-rose-500/30 light:border-rose-200 hover:border-rose-400/60 shadow-md light:shadow-sm transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {isCancellingCounter ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400 light:text-rose-600 shrink-0" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-rose-400 light:text-rose-600 group-hover:text-rose-200 group-hover:scale-125 transition-transform duration-200 shrink-0" />
                  )}
                  <span>{isCancellingCounter ? 'Cancelling...' : 'Cancel Counter'}</span>
                </button>

                {/* Edit Counter Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCounterOffer?.(offer);
                  }}
                  disabled={isAccepting || isCancellingCounter}
                  className="group px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-amber-950/40 light:bg-amber-50 hover:from-amber-900/60 hover:via-orange-900/50 hover:to-amber-900/60 light:hover:bg-amber-100 text-xs font-bold text-amber-300 light:text-amber-800 hover:text-white light:hover:text-amber-900 border border-amber-500/30 light:border-amber-200 hover:border-amber-400/60 shadow-md light:shadow-sm transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400 light:text-amber-600 group-hover:rotate-180 transition-transform duration-500 shrink-0" />
                  <span>Edit Counter</span>
                </button>
              </>
            ) : (
              <>
                {/* Decline Button */}
                <button
                  type="button"
                  onClick={() => onDecline(offer.id)}
                  disabled={isAccepting}
                  className="group px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-950/40 to-red-950/30 light:bg-rose-50 hover:from-rose-900/60 hover:to-red-900/50 light:hover:bg-rose-100 text-xs font-bold text-rose-200 light:text-rose-700 hover:text-white light:hover:text-rose-900 border border-rose-500/30 light:border-rose-200 hover:border-rose-400/60 shadow-md light:shadow-sm transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5 text-rose-400 light:text-rose-600 group-hover:text-rose-200 group-hover:scale-125 transition-transform duration-200 shrink-0" />
                  <span>Decline</span>
                </button>

                {/* Counter Offer Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCounterOffer?.(offer);
                  }}
                  disabled={isAccepting}
                  className="group px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-amber-950/40 light:bg-amber-50 hover:from-amber-900/60 hover:via-orange-900/50 hover:to-amber-900/60 light:hover:bg-amber-100 text-xs font-bold text-amber-300 light:text-amber-800 hover:text-white light:hover:text-amber-900 border border-amber-500/30 light:border-amber-200 hover:border-amber-400/60 shadow-md light:shadow-sm transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400 light:text-amber-600 group-hover:rotate-180 transition-transform duration-500 shrink-0" />
                  <span>Counter Offer</span>
                </button>

                {/* Accept & Start Project Button */}
                <button
                  type="button"
                  onClick={() => onAccept(offer.id)}
                  disabled={isAccepting}
                  className="group px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-black text-white keep-white shadow-lg shadow-emerald-950/40 hover:shadow-emerald-900/60 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  <Check className="w-4 h-4 text-white group-hover:scale-125 transition-transform duration-200 shrink-0" />
                  <span>{isAccepting ? 'Accepting...' : 'Accept & Start Project'}</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
