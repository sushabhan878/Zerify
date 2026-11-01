'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, ExternalLink, FileVideo, Download } from 'lucide-react';
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

  // Portalled to <body> so the backdrop covers the full viewport (sidebar
  // included) — ancestors with backdrop-filter otherwise trap `fixed`.
  const modalContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 light:bg-slate-900/50 backdrop-blur-md"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl bg-[#090D16] light:bg-white border border-purple-500/25 light:border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] overflow-y-auto backdrop-blur-2xl p-6 space-y-5 relative"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 light:border-slate-200 pb-4">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-400 light:text-purple-600">
              Deliverable Review • {deal.dealNumber}
            </span>
            <h3 className="text-lg font-black text-white light:text-slate-900 mt-0.5">
              {activeDeliverable?.title || deal.primaryDeliverableTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white light:bg-slate-100 light:hover:bg-slate-200 light:text-slate-500 light:hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Draft Mock Preview Box */}
        <div className="rounded-2xl border border-white/10 light:border-slate-200/80 bg-slate-950 light:bg-slate-50/80 p-6 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 light:bg-purple-100/70 light:border-purple-200 light:text-purple-600">
            <FileVideo className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white light:text-slate-900">Creator Draft Submission Available</h4>
            <p className="text-xs text-slate-400 light:text-slate-500 mt-0.5">
              Uploaded by {deal.creator.name} ({deal.creator.handle})
            </p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <a
              href={activeDeliverable?.previewUrl || 'https://youtube.com'}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white keep-white transition-colors inline-flex items-center gap-1.5 shadow-md shadow-purple-950/40"
            >
              <ExternalLink className="w-3.5 h-3.5 text-white keep-white" />
              <span className="keep-white text-white">Open Video Player</span>
            </a>
            <button
              type="button"
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 border border-white/10 light:bg-white light:border-slate-200 light:text-slate-700 light:hover:bg-slate-100 transition-colors inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-purple-400 light:text-purple-600" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Creator Notes */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 light:bg-slate-50/80 border border-white/5 light:border-slate-200/80 space-y-1">
          <span className="text-[10.5px] font-bold uppercase text-slate-400 light:text-slate-500">Creator Notes</span>
          <p className="text-xs text-slate-300 light:text-slate-600 italic">
            &quot;{activeDeliverable?.draftNotes || 'Draft version ready for brand review. Brand mentions and call-to-actions placed as per campaign requirements.'}&quot;
          </p>
        </div>

        {/* Request Revision Form */}
        {isEditing ? (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 light:text-slate-700 block">Revision Instructions for Creator:</label>
            <textarea
              value={revisionNote}
              onChange={(e) => setRevisionNote(e.target.value)}
              placeholder="Specify what timestamps or sections need changes..."
              rows={3}
              className="w-full p-3 rounded-xl bg-slate-900 light:bg-white border border-purple-500/40 light:border-slate-300 text-xs text-white light:text-slate-900 placeholder-slate-500 light:placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white light:text-slate-500 light:hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendRevision}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white keep-white shadow-md shadow-purple-950/40"
              >
                <span className="keep-white text-white">Submit Revision Request</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-2 border-t border-white/10 light:border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-bold text-slate-300 hover:text-white light:bg-slate-100 light:hover:bg-slate-200 light:border-slate-200 light:text-slate-700 transition-colors"
            >
              Request Revisions
            </button>
            <button
              type="button"
              onClick={() => {
                onApprove(deal);
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white keep-white transition-all shadow-md shadow-emerald-950/40"
            >
              <span className="keep-white text-white">Approve Deliverable</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
