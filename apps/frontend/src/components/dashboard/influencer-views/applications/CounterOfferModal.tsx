'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, MessageSquare } from 'lucide-react';
import { CampaignOfferItem, OfferService } from '@/services/offer.service';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency } from '@/utils/currency';
import { useToast } from '@/components/ui/Toast';

interface CounterOfferModalProps {
  offer: CampaignOfferItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CounterOfferModal({
  offer,
  isOpen,
  onClose,
  onSuccess,
}: CounterOfferModalProps) {
  const [mounted, setMounted] = useState(false);
  const { toastSuccess, toastError } = useToast();
  const { currency, symbol, convert } = useCurrency();
  const originalAmount = offer.compensationAmount || 0;
  const originalCurrency = offer.compensationCurrency || 'USD';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Live conversion of the brand offered rate into the influencer's active currency
  const convertedBrandOffered = Math.round(convert(originalAmount, originalCurrency));
  const formattedBrandOffered = formatCurrency(convertedBrandOffered, currency);

  // Initialize counter offer rate in influencer's currency
  const initialCounter = offer.termsSnapshot?.counterRate
    ? offer.termsSnapshot.counterCurrency && offer.termsSnapshot.counterCurrency !== currency
      ? Math.round(convert(offer.termsSnapshot.counterRate, offer.termsSnapshot.counterCurrency))
      : offer.termsSnapshot.counterRate
    : convertedBrandOffered || originalAmount;

  const [counterAmount, setCounterAmount] = useState<number | ''>(initialCounter);
  const [pitchMessage, setPitchMessage] = useState<string>(
    offer.termsSnapshot?.counterNotes || '',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !mounted || typeof document === 'undefined') return null;

  const campaignTitle =
    offer.application?.campaign?.title ||
    offer.termsSnapshot?.campaignTitle ||
    'Campaign Collaboration';

  const brandName =
    offer.application?.campaign?.brandProfile?.companyName ||
    offer.application?.campaign?.brandProfile?.brandName ||
    'Brand Partner';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (counterAmount === '' || Number(counterAmount) <= 0) {
      toastError('Please enter a valid counter offer amount.');
      return;
    }

    try {
      setIsSubmitting(true);
      await OfferService.counterOffer(offer.id, {
        proposedAmount: Number(counterAmount),
        proposedCurrency: currency,
        message: pitchMessage.trim() || undefined,
      });

      toastSuccess('Counter offer submitted successfully! The brand has been notified.');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('zerify_offers_updated'));
      }
      onSuccess();
    } catch (err: any) {
      console.error('Failed to submit counter offer:', err);
      toastError(err?.message || 'Failed to submit counter offer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      >
        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md rounded-3xl bg-slate-950/95 light:bg-white border border-purple-500/30 light:border-slate-200/90 p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.8)] light:shadow-xl z-10 space-y-5 my-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-white light:text-slate-900 tracking-tight">
                Send Counter Offer
              </h3>
              <p className="text-xs text-slate-400 light:text-slate-500">
                Propose your custom rate for <strong className="text-purple-300 light:text-purple-700">{campaignTitle}</strong> by {brandName}.
              </p>
            </div>

            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 rounded-2xl bg-white/5 light:bg-slate-100 hover:bg-white/10 light:hover:bg-slate-200 text-slate-400 light:text-slate-500 hover:text-white light:hover:text-slate-900 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount Input with Brand Offered display inline */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="counter-amount" className="font-bold text-slate-300 light:text-slate-700">
                  Proposed Compensation Amount
                </label>
                <span className="text-xs text-slate-400 light:text-slate-500">
                  Brand Offered:{' '}
                  <strong className="text-emerald-400 light:text-emerald-700 font-bold ml-1">
                    {formattedBrandOffered}
                  </strong>
                </span>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 light:text-slate-500 font-black text-base">
                  {symbol}
                </div>
                <input
                  id="counter-amount"
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={counterAmount === '' ? '' : counterAmount}
                  onChange={(e) =>
                    setCounterAmount(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder={`e.g. ${convertedBrandOffered || 500}`}
                  className="w-full pl-9 pr-14 py-3 rounded-2xl bg-slate-900/90 light:bg-slate-50 border border-purple-500/30 light:border-slate-200 focus:border-purple-400 light:focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white light:text-slate-900 font-black text-base placeholder:text-slate-600 light:placeholder:text-slate-400 transition-all outline-none"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-xs font-bold text-purple-400 light:text-purple-600 uppercase">
                  {currency}
                </div>
              </div>
            </div>

            {/* Optional Pitch Note / Message */}
            <div className="space-y-1.5">
              <label
                htmlFor="counter-notes"
                className="text-xs font-bold text-slate-300 light:text-slate-700 flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-purple-400 light:text-purple-600" />
                <span>Pitch Note / Message (Optional)</span>
              </label>
              <textarea
                id="counter-notes"
                rows={3}
                value={pitchMessage}
                onChange={(e) => setPitchMessage(e.target.value)}
                placeholder="Add an optional message or deliverables scope for the brand..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-900/90 light:bg-slate-50 border border-purple-500/30 light:border-slate-200 focus:border-purple-400 light:focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white light:text-slate-900 text-xs placeholder:text-slate-600 light:placeholder:text-slate-400 transition-all outline-none resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl bg-slate-900 light:bg-white hover:bg-slate-800 light:hover:bg-slate-50 text-xs font-bold text-slate-400 light:text-slate-700 hover:text-white light:hover:text-slate-900 border border-white/5 light:border-slate-200 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || counterAmount === '' || Number(counterAmount) <= 0}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:via-orange-400 hover:to-amber-500 text-xs font-black text-slate-950 shadow-lg shadow-amber-950/50 hover:shadow-amber-900/70 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-slate-950" />
                    <span>Send Counter Offer</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
