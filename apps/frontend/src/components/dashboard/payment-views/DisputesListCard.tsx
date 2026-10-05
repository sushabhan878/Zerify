'use client';

import React from 'react';
import { AlertTriangle, Clock, CheckCircle2, ShieldAlert, FileText, ExternalLink } from 'lucide-react';

export interface DisputeItem {
  id: string;
  paymentId: string;
  openedBy: 'INFLUENCER' | 'COMPANY';
  reason: string;
  description?: string;
  evidence?: string[];
  requestedResolution?: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface DisputesListCardProps {
  disputes?: DisputeItem[];
  onOpenDisputeModal?: () => void;
  onRaiseNewDispute?: () => void;
}

export default function DisputesListCard({
  disputes,
  onOpenDisputeModal,
  onRaiseNewDispute,
}: DisputesListCardProps) {
  const triggerNewDispute = onRaiseNewDispute || onOpenDisputeModal;

  const defaultDisputes: DisputeItem[] = [
    {
      id: 'DISP-8921',
      paymentId: 'TX-88105-ESCROW',
      openedBy: 'INFLUENCER',
      reason: 'Deliverable Approved but Payment Withheld',
      description: 'The reel integration video was approved on Tuesday, but escrow payout release remains pending past the 48-hour SLA.',
      evidence: ['https://instagram.com/reel/demo123'],
      requestedResolution: 'Immediate escrow payout release of agreed ₹2,33,800 milestone amount.',
      status: 'UNDER_REVIEW',
      resolutionNotes: 'Zerify compliance team contacted brand finance officer. Review expected within 6 business hours.',
      createdAt: '2026-07-20',
      updatedAt: '2026-07-21',
    },
  ];

  const activeDisputes = disputes !== undefined ? disputes : defaultDisputes;

  const getStatusBadge = (status: DisputeItem['status']) => {
    switch (status) {
      case 'OPEN':
        return { label: 'Case Open', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
      case 'UNDER_REVIEW':
        return { label: 'Admin Review In Progress', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
      case 'RESOLVED':
        return { label: 'Resolved by Mediation', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'DISMISSED':
        return { label: 'Dismissed', color: 'bg-slate-500/10 text-slate-400 border-slate-500/30' };
    }
  };

  if (activeDisputes.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-slate-950/45 border border-white/10 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-white">No Active Disputes</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          All your escrow contracts and payments are running smoothly. If you encounter an issue with a deliverable or release, you can open a dispute.
        </p>
        {triggerNewDispute && (
          <button
            onClick={triggerNewDispute}
            className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all inline-flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Raise a Dispute</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activeDisputes.map((d) => {
        const badge = getStatusBadge(d.status);

        return (
          <div
            key={d.id}
            className="p-4 rounded-xl bg-slate-950/60 border border-white/10 space-y-3 hover:border-amber-500/30 transition-all shadow-md"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{d.reason}</h4>
                  <span className="text-[10px] text-slate-500">
                    Opened by {d.openedBy === 'INFLUENCER' ? 'Creator' : 'Brand'} • Ref: {d.paymentId.slice(0, 8)}...
                  </span>
                </div>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border self-start sm:self-auto ${badge.color}`}>
                {badge.label}
              </span>
            </div>

            {d.description && (
              <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-white/5 leading-relaxed">
                {d.description}
              </p>
            )}

            {d.evidence && d.evidence.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-slate-500 font-semibold">Evidence:</span>
                {d.evidence.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold text-purple-400 hover:text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 inline-flex items-center gap-1"
                  >
                    <span>Link #{idx + 1}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                ))}
              </div>
            )}

            {d.resolutionNotes && (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
                <span className="font-bold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mediator Resolution Note:
                </span>
                <p className="text-[11px] text-emerald-200/90 leading-relaxed">{d.resolutionNotes}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
