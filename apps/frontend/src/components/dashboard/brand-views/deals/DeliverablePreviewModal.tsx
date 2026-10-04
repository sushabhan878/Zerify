'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, MessageSquare, CheckCircle2, AlertTriangle, FileVideo, Download } from 'lucide-react';
import { DealItem } from './deal-types';

interface DeliverablePreviewModalProps {
  deal: DealItem | null;
  onClose: () => void;
  onRequestEdits: (deal: DealItem, note: string) => void;
  onApprove: (deal: DealItem) => void;
}

export default function DeliverablePreviewModal({
  deal,
  onClose,
  onRequestEdits,
  onApprove,
}: DeliverablePreviewModalProps) {
  const [revisionNote, setRevisionNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  if (!deal) return null;

  const activeDeliverable = deal.deliverables[0];

  const handleSendRevision = () => {
    if (!revisionNote.trim()) return;
    onRequestEdits(deal, revisionNote);
    setIsEditing(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative w-full max-w-xl rounded-3xl bg-[#090C15] border border-white/10 shadow-2xl p-6 space-y-5"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-purple-400">
                Deliverable Review • {deal.dealNumber}
              </span>
              <h3 className="text-lg font-black text-white mt-0.5">
                {activeDeliverable?.title || deal.primaryDeliverableTitle}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Media Draft Mock Preview Box */}
          <div className="rounded-2xl border border-white/10 bg-slate-950 p-6 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400">
              <FileVideo className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Creator Draft Submission Available</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Uploaded by {deal.creator.name} ({deal.creator.handle})
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <a
                href={activeDeliverable?.previewUrl || 'https://youtube.com'}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-colors inline-flex items-center gap-1.5 shadow-md shadow-purple-950/40"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Video Player</span>
              </a>
              <button
                type="button"
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 border border-white/10 transition-colors inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-purple-400" />
                <span>Download File</span>
              </button>
            </div>
          </div>

          {/* Creator Notes */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
            <span className="text-[10.5px] font-bold uppercase text-slate-400">Creator Notes</span>
            <p className="text-xs text-slate-300 italic">
              &quot;{activeDeliverable?.draftNotes || 'Draft version ready for brand review. Brand mentions and call-to-actions placed as per campaign requirements.'}&quot;
            </p>
          </div>

          {/* Request Revision Form */}
          {isEditing ? (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Revision Instructions for Creator:</label>
              <textarea
                value={revisionNote}
                onChange={(e) => setRevisionNote(e.target.value)}
                placeholder="Specify what timestamps or sections need changes..."
                rows={3}
                className="w-full p-3 rounded-xl bg-slate-900 border border-purple-500/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendRevision}
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-md shadow-purple-950/40"
                >
                  Submit Revision Request
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-colors"
              >
                Request Revisions
              </button>
              <button
                type="button"
                onClick={() => {
                  onApprove(deal);
                  onClose();
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all shadow-md shadow-emerald-950/40"
              >
                Approve Deliverable
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
