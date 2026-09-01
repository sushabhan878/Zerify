import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, DollarSign, ShieldCheck, ArrowUpRight, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { CampaignApplicationItem } from '@/services/application.service';
import { OfferService } from '@/services/offer.service';
import { CreatorItem } from '../find-influencers/CreatorCard';
import { mapApplicationToCreator } from './mapApplicationToCreator';

import CustomDatePicker from '@/components/ui/CustomDatePicker';

interface SendOfferModalProps {
  application: CampaignApplicationItem | null;
  onClose: () => void;
  onSuccess: () => void;
  onViewProfile?: (creator: CreatorItem) => void;
}

export default function SendOfferModal({
  application,
  onClose,
  onSuccess,
  onViewProfile,
}: SendOfferModalProps) {
  const [mounted, setMounted] = useState(false);
  const [compensationAmount, setCompensationAmount] = useState<number>(
    application?.proposedAmount || 1500,
  );
  const [responseDeadline, setResponseDeadline] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const creatorItem = useMemo(() => {
    return application ? mapApplicationToCreator(application) : null;
  }, [application]);

  if (!application || !mounted || !creatorItem) return null;

  const handleOpenCreatorProfile = () => {
    onClose();
    if (onViewProfile) {
      onViewProfile(creatorItem);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!compensationAmount || compensationAmount <= 0) {
      setError('Please enter a valid compensation amount greater than $0.');
      return;
    }

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      setError('Content due date cannot be earlier than the campaign start date.');
      return;
    }

    if (responseDeadline && startDate && new Date(responseDeadline) > new Date(startDate)) {
      setError('Offer expiration date must be prior to the campaign start date.');
      return;
    }

    setIsSending(true);
    try {
      await OfferService.sendOffer(application.id, {
        compensationAmount,
        compensationCurrency: application.proposedCurrency || 'USD',
        responseDeadline: responseDeadline ? new Date(responseDeadline).toISOString() : undefined,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        customNotes: customNotes.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to send offer');
    } finally {
      setIsSending(false);
    }
  };

  const modalContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg bg-[#090D16] border border-purple-500/30 rounded-3xl shadow-2xl overflow-visible flex flex-col backdrop-blur-2xl p-6 sm:p-7 relative my-auto"
      >
        {/* Subtle ambient lighting */}
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <form onSubmit={handleSend} className="space-y-4 relative z-10">
          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span className="flex-1 font-medium">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* In-Platform Creator Info Snippet */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/5">
            <button
              type="button"
              onClick={handleOpenCreatorProfile}
              title={`View ${creatorItem.name}'s platform profile`}
              className="flex items-center gap-3 group/creator cursor-pointer text-left min-w-0"
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-purple-500/30 bg-slate-950 flex items-center justify-center text-white font-bold shrink-0 shadow-md group-hover/creator:scale-105 transition-transform">
                {creatorItem.avatarUrl ? (
                  <img
                    src={creatorItem.avatarUrl}
                    alt={creatorItem.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white text-xs font-black">
                    {creatorItem.name.charAt(0)}
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-white group-hover/creator:text-purple-300 transition-colors truncate">
                    Offer for {creatorItem.name}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-purple-400 group-hover/creator:translate-x-0.5 group-hover/creator:-translate-y-0.5 transition-transform shrink-0" />
                </div>
                <span className="text-[11px] text-purple-300/80 font-medium block truncate">
                  Click to inspect in-platform profile
                </span>
              </div>
            </button>

            <span className="px-2.5 py-1 rounded-xl bg-purple-500/15 border border-purple-500/30 text-[11px] font-bold text-purple-300 flex items-center gap-1 shrink-0">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>{creatorItem.matchScore}% Match</span>
            </span>
          </div>

          {/* Agreed Compensation Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Agreed Compensation Amount (USD) <span className="text-pink-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="1"
                step="any"
                value={compensationAmount}
                onChange={(e) => setCompensationAmount(Number(e.target.value))}
                className="w-full pl-9 pr-4 py-3 bg-slate-900/60 border border-purple-500/20 hover:border-purple-500/40 focus:border-purple-400 focus:bg-purple-950/20 rounded-2xl text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none transition-all"
              />
              <DollarSign className="w-4 h-4 text-purple-400 absolute left-3 top-3.5" />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Campaign Start Date
              </label>
              <CustomDatePicker
                value={startDate}
                onChange={setStartDate}
                placeholder="Select start date"
                minDate={todayStr}
                align="left"
                position="bottom"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Content Due Date
              </label>
              <CustomDatePicker
                value={endDate}
                onChange={setEndDate}
                placeholder="Select due date"
                minDate={startDate || todayStr}
                align="right"
                position="bottom"
              />
            </div>
          </div>

          {/* Expiration Date */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Offer Response Expiration Date
            </label>
            <CustomDatePicker
              value={responseDeadline}
              onChange={setResponseDeadline}
              placeholder="Select expiration date"
              minDate={todayStr}
              maxDate={startDate || undefined}
              align="left"
              position="bottom"
            />
          </div>

          {/* Custom Notes / Scope Additions */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Custom Notes / Scope Additions
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Delighted by your concept! We will ship the product sample immediately upon your acceptance."
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              className="w-full px-3.5 py-3 bg-slate-900/60 border border-purple-500/20 hover:border-purple-500/40 focus:border-purple-400 focus:bg-purple-950/20 rounded-2xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Confirmation Notice */}
          <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-2.5 text-xs text-purple-300 font-medium">
            <ShieldCheck className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span>Upon creator acceptance, a confirmed campaign participant contract is created.</span>
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-black text-white flex items-center gap-2 shadow-lg shadow-purple-950/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sending Offer...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Formal Offer</span>
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


