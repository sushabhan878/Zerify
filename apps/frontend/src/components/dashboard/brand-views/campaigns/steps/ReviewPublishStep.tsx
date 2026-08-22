'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Megaphone, Video, DollarSign, Users, Sparkles } from 'lucide-react';

interface ReviewPublishStepProps {
  formData: any;
  onPublish: () => void;
  onSaveDraft: () => void;
  isPublishing: boolean;
  isSavingDraft: boolean;
}

export default function ReviewPublishStep({
  formData,
  onPublish,
  onSaveDraft,
  isPublishing,
  isSavingDraft,
}: ReviewPublishStepProps) {
  const deliverables = formData.deliverables || [];
  const platforms = formData.platforms || [];

  const isValid = Boolean(formData.title && formData.description);

  return (
    <div className="space-y-6">
      {!isValid && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold text-amber-300">Missing Required Fields</h5>
            <p className="text-[11px] text-slate-300">
              Please ensure you have filled out Campaign Name and Description before publishing.
            </p>
          </div>
        </div>
      )}

      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Campaign Brief */}
        <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-400/20 backdrop-blur-md space-y-2">
          <div className="flex items-center gap-2 text-purple-300 text-xs font-bold">
            <Megaphone className="w-4 h-4 text-purple-300" />
            <span>Campaign Brief</span>
          </div>
          <h4 className="text-sm font-bold text-white">{formData.title || 'Untitled Campaign'}</h4>
          <p className="text-xs text-slate-300 line-clamp-3">
            {formData.description || 'No description provided.'}
          </p>
          <div className="flex flex-wrap gap-1.5 pt-2">
            {Array.isArray(formData.categories) && formData.categories.length > 0 ? (
              formData.categories.map((cat: string) => (
                <span key={cat} className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-200 border border-purple-300/30">
                  {cat}
                </span>
              ))
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-200 border border-purple-300/30">
                {formData.objective || 'Brand Awareness'}
              </span>
            )}
            {formData.industry && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 border border-white/10 text-slate-300">
                {formData.industry}
              </span>
            )}
          </div>
        </div>

        {/* Budget & Slots */}
        <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-400/20 backdrop-blur-md space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
            <DollarSign className="w-4 h-4" />
            <span>Budget & Capacity</span>
          </div>
          <div className="flex justify-between items-baseline pt-1">
            <span className="text-xs text-slate-400">Total Budget:</span>
            <span className="text-base font-black text-emerald-400">
              {formData.budgetCurrency || 'USD'} {formData.budgetTotalAmount?.toLocaleString() || 'Flexible'}
            </span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-slate-400">Target Hires:</span>
            <span className="text-xs font-black text-white">{formData.targetParticipants || 1} Creators</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-slate-400">Payment Model:</span>
            <span className="text-xs font-bold text-slate-200">{formData.budgetPaymentModel || 'FIXED'}</span>
          </div>
        </div>

        {/* Platforms & Deliverables */}
        <div className="md:col-span-2 p-4 rounded-2xl bg-purple-950/20 border border-purple-400/20 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-300 text-xs font-bold">
              <Video className="w-4 h-4" />
              <span>Deliverables & Channels ({deliverables.length})</span>
            </div>
            <div className="flex gap-1.5">
              {platforms.map((p: string) => (
                <span key={p} className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/20 text-purple-200 border border-purple-300/30">
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {deliverables.map((d: any, idx: number) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-900/90 border border-purple-400/10 text-xs">
                <span className="font-bold text-white block">{d.type}</span>
                <span className="text-[10px] text-slate-400 block">
                  Qty: {d.quantity || 1} • {d.revisionLimit || 2} revisions max
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-purple-400/10">
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSavingDraft || isPublishing}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors disabled:opacity-50"
        >
          {isSavingDraft ? 'Saving Draft...' : 'Save Draft & Exit'}
        </button>

        <button
          type="button"
          onClick={onPublish}
          disabled={!isValid || isPublishing || isSavingDraft}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 hover:scale-105 text-xs font-black text-white flex items-center justify-center gap-2 transition-all shadow-[0_0_16px_rgba(192,132,252,0.4)] disabled:opacity-50 disabled:hover:scale-100"
        >
          <Sparkles className="w-4 h-4 text-purple-200" />
          <span>{isPublishing ? 'Publishing Campaign...' : 'Publish Campaign Live'}</span>
        </button>
      </div>
    </div>
  );
}
