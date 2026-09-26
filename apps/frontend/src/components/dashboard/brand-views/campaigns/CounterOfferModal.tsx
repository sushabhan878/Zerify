'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw,
  DollarSign,
  ShieldCheck,
  Sparkles,
  Loader2,
  AlertCircle,
  X,
  FileText,
  Calendar,
} from 'lucide-react';
import { CampaignApplicationItem } from '@/services/application.service';
import { OfferService } from '@/services/offer.service';
import { CreatorItem } from '../find-influencers/CreatorCard';
import { mapApplicationToCreator } from './mapApplicationToCreator';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency } from '@/utils/currency';
import CustomDatePicker from '@/components/ui/CustomDatePicker';

interface CounterOfferModalProps {
  application: CampaignApplicationItem | null;
  onClose: () => void;
  onSuccess: () => void;
  onViewProfile?: (creator: CreatorItem) => void;
}

export default function CounterOfferModal({
  application,
  onClose,
  onSuccess,
  onViewProfile,
}: CounterOfferModalProps) {
  const { currency, symbol } = useCurrency();
  const [mounted, setMounted] = useState(false);
  const [counterAmount, setCounterAmount] = useState<number>(
    application?.proposedAmount
      ? Math.round(application.proposedAmount * 0.85)
      : currency === 'INR'
      ? 20000
      : 750,
  );
  const [responseDeadline, setResponseDeadline] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const creatorItem = useMemo(() => {
    return application ? mapApplicationToCreator(application) : null;
  }, [application]);

  if (!application || !mounted || !creatorItem) return null;

  const originalQuoteStr = application.proposedAmount
    ? formatCurrency(application.proposedAmount, application.proposedCurrency || currency)
    : 'Not Specified';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!counterAmount || counterAmount <= 0) {
      setError(`Please enter a valid counter offer amount greater than ${symbol}0.`);
      return;
    }

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      setError('Delivery date cannot be earlier than the start date.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Send the counter offer through API
      await OfferService.sendOffer(application.id, {
        compensationAmount: counterAmount,
        compensationCurrency: application.proposedCurrency || currency || 'USD',
        responseDeadline: responseDeadline ? new Date(responseDeadline).toISOString() : undefined,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        customNotes: customNotes.trim() ? `[COUNTER_OFFER] ${customNotes.trim()}` : '[COUNTER_OFFER] Brand proposed counter offer.',
        isCounterOffer: true,
      });

      // 2. Persist local counter offer state for cross-view reactivity
      try {
        localStorage.setItem(
          `zerify_counter_offer_${application.id}`,
          JSON.stringify({
            isCounterOffer: true,
            applicationId: application.id,
            counterAmount,
            counterCurrency: application.proposedCurrency || currency,
            originalAmount: application.proposedAmount,
            notes: customNotes.trim() || 'Brand proposed a revised counter offer.',
            createdAt: new Date().toISOString(),
          }),
        );
        window.dispatchEvent(new Event('zerify_counter_offer_updated'));
      } catch (storageErr) {
        console.warn('Could not save to localStorage', storageErr);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit counter offer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl bg-slate-950 border border-amber-500/30 shadow-2xl shadow-amber-950/30 overflow-hidden flex flex-col my-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <RefreshCw className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Propose Counter Offer</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-extrabold text-amber-300 uppercase tracking-wider">
                  Counter Offer
                </span>
              </div>
              <p className="text-xs text-slate-400">Negotiate deliverables & compensation with creator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Creator Snippet */}
        <div className="p-4 mx-6 mt-4 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-amber-500/20">
              {creatorItem.avatarUrl ? (
                <img
                  src={creatorItem.avatarUrl}
                  alt={creatorItem.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-white bg-purple-600">
                  {creatorItem.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white truncate">{creatorItem.name}</h4>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-purple-400" />
                Verified Creator
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Original Pitch Quote
            </span>
            <span className="text-xs sm:text-sm font-black text-purple-300">
              {originalQuoteStr}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Counter Amount */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Counter Offer Amount ({currency})</span>
              <span className="text-[11px] text-amber-400 font-medium">New proposed rate</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-amber-400">
                {symbol}
              </span>
              <input
                type="number"
                min="1"
                step="any"
                value={counterAmount || ''}
                onChange={(e) => setCounterAmount(Number(e.target.value))}
                placeholder="Enter counter offer amount"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-amber-500/30 focus:border-amber-400 text-sm font-black text-white focus:outline-none transition-all placeholder:text-slate-600"
                required
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400">Campaign Start Date</label>
              <CustomDatePicker
                value={startDate}
                onChange={setStartDate}
                placeholder="Optional start date"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400">Content Due Date</label>
              <CustomDatePicker
                value={endDate}
                onChange={setEndDate}
                placeholder="Optional delivery date"
              />
            </div>
          </div>

          {/* Response Expiration */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400">Counter Offer Expiry</label>
            <CustomDatePicker
              value={responseDeadline}
              onChange={setResponseDeadline}
              placeholder="When does this counter offer expire?"
            />
          </div>

          {/* Notes / Message to Creator */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              Counter Offer Note / Revision Details
            </label>
            <textarea
              rows={3}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Explain your counter proposal (e.g. We love your concept! Our campaign budget tier for this slot is $8,500. Let us know if this works for you.)"
              className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 focus:border-amber-500/40 text-xs text-white focus:outline-none transition-all placeholder:text-slate-600 resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
            <button
              onClick={onClose}
              type="button"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 hover:from-amber-500 hover:to-orange-500 text-xs font-black text-white flex items-center gap-2 shadow-lg shadow-amber-950/50 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sending Counter Offer...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Send Counter Offer</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
