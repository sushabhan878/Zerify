'use client';

import React from 'react';
import CustomDatePicker from '@/components/ui/CustomDatePicker';
import {
  Check,
  ShieldCheck,
  Share2,
  Clock,
  Calendar,
  HardDrive,
  Layers,
  Image as ImageIcon,
  Video,
  FileText,
} from 'lucide-react';

interface DeliverableWorkflowFieldsProps {
  item: any;
  onChange: (field: string, value: unknown) => void;
  campaignStartDate?: string;
}

const getNextDay = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + 1);
  return d.toLocaleDateString('en-CA');
};

const FILE_TYPE_OPTIONS = [
  {
    key: 'both',
    title: 'Images & Video',
    subtitle: 'JPG, PNG, WEBP, MP4, MOV',
    icon: Layers,
    mimes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'],
  },
  {
    key: 'images',
    title: 'Images Only',
    subtitle: 'JPG, PNG, WEBP (Stills)',
    icon: ImageIcon,
    mimes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  {
    key: 'videos',
    title: 'MP4 / MOV Only',
    subtitle: 'Video clips & reels',
    icon: Video,
    mimes: ['video/mp4', 'video/quicktime'],
  },
];

export default function DeliverableWorkflowFields({ item, onChange, campaignStartDate }: DeliverableWorkflowFieldsProps) {
  // Determine selected mime configuration
  const currentFileType =
    item.allowedMimeTypes && item.allowedMimeTypes.length > 0
      ? item.allowedMimeTypes.every((m: string) => m.startsWith('image/'))
        ? 'images'
        : item.allowedMimeTypes.every((m: string) => m.startsWith('video/'))
        ? 'videos'
        : 'both'
      : 'both';

  const rulesConfig = [
    {
      key: 'requiresPreApproval',
      label: 'Require approval before publication',
      icon: ShieldCheck,
      checked: item.requiresPreApproval ?? true,
    },
    {
      key: 'requiresPublication',
      label: 'Require a published social post',
      icon: Share2,
      checked: item.requiresPublication ?? true,
    },
    {
      key: 'allowLateSubmission',
      label: 'Allow late submissions (show overdue)',
      icon: Clock,
      checked: item.allowLateSubmission ?? true,
    },
  ];

  return (
    <div className="space-y-4 rounded-2xl border border-purple-500/25 bg-slate-950/40 light:bg-slate-50 light:border-slate-200 p-4 backdrop-blur-md">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-purple-400/15 light:border-slate-200 pb-2.5">
        <span className="text-xs font-bold text-purple-200 light:text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-purple-400 light:text-purple-700" />
          <span>Workflow & Submission Rules</span>
        </span>
        <span className="text-[10px] text-purple-300/70 light:text-slate-500 font-medium">Standard Guidelines</span>
      </div>

      {/* Rules Toggles / Checkbox Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {rulesConfig.map((rule) => {
          const isChecked = rule.checked;
          const Icon = rule.icon;

          return (
            <button
              type="button"
              key={rule.key}
              onClick={() => onChange(rule.key, !isChecked)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                isChecked
                  ? 'bg-purple-600/15 border-purple-400/70 text-white shadow-[0_0_12px_rgba(168,85,247,0.15)] light:bg-purple-100 light:border-purple-300 light:text-purple-900 light:shadow-sm'
                  : 'bg-slate-900/60 border-white/10 text-slate-400 hover:border-purple-400/30 hover:bg-slate-900/90 hover:text-slate-200 light:bg-white light:border-slate-200 light:text-slate-600 light:hover:bg-slate-100 light:hover:text-slate-900'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                  isChecked
                    ? 'bg-purple-600 border-purple-400 text-white keep-white shadow-[0_0_8px_rgba(168,85,247,0.5)]'
                    : 'bg-slate-950 border-white/20 text-transparent light:bg-white light:border-slate-300 hover:border-purple-400/50'
                }`}
              >
                <Check className={`w-3 h-3 text-white keep-white stroke-[3] transition-transform ${isChecked ? 'scale-100' : 'scale-0'}`} />
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isChecked ? 'text-purple-300 light:text-purple-700' : 'text-slate-500 light:text-slate-400'}`} />
                <span className="text-xs font-medium leading-tight truncate">{rule.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Deadlines & File Size */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
        <div>
          <label className="block text-xs font-bold text-purple-200 light:text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-purple-400 light:text-purple-600" />
            <span>Submission Deadline</span>
          </label>
          <CustomDatePicker
            value={item.dueDate ? item.dueDate.slice(0, 10) : ''}
            onChange={(val) => {
              onChange('dueDate', val || undefined);
              if (val) {
                const nextPubDate = getNextDay(val);
                if (!item.publicationDeadline || item.publicationDeadline <= val) {
                  onChange('publicationDeadline', nextPubDate);
                }
              }
            }}
            placeholder="Select submission deadline"
            minDate={campaignStartDate ? getNextDay(campaignStartDate) : new Date().toLocaleDateString('en-CA')}
            position="top"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-purple-200 light:text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-purple-400 light:text-purple-600" />
            <span>Publication Deadline</span>
          </label>
          <CustomDatePicker
            value={item.publicationDeadline ? item.publicationDeadline.slice(0, 10) : ''}
            onChange={(val) => onChange('publicationDeadline', val || undefined)}
            placeholder="Select publication deadline"
            minDate={
              item.dueDate
                ? getNextDay(item.dueDate)
                : campaignStartDate
                ? getNextDay(getNextDay(campaignStartDate))
                : getNextDay(new Date().toLocaleDateString('en-CA'))
            }
            position="top"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-purple-200 light:text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-purple-400 light:text-purple-600" />
            <span>Max File Size</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min={1}
              max={500}
              value={item.maxFileSizeMb ?? 100}
              onChange={(e) => onChange('maxFileSizeMb', Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/15 rounded-lg text-xs text-white light:bg-white light:border-slate-300 light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-purple-400/80 transition-all font-semibold"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-purple-300/80 light:text-purple-700 pointer-events-none">
              MB
            </span>
          </div>
        </div>
      </div>

      {/* Allowed Files */}
      <div className="pt-1">
        <label className="block text-xs font-bold text-purple-200 light:text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Allowed File Formats</span>
          <span className="text-[11px] font-normal normal-case text-slate-400 light:text-slate-500">Choose acceptable upload formats</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {FILE_TYPE_OPTIONS.map((opt) => {
            const isSelected = currentFileType === opt.key;
            const Icon = opt.icon;

            return (
              <button
                type="button"
                key={opt.key}
                onClick={() => onChange('allowedMimeTypes', opt.mimes)}
                className={`relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-br from-purple-600/20 to-indigo-600/15 border-purple-400/80 shadow-[0_0_15px_rgba(168,85,247,0.2)] light:bg-purple-50 light:border-purple-300 light:text-purple-900 light:shadow-sm'
                    : 'bg-slate-950/60 border-white/10 hover:border-purple-400/40 hover:bg-slate-900/80 text-slate-300 light:bg-white light:border-slate-200 light:text-slate-700 light:hover:bg-slate-50'
                }`}
              >
                {/* Format Icon */}
                <div
                  className={`p-2 rounded-lg shrink-0 transition-colors ${
                    isSelected ? 'bg-purple-500/25 text-purple-200 light:bg-purple-100 light:text-purple-700' : 'bg-white/5 text-slate-400 light:bg-slate-100 light:text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-bold leading-tight ${isSelected ? 'text-white light:text-slate-900' : 'text-slate-200 light:text-slate-700'}`}>
                    {opt.title}
                  </div>
                  <div className="text-[10px] text-slate-400 light:text-slate-500 truncate mt-0.5">{opt.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-[11px] text-slate-400/80 light:text-slate-500 pt-1 border-t border-white/5 light:border-slate-200">
        Each deliverable quantity produces an independent tracking entry. Accepted requirements are permanently preserved even if the campaign is modified later.
      </p>
    </div>
  );
}
