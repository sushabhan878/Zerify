'use client';

import React, { useMemo } from 'react';
import {
  CheckCircle,
  Sparkles,
  ArrowUpRight,
  FileText,
  Layers,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { PlatformBadge } from '../find-influencers/CreatorCard';
import Money from '@/components/currency/Money';

interface ManageDeliverableOverviewCardProps {
  participant: any;
  campaign?: any;
  displayName: string;
  avatarUrl?: string;
  isCompleted: boolean;
  isAllDone: boolean;
  completedCount: number;
  deliverables: any[];
  isFinalizing: boolean;
  onOpenProfile: () => void;
  onFinalize: () => void;
}

function formatDeliverableName(platform?: string, type?: string, title?: string): string {
  if (title && title.trim()) return title.trim();
  const p = (platform || '').trim();
  const t = (type || 'Deliverable').trim();

  let pName = p;
  if (/^instagram$/i.test(p)) pName = 'Instagram';
  else if (/^youtube$/i.test(p)) pName = 'YouTube';
  else if (/^tiktok$/i.test(p)) pName = 'TikTok';
  else if (/^twitter|x$/i.test(p)) pName = 'X';
  else if (/^linkedin$/i.test(p)) pName = 'LinkedIn';
  else if (/^facebook$/i.test(p)) pName = 'Facebook';

  let tName = t;
  if (/^reels?$/i.test(t)) tName = 'Reels';
  else if (/^posts?$/i.test(t)) tName = 'Post';
  else if (/^story|stories$/i.test(t)) tName = 'Story';
  else if (/^shorts?$/i.test(t)) tName = 'Shorts';
  else if (/^videos?$/i.test(t)) tName = 'Video';
  else if (/^carousel$/i.test(t)) tName = 'Carousel';

  if (pName && !tName.toLowerCase().includes(pName.toLowerCase())) {
    return `${pName} ${tName}`;
  }
  return tName;
}

export default function ManageDeliverableOverviewCard({
  participant,
  campaign,
  displayName,
  avatarUrl,
  isCompleted,
  isAllDone,
  completedCount,
  deliverables,
  isFinalizing,
  onOpenProfile,
  onFinalize,
}: ManageDeliverableOverviewCardProps) {
  const profile = participant.influencerProfile || {};

  // Extract operating platforms with fallback to campaign / deliverables
  const operatingPlatforms = useMemo(() => {
    const list: string[] = [];
    const add = (val?: string) => {
      if (!val) return;
      const clean = val.trim();
      if (clean && !list.some((item) => item.toUpperCase() === clean.toUpperCase())) {
        list.push(clean);
      }
    };

    if (Array.isArray(profile.platforms)) profile.platforms.forEach(add);
    if (Array.isArray(profile.socialAccounts)) {
      profile.socialAccounts.forEach((acc: any) => add(acc.platform));
    }
    deliverables.forEach((d: any) => add(d.platform));
    if (Array.isArray(campaign?.platforms)) campaign.platforms.forEach(add);

    if (list.length === 0) list.push('Instagram');
    return list;
  }, [profile, deliverables, campaign]);

  // Campaign or collaboration description
  const description =
    campaign?.description ||
    participant.campaign?.description ||
    participant.notes ||
    deliverables.find((d: any) => d.description)?.description ||
    participant.application?.applicationMessage ||
    'Deliverable requirements and publication guidelines as agreed in the campaign brief.';

  const productName = campaign?.product?.productName;
  const hashtags =
    campaign?.contentGuidelines?.requiredHashtags ||
    deliverables[0]?.requirements?.mandatoryHashtags ||
    [];

  return (
    <div className="relative overflow-visible mt-6 sm:mt-7 p-5 sm:p-6 pr-6 sm:pr-8 rounded-2xl bg-slate-950/60 border border-purple-500/20 hover:border-purple-500/40 backdrop-blur-2xl shadow-xl shadow-purple-950/20 hover:shadow-[0_16px_40px_rgba(168,85,247,0.16)] transition-all duration-300 space-y-5 group">
      {/* Ambient Background Aura Clipped */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-purple-600/10 rounded-full blur-2xl group-hover:bg-purple-600/20 transition-all duration-500" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-600/10 rounded-full blur-2xl group-hover:bg-indigo-600/15 transition-all duration-500" />
      </div>

      {/* Floating Status Badge Overlapping Top-Right Corner - Shifted higher & bigger */}
      <div
        className="absolute right-5 sm:right-7 z-30 pointer-events-none"
        style={{ top: '-16px', transform: 'translateY(-50%)' }}
      >
        {isCompleted ? (
          <span className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full border border-emerald-400/50 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white text-sm sm:text-[14px] font-black tracking-wide flex items-center gap-2 shadow-2xl shadow-emerald-950/80 ring-4 ring-[#090C15] group-hover:scale-105 transition-all duration-300">
            <CheckCircle className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>Completed</span>
          </span>
        ) : (
          <span className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full border border-purple-400/50 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white text-sm sm:text-[14px] font-black tracking-wide flex items-center gap-2 shadow-2xl shadow-purple-950/80 ring-4 ring-[#090C15] group-hover:scale-105 transition-all duration-300">
            <Sparkles className="w-4 h-4 text-purple-200 animate-pulse shrink-0" />
            <span>In Production</span>
          </span>
        )}
      </div>

      {/* Header Row: Creator Information, Operating Platforms, and Agreed Amount */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-white/10 pb-5 relative z-10">
        {/* Creator Identity & Operating Platforms */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-500 flex items-center justify-center text-white font-black text-base shrink-0 border border-purple-400/30 shadow-lg shadow-purple-950/40">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span>{displayName.charAt(0).toUpperCase()}</span>
            )}
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenProfile}
                className="inline-flex items-center gap-1.5 group/name text-left cursor-pointer"
              >
                <h2 className="text-lg sm:text-xl font-black text-white group-hover/name:text-purple-300 transition-colors truncate">
                  {displayName}
                </h2>
                <ArrowUpRight className="w-4 h-4 text-purple-400 group-hover/name:text-purple-300 transition-transform group-hover/name:translate-x-0.5 group-hover/name:-translate-y-0.5" />
              </button>
            </div>

            {/* Operating Platforms with Logos & Joined Date */}
            <div className="flex items-center gap-2.5 flex-wrap text-xs text-slate-400">
              <span className="font-medium text-slate-400">
                Joined{' '}
                {new Date(participant.joinedAt || Date.now()).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>

              {operatingPlatforms.length > 0 && (
                <>
                  <span className="text-slate-600">•</span>
                  <div className="flex items-center gap-1.5" title="Operating Platforms">
                    {operatingPlatforms.map((plat) => (
                      <PlatformBadge key={plat} platform={plat} size="sm" />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Agreed Amount */}
        <div className="text-left sm:text-right shrink-0">
          <span className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight leading-none block">
            <Money amount={participant.agreedAmount} currency={participant.agreedCurrency || 'USD'} />
          </span>
          <span className="text-[11px] text-slate-400 font-semibold block pt-1">
            Agreed Collaboration Fee
          </span>
        </div>
      </div>

      {/* Main Grid: Left Side Description vs Right Side Deliverables & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 items-stretch">
        {/* Left Side: Campaign Description & Scope */}
        <div className="lg:col-span-6 flex flex-col justify-between p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Campaign Brief & Scope
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal whitespace-pre-line">
              {description}
            </p>
          </div>

          {/* Product & Hashtags metadata if available */}
          {(productName || hashtags.length > 0) && (
            <div className="pt-2 border-t border-white/5 flex flex-wrap gap-1.5 items-center">
              {productName && (
                <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[11px] font-medium">
                  Product: {productName}
                </span>
              )}
              {hashtags.slice(0, 3).map((tag: string) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px] font-medium"
                >
                  {tag.startsWith('#') ? tag : `#${tag}`}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Deliverables in Two Rows & Progress Bar Below */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          {/* Deliverables Header */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Deliverables Scope ({deliverables.length})
                </span>
              </div>
            </div>

            {/* Deliverables tags in two rows */}
            {deliverables.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-900/40 border border-dashed border-white/10 text-center">
                <span className="text-xs text-slate-400">No deliverables assigned yet</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {deliverables.map((del: any, idx: number) => {
                  const revisionLimit = del.requirements?.revisionLimit || del.revisionLimit || 2;
                  const revisionCount = del.revisionCount || 0;
                  const delName = formatDeliverableName(del.platform, del.type, del.title);

                  return (
                    <div
                      key={del.id || idx}
                      className="p-2.5 rounded-xl bg-slate-900/60 border border-purple-500/20 hover:border-purple-500/40 transition-colors flex items-center justify-between gap-2 shadow-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <PlatformBadge platform={del.platform || 'Instagram'} size="sm" />
                        <span className="text-xs font-bold text-white truncate">
                          {del.quantity || 1}x {delName}
                        </span>
                      </div>
                      <div className="shrink-0">
                        <span
                          className="px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-200 text-[10px] font-bold tracking-tight"
                          title={`${revisionCount} revisions out of ${revisionLimit} allowed`}
                        >
                          {revisionCount}/{revisionLimit} Revs
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Progress Bar & Finalize Button below Deliverables */}
          <div className="space-y-2.5 pt-1">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-400">Overall Deliverables Progress</span>
                <span className="font-black text-purple-300">
                  {completedCount} / {deliverables.length} Completed
                </span>
              </div>
              <div className="w-full bg-slate-800/50 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                  style={{
                    width: `${deliverables.length > 0 ? (completedCount / deliverables.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Finalize Action when all deliverables are complete */}
            {isAllDone && !isCompleted && (
              <button
                type="button"
                disabled={isFinalizing}
                onClick={onFinalize}
                className="w-full mt-2 px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isFinalizing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Finalizing...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Finalize Collaboration & Mark Completed</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
