'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Check, Search } from 'lucide-react';

interface LocationAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

const POPULAR_LOCATIONS = [
  'San Francisco, CA, United States',
  'New York, NY, United States',
  'Los Angeles, CA, United States',
  'London, United Kingdom',
  'Mumbai, Maharashtra, India',
  'Bengaluru, Karnataka, India',
  'Delhi, NCR, India',
  'Toronto, Ontario, Canada',
  'Vancouver, BC, Canada',
  'Berlin, Germany',
  'Paris, France',
  'Tokyo, Japan',
  'Sydney, Australia',
  'Singapore, Singapore',
  'Dubai, United Arab Emirates',
  'Austin, TX, United States',
  'Seattle, WA, United States',
  'Amsterdam, Netherlands',
  'Barcelona, Spain',
  'Seoul, South Korea',
];

export default function LocationAutocomplete({
  value,
  onChange,
  placeholder = 'Search city or region...',
}: LocationAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value.trim()) {
      setSuggestions(POPULAR_LOCATIONS.slice(0, 6));
      return;
    }
    const filtered = POPULAR_LOCATIONS.filter((loc) =>
      loc.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(filtered.length > 0 ? filtered : [value]);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (loc: string) => {
    onChange(loc);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <MapPin className="w-4 h-4 text-slate-500/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={value}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-slate-950/70 border border-white/10 text-xs text-white placeholder:text-slate-600/70 focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20 transition-all font-medium shadow-inner"
        />
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900/95 border border-white/10 rounded-lg shadow-2xl z-50 backdrop-blur-xl max-h-48 overflow-y-auto no-scrollbar p-1 space-y-0.5">
          <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Location Suggestions
          </div>
          {suggestions.map((loc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(loc)}
              className="w-full px-2.5 py-1.5 rounded-md text-xs text-slate-300 hover:text-white hover:bg-purple-600/20 flex items-center justify-between transition-colors text-left font-medium"
            >
              <div className="flex items-center gap-2 truncate">
                <MapPin className="w-3 h-3 text-purple-400 shrink-0" />
                <span className="truncate">{loc}</span>
              </div>
              {value === loc && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
