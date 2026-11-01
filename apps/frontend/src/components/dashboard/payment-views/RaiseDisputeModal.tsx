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
      <div className="relative w-full max-w-lg bg-slate-950 light:bg-white border border-white/10 light:border-slate-200 rounded-2xl shadow-2xl light:shadow-xl overflow-hidden p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 light:border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 light:bg-amber-50 light:border-amber-200 light:text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white light:text-slate-900">Raise Escrow Dispute</h3>
              <p className="text-[11px] text-slate-400 light:text-slate-500">
                {campaignTitle ? `Disputing: ${campaignTitle}` : 'Freeze funds and initiate Zerify mediation'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 light:text-slate-500 hover:text-white light:hover:text-slate-900 hover:bg-white/10 light:hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="p-3 rounded-xl bg-amber-500/10 light:bg-amber-50 border border-amber-500/20 light:border-amber-200 flex items-start gap-2.5 text-xs text-amber-300 light:text-amber-800">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400 light:text-amber-600" />
          <div className="space-y-1">
            <p className="font-bold">How Zerify Escrow Mediation Works</p>
            <p className="text-[11px] text-amber-200/80 light:text-amber-700 leading-relaxed">
              When a dispute is raised, escrow funds are placed on a neutral legal hold. Both parties submit evidence, and an unbiased Zerify mediator reviews deliverables and contract terms within 48 hours.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 light:text-rose-700 light:bg-rose-50 light:border-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!paymentId && (
            <div>
              <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">Contract / Payment Reference ID *</label>
              <input
                type="text"
                value={targetPaymentId}
                onChange={(e) => setTargetPaymentId(e.target.value)}
                placeholder="e.g. pay_92014 or UUID"
                className="w-full bg-slate-900/90 light:bg-white border border-white/10 light:border-slate-200 rounded-xl px-3.5 py-2 text-xs text-white light:text-slate-900 placeholder-slate-500 light:placeholder-slate-400 focus:outline-none focus:border-amber-500 light:focus:border-purple-500 font-mono light:shadow-sm"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">Reason for Dispute *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-900/90 light:bg-white border border-white/10 light:border-slate-200 rounded-xl px-3.5 py-2 text-xs text-white light:text-slate-900 focus:outline-none focus:border-amber-500 light:focus:border-purple-500 light:shadow-sm"
            >
              {DISPUTE_REASONS.map((r) => (
                <option key={r} value={r} className="bg-slate-950 text-white light:bg-white light:text-slate-900">
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">Detailed Explanation & Summary *</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain clearly what happened, revision history, and why you are disputing the current status..."
              className="w-full bg-slate-900/90 light:bg-white border border-white/10 light:border-slate-200 rounded-xl p-3 text-xs text-white light:text-slate-900 placeholder-slate-500 light:placeholder-slate-400 focus:outline-none focus:border-amber-500 light:focus:border-purple-500 leading-relaxed resize-none light:shadow-sm"
              required
            />
          </div>

          {/* Evidence URLs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-300 light:text-slate-700">Evidence Links (Deliverables, screenshots, drive folders)</label>
              {evidenceUrls.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddEvidence}
                  className="text-[10px] font-bold text-purple-400 light:text-purple-600 hover:text-purple-300 light:hover:text-purple-700 flex items-center gap-1 cursor-pointer"
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
                  className="flex-1 bg-slate-900/90 light:bg-white border border-white/10 light:border-slate-200 rounded-xl px-3 py-1.5 text-xs text-white light:text-slate-900 placeholder-slate-500 light:placeholder-slate-400 focus:outline-none focus:border-amber-500 light:focus:border-purple-500 light:shadow-sm"
                />
                {evidenceUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveEvidence(idx)}
                    className="p-1.5 rounded-lg text-slate-400 light:text-slate-500 hover:text-rose-400 light:hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">Requested Fair Resolution</label>
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
                  className={`p-2.5 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer ${
                    requestedResolution === item.id
                      ? 'bg-amber-500/20 light:bg-amber-50 border-amber-500 light:border-amber-400 text-amber-300 light:text-amber-800 shadow-md'
                      : 'bg-slate-900 light:bg-slate-50 border-white/5 light:border-slate-200 text-slate-400 light:text-slate-600 hover:text-white light:hover:text-slate-900'
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
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 light:text-slate-600 hover:text-white light:hover:text-slate-900 border border-white/10 light:border-slate-200 hover:bg-white/5 light:hover:bg-slate-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-extrabold text-white keep-white bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
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
