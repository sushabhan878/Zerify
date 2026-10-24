'use client';

import React, { useState, useRef, useEffect } from 'react';
import DeliverableWorkflowFields from '../../../campaign-execution/DeliverableWorkflowFields';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Video, Hash, AtSign, ChevronDown, Check, Sparkles, FileText, X, AlertCircle } from 'lucide-react';

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

interface HashtagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

function HashtagInput({ tags, onChange }: HashtagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    const tag = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
    if (!tags.includes(tag)) {
      onChange([...tags, tag]);
    }
    setInputValue('');
  };

  const handleInputChange = (val: string) => {
    if (val.includes(',') || val.includes(' ')) {
      const parts = val.split(/[,\s]+/).filter(Boolean);
      if (parts.length > 0) {
        const nextTags = [...tags];
        parts.forEach((p) => {
          const formatted = p.startsWith('#') ? p : `#${p}`;
          if (!nextTags.includes(formatted)) {
            nextTags.push(formatted);
          }
        });
        onChange(nextTags);
      }
      setInputValue('');
    } else {
      setInputValue(val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      e.preventDefault();
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, i) => i !== indexToRemove));
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="w-full min-h-[42px] px-3 py-1.5 bg-slate-900/90 border border-purple-400/20 focus-within:border-purple-400/80 rounded-xl flex flex-wrap items-center gap-1.5 cursor-text transition-colors"
    >
      {tags.map((tag, tIdx) => (
        <span
          key={tIdx}
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-purple-500/20 border border-purple-400/40 text-purple-200 text-xs font-semibold"
        >
          <span>{tag}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(tIdx);
            }}
            className="hover:text-white hover:bg-white/10 rounded-full p-0.5 transition-colors cursor-pointer"
            aria-label={`Remove ${tag}`}
          >
            <X className="w-3 h-3 stroke-[2.5]" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        placeholder={tags.length === 0 ? 'Type #tag & press comma or space...' : 'Add hashtag...'}
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(inputValue)}
        className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none flex-1 min-w-[130px] py-1"
      />
    </div>
  );
}

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
                    Deliverable No. {idx + 1}
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

              <DeliverableWorkflowFields
                item={item}
                onChange={(field, value) => updateItem(idx, field, value)}
                campaignStartDate={formData.startDate}
              />

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
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${openDropdownIdx === idx ? 'rotate-180 text-purple-300' : ''
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
                              className={`w-full px-3 py-2 rounded-xl text-left text-xs font-medium transition-colors flex items-center justify-between ${isSelected
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider">
                      Revision Limit
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Max 4</span>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="2"
                    value={item.revisionLimit !== undefined && item.revisionLimit !== null && item.revisionLimit !== '' ? item.revisionLimit : ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      updateItem(idx, 'revisionLimit', val ? Number(val) : '');
                    }}
                    className={`w-full px-3.5 py-2.5 bg-slate-900/90 border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 transition-colors ${
                      Number(item.revisionLimit) > 4
                        ? 'border-amber-400/80 bg-amber-500/10'
                        : 'border-purple-400/20 focus:border-white/20'
                    }`}
                  />
                  {Number(item.revisionLimit) > 4 ? (
                    <div className="flex items-start gap-1.5 mt-1.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 leading-tight">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5" />
                      <span>
                        Revision limit exceeds industry standards (1–2) and Zerify fair-collaboration policy (max 4). Excessive revisions increase creator drop-off.
                      </span>
                    </div>
                  ) : Number(item.revisionLimit) > 0 ? (
                    <p className="text-[10px] text-slate-400/80 mt-1">
                      {Number(item.revisionLimit) <= 2
                        ? '✓ Standard creator practice (1–2 rounds included).'
                        : '⚠️ 3–4 revisions is higher than standard. Recommended only for complex productions.'}
                    </p>
                  ) : null}
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
                    <span>Mandatory Hashtags</span>
                  </label>
                  <HashtagInput
                    tags={Array.isArray(item.mandatoryHashtags) ? item.mandatoryHashtags : []}
                    onChange={(newTags) => updateItem(idx, 'mandatoryHashtags', newTags)}
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
