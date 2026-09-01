'use client';

import React from 'react';
import { X, RotateCcw } from 'lucide-react';

interface ActiveFilterChip {
  key: string;
  label: string;
}

interface CompanyActiveFilterChipsProps {
  chips: ActiveFilterChip[];
  onRemoveChip: (key: string) => void;
  onClearAll: () => void;
}

export default function CompanyActiveFilterChips({
  chips,
  onRemoveChip,
  onClearAll,
}: CompanyActiveFilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap pt-1 pb-2">
      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Filters:</span>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold"
        >
          <span>{chip.label}</span>
          <button
            onClick={() => onRemoveChip(chip.key)}
            className="hover:text-white p-0.5 rounded-full hover:bg-purple-500/30 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      <button
        onClick={onClearAll}
        className="text-xs text-slate-400 hover:text-white underline font-medium ml-2 flex items-center gap-1 transition-colors"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Clear All</span>
      </button>
    </div>
  );
}
