'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Upload, Link2, Video, Send, Loader2 } from 'lucide-react';
import { DeliverableService, ParticipantDeliverableItem } from '@/services/deliverable.service';

interface SubmitDraftModalProps {
  deliverable: ParticipantDeliverableItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SubmitDraftModal({
  deliverable,
  onClose,
  onSuccess,
}: SubmitDraftModalProps) {
  const [mounted, setMounted] = useState(false);
  const [contentUrls, setContentUrls] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
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

    const urls = contentUrls
      .split('\n')
      .map((u) => u.trim())
      .filter(Boolean);

    if (urls.length === 0) {
      setError('Please provide at least one asset link (e.g. Google Drive, Dropbox, Frame.io or unlisted video link)');
      setIsSubmitting(false);
      return;
    }

    try {
      await DeliverableService.submitDraft(deliverable.id, {
        contentUrls: urls,
        notes,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit draft');
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
            <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider">
              Deliverable Draft Submission
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
              Draft Video / Preview Links (one per line) <span className="text-pink-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="https://drive.google.com/file/d/...\nhttps://vimeo.com/..."
              value={contentUrls}
              onChange={(e) => setContentUrls(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5 text-[11px]">
              Notes for Brand Reviewer (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Here is the first cut of the reel! Hook is in the first 2 seconds, product CTA included at 0:42."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
            />
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
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit for Brand Review</span>
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

