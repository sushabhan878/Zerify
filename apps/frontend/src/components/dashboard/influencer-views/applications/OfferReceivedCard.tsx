'use client';

import React from 'react';
import { Sparkles, DollarSign, Calendar, Check, X, ShieldCheck, Video } from 'lucide-react';
import { CampaignOfferItem } from '@/services/offer.service';

interface OfferReceivedCardProps {
  offer: CampaignOfferItem;
  onAccept: (offerId: string) => void;
  onDecline: (offerId: string) => void;
  onViewDetails: (offer: CampaignOfferItem) => void;
  isAccepting?: boolean;
}

export default function OfferReceivedCard({
  offer,
  onAccept,
  onDecline,
  onViewDetails,
  isAccepting,
}: OfferReceivedCardProps) {
  const app = offer.application || {};
  const campaign = app.campaign || {};
  const brand = campaign.brandProfile || {};

  return (
    <div className="p-5 rounded-3xl bg-slate-900/90 border border-purple-500/30 backdrop-blur-xl shadow-xl shadow-purple-950/20 space-y-4 hover:border-purple-500/50 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-white/10 overflow-hidden flex-shrink-0">
            <img
              src={brand.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80'}
              alt={brand.companyName || 'Brand'}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider block">
              Collaboration Offer Received
            </span>
            <h4 className="text-sm font-black text-white">{campaign.title || 'Brand Sponsorship'}</h4>
            <span className="text-[11px] text-slate-400 font-bold">{brand.companyName || 'Verified Brand'}</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Guaranteed Payout</span>
          <span className="text-base font-black text-emerald-400">
            ${offer.compensationAmount.toLocaleString()} {offer.compensationCurrency}
          </span>
        </div>
      </div>

      {/* Terms & Timeline */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-2xl border border-white/5 text-xs">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-bold">Payment Model</span>
          <span className="font-bold text-white">{offer.compensationPaymentModel || 'FIXED'}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-bold">Response Deadline</span>
          <span className="font-bold text-amber-400">
            {offer.responseDeadline ? new Date(offer.responseDeadline).toLocaleDateString() : 'Rolling'}
          </span>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <span className="text-[10px] text-slate-500 block uppercase font-bold">Escrow Protection</span>
          <span className="font-bold text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            100% Secured
          </span>
        </div>
      </div>

      {offer.customNotes && (
        <p className="text-[11px] text-slate-300 italic bg-purple-950/20 p-2.5 rounded-xl border border-purple-500/20">
          &quot;{offer.customNotes}&quot;
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <button
          onClick={() => onViewDetails(offer)}
          className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          View Full Scope
        </button>

        {offer.status === 'PENDING' ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDecline(offer.id)}
              disabled={isAccepting}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/50 hover:text-rose-400 text-xs font-bold text-slate-400 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={() => onAccept(offer.id)}
              disabled={isAccepting}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:scale-105 text-xs font-black text-white shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isAccepting ? 'Accepting...' : 'Accept & Start Project'}</span>
            </button>
          </div>
        ) : (
          <span className="text-xs font-black px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-white/10 uppercase">
            {offer.status.replace('_', ' ')}
          </span>
        )}
      </div>
    </div>
  );
}
