'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Eye,
  CheckCircle2,
  ShieldCheck,
  MessageSquare,
  ArrowUpRight,
  RefreshCw,
  Target,
  Trash2,
} from 'lucide-react';
import { CampaignApplicationItem } from '@/services/application.service';
import { CreatorItem } from '../find-influencers/CreatorCard';
import { mapApplicationToCreator } from '../campaigns/mapApplicationToCreator';

interface ShortlistApplicantCardProps {
  application: CampaignApplicationItem;
  onViewDetails: (app: CampaignApplicationItem) => void;
  onViewProfile?: (creator: CreatorItem) => void;
  onSendOffer: (app: CampaignApplicationItem) => void;
  onReject: (appId: string) => void;
  onSelectCompare?: (appId: string) => void;
  isCompareSelected?: boolean;
  viewMode?: 'grid' | 'list';
  onFilterByCampaign?: (campaignId: string) => void;
}

export default function ShortlistApplicantCard({
  application,
  onViewDetails,
  onViewProfile,
  onSendOffer,
  onReject,
  onSelectCompare,
  isCompareSelected = false,
  viewMode = 'grid',
  onFilterByCampaign,
}: ShortlistApplicantCardProps) {
  const [imageError, setImageError] = useState(false);

  const creatorItem = mapApplicationToCreator(application);
  const match = application.matchSnapshot || { score: 92, eligibility: 'ELIGIBLE' };

  const handleOpenProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewProfile) {
      onViewProfile(creatorItem);
    }
  };

  const currencySym =
    application.proposedCurrency === 'INR' ||
    (application.proposedAmount && application.proposedAmount > 5000)
      ? '₹'
      : application.proposedCurrency === 'EUR'
      ? '€'
      : '$';

  const quoteDisplay = application.proposedAmount
    ? `${currencySym}${Number(application.proposedAmount).toLocaleString()}`
    : 'Flexible';

  const hasExistingOffer =
    application.status === 'OFFER_SENT' ||
    Boolean(application.offers && application.offers.length > 0);

  const campaignTitle = application.campaign?.title || 'Active Campaign';
  const campaignId = application.campaignId || application.campaign?.id;

  if (viewMode === 'list') {
    return (
      <div className="p-4 rounded-2xl bg-slate-950/75 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 shadow-lg shadow-purple-950/20 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {onSelectCompare && (
            <input
              type="checkbox"
              checked={isCompareSelected}
              onChange={() => onSelectCompare(application.id)}
              className="w-4 h-4 rounded border-purple-500/30 text-purple-600 focus:ring-purple-500 cursor-pointer"
            />
          )}

          <button
            type="button"
            onClick={handleOpenProfile}
            className="w-11 h-11 rounded-xl overflow-hidden border border-purple-500/30 hover:border-purple-400 bg-slate-900 shrink-0 shadow-md flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
          >
            {creatorItem.avatarUrl && !imageError ? (
              <img
                src={creatorItem.avatarUrl}
                alt={creatorItem.name}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600 flex items-center justify-center text-white font-black text-sm">
                {creatorItem.name ? creatorItem.name.charAt(0).toUpperCase() : 'C'}
              </div>
            )}
          </button>

          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenProfile}
                className="text-sm font-bold text-white hover:text-purple-300 transition-colors truncate text-left cursor-pointer"
              >
                {creatorItem.name}
              </button>
              <span className="px-2 py-0.5 rounded-md bg-purple-950/60 border border-purple-500/25 text-[10px] font-semibold text-purple-300">
                {match.score || 95}% Match
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="text-slate-300 font-medium">{creatorItem.handle}</span>
              <span>•</span>
              <button
                type="button"
                onClick={() => campaignId && onFilterByCampaign?.(campaignId)}
                className="text-[11px] text-purple-300 hover:underline flex items-center gap-1 font-semibold truncate max-w-[200px]"
                title={`Filter by campaign: ${campaignTitle}`}
              >
                <Target className="w-3 h-3 text-purple-400" />
                <span className="truncate">{campaignTitle}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Followers / Quote
            </span>
            <span className="text-xs font-black text-white">
              {creatorItem.reach} • <span className="text-purple-300">{quoteDisplay}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewDetails(application)}
              type="button"
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Pitch</span>
            </button>

            {hasExistingOffer && application.status !== 'OFFER_ACCEPTED' ? (
              <button
                onClick={() => onSendOffer(application)}
                type="button"
                className="px-3.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-xs font-bold text-purple-200 hover:text-white border border-purple-400/30 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Change Offer</span>
              </button>
            ) : application.status === 'OFFER_ACCEPTED' ? (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Accepted</span>
              </span>
            ) : (
              <button
                onClick={() => onSendOffer(application)}
                type="button"
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-purple-950/40 transition-all cursor-pointer"
              >
                <Send className="w-3 h-3" />
                <span>Send Offer</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-slate-950/75 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 space-y-4 shadow-xl shadow-purple-950/20 backdrop-blur-xl group flex flex-col justify-between">
      <div className="space-y-3.5">
        {/* Campaign Association Pill */}
        <div className="flex items-center justify-between gap-2 pb-1">
          <button
            type="button"
            onClick={() => campaignId && onFilterByCampaign?.(campaignId)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-500/25 text-[11px] font-bold text-purple-200 transition-colors truncate max-w-[220px] text-left cursor-pointer"
            title={`Campaign: ${campaignTitle}`}
          >
            <Target className="w-3 h-3 text-purple-400 shrink-0" />
            <span className="truncate">{campaignTitle}</span>
          </button>

          {onSelectCompare && (
            <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-white cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isCompareSelected}
                onChange={() => onSelectCompare(application.id)}
                className="w-3.5 h-3.5 rounded border-purple-500/30 text-purple-600 focus:ring-purple-500 cursor-pointer"
              />
              <span>Compare</span>
            </label>
          )}
        </div>

        {/* Header: Avatar, Name & Match Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <button
              type="button"
              onClick={handleOpenProfile}
              title={`View ${creatorItem.name}'s platform profile`}
              className="w-12 h-12 rounded-2xl overflow-hidden border border-purple-500/30 hover:border-purple-400 bg-slate-900 shrink-0 shadow-md flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer text-left relative"
            >
              {creatorItem.avatarUrl && !imageError ? (
                <img
                  src={creatorItem.avatarUrl}
                  alt={creatorItem.name}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600 flex items-center justify-center text-white font-black text-base shadow-inner">
                  {creatorItem.name ? creatorItem.name.charAt(0).toUpperCase() : 'C'}
                </div>
              )}
            </button>

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

          <div className="px-3 py-1 rounded-full bg-purple-950/70 border border-purple-500/35 flex items-center gap-1.5 text-xs font-black text-purple-200 shadow-sm shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
            <span>{match.score || 95}% Match</span>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 divide-x divide-purple-500/20 py-2 text-center bg-slate-900/40 rounded-2xl border border-white/5">
          <div className="px-2">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mb-0.5">
              Followers
            </span>
            <span className="text-sm sm:text-base font-black text-white">
              {creatorItem.reach}
            </span>
          </div>
          <div className="px-2">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mb-0.5">
              Engagement
            </span>
            <span className="text-sm sm:text-base font-black text-emerald-400">
              {creatorItem.engRate}
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

        {/* Pitch snippet */}
        {application.applicationMessage && (
          <div className="p-3 rounded-2xl bg-purple-950/20 border border-purple-500/20 text-xs text-slate-300 leading-relaxed italic flex items-start gap-2.5">
            <MessageSquare className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
            <p className="line-clamp-2">&quot;{application.applicationMessage}&quot;</p>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <button
          onClick={() => onViewDetails(application)}
          type="button"
          className="text-xs font-bold text-slate-300 hover:text-purple-300 flex items-center gap-1.5 transition-colors py-1 px-2 rounded-lg hover:bg-slate-900 cursor-pointer"
        >
          <Eye className="w-4 h-4 text-purple-400" />
          <span>Full Pitch</span>
        </button>

        <div className="flex items-center gap-2">
          {hasExistingOffer && application.status !== 'OFFER_ACCEPTED' ? (
            <button
              onClick={() => onSendOffer(application)}
              type="button"
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/30 via-indigo-600/30 to-purple-600/30 hover:from-purple-600 hover:to-indigo-600 text-xs font-bold text-purple-200 hover:text-white border border-purple-400/30 hover:border-transparent transition-all flex items-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-purple-300" />
              <span>Change Offer</span>
            </button>
          ) : application.status === 'OFFER_ACCEPTED' ? (
            <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Offer Accepted</span>
            </span>
          ) : (
            <button
              onClick={() => onSendOffer(application)}
              type="button"
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-purple-950/40 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
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
