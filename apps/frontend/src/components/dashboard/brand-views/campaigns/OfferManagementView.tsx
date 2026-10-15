'use client';

import React, { useState } from 'react';
import {
  Send,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  DollarSign,
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
          bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-400',
          label: 'Accepted',
          desc: 'Creator agreed and joined campaign',
        };
      case 'DECLINED':
        return {
          bg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
          dot: 'bg-rose-400',
          label: 'Declined',
          desc: 'Creator turned down this offer',
        };
      case 'CANCELLED':
        return {
          bg: 'bg-slate-800 text-slate-400 border-white/10',
          dot: 'bg-slate-400',
          label: 'Cancelled',
          desc: 'Offer withdrawn by brand',
        };
      case 'OFFER_EXPIRED':
        return {
          bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-400',
          label: 'Expired',
          desc: 'Response deadline elapsed',
        };
      case 'PENDING':
      default:
        return {
          bg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
          dot: 'bg-purple-400 animate-pulse',
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
    <div className="space-y-3">
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
            className="p-4 sm:p-5 rounded-2xl bg-[#0b0f19]/90 border border-white/10 hover:border-purple-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg backdrop-blur-xl group"
          >
            {/* Creator Avatar & Info */}
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl overflow-hidden bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shrink-0 border border-white/10 shadow-md">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span>{displayName.charAt(0).toUpperCase()}</span>
                )}
              </div>

              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-black text-white truncate group-hover:text-purple-300 transition-colors">
                    {displayName}
                  </h4>
                  {isDirectInvite ? (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      Direct Invite
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      Application Offer
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">@{displayHandle}</span>
                  <span>•</span>
                  <span>Sent {new Date(offer.sentAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  {offer.customNotes && (
                    <>
                      <span>•</span>
                      <span className="text-slate-400 italic truncate max-w-[220px]" title={offer.customNotes}>
                        &ldquo;{offer.customNotes}&rdquo;
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side: Compensation, Status & Actions */}
            <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
              <div className="text-left md:text-right">
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">
                  Offered Fee
                </span>
                <span className="text-base font-black text-emerald-400">
                  {formatCurrency(offer.compensationAmount, offer.compensationCurrency || currency)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Status Badge */}
                <div
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-black border flex items-center gap-1.5 uppercase tracking-wider ${badge.bg}`}
                  title={badge.desc}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                  <span>{badge.label}</span>
                </div>

                {/* Actions based on status */}
                {offer.status === 'ACCEPTED' && onViewCollab && (
                  <button
                    onClick={onViewCollab}
                    type="button"
                    className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-black transition-all flex items-center gap-1 shadow-sm cursor-pointer"
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
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-rose-500/40 hover:bg-rose-950/40 hover:text-rose-300 text-xs font-bold text-slate-400 transition-all disabled:opacity-50 cursor-pointer"
                    title="Withdraw this offer"
                  >
                    {cancellingOfferId === offer.id ? 'Cancelling...' : 'Cancel'}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
