'use client';

import React from 'react';
import {
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

  // Status Badge Configuration for Top-Right Floating Badge (like CreatorCard)
  const statusBadge = (() => {
    if (application.reviewNotes === 'COUNTER_OFFER') {
      return {
        label: 'Counter Offer',
        gradient: 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600',
        border: 'border-amber-400/60',
        shadow: 'shadow-lg shadow-amber-600/30',
        dot: 'bg-amber-200 animate-pulse shadow-sm',
      };
    }
    switch (application.status) {
      case 'OFFER_ACCEPTED':
        return {
          label: 'Accepted',
          gradient: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500',
          border: 'border-emerald-400/60',
          shadow: 'shadow-lg shadow-emerald-600/30',
          dot: 'bg-emerald-200 animate-pulse shadow-sm',
        };
      case 'OFFER_SENT':
        return {
          label: 'Offer Sent',
          gradient: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600',
          border: 'border-indigo-400/60',
          shadow: 'shadow-lg shadow-indigo-600/30',
          dot: 'bg-indigo-200 animate-pulse shadow-sm',
        };
      case 'SHORTLISTED':
        return {
          label: 'Shortlisted',
          gradient: 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600',
          border: 'border-purple-400/60',
          shadow: 'shadow-lg shadow-purple-600/30',
          dot: 'bg-purple-200 animate-pulse shadow-sm',
        };
      case 'REJECTED':
      case 'OFFER_DECLINED':
        return {
          label: 'Declined',
          gradient: 'bg-gradient-to-r from-rose-700 via-red-700 to-rose-700',
          border: 'border-rose-400/60',
          shadow: 'shadow-lg shadow-rose-900/40',
          dot: 'bg-rose-200 shadow-sm',
        };
      case 'UNDER_REVIEW':
        return {
          label: 'Under Review',
          gradient: 'bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-600',
          border: 'border-cyan-400/60',
          shadow: 'shadow-lg shadow-cyan-600/30',
          dot: 'bg-cyan-200 shadow-sm',
        };
      case 'APPLIED':
      default:
        return {
          label: 'New Pitch',
          gradient: 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600',
          border: 'border-purple-400/60',
          shadow: 'shadow-lg shadow-purple-600/30',
          dot: 'bg-purple-200 animate-pulse shadow-sm',
        };
    }
  })();

  return (
    <div className="relative overflow-visible px-5 pb-5 pt-3 sm:px-6 sm:pb-6 sm:pt-3.5 rounded-3xl bg-slate-950/75 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 space-y-3.5 shadow-xl shadow-purple-950/20 backdrop-blur-xl group">
      {/* Floating Status Badge Overlapping Top-Right Corner */}
      <div className="absolute -top-2.5 sm:-top-3 right-5 sm:right-6 z-30 pointer-events-none">
        <span
          className={`px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full ${statusBadge.gradient} border ${statusBadge.border} text-xs sm:text-sm font-black text-white flex items-center gap-1.5 shadow-xl ${statusBadge.shadow} ring-4 ring-[#090C15] group-hover:scale-105 transition-all duration-300`}
        >
          <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
          <span className="uppercase tracking-wider">{statusBadge.label}</span>
        </span>
      </div>

      {/* Top Header Row - Shifted upward to eliminate dead gap on top */}
      <div className="flex items-start justify-between gap-3 -mt-0.5 sm:-mt-1">
        <div className="flex items-center gap-3.5 min-w-0 pr-24 sm:pr-28">
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
          <div className="space-y-0.5 min-w-0">
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

            <p className="text-xs text-slate-400 font-medium truncate">
              {creatorItem.category || creatorItem.role || 'Verified Creator'}
            </p>
          </div>
        </div>
      </div>

      {/* Snapshot Stats (Followers, Engagement, Proposed Quote) - Clean Minimal Layout (No Horizontal Lines) */}
      <div className="grid grid-cols-3 divide-x divide-purple-500/20 py-2 text-center">
        <div className="px-2">
          <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mb-0.5">
            Followers
          </span>
          <span className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight">
            {followersDisplay}
          </span>
        </div>
        <div className="px-2">
          <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mb-0.5">
            Engagement
          </span>
          <span className="text-lg sm:text-xl md:text-2xl font-black text-emerald-400 tracking-tight">
            {engagementDisplay}
          </span>
        </div>
        <div className="px-2">
          <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mb-0.5">
            {application.reviewNotes === 'COUNTER_OFFER' ? 'Counter Quote' : 'Pitch Quote'}
          </span>
          <span className={`text-lg sm:text-xl md:text-2xl font-black tracking-tight ${application.reviewNotes === 'COUNTER_OFFER' ? 'text-amber-400' : 'text-purple-300'}`}>
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
        {/* Link to Detailed Pitch Popup */}
        <button
          onClick={() => onViewDetails(application)}
          type="button"
          className="group/pitch inline-flex items-center gap-1.5 py-1 text-xs sm:text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors duration-200 cursor-pointer select-none"
        >
          <span>Detailed Pitch</span>
          <ArrowRight className="w-4 h-4 text-purple-400 group-hover/pitch:text-purple-300 group-hover/pitch:translate-x-1 transition-transform duration-200 shrink-0" />
        </button>

        <div className="flex items-center gap-2 flex-wrap pr-16 sm:pr-20">
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
          ) : application.status === 'OFFER_ACCEPTED' ? null : application.status === 'REJECTED' || application.status === 'OFFER_DECLINED' ? (
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

      {/* Bottom-Right Diagonal Corner Ribbon: Zerify Creator (Bigger & Prominent) */}
      <div className="absolute bottom-0 right-0 w-28 h-28 sm:w-32 sm:h-32 overflow-hidden rounded-br-3xl pointer-events-none z-20">
        <div className="absolute bottom-[20px] sm:bottom-[22px] -right-[40px] sm:-right-[44px] w-[160px] sm:w-[170px] -rotate-45 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 py-1 sm:py-1.5 shadow-xl shadow-purple-950/90 border-y border-purple-300/40 flex items-center justify-center gap-1.5 group-hover:scale-105 transition-transform duration-300">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-200 shrink-0" />
          <span className="text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider text-white drop-shadow-md whitespace-nowrap">
            Zerify Creator
          </span>
        </div>
      </div>
    </div>
  );
}
