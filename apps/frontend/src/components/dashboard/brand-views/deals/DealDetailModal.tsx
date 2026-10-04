'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, CheckCircle2, AlertCircle, FileText, Calendar, DollarSign, ExternalLink } from 'lucide-react';
import { DealItem } from './deal-types';
import { useCurrency } from '@/context/CurrencyContext';

interface DealDetailModalProps {
  deal: DealItem | null;
  onClose: () => void;
  onApproveRelease?: (deal: DealItem) => void;
}

export default function DealDetailModal({ deal, onClose, onApproveRelease }: DealDetailModalProps) {
  const { format } = useCurrency();
  if (!deal) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#090C15] border border-white/10 shadow-2xl p-6 space-y-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-purple-400 uppercase tracking-wider">
                  {deal.dealNumber}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-bold text-slate-300">{deal.campaignTitle}</span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">Contract & Escrow Details</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Creator & Financial Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
              <span className="text-[10.5px] font-bold uppercase text-slate-400">Creator Partner</span>
              <h4 className="text-base font-bold text-white">{deal.creator.name}</h4>
              <p className="text-xs text-purple-300">{deal.creator.handle}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
              <span className="text-[10.5px] font-bold uppercase text-slate-400">Agreed Compensation</span>
              <h4 className="text-xl font-black text-emerald-400">{format(deal.agreedAmount)}</h4>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{deal.escrowStatus === 'SECURED' ? 'Protected in Escrow' : deal.escrowStatus}</span>
              </p>
            </div>
          </div>

          {/* Timeline & Milestones */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Milestone Timeline</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Started</span>
                <strong className="text-slate-200">{deal.startedAt}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Due Date</span>
                <strong className="text-slate-200">{deal.dueDate}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Status</span>
                <strong className="text-purple-300">{deal.stageLabel}</strong>
              </div>
            </div>
          </div>

          {/* Deliverables Detailed List */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Agreed Deliverables</span>
            <div className="space-y-2">
              {deal.deliverables.map((del) => (
                <div
                  key={del.id}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs"
                >
                  <div>
                    <h5 className="font-bold text-white">{del.title}</h5>
                    <p className="text-slate-400 text-[11px]">{del.platform} • Due: {del.dueDate}</p>
                    {del.draftNotes && (
                      <p className="text-slate-300 italic text-[11px] mt-1">&quot;{del.draftNotes}&quot;</p>
                    )}
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/25 text-purple-300 text-[11px] font-bold">
                    {del.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cancellation Notice if Cancelled */}
          {deal.status === 'CANCELLED' && deal.cancellationReason && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300 space-y-1">
              <span className="font-bold block">Cancellation Note & Resolution:</span>
              <p>{deal.cancellationReason}</p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
            >
              Close
            </button>
            {deal.status === 'ACTIVE' && onApproveRelease && (
              <button
                onClick={() => {
                  onApproveRelease(deal);
                  onClose();
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all shadow-md shadow-emerald-950/40"
              >
                Approve & Release Payment
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
