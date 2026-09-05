'use client';

import React from 'react';
import { Send, Check, X, Clock, DollarSign } from 'lucide-react';
import { CampaignOfferItem, OfferService } from '@/services/offer.service';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency } from '@/utils/currency';

interface OfferManagementViewProps {
  offers: CampaignOfferItem[];
  onRefresh: () => void;
}

export default function OfferManagementView({ offers, onRefresh }: OfferManagementViewProps) {
  const { currency } = useCurrency();
  const handleCancel = async (offerId: string) => {
    try {
      await OfferService.cancelOffer(offerId);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'DECLINED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'OFFER_EXPIRED':
        return 'bg-slate-800 text-slate-400 border-white/10';
      case 'PENDING':
      default:
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30 animate-pulse';
    }
  };

  if (offers.length === 0) {
    return (
      <div className="p-12 rounded-2xl bg-slate-950/40 border border-dashed border-white/10 text-center space-y-2">
        <Send className="w-8 h-8 text-slate-600 mx-auto" />
        <h4 className="text-xs font-bold text-slate-300">No active offers sent</h4>
        <p className="text-[11px] text-slate-500">
          When you send collaboration offers to shortlisted applicants, their contract status will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {offers.map((offer) => {
        const app = offer.application || {};
        const profile = app.influencerProfile || {};

        return (
          <div
            key={offer.id}
            className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs">
                {profile.handle ? profile.handle.charAt(0).toUpperCase() : 'C'}
              </div>
              <div>
                <h4 className="text-xs font-black text-white">@{profile.handle || 'creator'}</h4>
                <span className="text-[10px] text-slate-400">
                  Sent {new Date(offer.sentAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Offered Fee</span>
                <span className="text-sm font-black text-emerald-400">
                  {formatCurrency(offer.compensationAmount, offer.compensationCurrency || currency)}
                </span>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border uppercase ${getStatusBadge(offer.status)}`}>
                {offer.status.replace('_', ' ')}
              </span>

              {offer.status === 'PENDING' && (
                <button
                  onClick={() => handleCancel(offer.id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/50 hover:text-rose-400 text-xs font-bold text-slate-400 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
