'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Send, DollarSign, Calendar, ShieldCheck, Sparkles } from 'lucide-react';
import { CampaignApplicationItem } from '@/services/application.service';
import { OfferService } from '@/services/offer.service';

import CustomDatePicker from '@/components/ui/CustomDatePicker';

interface SendOfferModalProps {
  application: CampaignApplicationItem | null;
  onClose: () => void;
  onSuccess: () => void;
}


export default function SendOfferModal({ application, onClose, onSuccess }: SendOfferModalProps) {
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

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!application || !mounted) return null;

  const profile: any = application.profileSnapshot || {};

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setError(null);
    try {
      await OfferService.sendOffer(application.id, {
        compensationAmount,
        compensationCurrency: application.proposedCurrency || 'USD',
        responseDeadline: responseDeadline ? new Date(responseDeadline).toISOString() : undefined,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        customNotes,
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-950/40">
          <div>
            <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider">
              Send Official Offer
            </span>
            <h3 className="text-base font-black text-white">Offer for @{profile.username || 'creator'}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSend} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Agreed Compensation Amount (USD) <span className="text-pink-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="1"
                value={compensationAmount}
                onChange={(e) => setCompensationAmount(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
              />
              <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Campaign Start Date
              </label>
              <CustomDatePicker
                value={startDate}
                onChange={setStartDate}
                placeholder="Select start date"
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
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Offer Response Expiration Date
            </label>
            <CustomDatePicker
              value={responseDeadline}
              onChange={setResponseDeadline}
              placeholder="Select expiration date"
            />
          </div>


          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Custom Notes / Scope Additions
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Delighted by your concept! We will ship the product sample immediately upon your acceptance."
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 flex items-center gap-2.5 text-xs text-purple-300">
            <ShieldCheck className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span>Upon creator acceptance, a confirmed campaign participant contract is created.</span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105 text-xs font-black text-white flex items-center gap-1.5 shadow-md disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Sending Offer...' : 'Send Formal Offer'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

