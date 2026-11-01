'use client';

import React from 'react';
import { X, RotateCcw } from 'lucide-react';

interface ActiveFilterChip {
  key: string;
  label: string;
}

interface CampaignActiveFilterChipsProps {
  chips: ActiveFilterChip[];
  onRemoveChip: (key: string) => void;
  onResetAll: () => void;
}

export default function CampaignActiveFilterChips({
  chips,
  onRemoveChip,
  onResetAll,
}: CampaignActiveFilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap pt-1">
      <span className="text-[11px] font-bold text-slate-500 light:text-slate-600 uppercase tracking-wider">
        Active Filters:
      </span>

      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/15 light:bg-purple-50 border border-purple-500/30 light:border-purple-200 text-purple-300 light:text-purple-700 text-[11px] font-semibold"
        >
          <span>{chip.label}</span>
          <button
            type="button"
            onClick={() => onRemoveChip(chip.key)}
            className="hover:text-white light:hover:text-purple-900 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={onResetAll}
        className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 light:text-slate-500 hover:text-pink-400 light:hover:text-pink-600 transition-colors ml-1"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Reset all</span>
      </button>
    </div>
  );
}
