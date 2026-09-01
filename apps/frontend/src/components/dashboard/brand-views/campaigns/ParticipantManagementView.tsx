'use client';

import React, { useState } from 'react';
import { Users, CheckCircle, Clock, Video, ShieldCheck, ChevronRight } from 'lucide-react';
import DeliverableReviewCard from './DeliverableReviewCard';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency } from '@/utils/currency';

interface ParticipantManagementViewProps {
  participants: any[];
  onRefresh: () => void;
}

export default function ParticipantManagementView({
  participants,
  onRefresh,
}: ParticipantManagementViewProps) {
  const { currency } = useCurrency();
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);

  if (participants.length === 0) {
    return (
      <div className="p-12 rounded-2xl bg-slate-950/40 border border-dashed border-white/10 text-center space-y-2">
        <Users className="w-8 h-8 text-slate-600 mx-auto" />
        <h4 className="text-xs font-bold text-slate-300">No confirmed creators yet</h4>
        <p className="text-[11px] text-slate-500">
          When shortlisted influencers accept your collaboration offers, their active project workspace will appear here.
        </p>
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
          const deliverables = p.deliverables || [];
          const completedCount = deliverables.filter((d: any) => d.status === 'VERIFIED' || d.status === 'APPROVED').length;
          const isSelected = selectedParticipantId === p.id;

          return (
            <div
              key={p.id}
              onClick={() => setSelectedParticipantId(isSelected ? null : p.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                isSelected
                  ? 'bg-purple-950/20 border-purple-500/80 ring-1 ring-purple-500/50'
                  : 'bg-slate-900/80 border-white/10 hover:border-purple-500/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs">
                    {profile.handle ? profile.handle.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">@{profile.handle || 'creator'}</h4>
                    <span className="text-[10px] text-slate-400">
                      Joined {new Date(p.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Fee</span>
                  <span className="text-xs font-black text-emerald-400">
                    {formatCurrency(p.agreedAmount, p.agreedCurrency || currency)}
                  </span>
                </div>
              </div>

              {/* Deliverable Progress Meter */}
              <div className="space-y-1 bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-400">Deliverable Progress</span>
                  <span className="text-purple-300">
                    {completedCount} / {deliverables.length} Completed
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-emerald-500 h-full transition-all"
                    style={{
                      width: `${deliverables.length > 0 ? (completedCount / deliverables.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs text-purple-400 font-bold">
                <span>{isSelected ? 'Hide Workspace' : 'Inspect Deliverables'}</span>
                <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Participant Workspace */}
      {selectedParticipant && (
        <div className="p-6 rounded-3xl bg-slate-950/90 border border-purple-500/30 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] font-black text-purple-400 uppercase">Participant Workspace</span>
              <h3 className="text-base font-black text-white">
                Deliverable Tracker: @{selectedParticipant.influencerProfile?.handle}
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Contract Active
            </span>
          </div>

          <div className="space-y-3">
            {(selectedParticipant.deliverables || []).map((del: any) => (
              <DeliverableReviewCard key={del.id} deliverable={del} onRefresh={onRefresh} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
