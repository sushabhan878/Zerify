'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Video, Hash, AtSign, ChevronDown, Check, Sparkles, FileText } from 'lucide-react';


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
  'X (Twitter) Thread',
  'UGC Raw Video Asset',
];

interface DeliverablesStepProps {
  formData: any;
  onChange: (field: string, val: any) => void;
}

export default function DeliverablesStep({ formData, onChange }: DeliverablesStepProps) {
  const deliverables = formData.deliverables || [];
  const [openDropdownIdx, setOpenDropdownIdx] = useState<number | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside() {
      setOpenDropdownIdx(null);
    }
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const addDeliverable = () => {
    const newItem = {
      type: '',
      quantity: '',
      requiredCta: '',
      mandatoryHashtags: [],
      mandatoryMentions: [],
      revisionLimit: '',
      instructions: '',
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-purple-200 uppercase tracking-wider">
            Expected Deliverables <span className="text-pink-400">*</span>
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Define the content assets each hired creator must produce, submit for approval, and publish.
          </p>
        </div>

        <button
          type="button"
          onClick={addDeliverable}
          className="px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-xs font-bold text-purple-200 border border-purple-400/30 flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(192,132,252,0.15)]"
        >
          <Plus className="w-3.5 h-3.5 text-purple-300" />
          <span>Add Deliverable</span>
        </button>
      </div>

      {deliverables.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-dashed border-purple-400/20 text-center space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-400/20 text-purple-300 flex items-center justify-center mx-auto">
            <Video className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-400">
            No deliverables configured yet. Click &quot;Add Deliverable&quot; to define required content tasks.
          </p>
          <button
            type="button"
            onClick={addDeliverable}
            className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-xs font-bold text-purple-200 border border-purple-400/30 transition-colors"
          >
            Add First Deliverable
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {deliverables.map((item: any, idx: number) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4 hover:border-purple-400/30 transition-all duration-200"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-400/20 text-purple-300 flex items-center justify-center">
                    <Video className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-white">
                    Deliverable #{idx + 1}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => removeDeliverable(idx)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Remove deliverable"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Row 1: Asset Type, Quantity, Revision Limit */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Asset Type Custom Dropdown */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
                    Asset Type <span className="text-pink-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setOpenDropdownIdx(openDropdownIdx === idx ? null : idx)}
                    className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white flex items-center justify-between focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                  >
                    <span className={item.type ? 'font-medium text-white' : 'text-slate-500'}>
                      {item.type || 'Select Asset Type...'}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                        openDropdownIdx === idx ? 'rotate-180 text-purple-300' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {openDropdownIdx === idx && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 left-0 right-0 mt-1.5 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl max-h-56 overflow-y-auto p-1.5 space-y-0.5 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                      >
                        {DELIVERABLE_TYPES.map((dt) => {
                          const isSelected = item.type === dt;
                          return (
                            <button
                              type="button"
                              key={dt}
                              onClick={() => {
                                updateItem(idx, 'type', dt);
                                setOpenDropdownIdx(null);
                              }}
                              className={`w-full px-3 py-2 rounded-xl text-left text-xs font-medium transition-colors flex items-center justify-between ${
                                isSelected
                                  ? 'bg-purple-500/20 text-purple-200 font-bold'
                                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                              }`}
                            >
                              <span>{dt}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-purple-300 stroke-[2.5]" />}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
                    Quantity
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="1"
                    value={item.quantity !== undefined && item.quantity !== null && item.quantity !== '' ? item.quantity : ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      updateItem(idx, 'quantity', val ? Number(val) : '');
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
                    Revision Limit
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="2"
                    value={item.revisionLimit !== undefined && item.revisionLimit !== null && item.revisionLimit !== '' ? item.revisionLimit : ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      updateItem(idx, 'revisionLimit', val ? Number(val) : '');
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                  />
                </div>
              </div>

              {/* Row 2: Required CTA & Mandatory Hashtags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <AtSign className="w-3.5 h-3.5 text-purple-300/70" />
                    <span>Required Call To Action (CTA)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Use promo code LAUNCH20 in bio link"
                    value={item.requiredCta || ''}
                    onChange={(e) => updateItem(idx, 'requiredCta', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-purple-300/70" />
                    <span>Mandatory Hashtags (comma separated)</span>
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
                    className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                  />
                </div>
              </div>

              {/* Row 3: Deliverable Specific Instructions */}
              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-purple-300/70" />
                  <span>Content Guidelines & Creative Instructions</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Specify key talking points, required hook, format specifications, audio/visual guidelines, or brand do's & don'ts..."
                  value={item.instructions || ''}
                  onChange={(e) => updateItem(idx, 'instructions', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                />
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
