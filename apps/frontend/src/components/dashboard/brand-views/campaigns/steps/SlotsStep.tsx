'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Users, Lock, Link2, FolderOpen, AlertCircle, X } from 'lucide-react';
import ImageUploader from '@/components/ui/ImageUploader';

interface UrlTagInputProps {
  urls: string[] | undefined | null;
  onChange: (urls: string[]) => void;
  placeholder?: string;
}

function UrlTagInput({ urls = [], onChange, placeholder }: UrlTagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const currentUrls = Array.isArray(urls)
    ? urls.filter((u) => typeof u === 'string' && u.trim().length > 0)
    : [];

  const addUrls = (raw: string) => {
    if (!raw.trim()) return;
    const parts = raw.split(/[,\s]+/).map((s) => s.trim()).filter(Boolean);
    if (parts.length === 0) return;

    const nextUrls = [...currentUrls];
    parts.forEach((part) => {
      if (!nextUrls.includes(part)) {
        nextUrls.push(part);
      }
    });
    onChange(nextUrls);
    setInputValue('');
  };

  const handleInputChange = (val: string) => {
    if (val.includes(',') || val.includes(' ')) {
      addUrls(val);
    } else {
      setInputValue(val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      addUrls(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && currentUrls.length > 0) {
      e.preventDefault();
      onChange(currentUrls.slice(0, -1));
    }
  };

  const removeUrl = (indexToRemove: number) => {
    onChange(currentUrls.filter((_, i) => i !== indexToRemove));
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="w-full min-h-[42px] px-3 py-1.5 bg-slate-900/90 border border-purple-400/20 focus-within:border-purple-400/80 rounded-xl flex flex-wrap items-center gap-1.5 cursor-text transition-colors"
    >
      {currentUrls.map((url, idx) => (
        <span
          key={idx}
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-purple-500/20 border border-purple-400/40 text-purple-200 text-xs font-semibold max-w-[280px]"
        >
          <span className="truncate" title={url}>
            {url.replace(/^https?:\/\/(www\.)?/, '')}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeUrl(idx);
            }}
            className="hover:text-white hover:bg-white/10 rounded-full p-0.5 transition-colors cursor-pointer flex-shrink-0"
            aria-label={`Remove ${url}`}
          >
            <X className="w-3 h-3 stroke-[2.5]" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        placeholder={currentUrls.length === 0 ? placeholder || 'Paste URL & press comma or space...' : 'Add another URL...'}
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addUrls(inputValue)}
        className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none flex-1 min-w-[140px] py-1"
      />
    </div>
  );
}

interface SlotsStepProps {
  formData: any;
  onChange: (field: string, val: any) => void;
}

export default function SlotsStep({ formData, onChange }: SlotsStepProps) {
  const guidelines = formData.contentGuidelines || {};

  const handleGuidelineChange = (field: string, val: any) => {
    onChange('contentGuidelines', {
      ...guidelines,
      [field]: val,
    });
  };

  // Calculate target creators: Math.floor(Total Budget Pool / Per Creator Fee or Cap)
  const budgetTotal = Number(formData.budgetTotalAmount || 0);
  const perCreatorFee = Number(formData.budgetMinPerInfluencer || formData.budgetMaxPerInfluencer || 0);
  const calculatedSlots = (budgetTotal > 0 && perCreatorFee > 0)
    ? Math.floor(budgetTotal / perCreatorFee)
    : null;

  // Auto-fill target slots if not already filled
  useEffect(() => {
    if (
      calculatedSlots &&
      calculatedSlots > 0 &&
      (formData.targetParticipants === undefined || formData.targetParticipants === '' || formData.targetParticipants === null)
    ) {
      onChange('targetParticipants', calculatedSlots);
    }
  }, [calculatedSlots, formData.targetParticipants, onChange]);

  const targetSlots = Number(formData.targetParticipants || 0);
  const maxSlots = Number(formData.maxParticipants || 0);
  const hasMaxSlots = formData.maxParticipants !== undefined && formData.maxParticipants !== '' && formData.maxParticipants !== null;
  const isMaxSlotsInvalid = hasMaxSlots && maxSlots <= targetSlots;

  return (
    <div className="space-y-6">
      {/* Participant Capacity Inputs */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-300/70" />
              <span>Target No. of Creators to Hire</span> <span className="text-pink-400">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder={calculatedSlots ? `e.g. ${calculatedSlots}` : 'e.g. 3'}
              value={formData.targetParticipants !== undefined && formData.targetParticipants !== null ? formData.targetParticipants : ''}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                onChange('targetParticipants', val ? Number(val) : '');
              }}
              className="w-full px-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
            />
            {calculatedSlots && calculatedSlots > 0 ? (
              <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                <span>
                  Budget estimate: {budgetTotal.toLocaleString()} ÷ {perCreatorFee.toLocaleString()} = <strong className="text-purple-300 font-bold">{calculatedSlots} creators</strong>
                </span>
                {formData.targetParticipants !== calculatedSlots && (
                  <button
                    type="button"
                    onClick={() => onChange('targetParticipants', calculatedSlots)}
                    className="text-[10px] text-purple-400 hover:text-purple-200 underline cursor-pointer ml-1"
                  >
                    Reset to {calculatedSlots}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-[10px] text-slate-400/90 mt-1">
                The targeted number of creators you want to onboard for this campaign.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-purple-300/70" />
              <span>Maximum Creators Allowed</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder={formData.targetParticipants ? `e.g. ${Number(formData.targetParticipants) + 2}` : 'e.g. 5'}
              value={formData.maxParticipants !== undefined && formData.maxParticipants !== null ? formData.maxParticipants : ''}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                onChange('maxParticipants', val ? Number(val) : '');
              }}
              className={`w-full px-4 py-2.5 bg-slate-900/90 border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 transition-colors ${
                isMaxSlotsInvalid
                  ? 'border-rose-500/80 bg-rose-500/5 focus:border-rose-500'
                  : 'border-purple-400/20 focus:border-white/20'
              }`}
            />
            {isMaxSlotsInvalid ? (
              <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-rose-400 font-medium">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Maximum Creators Allowed must be strictly greater than Target No. of Creators to Hire ({targetSlots || 1}).</span>
              </div>
            ) : (
              <p className="text-[10px] text-slate-400/90 mt-1">
                Hard ceiling limit — must be strictly greater than the target hiring goal.
              </p>
            )}
          </div>
        </div>

        {/* Auto-Close Toggle */}
        <div className="flex items-center gap-3 pt-1">
          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              checked={Boolean(formData.autoCloseWhenFilled)}
              onChange={(e) => onChange('autoCloseWhenFilled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
          </label>
          <div>
            <span className="text-xs font-bold text-white block">Auto-close applications when filled</span>
            <span className="text-[10px] text-slate-400 block">
              Automatically stop accepting new applicant pitches once target slots are confirmed
            </span>
          </div>
        </div>
      </div>

      {/* Brand Guidelines & Reference Links */}
      <div className="pt-6 border-t border-purple-400/10 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-purple-300/70" />
              <span>Reference / Moodboard URLs</span>
            </label>
            <UrlTagInput
              urls={guidelines.referenceUrls}
              onChange={(urls) => handleGuidelineChange('referenceUrls', urls)}
              placeholder="e.g. figma.com/..., pinterest.com/..."
            />
            <p className="text-[10px] text-slate-400/80 mt-1">
              Press comma or space to add multiple reference links.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-purple-300/70" />
              <span>Brand Asset Folder / Logo Drive URL</span>
            </label>
            <UrlTagInput
              urls={guidelines.assetUrls}
              onChange={(urls) => handleGuidelineChange('assetUrls', urls)}
              placeholder="e.g. drive.google.com/..., dropbox.com/..."
            />
            <p className="text-[10px] text-slate-400/80 mt-1">
              Press comma or space to add multiple asset drive links.
            </p>
          </div>
        </div>

        {/* Optional Cloudinary Moodboard / Style Guide Upload */}
        <div className="pt-2">
          <ImageUploader
            value={guidelines.moodboardUrl || ''}
            onChange={(url) => handleGuidelineChange('moodboardUrl', url)}
            label="Upload Moodboard Image or Visual Guide (Optional)"
            helperText="Upload visual moodboard, style inspiration, or brand asset directly to Cloudinary"
          />
        </div>
      </div>
    </div>
  );
}
