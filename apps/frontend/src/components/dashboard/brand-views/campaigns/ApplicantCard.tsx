'use client';

import React from 'react';
import {
  Sparkles,
  Send,
  Eye,
  CheckCircle2,
  ShieldCheck,
  MessageSquare,
  ArrowUpRight,
  User,
} from 'lucide-react';
import { CampaignApplicationItem } from '@/services/application.service';
import { CreatorItem } from '../find-influencers/CreatorCard';
import { mapApplicationToCreator } from './mapApplicationToCreator';

interface ApplicantCardProps {
  application: CampaignApplicationItem;
  onViewDetails: (app: CampaignApplicationItem) => void;
  onViewProfile?: (creator: CreatorItem) => void;
  onShortlist: (appId: string) => void;
  onReject: (appId: string) => void;
  onSendOffer: (app: CampaignApplicationItem) => void;
  onSelectCompare?: (appId: string) => void;
  isCompareSelected?: boolean;
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
}: ApplicantCardProps) {
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

  // Proposed Quote Currency
  const currencySym =
    application.proposedCurrency === 'INR' || (application.proposedAmount && application.proposedAmount > 5000)
      ? '₹'
      : application.proposedCurrency === 'EUR'
      ? '€'
      : '$';

  const quoteDisplay = application.proposedAmount
    ? `${currencySym}${Number(application.proposedAmount).toLocaleString()}`
    : 'Flexible';

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

        {/* Right Badge: Match Score Only */}
        <div className="flex items-center shrink-0">
          <div className="px-3 py-1 rounded-full bg-purple-950/70 border border-purple-500/35 flex items-center gap-1.5 text-xs font-black text-purple-200 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
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
            Pitch Quote
          </span>
          <span className="text-sm sm:text-base font-black text-purple-300">
            {quoteDisplay}
          </span>
        </div>
      </div>

      {/* Pitch Snippet */}
      {application.applicationMessage && (
        <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/20 text-xs text-slate-300 leading-relaxed italic flex items-start gap-2.5">
          <MessageSquare className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <p className="line-clamp-2">&quot;{application.applicationMessage}&quot;</p>
        </div>
      )}

      {/* Action Footer (No Top Horizontal Line) */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => onViewDetails(application)}
          type="button"
          className="text-xs font-bold text-slate-300 hover:text-purple-300 flex items-center gap-1.5 transition-colors py-1 px-2 rounded-lg hover:bg-slate-900"
        >
          <Eye className="w-4 h-4 text-purple-400" />
          <span>Full Pitch</span>
        </button>

        <div className="flex items-center gap-2.5">
          {application.status === 'APPLIED' && (
            <>
              <button
                onClick={() => onReject(application.id)}
                type="button"
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/50 hover:text-rose-300 border border-white/5 hover:border-rose-500/30 text-xs font-bold text-slate-400 transition-all"
              >
                Pass
              </button>
              <button
                onClick={() => onShortlist(application.id)}
                type="button"
                className="px-4 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-xs font-bold text-indigo-200 hover:text-white border border-indigo-500/40 transition-all shadow-sm"
              >
                Shortlist
              </button>
            </>
          )}

          {(application.status === 'SHORTLISTED' || application.status === 'UNDER_REVIEW') && (
            <button
              onClick={() => onSendOffer(application)}
              type="button"
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-purple-950/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
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
