'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  CheckCircle2,
  Clock,
  MessageSquare,
  FileText,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';
import { CampaignOfferItem } from '@/services/offer.service';
import { useCurrency } from '@/context/CurrencyContext';

interface OfferReceivedCardProps {
  offer: CampaignOfferItem;
  onAccept: (offerId: string) => void;
  onDecline: (offerId: string) => void;
  onViewDetails?: (offer: CampaignOfferItem) => void;
  isAccepting?: boolean;
}

export default function OfferReceivedCard({
  offer,
  onAccept,
  onDecline,
  isAccepting,
}: OfferReceivedCardProps) {
  const { format: formatUserCurrency } = useCurrency();
  const app = offer.application || {};
  const campaign = app.campaign || {};
  const brand = campaign.brandProfile || {};

  const payoutStr = formatUserCurrency(Number(offer.compensationAmount || 0));

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
      className="p-5 sm:p-6 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-4 hover:border-purple-500/40 transition-all group"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl bg-gradient-to-br from-purple-900/60 to-slate-900 border border-purple-500/30 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform overflow-hidden">
            {brand.logoUrl ? (
              <img
                src={brand.logoUrl}
                alt={brand.companyName || 'Brand'}
                className="w-full h-full object-cover"
              />
            ) : (
              <Building2 className="w-8 h-8 text-purple-300" />
            )}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="text-xs font-black text-purple-300">{brand.companyName || 'Verified Brand'}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-extrabold text-purple-300">
                <CheckCircle2 className="w-3 h-3 text-purple-400" /> Verified
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-extrabold text-emerald-400">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                {paymentModelLabel}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white">{campaign.title || 'Brand Sponsorship'}</h3>
            <span className="text-xs text-slate-400 font-medium">{campaign.industry || brand.industry || 'Technology & Creator'}</span>
          </div>
        </div>

        {/* Amount Display (No Background Card) */}
        <div className="shrink-0 text-right sm:text-right">
          <span className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
            {payoutStr}
          </span>
        </div>
      </div>

      {/* Middle: Campaign Details / Brief */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-slate-300 space-y-1.5">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-300 uppercase tracking-wider">
          <FileText className="w-3.5 h-3.5 text-purple-400" />
          <span>Campaign Details</span>
        </div>
        <p className="leading-relaxed text-slate-300 line-clamp-3">
          {campaignDetailsText}
        </p>
        {offer.customNotes && campaign.description && (
          <p className="text-[11px] text-purple-300/90 italic pt-1.5 border-t border-white/5">
            &quot;{offer.customNotes}&quot;
          </p>
        )}
      </div>

      {/* Footer Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Left: Response Due Date & Message Brand */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Response Due: <strong className="text-white font-bold">{deadlineStr}</strong>
          </span>
          <span className="text-slate-700">|</span>
          <button className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Message Brand</span>
          </button>
        </div>

        {/* Right: Actions */}
        {offer.status === 'PENDING' ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDecline(offer.id)}
              disabled={isAccepting}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/50 text-xs font-bold text-slate-400 hover:text-rose-300 border border-white/10 transition-all flex items-center gap-1 disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
              <span>Decline</span>
            </button>
            <button
              onClick={() => onAccept(offer.id)}
              disabled={isAccepting}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 hover:scale-105 text-xs font-black text-white shadow-lg shadow-emerald-950/40 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isAccepting ? 'Accepting...' : 'Accept & Start Project'}</span>
            </button>
          </div>
        ) : (
          <span
            className={`px-3.5 py-1 rounded-full text-xs font-extrabold border ${
              offer.status === 'ACCEPTED'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}
          >
            {offer.status === 'ACCEPTED' ? 'Offer Accepted' : 'Offer Declined'}
          </span>
        )}
      </div>
    </motion.div>
  );
}
