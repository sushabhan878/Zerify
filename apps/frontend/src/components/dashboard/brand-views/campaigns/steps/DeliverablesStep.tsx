'use client';

import React from 'react';
import { Plus, Trash2, Video, FileText, Calendar, Hash, AtSign } from 'lucide-react';

const DELIVERABLE_TYPES = [
  'Instagram Reel',
  'Instagram Feed Post',
  'Instagram Carousel',
  'Instagram Story',
  'YouTube Dedicated Video',
  'YouTube Sponsored Segment',
  'YouTube Short',
  'TikTok Video',
  'LinkedIn Article / Post',
  'UGC Video Asset',
];

interface DeliverablesStepProps {
  formData: any;
  onChange: (field: string, val: any) => void;
}

export default function DeliverablesStep({ formData, onChange }: DeliverablesStepProps) {
  const deliverables = formData.deliverables || [];

  const addDeliverable = () => {
    const newItem = {
      type: 'Instagram Reel',
      quantity: 1,
      requiredCta: 'Check out the link in bio for 20% off!',
      mandatoryHashtags: ['#Zerify', '#Ad', '#Tech'],
      mandatoryMentions: ['@zerify_app'],
      revisionLimit: 2,
    };
    onChange('deliverables', [...deliverables, newItem]);
  };

  const removeDeliverable = (index: number) => {
    onChange(
      'deliverables',
      deliverables.filter((_: any, idx: number) => idx !== index),
    );
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = deliverables.map((item: any, idx: number) => {
      if (idx === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onChange('deliverables', updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-purple-200 uppercase tracking-wider">
            Expected Deliverables <span className="text-pink-400">*</span>
          </h4>
          <p className="text-[11px] text-slate-400">
            Define what content assets each hired influencer must produce and submit for review.
          </p>
        </div>

        <button
          type="button"
          onClick={addDeliverable}
          className="px-4 py-2 rounded-xl bg-purple-500/25 hover:bg-purple-500/40 text-xs font-bold text-purple-100 border border-purple-300/40 flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(192,132,252,0.3)]"
        >
          <Plus className="w-4 h-4 text-purple-300" />
          <span>Add Deliverable</span>
        </button>
      </div>

      {deliverables.length === 0 ? (
        <div className="p-8 rounded-2xl bg-purple-950/20 border border-dashed border-purple-400/20 text-center space-y-3">
          <Video className="w-8 h-8 text-purple-300/60 mx-auto" />
          <p className="text-xs text-slate-400">No deliverables added yet. Click &quot;Add Deliverable&quot; to configure content tasks.</p>
          <button
            type="button"
            onClick={addDeliverable}
            className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-xs font-bold text-purple-200 border border-purple-300/30"
          >
            Add First Deliverable
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {deliverables.map((item: any, idx: number) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-purple-950/20 border border-purple-400/20 backdrop-blur-md space-y-3 relative group"
            >
              <div className="flex items-center justify-between gap-2 border-b border-purple-400/10 pb-2.5">
                <span className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-purple-300" />
                  Deliverable #{idx + 1}
                </span>

                <button
                  type="button"
                  onClick={() => removeDeliverable(idx)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-purple-200 uppercase mb-1">
                    Asset Type
                  </label>
                  <select
                    value={item.type || 'Instagram Reel'}
                    onChange={(e) => updateItem(idx, 'type', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                  >
                    {DELIVERABLE_TYPES.map((dt) => (
                      <option key={dt} value={dt}>
                        {dt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-purple-200 uppercase mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity || 1}
                    onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-purple-200 uppercase mb-1">
                    Revision Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.revisionLimit || 2}
                    onChange={(e) => updateItem(idx, 'revisionLimit', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-purple-200 uppercase mb-1 flex items-center gap-1">
                    <AtSign className="w-3 h-3 text-purple-300/70" />
                    Required Call To Action (CTA)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Use code LAUNCH20 for 20% off"
                    value={item.requiredCta || ''}
                    onChange={(e) => updateItem(idx, 'requiredCta', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-purple-200 uppercase mb-1 flex items-center gap-1">
                    <Hash className="w-3 h-3 text-purple-300/70" />
                    Mandatory Hashtags (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="#Brand, #Ad, #Launch"
                    value={Array.isArray(item.mandatoryHashtags) ? item.mandatoryHashtags.join(', ') : item.mandatoryHashtags || ''}
                    onChange={(e) =>
                      updateItem(
                        idx,
                        'mandatoryHashtags',
                        e.target.value.split(',').map((s) => s.trim()),
                      )
                    }
                    className="w-full px-3 py-2 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                  />
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
