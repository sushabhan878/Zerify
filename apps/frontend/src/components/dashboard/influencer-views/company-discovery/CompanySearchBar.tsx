'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

interface CompanySearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

export default function CompanySearchBar({ value, onChange }: CompanySearchBarProps) {
  return (
    <div className="relative w-full">
      <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
      <input
        type="text"
        placeholder="Search brands, industries, products, campaigns or keywords..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/20 focus:ring-0 transition-all shadow-inner"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
