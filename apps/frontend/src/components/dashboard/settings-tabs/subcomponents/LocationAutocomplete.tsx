'use client';

import React, { useState, useEffect, useRef, useId } from 'react';
import { MapPin, Check, Search, Loader2 } from 'lucide-react';

interface LocationAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

interface NominatimResult {
  display_name: string;
  place_id: number;
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
];

async function fetchNominatimSuggestions(query: string, signal: AbortSignal): Promise<string[]> {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '6');
  url.searchParams.set('addressdetails', '1');

  const response = await fetch(url.toString(), {
    signal,
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Zerify/1.0 (https://zerify.io)',
    },
  });

  if (!response.ok) {
    throw new Error(`Nominatim request failed: ${response.status}`);
  }

  const data = (await response.json()) as NominatimResult[];
  return data.map((item) => item.display_name);
}

export default function LocationAutocomplete({
  value,
  onChange,
  placeholder = 'Search city or region...',
  debounceMs = 400,
}: LocationAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = value.trim();
    if (!trimmed) {
      setSuggestions(POPULAR_LOCATIONS.slice(0, 6));
      setIsLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const abortTimeout = window.setTimeout(() => controller.abort(), 10000);
    const debounceTimer = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const results = await fetchNominatimSuggestions(trimmed, controller.signal);
        setSuggestions(results.length > 0 ? results : [trimmed]);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setError('Unable to fetch suggestions');
        setSuggestions([trimmed]);
      } finally {
        window.clearTimeout(abortTimeout);
        setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      window.clearTimeout(debounceTimer);
      window.clearTimeout(abortTimeout);
      controller.abort();
    };
  }, [value, debounceMs]);

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

  const hasSuggestions = suggestions.length > 0 || isLoading || error;

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
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="location-suggestions-list"
          className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-slate-950/70 border border-white/10 text-xs text-white placeholder:text-slate-600/70 focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20 transition-all font-medium shadow-inner"
        />
      </div>

      {isOpen && hasSuggestions && (
        <div id="location-suggestions-list" role="listbox" className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900/95 border border-white/10 rounded-lg shadow-2xl z-50 backdrop-blur-xl max-h-56 overflow-y-auto no-scrollbar p-1 space-y-0.5">
          <div className="px-2 py-1 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Search className="w-3 h-3" />
              Location Suggestions
            </span>
            {isLoading && <Loader2 className="w-3 h-3 animate-spin text-purple-400" />}
          </div>

          {!isLoading && error && (
            <div className="px-2.5 py-1.5 text-[11px] text-amber-400 bg-amber-500/10 rounded-md">
              {error}
            </div>
          )}

          {!isLoading &&
            suggestions.map((loc, idx) => (
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

          {!isLoading && suggestions.length === 0 && !error && (
            <div className="px-2.5 py-2 text-xs text-slate-500 text-center">No suggestions found</div>
          )}

          <div className="px-2 py-1 text-[9px] text-slate-600 text-center truncate">
            Powered by OpenStreetMap · Results from Nominatim
          </div>
        </div>
      )}
    </div>
  );
}
