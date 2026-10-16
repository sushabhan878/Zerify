'use client';

import React, { useState } from 'react';
import { Users, CheckCircle, Clock, Video, ShieldCheck, ChevronRight, ArrowUpRight } from 'lucide-react';
import DeliverableReviewCard from './DeliverableReviewCard';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency } from '@/utils/currency';
import { isComplete } from '@/services/deliverable-workflow';

interface ParticipantManagementViewProps {
  participants: any[];
  onRefresh: () => void;
  onViewOffers?: () => void;
  offersCount?: number;
  onViewProfile?: (creator: any) => void;
}

export default function ParticipantManagementView({
  participants,
  onRefresh,
  onViewOffers,
  offersCount = 0,
  onViewProfile,
}: ParticipantManagementViewProps) {
  const { currency } = useCurrency();
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);

  if (participants.length === 0) {
    return (
      <div className="p-12 rounded-2xl bg-slate-950/40 border border-dashed border-white/10 text-center space-y-3">
        <Users className="w-8 h-8 text-slate-600 mx-auto" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-300">No active collaborations yet</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            When shortlisted influencers accept your collaboration offers, their active workspace, deliverable drafts, and review pipeline will appear here.
          </p>
        </div>
        {onViewOffers && (
          <button
            onClick={onViewOffers}
            type="button"
            className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
          >
            <span>View Sent Offers ({offersCount})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  const selectedParticipant = participants.find((p) => p.id === selectedParticipantId);

  return (
    <div className="space-y-6">
      {/* List of Confirmed Creators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {participants.map((p) => {
          const profile = p.influencerProfile || {};
          const rawHandle = profile.handle || profile.user?.name || 'Creator';
          const cleanHandle = rawHandle.replace(/^@+/, '');
          const displayName = profile.user?.name || cleanHandle;
          const avatarUrl = profile.avatarUrl || profile.user?.avatarUrl;
          const deliverables = p.deliverables || [];
          const completedCount = deliverables.filter(isComplete).length;
          const isSelected = selectedParticipantId === p.id;

          const handleOpenProfile = (e: React.MouseEvent) => {
            if (!onViewProfile) return;
            e.stopPropagation();
            onViewProfile({
              id: profile.id || p.influencerProfileId,
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

          return (
            <div
              key={p.id}
              onClick={() => setSelectedParticipantId(isSelected ? null : p.id)}
              className={`p-5 sm:p-6 rounded-3xl border transition-all duration-300 cursor-pointer space-y-4 shadow-xl backdrop-blur-xl group ${
                isSelected
                  ? 'bg-slate-950/90 border-purple-500 ring-2 ring-purple-500/30 shadow-[0_16px_40px_rgba(168,85,247,0.25)]'
                  : 'bg-slate-950/75 border-purple-500/20 hover:border-purple-500/40 shadow-purple-950/20 hover:shadow-[0_16px_40px_rgba(168,85,247,0.16)]'
              }`}
            >
              {/* Header: Avatar, Name & Fee */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Creator Avatar Picture */}
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-500 flex items-center justify-center text-white font-black text-sm shrink-0 border border-purple-400/30 shadow-md shadow-purple-950/40 group-hover:scale-105 transition-transform duration-300">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <span>{displayName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>

                  {/* Creator Name & Redirect Icon (No @ icon) */}
                  <div className="space-y-1 min-w-0">
                    <button
                      type="button"
                      onClick={handleOpenProfile}
                      title={`View ${displayName}'s platform profile`}
                      className="inline-flex items-center gap-1.5 min-w-0 group/name cursor-pointer max-w-full text-left"
                    >
                      <h4 className="text-sm sm:text-base font-black text-white group-hover/name:text-purple-300 transition-colors truncate">
                        {displayName}
                      </h4>
                      <span className="p-0.5 rounded-md bg-purple-500/10 group-hover/name:bg-purple-500/25 border border-purple-500/20 text-purple-400 group-hover/name:text-purple-300 transition-all flex items-center justify-center shrink-0">
                        <ArrowUpRight className="w-3.5 h-3.5 group-hover/name:translate-x-0.5 group-hover/name:-translate-y-0.5 transition-transform" />
                      </span>
                    </button>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>Joined {new Date(p.joinedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                {/* Fee Display Matching Other Cards */}
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">
                    FEE
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight leading-none block pt-0.5">
                    {formatCurrency(p.agreedAmount, p.agreedCurrency || currency)}
                  </span>
                </div>
              </div>

              {/* Deliverable Progress Meter - Seamless without nested card container */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300">Deliverable Progress</span>
                  <span className="font-black text-purple-300">
                    {completedCount} / {deliverables.length} Completed
                  </span>
                </div>
                <div className="w-full bg-slate-900/90 h-2 rounded-full overflow-hidden border border-white/5 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-purple-600 via-indigo-500 to-emerald-500 h-full transition-all duration-500 rounded-full"
                    style={{
                      width: `${deliverables.length > 0 ? (completedCount / deliverables.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-purple-400 font-bold group-hover:text-purple-300 transition-colors">
                <span className="font-black flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-purple-400" />
                  <span>{isSelected ? 'Hide Deliverables Workspace' : 'Inspect Deliverables'}</span>
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 group-hover:text-white transition-colors">
                  <span>{isSelected ? 'Close' : 'View drafts'}</span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-300 ${isSelected ? 'rotate-90 text-purple-300' : 'group-hover:translate-x-1'}`} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Participant Workspace */}
      {selectedParticipant && (() => {
        const pDeliverables = selectedParticipant.deliverables || [];
        const isAllDone = pDeliverables.length > 0 && pDeliverables.every(isComplete);
        const isCompleted = selectedParticipant.status === 'PARTICIPANT_COMPLETED';
        const pProfile = selectedParticipant.influencerProfile || {};
        const pDisplayName = pProfile.user?.name || (pProfile.handle ? pProfile.handle.replace(/^@+/, '') : 'Creator');

        return (
          <div className="p-6 rounded-3xl bg-slate-950/90 border border-purple-500/30 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-black text-purple-400 uppercase">Participant Workspace</span>
                <h3 className="text-base font-black text-white">
                  Deliverable Tracker: {pDisplayName}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {isCompleted ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Collaboration Completed · Eligible for Settlement
                  </span>
                ) : isAllDone ? (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const { DeliverableService } = await import('@/services/deliverable.service');
                        await DeliverableService.completeParticipant(selectedParticipant.id);
                        onRefresh();
                      } catch (err: any) {
                        alert(err?.message || 'Could not complete collaboration');
                      }
                    }}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 transition flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Finalize Collaboration & Mark Completed
                  </button>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                    Active in Production
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {pDeliverables.map((del: any) => (
                <DeliverableReviewCard key={del.id} deliverable={del} onRefresh={onRefresh} />
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
