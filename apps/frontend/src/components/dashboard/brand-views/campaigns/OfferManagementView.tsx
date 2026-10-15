'use client';

import React, { useState } from 'react';
import {
  Send,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  DollarSign,
  X,
  Loader2,
} from 'lucide-react';
import { CampaignOfferItem, OfferService } from '@/services/offer.service';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency } from '@/utils/currency';

interface OfferManagementViewProps {
  offers: CampaignOfferItem[];
  onRefresh: () => void;
  onViewCollab?: () => void;
}

export default function OfferManagementView({
  offers,
  onRefresh,
  onViewCollab,
}: OfferManagementViewProps) {
  const { currency } = useCurrency();
  const [cancellingOfferId, setCancellingOfferId] = useState<string | null>(null);

  const handleCancel = async (offerId: string) => {
    try {
      setCancellingOfferId(offerId);
      await OfferService.cancelOffer(offerId);
      onRefresh();
    } catch (err) {
      console.error('Failed to cancel offer:', err);
    } finally {
      setCancellingOfferId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return {
          gradient: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500',
          border: 'border-emerald-400/50',
          shadow: 'shadow-emerald-950/80',
          dot: 'bg-emerald-200 shadow-sm',
          label: 'Accepted',
          desc: 'Creator agreed and joined campaign',
        };
      case 'DECLINED':
        return {
          gradient: 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-600',
          border: 'border-rose-400/50',
          shadow: 'shadow-rose-950/80',
          dot: 'bg-rose-200 shadow-sm',
          label: 'Declined',
          desc: 'Creator turned down this offer',
        };
      case 'CANCELLED':
        return {
          gradient: 'bg-gradient-to-r from-slate-700 via-slate-800 to-slate-700',
          border: 'border-slate-500/50',
          shadow: 'shadow-black/80',
          dot: 'bg-slate-400',
          label: 'Cancelled',
          desc: 'Offer withdrawn by brand',
        };
      case 'OFFER_EXPIRED':
        return {
          gradient: 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600',
          border: 'border-amber-400/50',
          shadow: 'shadow-amber-950/80',
          dot: 'bg-amber-200 shadow-sm',
          label: 'Expired',
          desc: 'Response deadline elapsed',
        };
      case 'PENDING':
      default:
        return {
          gradient: 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600',
          border: 'border-purple-400/50',
          shadow: 'shadow-purple-950/80 shadow-[0_0_20px_rgba(168,85,247,0.35)]',
          dot: 'bg-purple-200 animate-pulse shadow-sm',
          label: 'Pending Response',
          desc: 'Awaiting creator review and acceptance',
        };
    }
  };

  if (offers.length === 0) {
    return (
      <div className="p-12 rounded-2xl bg-slate-950/40 border border-dashed border-white/10 text-center space-y-3">
        <Send className="w-8 h-8 text-slate-600 mx-auto" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-300">No offers sent yet</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            When you invite creators from &quot;Find Influencers&quot; or send collaboration offers to applicants, their offer cards with live contract status will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-5">
      {offers.map((offer) => {
        const app = offer.application || {};
        const profile = app.influencerProfile || {};
        const avatarUrl = profile.avatarUrl || app.profileSnapshot?.avatarUrl;
        const displayName =
          profile.user?.name || app.profileSnapshot?.displayName || profile.handle || 'Creator';
        const displayHandle = (profile.handle || app.profileSnapshot?.username || 'creator').replace(/^@/, '');
        const badge = getStatusBadge(offer.status);
        const isDirectInvite = app.applicationMessage === 'Official brand collaboration invite';

        return (
          <div
            key={offer.id}
            className="relative p-5 sm:p-6 rounded-2xl bg-slate-950/60 border border-purple-500/20 hover:border-purple-500/40 backdrop-blur-2xl shadow-xl shadow-purple-950/20 hover:shadow-[0_16px_40px_rgba(168,85,247,0.16)] transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-5 group"
          >
            {/* Ambient Background Aura Clipped */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              <div className="absolute -top-16 -right-16 w-56 h-56 bg-purple-600/10 rounded-full blur-2xl group-hover:bg-purple-600/20 transition-all duration-500" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-600/10 rounded-full blur-2xl group-hover:bg-indigo-600/15 transition-all duration-500" />
            </div>

            {/* Floating Status Badge Overlapping Top-Right Corner */}
            <div
              className="absolute right-5 sm:right-7 z-30 pointer-events-none"
              style={{ top: '0px', transform: 'translateY(-50%)' }}
            >
              <span
                className={`px-4 py-1.5 rounded-full ${badge.gradient} border ${badge.border} text-xs sm:text-[13px] font-black text-white flex items-center gap-1.5 shadow-xl ${badge.shadow} ring-4 ring-[#090C15] group-hover:scale-105 transition-all duration-300`}
                title={badge.desc}
              >
                <span className={`w-2 h-2 rounded-full ${badge.dot} shrink-0`} />
                <span>{badge.label}</span>
              </span>
            </div>

            {/* Creator Avatar & Info */}
            <div className="flex items-center gap-4 min-w-0 relative z-10">
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-500 flex items-center justify-center text-white font-black text-sm shrink-0 border border-purple-400/30 shadow-md shadow-purple-950/40 group-hover:scale-105 transition-transform duration-300">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span>{displayName.charAt(0).toUpperCase()}</span>
                )}
              </div>

              <div className="min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm sm:text-base font-black text-white truncate group-hover:text-purple-300 transition-colors">
                    {displayName}
                  </h4>
                  {isDirectInvite ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-400/30 shadow-sm">
                      Direct Invite
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-400/30 shadow-sm">
                      Application Offer
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
                  <span className="font-semibold text-purple-300/90">@{displayHandle}</span>
                  <span>•</span>
                  <span>Sent {new Date(offer.sentAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  {offer.customNotes && (
                    <>
                      <span>•</span>
                      <span className="text-slate-300/80 italic truncate max-w-[280px]" title={offer.customNotes}>
                        &ldquo;{offer.customNotes}&rdquo;
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side: Compensation & Actions */}
            <div className="flex items-center justify-between md:justify-end gap-5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5 relative z-10">
              <div className="text-left md:text-right">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">
                  Offered Fee
                </span>
                <span className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight leading-none block pt-0.5">
                  {formatCurrency(offer.compensationAmount, offer.compensationCurrency || currency)}
                </span>
              </div>

              {/* Actions based on status */}
              {offer.status === 'ACCEPTED' && onViewCollab && (
                <button
                  onClick={onViewCollab}
                  type="button"
                  className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  title="View active workspace and deliverables"
                >
                  <span>Active Collab</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}

              {offer.status === 'PENDING' && (
                <button
                  onClick={() => handleCancel(offer.id)}
                  disabled={cancellingOfferId === offer.id}
                  type="button"
                  className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-white border border-rose-500/25 hover:border-rose-500/50 text-xs font-bold transition-all duration-300 flex items-center gap-1.5 shadow-sm hover:shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group/btn"
                  title="Withdraw this offer"
                >
                  {cancellingOfferId === offer.id ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-300" />
                      <span>Cancelling...</span>
                    </>
                  ) : (
                    <>
                      <X className="w-3.5 h-3.5 text-rose-400 group-hover/btn:rotate-90 group-hover/btn:text-white transition-all duration-300" />
                      <span>Cancel</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
