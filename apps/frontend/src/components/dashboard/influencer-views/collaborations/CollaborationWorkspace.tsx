'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Megaphone, Video, DollarSign, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { DeliverableService, ParticipantDeliverableItem } from '@/services/deliverable.service';
import DeliverableTaskCard from './DeliverableTaskCard';
import SubmitDraftModal from './SubmitDraftModal';
import SubmitPublishedLinkModal from './SubmitPublishedLinkModal';

interface CollaborationWorkspaceProps {
  participantId: string;
  onBack: () => void;
}

export default function CollaborationWorkspace({
  participantId,
  onBack,
}: CollaborationWorkspaceProps) {
  const [participant, setParticipant] = useState<any>(null);
  const [deliverables, setDeliverables] = useState<ParticipantDeliverableItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedForDraft, setSelectedForDraft] = useState<ParticipantDeliverableItem | null>(null);
  const [selectedForPublish, setSelectedForPublish] = useState<ParticipantDeliverableItem | null>(null);

  const loadData = async () => {
    try {
      const [partData, delData] = await Promise.all([
        DeliverableService.getParticipantDetails(participantId),
        DeliverableService.getParticipantDeliverables(participantId),
      ]);
      setParticipant(partData);
      setDeliverables(delData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [participantId]);

  if (isLoading || !participant) {
    return (
      <div className="p-12 text-center text-xs text-slate-400">
        Loading creator workspace...
      </div>
    );
  }

  const campaign = participant.campaign || {};
  const brand = campaign.brandProfile || {};
  const completedCount = deliverables.filter((d) => d.status === 'VERIFIED').length;

  return (
    <div className="space-y-6">
      {/* Top Back Navigation */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Active Collaborations</span>
      </button>

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 backdrop-blur-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-white/10 overflow-hidden flex-shrink-0">
              <img
                src={brand.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80'}
                alt={brand.companyName || 'Brand'}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider block">
                Active Project Workspace
              </span>
              <h2 className="text-lg font-black text-white">{campaign.title}</h2>
              <span className="text-xs text-slate-400 font-bold">{brand.companyName}</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-2xl border border-white/5 text-right">
            <span className="text-[10px] text-slate-500 font-bold block uppercase">Agreed Payout</span>
            <span className="text-base font-black text-emerald-400">
              ${participant.agreedAmount?.toLocaleString()} {participant.agreedCurrency}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-2 border-t border-white/5">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-400">Overall Deliverable Completion</span>
            <span className="text-emerald-400">
              {completedCount} of {deliverables.length} Deliverables Verified
            </span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-600 to-emerald-500 h-full transition-all"
              style={{
                width: `${deliverables.length > 0 ? (completedCount / deliverables.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Deliverable Tasks List */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-white flex items-center gap-2">
          <Video className="w-4 h-4 text-purple-400" />
          <span>Deliverable Tasks & Milestones</span>
        </h3>

        <div className="space-y-3">
          {deliverables.map((del) => (
            <DeliverableTaskCard
              key={del.id}
              deliverable={del}
              onSubmitDraft={(d) => setSelectedForDraft(d)}
              onSubmitPublished={(d) => setSelectedForPublish(d)}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      {selectedForDraft && (
        <SubmitDraftModal
          deliverable={selectedForDraft}
          onClose={() => setSelectedForDraft(null)}
          onSuccess={loadData}
        />
      )}

      {selectedForPublish && (
        <SubmitPublishedLinkModal
          deliverable={selectedForPublish}
          onClose={() => setSelectedForPublish(null)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
