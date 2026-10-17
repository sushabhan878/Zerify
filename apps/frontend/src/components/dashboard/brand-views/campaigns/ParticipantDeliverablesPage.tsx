'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle,
  ShieldCheck,
  Video,
  ArrowUpRight,
  Layers,
  Sparkles,
  Loader2,
} from 'lucide-react';
import DeliverableReviewCard from './DeliverableReviewCard';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency } from '@/utils/currency';
import { isComplete } from '@/services/deliverable-workflow';
import { DeliverableService } from '@/services/deliverable.service';

interface ParticipantDeliverablesPageProps {
  participant: any;
  campaign?: any;
  onBack: () => void;
  onRefresh: () => void;
  onViewProfile?: (creator: any) => void;
}

export default function ParticipantDeliverablesPage({
  participant,
  campaign,
  onBack,
  onRefresh,
  onViewProfile,
}: ParticipantDeliverablesPageProps) {
  const { currency } = useCurrency();
  const [isFinalizing, setIsFinalizing] = useState(false);

  const profile = participant.influencerProfile || {};
  const rawHandle = profile.handle || profile.user?.name || 'Creator';
  const cleanHandle = rawHandle.replace(/^@+/, '');
  const displayName = profile.user?.name || cleanHandle;
  const avatarUrl = profile.avatarUrl || profile.user?.avatarUrl;

  const deliverables = participant.deliverables || [];
  const completedCount = deliverables.filter(isComplete).length;
  const isAllDone = deliverables.length > 0 && deliverables.every(isComplete);
  const isCompleted = participant.status === 'PARTICIPANT_COMPLETED';

  const handleOpenProfile = () => {
    if (!onViewProfile) return;
    onViewProfile({
      id: profile.id || participant.influencerProfileId,
      userId: profile.userId,
      name: displayName,
      handle: cleanHandle,
      avatarUrl: avatarUrl || '',
      category: profile.niches?.[0] || 'Content Creator',
      categories: profile.niches || ['Content Creator'],
      reach: profile.totalFollowers || '10K+',
      engRate: `${profile.averageEngagementRate || 4.5}%`,
      location: profile.location || 'Global',
      platforms: ['Instagram'],
      tier: 'Micro',
      verified: true,
    });
  };

  const handleFinalize = async () => {
    try {
      setIsFinalizing(true);
      await DeliverableService.completeParticipant(participant.id);
      onRefresh();
    } catch (err: any) {
      alert(err?.message || 'Could not complete collaboration');
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Breadcrumbs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <button
          onClick={onBack}
          type="button"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 text-purple-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Collaborations</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="truncate max-w-[200px] text-purple-300 font-semibold">
            {campaign?.title || 'Campaign'}
          </span>
          <span>/</span>
          <span className="text-white font-bold">{displayName}</span>
        </div>
      </div>

      {/* Collaboration Overview Banner */}
      <div className="relative overflow-visible mt-4 p-5 sm:p-6 pr-6 sm:pr-8 rounded-2xl bg-slate-950/60 border border-purple-500/20 hover:border-purple-500/40 backdrop-blur-2xl shadow-xl shadow-purple-950/20 hover:shadow-[0_16px_40px_rgba(168,85,247,0.16)] transition-all duration-300 space-y-4 group">
        {/* Ambient Background Aura Clipped */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-purple-600/10 rounded-full blur-2xl group-hover:bg-purple-600/20 transition-all duration-500" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-600/10 rounded-full blur-2xl group-hover:bg-indigo-600/15 transition-all duration-500" />
        </div>

        {/* Floating Status Badge Overlapping Top-Right Corner - Shifted higher */}
        <div
          className="absolute right-5 sm:right-7 z-30 pointer-events-none"
          style={{ top: '-10px', transform: 'translateY(-50%)' }}
        >
          {isCompleted ? (
            <span className="px-4 py-1.5 rounded-full border border-emerald-400/50 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white text-xs sm:text-[13px] font-black tracking-wide flex items-center gap-1.5 shadow-xl shadow-emerald-950/80 ring-4 ring-[#090C15] group-hover:scale-105 transition-all duration-300">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
              <span>Completed</span>
            </span>
          ) : (
            <span className="px-4 py-1.5 rounded-full border border-purple-400/50 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white text-xs sm:text-[13px] font-black tracking-wide flex items-center gap-1.5 shadow-xl shadow-purple-950/80 ring-4 ring-[#090C15] group-hover:scale-105 transition-all duration-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-200 animate-pulse shrink-0" />
              <span>In Production</span>
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-white/10 pb-5 relative z-10">
          {/* Creator Profile */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-500 flex items-center justify-center text-white font-black text-base shrink-0 border border-purple-400/30 shadow-lg shadow-purple-950/40">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span>{displayName.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenProfile}
                  className="inline-flex items-center gap-1.5 group/name text-left cursor-pointer"
                >
                  <h2 className="text-lg sm:text-xl font-black text-white group-hover/name:text-purple-300 transition-colors truncate">
                    {displayName}
                  </h2>
                  <ArrowUpRight className="w-4 h-4 text-purple-400 group-hover/name:text-purple-300 transition-transform group-hover/name:translate-x-0.5 group-hover/name:-translate-y-0.5" />
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-semibold text-purple-300/90">@{cleanHandle}</span>
                <span>•</span>
                <span>
                  Joined{' '}
                  {new Date(participant.joinedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Agreed Amount */}
          <div className="text-left sm:text-right shrink-0">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight leading-none block">
              {formatCurrency(participant.agreedAmount, participant.agreedCurrency || currency)}
            </span>
            <span className="text-[11px] text-slate-400 font-semibold block pt-1">
              Agreed Collaboration Fee
            </span>
          </div>
        </div>

        {/* Progress & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div className="space-y-1.5 flex-1 max-w-md">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-400">Overall Deliverables Progress</span>
              <span className="font-black text-purple-300">
                {completedCount} / {deliverables.length} Completed
              </span>
            </div>
            <div className="w-full bg-slate-800/50 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                style={{
                  width: `${deliverables.length > 0 ? (completedCount / deliverables.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* Finalize Action */}
          {isAllDone && !isCompleted && (
            <button
              type="button"
              disabled={isFinalizing}
              onClick={handleFinalize}
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
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

      {/* Deliverables Pipeline Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-purple-400" />
            <h3 className="text-base font-black text-white">Deliverables Pipeline</h3>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 text-xs font-bold border border-purple-500/20">
              {deliverables.length}
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Review drafts, request revisions, and verify live publications
          </span>
        </div>

        {deliverables.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-950/50 border border-dashed border-white/10 text-center space-y-2">
            <Layers className="w-8 h-8 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-300">No deliverables assigned yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Deliverables configured in the campaign brief will appear here once instantiated.
            </p>
          </div>
        ) : (
          <div className="space-y-8 sm:space-y-10 pt-3">
            {deliverables.map((del: any) => (
              <DeliverableReviewCard key={del.id} deliverable={del} onRefresh={onRefresh} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
