'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Check, ShieldCheck, DollarSign, Calendar, Video, FileText } from 'lucide-react';
import { CampaignOfferItem } from '@/services/offer.service';

interface OfferDetailModalProps {
  offer: CampaignOfferItem | null;
  onClose: () => void;
  onAccept: (offerId: string) => void;
  onDecline: (offerId: string) => void;
}

export default function OfferDetailModal({
  offer,
  onClose,
  onAccept,
  onDecline,
}: OfferDetailModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!offer || !mounted) return null;

  const app = offer.application || {};
  const campaign = app.campaign || {};
  const brand = campaign.brandProfile || {};
  const deliverables = campaign.deliverables || [];

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-950/40">
          <div>
            <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider">
              Offer Contract Scope
            </span>
            <h3 className="text-base font-black text-white">{campaign.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Compensation Card */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase block">Agreed Compensation</span>
              <span className="text-xl font-black text-white">
                ${offer.compensationAmount.toLocaleString()} {offer.compensationCurrency}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold block">Escrow Protected</span>
              <span className="text-xs font-bold text-emerald-400">100% Guaranteed</span>
            </div>
          </div>

          {/* Deliverables Required */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              Deliverables Required
            </h4>
            <div className="space-y-2">
              {deliverables.map((d: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-purple-400" />
                      {d.quantity}x {d.type}
                    </span>
                    <span className="text-[10px] text-slate-400">{d.revisionLimit || 2} revisions included</span>
                  </div>
                  {d.requiredCta && (
                    <p className="text-[10px] text-slate-400">
                      <strong>CTA:</strong> {d.requiredCta}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {offer.customNotes && (
            <div className="space-y-1">
              <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                Brand Notes
              </h4>
              <p className="p-3 rounded-xl bg-slate-950/60 border border-white/5 text-slate-300 italic">
                {offer.customNotes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950/40 flex items-center justify-between">
          <button
            onClick={() => {
              onDecline(offer.id);
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/50 hover:text-rose-400 text-xs font-bold text-slate-400 transition-colors"
          >
            Decline Offer
          </button>
          <button
            onClick={() => {
              onAccept(offer.id);
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:scale-105 text-xs font-black text-white shadow-md transition-all flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Accept Contract</span>
          </button>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

