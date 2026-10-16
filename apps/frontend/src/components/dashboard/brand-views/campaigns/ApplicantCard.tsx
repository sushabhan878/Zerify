'use client';

import React from 'react';
import {
  Sparkles,
  Send,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  MessageSquare,
  ArrowUpRight,
  User,
  RefreshCw,
} from 'lucide-react';
import { CampaignApplicationItem } from '@/services/application.service';
import { CreatorItem } from '../find-influencers/CreatorCard';
import { mapApplicationToCreator } from './mapApplicationToCreator';
import { useCurrency } from '@/context/CurrencyContext';
import Money from '@/components/currency/Money';

interface ApplicantCardProps {
  application: CampaignApplicationItem;
  onViewDetails: (app: CampaignApplicationItem) => void;
  onViewProfile?: (creator: CreatorItem) => void;
  onShortlist: (appId: string) => void;
  onReject: (appId: string) => void;
  onSendOffer: (app: CampaignApplicationItem) => void;
  onSelectCompare?: (appId: string) => void;
  isCompareSelected?: boolean;
  onAccept?: (app: CampaignApplicationItem) => void;
  onCounterOffer?: (app: CampaignApplicationItem) => void;
}

export default function ApplicantCard({
  application,
  onViewDetails,
  onViewProfile,
  onShortlist,
  onReject,
  onSendOffer,
  onSelectCompare,
  isCompareSelected,
  onAccept,
  onCounterOffer,
}: ApplicantCardProps) {
  const { currency } = useCurrency();
  const [imageError, setImageError] = React.useState(false);

  const creatorItem = React.useMemo(() => mapApplicationToCreator(application), [application]);
  const match: any = application.matchSnapshot || { score: 95, eligibility: 'ELIGIBLE' };

  const handleOpenProfile = () => {
    if (onViewProfile) {
      onViewProfile(creatorItem);
    } else {
      onViewDetails(application);
    }
  };

  // Follower Count & Formatting
  const followersDisplay = creatorItem.reach;

  // Engagement Rate
  const engagementDisplay = creatorItem.engRate;

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-slate-950/75 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 space-y-4 shadow-xl shadow-purple-950/20 backdrop-blur-xl group">
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Profile Picture / Initial Avatar Button */}
          <button
            type="button"
            onClick={handleOpenProfile}
            title={`View ${creatorItem.name}'s platform profile`}
            className="w-12 h-12 rounded-2xl overflow-hidden border border-purple-500/30 hover:border-purple-400 bg-slate-900 shrink-0 shadow-md flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 group/avatar cursor-pointer text-left relative"
          >
            {creatorItem.avatarUrl && !imageError ? (
              <img
                src={creatorItem.avatarUrl}
                alt={creatorItem.name}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600 flex items-center justify-center text-white font-black text-base shadow-inner select-none">
                {creatorItem.name ? creatorItem.name.charAt(0).toUpperCase() : 'C'}
              </div>
            )}
          </button>

          {/* Identity, Arrow & In-Platform Creator Info */}
          <div className="space-y-1 min-w-0">
            <button
              type="button"
              onClick={handleOpenProfile}
              title={`View ${creatorItem.name}'s platform profile`}
              className="inline-flex items-center gap-1.5 min-w-0 group/name cursor-pointer max-w-full text-left"
            >
              <h4 className="text-sm sm:text-base font-bold text-white group-hover/name:text-purple-300 transition-colors truncate">
                {creatorItem.name}
              </h4>
              <span className="p-0.5 rounded-md bg-purple-500/10 group-hover/name:bg-purple-500/25 border border-purple-500/20 text-purple-400 group-hover/name:text-purple-300 transition-all flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-3.5 h-3.5 group-hover/name:translate-x-0.5 group-hover/name:-translate-y-0.5 transition-transform" />
              </span>
            </button>

            <div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-950/60 border border-purple-500/25 text-[11px] font-semibold text-purple-300 shadow-sm">
                <ShieldCheck className="w-3 h-3 text-purple-400 shrink-0" />
                <span>Zerify Creator</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Badges: Status + Match Score */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {(() => {
            const badge = (() => {
              if (application.reviewNotes === 'COUNTER_OFFER') {
                return {
                  label: 'Counter Offer',
                  bg: 'bg-amber-500/20 text-amber-300 border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
                  dot: 'bg-amber-300 animate-ping',
                };
              }
              switch (application.status) {
                case 'OFFER_ACCEPTED':
                  return {
                    label: 'Accepted',
                    bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                    dot: 'bg-emerald-400',
                  };
                case 'OFFER_SENT':
                  return {
                    label: 'Offer Sent',
                    bg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
                    dot: 'bg-indigo-400 animate-pulse',
                  };
                case 'SHORTLISTED':
                  return {
                    label: 'Shortlisted',
                    bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
                    dot: 'bg-amber-400',
                  };
                case 'REJECTED':
                case 'OFFER_DECLINED':
                  return {
                    label: 'Declined',
                    bg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
                    dot: 'bg-rose-400',
                  };
                case 'UNDER_REVIEW':
                  return {
                    label: 'Under Review',
                    bg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
                    dot: 'bg-cyan-400',
                  };
                case 'APPLIED':
                default:
                  return {
                    label: 'New Pitch',
                    bg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
                    dot: 'bg-purple-400',
                  };
              }
            })();

            return (
              <div
                className={`px-2.5 py-1 rounded-full border text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${badge.bg}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                <span>{badge.label}</span>
              </div>
            );
          })()}

          <div className="px-2.5 py-1 rounded-full bg-purple-950/70 border border-purple-500/35 flex items-center gap-1 text-xs font-black text-purple-200 shadow-sm">
            <Sparkles className="w-3 h-3 text-purple-300 animate-pulse" />
            <span>{match.score || 95}% Match</span>
          </div>
        </div>
      </div>

      {/* Snapshot Stats (Followers, Engagement, Proposed Quote) - Clean Minimal Layout (No Horizontal Lines) */}
      <div className="grid grid-cols-3 divide-x divide-purple-500/20 py-2 text-center">
        <div className="px-2">
          <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mb-0.5">
            Followers
          </span>
          <span className="text-sm sm:text-base font-black text-white">
            {followersDisplay}
          </span>
        </div>
        <div className="px-2">
          <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mb-0.5">
            Engagement
          </span>
          <span className="text-sm sm:text-base font-black text-emerald-400">
            {engagementDisplay}
          </span>
        </div>
        <div className="px-2">
          <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mb-0.5">
            {application.reviewNotes === 'COUNTER_OFFER' ? 'Counter Quote' : 'Pitch Quote'}
          </span>
          <span className={`text-sm sm:text-base font-black ${application.reviewNotes === 'COUNTER_OFFER' ? 'text-amber-400' : 'text-purple-300'}`}>
            {application.proposedAmount ? (
              <Money
                amount={application.proposedAmount}
                currency={application.proposedCurrency || 'USD'}
              />
            ) : (
              'Flexible'
            )}
          </span>
        </div>
      </div>

      {/* Pitch Snippet */}
      {application.applicationMessage && (
        <div className="flex items-start gap-2 px-1 text-xs text-slate-300 leading-relaxed">
          <MessageSquare className="w-3.5 h-3.5 text-purple-400/80 shrink-0 mt-0.5" />
          <p className="line-clamp-2 italic">
            &quot;{application.applicationMessage}&quot;
          </p>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        <button
          onClick={() => onViewDetails(application)}
          type="button"
          className="group/pitch relative h-8 w-20 sm:w-24 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-white/5 hover:border-purple-500/40 text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center transition-colors duration-200 cursor-pointer shadow-sm overflow-hidden select-none"
        >
          <span className="transition-transform duration-200 group-hover/pitch:-translate-x-2">
            Pitch
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-purple-400 absolute right-2.5 opacity-0 translate-x-2 group-hover/pitch:opacity-100 group-hover/pitch:translate-x-0 transition-all duration-200" />
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          {application.status === 'APPLIED' ||
          application.status === 'UNDER_REVIEW' ||
          application.reviewNotes === 'COUNTER_OFFER' ? (
            <>
              {/* Option 2: Reject */}
              <button
                onClick={() => onReject(application.id)}
                type="button"
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/50 hover:text-rose-300 border border-white/5 hover:border-rose-500/30 text-xs font-bold text-slate-400 transition-all cursor-pointer"
              >
                Reject
              </button>

              {/* Option 3: Counter Offer */}
              <button
                onClick={() => (onCounterOffer ? onCounterOffer(application) : onSendOffer(application))}
                type="button"
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600/20 via-orange-600/20 to-amber-600/20 hover:from-amber-600 hover:to-orange-600 border border-amber-500/40 hover:border-transparent text-xs font-bold text-amber-200 hover:text-white transition-all flex items-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-300" />
                <span>Counter Offer</span>
              </button>

              {/* Option 4: Accept */}
              <button
                onClick={() => (onAccept ? onAccept(application) : onSendOffer(application))}
                type="button"
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Accept</span>
              </button>
            </>
          ) : application.status === 'SHORTLISTED' ? (
            <>
              <button
                onClick={() => onReject(application.id)}
                type="button"
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/50 hover:text-rose-300 border border-white/5 hover:border-rose-500/30 text-xs font-bold text-slate-400 transition-all cursor-pointer"
              >
                Reject
              </button>
              <button
                onClick={() => onSendOffer(application)}
                type="button"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-purple-950/40 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Offer</span>
              </button>
            </>
          ) : application.status === 'OFFER_SENT' ? (
            <span className="px-3.5 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-indigo-400" />
              <span>Offer Sent • Awaiting Response</span>
            </span>
          ) : application.status === 'OFFER_ACCEPTED' ? (
            <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Offer Accepted • In Collab</span>
            </span>
          ) : application.status === 'REJECTED' || application.status === 'OFFER_DECLINED' ? (
            <span className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs font-bold text-rose-400">
              Application Declined
            </span>
          ) : (
            <button
              onClick={() => onSendOffer(application)}
              type="button"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-purple-950/40 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Offer</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
