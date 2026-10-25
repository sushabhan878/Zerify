'use client';

import React, { useState } from 'react';
import { Users, ChevronRight, ArrowUpRight, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency } from '@/utils/currency';
import { isComplete } from '@/services/deliverable-workflow';
import ParticipantDeliverablesPage from './ParticipantDeliverablesPage';
import ZerifyCreatorRibbon from '@/components/dashboard/common/ZerifyCreatorRibbon';

interface ParticipantManagementViewProps {
  participants: any[];
  campaign?: any;
  onRefresh: () => void;
  onViewOffers?: () => void;
  offersCount?: number;
  onViewProfile?: (creator: any) => void;
  onManageDeliverables?: (participant: any) => void;
}

export default function ParticipantManagementView({
  participants,
  campaign,
  onRefresh,
  onViewOffers,
  offersCount = 0,
  onViewProfile,
  onManageDeliverables,
}: ParticipantManagementViewProps) {
  const { currency } = useCurrency();
  const [localManagingParticipant, setLocalManagingParticipant] = useState<any | null>(null);

  // If viewing dedicated page via local state fallback
  if (localManagingParticipant) {
    const currentParticipant =
      participants.find((p) => p.id === localManagingParticipant.id) || localManagingParticipant;
    return (
      <ParticipantDeliverablesPage
        participant={currentParticipant}
        campaign={campaign}
        onBack={() => setLocalManagingParticipant(null)}
        onRefresh={onRefresh}
        onViewProfile={onViewProfile}
      />
    );
  }

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
            className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>View Sent Offers ({offersCount})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

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

          const deliverableDescription =
            deliverables.find((d: any) => d.description)?.description ||
            p.deliverableDescription ||
            p.deliverablesDescription ||
            p.notes ||
            p.customNotes ||
            p.description ||
            p.application?.applicationMessage ||
            campaign?.description ||
            (campaign?.deliverables && campaign.deliverables[0]?.description);

          const showZerifyCreator = Boolean(
            p.hasWorkedWithBrand ||
            p.workedWithBrand ||
            p.influencerProfile?.hasWorkedWithBrand ||
            p.isPastCollaborator ||
            p.influencerProfile?.isPastCollaborator ||
            p.influencerProfile?.verified ||
            p.influencerProfile?.isVerified ||
            (p.influencerProfile?.completedCollaborations && p.influencerProfile.completedCollaborations > 0) ||
            (p.influencerProfile?.collaborationsCount && p.influencerProfile.collaborationsCount > 0) ||
            p.isZerifyCreator !== false
          );

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

          const handleOpenDeliverables = () => {
            if (onManageDeliverables) {
              onManageDeliverables(p);
            } else {
              setLocalManagingParticipant(p);
            }
          };

          return (
            <div
              key={p.id}
              className="relative overflow-hidden p-5 sm:p-6 rounded-3xl border transition-all duration-300 space-y-3.5 shadow-xl backdrop-blur-xl group bg-slate-950/75 border-purple-500/20 hover:border-purple-500/40 shadow-purple-950/20 hover:shadow-[0_16px_40px_rgba(168,85,247,0.16)]"
            >
              {/* Header: Avatar, Name & Payout (No "FEE" text) */}
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

                  {/* Creator Name & Redirect Icon */}
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
                      <span>
                        Joined{' '}
                        {new Date(p.joinedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amount Display (No "FEE" label) */}
                <div className="text-right shrink-0">
                  <span className="text-lg sm:text-xl md:text-2xl font-black text-emerald-400 tracking-tight leading-none block">
                    {formatCurrency(p.agreedAmount, p.agreedCurrency || currency)}
                  </span>
                </div>
              </div>

              {/* Deliverable Description */}
              {deliverableDescription && (
                <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed font-normal">
                  {deliverableDescription}
                </p>
              )}

              {/* Deliverable Progress Meter - Shorter in width with comfortable spacing */}
              <div className="space-y-1.5 pt-3 max-w-xs sm:max-w-sm">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-400">Deliverable Progress</span>
                  <span className="font-bold text-purple-300 text-[11px]">
                    {completedCount} / {deliverables.length} Completed
                  </span>
                </div>
                <div className="w-full bg-slate-800/50 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 h-full transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                    style={{
                      width: `${deliverables.length > 0 ? (completedCount / deliverables.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Action Footer: Link to Manage Deliverables (similar to Detailed Pitch) */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-3 relative z-30">
                <button
                  type="button"
                  onClick={handleOpenDeliverables}
                  className="group/manage inline-flex items-center gap-1.5 py-1 text-xs sm:text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors duration-200 cursor-pointer select-none"
                >
                  <span>Manage Deliverables</span>
                  <ArrowRight className="w-4 h-4 text-purple-400 group-hover/manage:text-purple-300 group-hover/manage:translate-x-1 transition-transform duration-200 shrink-0" />
                </button>
              </div>

              {/* Bottom-Right Diagonal Corner Ribbon: Zerify Creator (3D wrap effect) */}
              {showZerifyCreator && <ZerifyCreatorRibbon />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
