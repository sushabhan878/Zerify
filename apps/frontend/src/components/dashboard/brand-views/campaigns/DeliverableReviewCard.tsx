'use client';

import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, ExternalLink, RefreshCw, MessageSquare, Video, ShieldCheck } from 'lucide-react';
import { ParticipantDeliverableItem, DeliverableService } from '@/services/deliverable.service';

interface DeliverableReviewCardProps {
  deliverable: ParticipantDeliverableItem;
  onRefresh: () => void;
}

export default function DeliverableReviewCard({
  deliverable,
  onRefresh,
}: DeliverableReviewCardProps) {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [decision, setDecision] = useState<'APPROVED' | 'REVISION_REQUESTED'>('APPROVED');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReview = async (type: 'APPROVED' | 'REVISION_REQUESTED') => {
    setDecision(type);
    if (type === 'APPROVED') {
      setIsSubmitting(true);
      try {
        await DeliverableService.reviewDeliverable(deliverable.id, {
          decision: 'APPROVED',
          comments: 'Approved by brand.',
        });
        onRefresh();
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setShowFeedbackModal(true);
    }
  };

  const submitRevisionRequest = async () => {
    setIsSubmitting(true);
    try {
      await DeliverableService.reviewDeliverable(deliverable.id, {
        decision: 'REVISION_REQUESTED',
        comments,
      });
      setShowFeedbackModal(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    setIsSubmitting(true);
    try {
      await DeliverableService.verifyDeliverable(deliverable.id);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'VERIFIED':
        return 'bg-emerald-600 text-white shadow-md';
      case 'SUBMITTED':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse';
      case 'REVISION_REQUESTED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'PUBLISHED':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-white/10';
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white">{deliverable.type}</h4>
            <span className="text-[10px] text-slate-400">Revision count: {deliverable.revisionCount}</span>
          </div>
        </div>

        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase ${getStatusBadge(deliverable.status)}`}>
          {deliverable.status.replace('_', ' ')}
        </span>
      </div>

      {/* Submitted Draft Content */}
      {deliverable.contentUrls && deliverable.contentUrls.length > 0 && (
        <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Submitted Assets / Draft Links</span>
          <div className="space-y-1">
            {deliverable.contentUrls.map((url, idx) => (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1.5 truncate"
              >
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{url}</span>
              </a>
            ))}
          </div>
          {deliverable.submissionNotes && (
            <p className="text-[11px] text-slate-300 italic pt-1 border-t border-white/5">
              &quot;{deliverable.submissionNotes}&quot;
            </p>
          )}
        </div>
      )}

      {/* Published URL Proof */}
      {deliverable.publishedUrl && (
        <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-1.5">
          <span className="text-[10px] text-indigo-300 font-bold uppercase block">Live Published Post</span>
          <a
            href={deliverable.publishedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-400 hover:underline flex items-center gap-1.5 truncate font-bold"
          >
            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{deliverable.publishedUrl}</span>
          </a>
        </div>
      )}

      {/* Actions */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-end gap-2">
        {deliverable.status === 'SUBMITTED' && (
          <>
            <button
              onClick={() => handleReview('REVISION_REQUESTED')}
              disabled={isSubmitting}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all disabled:opacity-50"
            >
              Request Revision
            </button>
            <button
              onClick={() => handleReview('APPROVED')}
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md transition-all disabled:opacity-50"
            >
              Approve Draft
            </button>
          </>
        )}

        {deliverable.status === 'PUBLISHED' && (
          <button
            onClick={handleVerify}
            disabled={isSubmitting}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:scale-105 text-white text-xs font-black shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verify Live Post</span>
          </button>
        )}
      </div>

      {/* Feedback Modal for Revision Requests */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-5 space-y-4">
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Request Content Revision
            </h4>
            <textarea
              rows={4}
              placeholder="Explain specifically what adjustments need to be made before approval (e.g. CTA positioning, audio balance, lighting)..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={submitRevisionRequest}
                disabled={!comments.trim() || isSubmitting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold disabled:opacity-50"
              >
                Send Revision Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
