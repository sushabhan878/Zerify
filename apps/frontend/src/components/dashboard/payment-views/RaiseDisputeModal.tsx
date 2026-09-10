'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert, Plus, Trash2, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface RaiseDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onDisputed?: () => void;
  paymentId?: string;
  campaignTitle?: string;
  partyType?: 'INFLUENCER' | 'COMPANY';
}

const DISPUTE_REASONS = [
  'Deliverable Approved but Payment Withheld',
  'Unreasonable Revision Demands Exceeding Agreement',
  'Scope Creep / Additional Unpaid Deliverables Requested',
  'Delayed Communication / Inactive Party',
  'Unfair Rejection of High-Quality Deliverable',
  'Deliverable Not Submitted by Agreed Deadline',
  'Payment Amount or Fee Discrepancy',
  'Other Contract Violation',
];

export default function RaiseDisputeModal({
  isOpen,
  onClose,
  onSuccess,
  onDisputed,
  paymentId,
  campaignTitle,
  partyType = 'INFLUENCER',
}: RaiseDisputeModalProps) {
  const { toastSuccess, toastError } = useToast();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  const [targetPaymentId, setTargetPaymentId] = useState(paymentId || '');
  const [reason, setReason] = useState(DISPUTE_REASONS[0]);
  const [description, setDescription] = useState('');
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>(['']);
  const [requestedResolution, setRequestedResolution] = useState<'RELEASE_INFLUENCER' | 'REFUND_COMPANY' | 'SPLIT'>(
    partyType === 'INFLUENCER' ? 'RELEASE_INFLUENCER' : 'REFUND_COMPANY'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddEvidence = () => {
    if (evidenceUrls.length < 5) {
      setEvidenceUrls([...evidenceUrls, '']);
    }
  };

  const handleRemoveEvidence = (index: number) => {
    setEvidenceUrls(evidenceUrls.filter((_, i) => i !== index));
  };

  const handleEvidenceChange = (index: number, val: string) => {
    const updated = [...evidenceUrls];
    updated[index] = val;
    setEvidenceUrls(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const activePaymentId = targetPaymentId.trim() || paymentId;
    if (!activePaymentId) {
      setErrorMsg('Please specify or select a payment / contract ID to dispute');
      return;
    }

    if (!description.trim() || description.trim().length < 20) {
      setErrorMsg('Please provide a detailed explanation (minimum 20 characters) explaining what occurred');
      return;
    }

    const filteredEvidence = evidenceUrls.map((u) => u.trim()).filter(Boolean);

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('zerify_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      };

      const res = await fetch(`${apiUrl}/payments/${activePaymentId}/dispute`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          openedBy: partyType,
          reason,
          description,
          evidence: filteredEvidence,
          requestedResolution,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to file dispute');
      }

      toastSuccess('Dispute ticket raised successfully. Zerify Compliance team notified.');
      onSuccess?.();
      onDisputed?.();
      onClose();
    } catch (err: any) {
      console.error('Dispute submission error:', err);
      setErrorMsg(err.message || 'Error opening dispute. Please contact support.');
      toastError(err.message || 'Failed to submit dispute');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Raise Escrow Dispute</h3>
              <p className="text-[11px] text-slate-400">
                {campaignTitle ? `Disputing: ${campaignTitle}` : 'Freeze funds and initiate Zerify mediation'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-300">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">How Zerify Escrow Mediation Works</p>
            <p className="text-[11px] text-amber-200/80 leading-relaxed">
              When a dispute is raised, escrow funds are placed on a neutral legal hold. Both parties submit evidence, and an unbiased Zerify mediator reviews deliverables and contract terms within 48 hours.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!paymentId && (
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Contract / Payment Reference ID *</label>
              <input
                type="text"
                value={targetPaymentId}
                onChange={(e) => setTargetPaymentId(e.target.value)}
                placeholder="e.g. pay_92014 or UUID"
                className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">Reason for Dispute *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {DISPUTE_REASONS.map((r) => (
                <option key={r} value={r} className="bg-slate-950 text-white">
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">Detailed Explanation & Summary *</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain clearly what happened, revision history, and why you are disputing the current status..."
              className="w-full bg-slate-900/90 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 leading-relaxed resize-none"
              required
            />
          </div>

          {/* Evidence URLs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-300">Evidence Links (Deliverables, screenshots, drive folders)</label>
              {evidenceUrls.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddEvidence}
                  className="text-[10px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Link
                </button>
              )}
            </div>

            {evidenceUrls.map((url, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => handleEvidenceChange(idx, e.target.value)}
                  placeholder="https://drive.google.com/... or post URL"
                  className="flex-1 bg-slate-900/90 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                {evidenceUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveEvidence(idx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">Requested Fair Resolution</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'RELEASE_INFLUENCER', label: 'Release to Creator' },
                { id: 'REFUND_COMPANY', label: 'Refund to Brand' },
                { id: 'SPLIT', label: 'Fair 50/50 Split' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setRequestedResolution(item.id as any)}
                  className={`p-2.5 rounded-xl border text-[11px] font-bold text-center transition-all ${
                    requestedResolution === item.id
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                      : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting Dispute...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Open Formal Dispute</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
