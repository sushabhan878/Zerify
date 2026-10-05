'use client';

import React from 'react';
import { Video, Clock, CheckCircle2, AlertTriangle, Upload, Globe, ExternalLink } from 'lucide-react';
import { ParticipantDeliverableItem } from '@/services/deliverable.service';

interface DeliverableTaskCardProps {
  deliverable: ParticipantDeliverableItem;
  onSubmitDraft: (del: ParticipantDeliverableItem) => void;
  onSubmitPublished: (del: ParticipantDeliverableItem) => void;
}

export default function DeliverableTaskCard({
  deliverable,
  onSubmitDraft,
  onSubmitPublished,
}: DeliverableTaskCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'APPROVED':
      case 'READY_TO_PUBLISH':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'SUBMITTED':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'REVISION_REQUESTED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'PENDING':
      default:
        return 'bg-slate-800 text-slate-400 border-white/10';
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white">{deliverable.type}</h4>
            <span className="text-[10px] text-slate-400">
              Revision count: {deliverable.revisionCount}
            </span>
          </div>
        </div>

        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase ${getStatusBadge(deliverable.status)}`}>
          {deliverable.status.replace('_', ' ')}
        </span>
      </div>

      {/* Revision Notice Alert */}
      {deliverable.status === 'REVISION_REQUESTED' && deliverable.reviewComments && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1">
          <span className="text-[10px] font-black text-rose-400 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Revision Feedback from Brand:
          </span>
          <p className="text-xs text-slate-300 italic">&quot;{deliverable.reviewComments}&quot;</p>
        </div>
      )}

      {/* Action Area */}
      <div className="pt-1 flex items-center justify-between">
        <span className="text-[10px] text-slate-500">
          {deliverable.dueDate ? `Due ${new Date(deliverable.dueDate).toLocaleDateString()}` : 'Flexible Timeline'}
        </span>

        <div className="flex items-center gap-2">
          {(deliverable.status === 'PENDING' ||
            deliverable.status === 'IN_PROGRESS' ||
            deliverable.status === 'REVISION_REQUESTED') && (
            <button
              onClick={() => onSubmitDraft(deliverable)}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-black text-white flex items-center gap-1.5 shadow-md transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{deliverable.status === 'REVISION_REQUESTED' ? 'Submit Revised Draft' : 'Submit Draft'}</span>
            </button>
          )}

          {deliverable.status === 'APPROVED' && (
            <button
              onClick={() => onSubmitPublished(deliverable)}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:scale-105 text-xs font-black text-white flex items-center gap-1.5 shadow-md transition-all"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Publish & Submit Live Link</span>
            </button>
          )}

          {deliverable.status === 'PUBLISHED' && (
            <span className="text-xs font-bold text-indigo-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>Awaiting Brand Verification</span>
            </span>
          )}

          {deliverable.status === 'VERIFIED' && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Completed & Verified</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
