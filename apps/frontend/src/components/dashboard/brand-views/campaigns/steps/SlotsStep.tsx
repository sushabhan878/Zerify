'use client';

import React from 'react';
import { Users, Lock, Link2, FolderOpen, UploadCloud } from 'lucide-react';
import ImageUploader from '@/components/ui/ImageUploader';

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

  return (
    <div className="space-y-6">
      {/* Participant Capacity Inputs */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-300/70" />
              <span>Target Creators to Hire</span> <span className="text-pink-400">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="e.g. 3"
              value={formData.targetParticipants !== undefined && formData.targetParticipants !== null ? formData.targetParticipants : ''}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                onChange('targetParticipants', val ? Number(val) : '');
              }}
              className="w-full px-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-purple-300/70" />
              <span>Maximum Creator Roster Cap</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="e.g. 5"
              value={formData.maxParticipants !== undefined && formData.maxParticipants !== null ? formData.maxParticipants : ''}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                onChange('maxParticipants', val ? Number(val) : '');
              }}
              className="w-full px-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
            />
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
            <input
              type="text"
              placeholder="e.g. https://figma.com/..., https://pinterest.com/..."
              value={Array.isArray(guidelines.referenceUrls) ? guidelines.referenceUrls.join(', ') : guidelines.referenceUrls || ''}
              onChange={(e) =>
                handleGuidelineChange(
                  'referenceUrls',
                  e.target.value.split(',').map((s) => s.trim()),
                )
              }
              className="w-full px-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-purple-300/70" />
              <span>Brand Asset Folder / Logo Drive URL</span>
            </label>
            <input
              type="text"
              placeholder="e.g. https://drive.google.com/drive/folders/..."
              value={Array.isArray(guidelines.assetUrls) ? guidelines.assetUrls.join(', ') : guidelines.assetUrls || ''}
              onChange={(e) =>
                handleGuidelineChange(
                  'assetUrls',
                  e.target.value.split(',').map((s) => s.trim()),
                )
              }
              className="w-full px-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
            />
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
