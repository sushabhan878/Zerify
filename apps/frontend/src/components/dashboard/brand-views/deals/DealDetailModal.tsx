'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, ShieldCheck } from 'lucide-react';
import { DealItem } from './deal-types';
import { useCurrency } from '@/context/CurrencyContext';
import { normalizeCurrency } from '@/utils/currency';

interface DealDetailModalProps {
  deal: DealItem | null;
  onClose: () => void;
  onApproveRelease?: (deal: DealItem) => void;
}

export default function DealDetailModal({ deal, onClose, onApproveRelease }: DealDetailModalProps) {
  const { currency, format, convert } = useCurrency();
  if (!deal) return null;

  const sourceCurrency = deal.agreedCurrency || 'INR';
  const isDiffCurrency = normalizeCurrency(sourceCurrency) !== normalizeCurrency(currency);
  const convertedAmount = isDiffCurrency
    ? convert(deal.agreedAmount, sourceCurrency)
    : deal.agreedAmount;

  // Portalled to <body> so the backdrop covers the full viewport (sidebar
  // included) — ancestors with backdrop-filter otherwise trap `fixed`.
  const modalContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 light:bg-slate-900/50 backdrop-blur-md"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#090D16] light:bg-white border border-purple-500/25 light:border-slate-200 shadow-2xl p-6 space-y-6 backdrop-blur-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 light:border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-purple-400 light:text-purple-600 uppercase tracking-wider">
                {deal.dealNumber}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-bold text-slate-300 light:text-slate-600">{deal.campaignTitle}</span>
            </div>
            <h2 className="text-xl font-black text-white light:text-slate-900 mt-1">Contract & Escrow Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white light:bg-slate-100 light:hover:bg-slate-200 light:text-slate-500 light:hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Creator & Financial Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 light:bg-slate-50/80 border border-white/5 light:border-slate-200/80 space-y-1">
            <span className="text-[10.5px] font-bold uppercase text-slate-400 light:text-slate-500">Creator Partner</span>
            <h4 className="text-base font-bold text-white light:text-slate-900">{deal.creator.name}</h4>
            <p className="text-xs text-purple-300 light:text-purple-700 font-semibold">{deal.creator.handle}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 light:bg-slate-50/80 border border-white/5 light:border-slate-200/80 space-y-1">
            <span className="text-[10.5px] font-bold uppercase text-slate-400 light:text-slate-500">Agreed Compensation</span>
            <div className="flex items-baseline gap-2 flex-wrap">
              <h4 className="text-xl font-black text-emerald-400 light:text-emerald-600">{format(convertedAmount)}</h4>
            </div>
            <p className="text-xs text-slate-400 light:text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 light:text-emerald-600" />
              <span>{deal.escrowStatus === 'SECURED' ? 'Protected in Escrow' : deal.escrowStatus}</span>
            </p>
          </div>
        </div>

        {/* Timeline & Milestones */}
        <div className="p-4 rounded-2xl bg-slate-900/40 light:bg-slate-50/80 border border-white/5 light:border-slate-200/80 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 light:text-slate-500 block">Milestone Timeline</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">Started</span>
              <strong className="text-slate-200 light:text-slate-800">{deal.startedAt}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Due Date</span>
              <strong className="text-slate-200 light:text-slate-800">{deal.dueDate}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Status</span>
              <strong className="text-purple-300 light:text-purple-700">{deal.stageLabel}</strong>
            </div>
          </div>
        </div>

        {/* Deliverables Detailed List */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 light:text-slate-500 block">Agreed Deliverables</span>
          <div className="space-y-2">
            {deal.deliverables.map((del) => (
              <div
                key={del.id}
                className="p-3.5 rounded-xl bg-slate-900/60 light:bg-slate-50/80 border border-white/5 light:border-slate-200/80 flex items-center justify-between text-xs"
              >
                <div>
                  <h5 className="font-bold text-white light:text-slate-900">{del.title}</h5>
                  <p className="text-slate-400 light:text-slate-500 text-[11px]">{del.platform} • Due: {del.dueDate}</p>
                  {del.draftNotes && (
                    <p className="text-slate-300 light:text-slate-600 italic text-[11px] mt-1">&quot;{del.draftNotes}&quot;</p>
                  )}
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/25 text-purple-300 light:bg-purple-50 light:border-purple-200 light:text-purple-700 text-[11px] font-bold">
                  {del.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Cancellation Notice if Cancelled */}
        {deal.status === 'CANCELLED' && deal.cancellationReason && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300 light:bg-rose-50 light:border-rose-200 light:text-rose-700 space-y-1">
            <span className="font-bold block">Cancellation Note & Resolution:</span>
            <p>{deal.cancellationReason}</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2 border-t border-white/10 light:border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 light:bg-slate-100 light:hover:bg-slate-200 light:text-slate-700 light:border light:border-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
          {deal.status === 'ACTIVE' && onApproveRelease && (
            <button
              onClick={() => {
                onApproveRelease(deal);
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white keep-white transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
            >
              <span className="keep-white text-white">Approve & Release Payment</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
