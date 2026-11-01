'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, X, Loader2 } from 'lucide-react';
import { CampaignOfferItem } from '@/services/offer.service';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency, convertCurrency } from '@/utils/currency';

interface OfferConfirmationModalProps {
  isOpen: boolean;
  type: 'ACCEPT' | 'DECLINE' | null;
  offer: CampaignOfferItem | null;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export default function OfferConfirmationModal({
  isOpen,
  type,
  offer,
  onConfirm,
  onCancel,
  isProcessing = false,
}: OfferConfirmationModalProps) {
  const { currency: userCurrency, format: formatUserCurrency, rates } = useCurrency();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !offer || !type || !mounted) return null;

  const app = offer.application || {};
  const campaign = app.campaign || {};
  const brand = campaign.brandProfile || {};

  const rawCompensation = Number(offer.compensationAmount || 0);
  const sourceCurrency = offer.compensationCurrency || campaign.budgetCurrency || 'USD';
  const convertedCompensation = convertCurrency(rawCompensation, sourceCurrency, userCurrency, rates);
  const isCrossCurrency = sourceCurrency.toUpperCase() !== userCurrency.toUpperCase();
  const payoutStr = formatUserCurrency(convertedCompensation);
  const originalPayoutStr = isCrossCurrency && rawCompensation > 0
    ? formatCurrency(rawCompensation, sourceCurrency)
    : undefined;

  const isAccept = type === 'ACCEPT';

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Full-Screen Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={!isProcessing ? onCancel : undefined}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md rounded-3xl bg-slate-950/95 light:bg-white border border-white/15 light:border-slate-200/90 p-6 shadow-2xl light:shadow-xl backdrop-blur-2xl z-10 space-y-5 overflow-hidden"
        >
          {/* Close button */}
          <button
            type="button"
            disabled={isProcessing}
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 light:text-slate-500 hover:text-white light:hover:text-slate-900 hover:bg-white/5 light:hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon & Title */}
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                isAccept
                  ? 'bg-emerald-500/10 light:bg-emerald-50 border-emerald-500/30 light:border-emerald-200 text-emerald-400 light:text-emerald-600'
                  : 'bg-rose-500/10 light:bg-rose-50 border-rose-500/30 light:border-rose-200 text-rose-400 light:text-rose-600'
              }`}
            >
              {isAccept ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="text-base font-black text-white light:text-slate-900">
                {isAccept ? 'Accept Campaign Offer?' : 'Decline Campaign Offer?'}
              </h3>
              <p className="text-xs text-slate-400 light:text-slate-500 font-medium">
                {brand.companyName || 'Verified Brand'} &bull; {campaign.title || 'Campaign'}
              </p>
            </div>
          </div>

          {/* Details / Notice Box */}
          {isAccept ? (
            <div className="p-4 rounded-2xl bg-emerald-950/20 light:bg-emerald-50 border border-emerald-500/20 light:border-emerald-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 light:text-slate-700 font-medium">Escrow Payout:</span>
                <div className="text-right">
                  <span className="font-black text-emerald-400 light:text-emerald-700 text-sm block">{payoutStr}</span>
                  {originalPayoutStr && (
                    <span className="text-[10px] text-slate-400 light:text-slate-500 font-semibold block">≈ {originalPayoutStr}</span>
                  )}
                </div>
              </div>
              <p className="text-slate-400 light:text-slate-600 leading-relaxed text-[11px] pt-1 border-t border-emerald-500/10 light:border-emerald-200">
                By accepting, you commit to delivering the content outlined in the campaign brief. Your payout will be locked in Zerify Escrow and automatically released upon brand approval.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-950/20 light:bg-rose-50 border border-rose-500/20 light:border-rose-200 space-y-1.5 text-xs">
              <p className="text-slate-300 light:text-slate-700 font-medium">
                Are you sure you want to decline this collaboration offer?
              </p>
              <p className="text-slate-400 light:text-slate-600 text-[11px] leading-relaxed">
                This action cannot be undone. The brand will be notified that you are unable to participate in this campaign.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={onCancel}
              className="px-4 py-2 rounded-xl bg-slate-900 light:bg-white hover:bg-slate-800 light:hover:bg-slate-50 text-xs font-bold text-slate-300 light:text-slate-700 hover:text-white light:hover:text-slate-900 border border-white/10 light:border-slate-200 transition-colors disabled:opacity-50"
            >
              {isAccept ? 'Cancel' : 'Keep Offer'}
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={onConfirm}
              className={`px-5 py-2 rounded-xl text-xs font-black text-white keep-white shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50 ${
                isAccept
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950/40'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/40'
              }`}
            >
              {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>
                {isProcessing
                  ? isAccept
                    ? 'Accepting...'
                    : 'Declining...'
                  : isAccept
                  ? 'Confirm & Accept'
                  : 'Confirm Decline'}
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
