'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Globe, Link2, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { DeliverableService, ParticipantDeliverableItem } from '@/services/deliverable.service';

interface SubmitPublishedLinkModalProps {
  deliverable: ParticipantDeliverableItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SubmitPublishedLinkModal({
  deliverable,
  onClose,
  onSuccess,
}: SubmitPublishedLinkModalProps) {
  const [mounted, setMounted] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState('');
  const [proofUrls, setProofUrls] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!deliverable || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await DeliverableService.publishDeliverable(deliverable.id, {
        publishedUrl,
        proofUrls: proofUrls ? [proofUrls] : [],
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit published URL');
    } finally {
      setIsSubmitting(false);
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
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">
              Submit Live Post
            </span>
            <h3 className="text-base font-black text-white">{deliverable.type}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
              {error}
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5 text-[11px]">
              Live Social URL <span className="text-pink-500">*</span>
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="url"
                required
                placeholder="https://instagram.com/reel/C8j491..."
                value={publishedUrl}
                onChange={(e) => setPublishedUrl(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5 text-[11px]">
              Screenshot / Story Analytics Proof Link (Optional)
            </label>
            <div className="relative">
              <Link2 className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="url"
                placeholder="https://imgur.com/... or Google Drive proof screenshot"
                value={proofUrls}
                onChange={(e) => setProofUrls(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-center gap-2 text-emerald-300">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>Once verified by the brand, escrow milestone funds are unlocked for payout.</span>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:scale-105 text-white font-black shadow-md flex items-center gap-1.5 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Live Verification</span>
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

