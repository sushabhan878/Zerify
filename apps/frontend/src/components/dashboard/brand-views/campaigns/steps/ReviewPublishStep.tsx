'use client';

import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Megaphone,
  Video,
  DollarSign,
  Users,
  Sparkles,
  Package,
  Calendar,
  Layers,
  ArrowRight,
  Bookmark,
  Send,
  Globe,
} from 'lucide-react';

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
  const currencyCode = formData.budgetCurrency || 'USD';
  const currencySymbol =
    currencyCode === 'INR' ? '₹' : currencyCode === 'EUR' ? '€' : currencyCode === 'GBP' ? '£' : currencyCode === 'CAD' ? 'C$' : currencyCode === 'AUD' ? 'A$' : '$';

  return (
    <div className="space-y-6">
      {/* Validation Status Banner */}
      {!isValid ? (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <div>
            <h5 className="text-xs font-bold text-amber-300">Missing Required Fields</h5>
            <p className="text-[11px] text-slate-300">
              Please ensure Campaign Title and Description are filled in Step 1 before launching.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <div>
            <h5 className="text-xs font-bold text-emerald-300">Campaign Ready for Review & Launch</h5>
            <p className="text-[11px] text-slate-300">
              All essential parameters configured. Review your campaign details below before going live.
            </p>
          </div>
        </div>
      )}

      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Campaign Brief */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-300 text-xs font-bold">
              <Megaphone className="w-4 h-4 text-purple-300" />
              <span>Campaign Brief</span>
            </div>
            {formData.industry && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 border border-white/10 text-slate-300">
                {formData.industry}
              </span>
            )}
          </div>

          <h4 className="text-sm font-bold text-white tracking-tight">
            {formData.title || 'Untitled Campaign'}
          </h4>

          <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
            {formData.description || 'No description provided.'}
          </p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {Array.isArray(formData.objective) && formData.objective.length > 0 ? (
              formData.objective.map((obj: string) => (
                <span key={obj} className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-200 border border-purple-300/30">
                  {obj}
                </span>
              ))
            ) : formData.objective ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-200 border border-purple-300/30">
                {formData.objective}
              </span>
            ) : Array.isArray(formData.categories) && formData.categories.length > 0 ? (
              formData.categories.map((cat: string) => (
                <span key={cat} className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-200 border border-purple-300/30">
                  {cat}
                </span>
              ))
            ) : (
              <span className="text-[11px] text-slate-500 italic">No objectives selected</span>
            )}
          </div>
        </div>

        {/* Budget & Slots */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <DollarSign className="w-4 h-4" />
              <span>Budget & Capacity</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30">
              {formData.budgetPaymentModel || 'Not Selected'}
            </span>
          </div>

          <div className="flex justify-between items-baseline pt-1">
            <span className="text-xs text-slate-400">Total Campaign Budget:</span>
            <span className="text-sm font-black text-emerald-400">
              {formData.budgetPaymentModel === 'BARTER'
                ? 'Product Barter ($0 Escrow)'
                : formData.budgetTotalAmount
                ? `${currencySymbol} ${Number(formData.budgetTotalAmount).toLocaleString()} ${currencyCode}`
                : 'Not Set / Flexible'}
            </span>
          </div>

          {formData.freeProductValue && (
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-400">Product Sample Retail Value:</span>
              <span className="text-xs font-bold text-purple-300">
                {currencySymbol} {Number(formData.freeProductValue).toLocaleString()} {currencyCode}
              </span>
            </div>
          )}

          <div className="flex justify-between items-baseline">
            <span className="text-xs text-slate-400">Target Hires:</span>
            <span className="text-xs font-black text-white">
              {formData.targetParticipants ? `${formData.targetParticipants} Creators` : 'Not Specified'}
            </span>
          </div>

          {formData.applicationDeadline && (
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-400">Deadline:</span>
              <span className="text-xs font-medium text-slate-300">{formData.applicationDeadline}</span>
            </div>
          )}
        </div>

        {/* Platforms & Deliverables */}
        <div className="md:col-span-2 p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-300 text-xs font-bold">
              <Video className="w-4 h-4" />
              <span>Deliverables & Channels ({deliverables.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {platforms.length > 0 ? (
                platforms.map((p: string) => (
                  <span key={p} className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-200 border border-purple-300/30">
                    {p}
                  </span>
                ))
              ) : (
                <span className="text-[10px] text-slate-500 italic">No specific platforms</span>
              )}
            </div>
          </div>

          {deliverables.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {deliverables.map((d: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs space-y-1">
                  <span className="font-bold text-white block">{d.type || 'Custom Deliverable'}</span>
                  <span className="text-[10px] text-slate-400 block">
                    Qty: {d.quantity || 1} • {d.revisionLimit || 2} revisions max
                  </span>
                  {d.requiredCta && (
                    <span className="text-[10px] text-purple-300/80 block truncate">
                      CTA: {d.requiredCta}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5 text-xs text-slate-500 text-center italic">
              No deliverables added yet.
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-purple-400/10">
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSavingDraft || isPublishing}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-white/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Bookmark className="w-3.5 h-3.5 text-slate-400" />
          <span>{isSavingDraft ? 'Saving Draft...' : 'Save Draft & Exit'}</span>
        </button>

        <button
          type="button"
          onClick={onPublish}
          disabled={!isValid || isPublishing || isSavingDraft}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 hover:opacity-95 text-xs font-black text-white flex items-center justify-center gap-2 transition-all shadow-[0_0_16px_rgba(192,132,252,0.35)] disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-purple-200" />
          <span>{isPublishing ? 'Publishing Campaign...' : 'Publish Campaign Live'}</span>
        </button>
      </div>
    </div>
  );
}
