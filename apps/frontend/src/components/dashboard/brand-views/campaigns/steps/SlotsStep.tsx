'use client';

import React from 'react';
import { Users, Lock, Link2, FileCheck } from 'lucide-react';

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
      {/* Creator Slots */}
      <div>
        <h4 className="text-xs font-bold text-purple-200 uppercase tracking-wider mb-2">
          Participant Capacity
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-purple-950/20 border border-purple-400/20 backdrop-blur-md">
          <div>
            <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
              Target Creators to Hire <span className="text-pink-400">*</span>
            </label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 5"
              value={formData.targetParticipants || 1}
              onChange={(e) => onChange('targetParticipants', Number(e.target.value) || 1)}
              className="w-full px-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
              Maximum Creator Roster Cap
            </label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 10"
              value={formData.maxParticipants || 1}
              onChange={(e) => onChange('maxParticipants', Number(e.target.value) || 1)}
              className="w-full px-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
            />
          </div>

          <div className="sm:col-span-2 flex items-center gap-3 pt-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoCloseWhenFilled ?? false}
                onChange={(e) => onChange('autoCloseWhenFilled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
            <div>
              <span className="text-xs font-bold text-white block">Auto-close applications when filled</span>
              <span className="text-[10px] text-purple-300/70 block">
                Automatically stop accepting new applicant pitches once target slots are confirmed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Guidelines & Reference Links */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-purple-200 uppercase tracking-wider">
          Brand Assets & Reference Links
        </h4>

        <div>
          <label className="block text-[10px] font-bold text-purple-200 uppercase mb-1">
            Reference / Moodboard URLs (comma separated)
          </label>
          <input
            type="text"
            placeholder="https://drive.google.com/..., https://figma.com/..."
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
          <label className="block text-[10px] font-bold text-purple-200 uppercase mb-1">
            Brand Asset Folder / Logo Drive URL
          </label>
          <input
            type="text"
            placeholder="https://brand-assets.box.com/..."
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
    </div>
  );
}
