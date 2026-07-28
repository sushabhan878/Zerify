'use client';

import React from 'react';
import { DollarSign, Clock, Check } from 'lucide-react';

interface PricingPreferencesFormProps {
  minAmount: string;
  setMinAmount: (val: string) => void;
  currency: string;
  setCurrency: (val: string) => void;
  responseTime: string;
  setResponseTime: (val: string) => void;
  collabTypes: string[];
  setCollabTypes: (val: string[]) => void;
}

export default function PricingPreferencesForm({
  minAmount,
  setMinAmount,
  currency,
  setCurrency,
  responseTime,
  setResponseTime,
  collabTypes,
  setCollabTypes,
}: PricingPreferencesFormProps) {
  const collabTypeOptions = [
    'Dedicated Video', 'Integrated Sponsorship', 'Instagram Reel', 'Story Series',
    'Product Unboxing & Review', 'Live Stream Host'
  ];

  const toggleItem = (item: string) => {
    if (collabTypes.includes(item)) {
      setCollabTypes(collabTypes.filter((i) => i !== item));
    } else {
      setCollabTypes([...collabTypes, item]);
    }
  };

  return (
    <div className="p-5 rounded-xl bg-slate-900/70 border border-white/10 backdrop-blur-xl space-y-5 shadow-xl">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-purple-400" />
        <span>Pricing & Deal Preferences</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[11px] font-semibold text-slate-400/80 uppercase tracking-wider block mb-1.5">
            Minimum Collaboration Amount
          </label>
          <div className="flex gap-2">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="px-3 py-2.5 rounded-lg bg-slate-950/70 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500/80 font-medium shrink-0 shadow-inner"
            >
              <option value="USD">$ USD</option>
              <option value="INR">₹ INR</option>
              <option value="EUR">€ EUR</option>
              <option value="GBP">£ GBP</option>
            </select>
            <input
              type="number"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              placeholder="e.g. 1000"
              className="flex-1 px-3.5 py-2.5 rounded-lg bg-slate-950/70 border border-white/10 text-xs text-white placeholder:text-slate-600/70 focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20 transition-all font-semibold shadow-inner"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-400/80 uppercase tracking-wider block mb-1.5">
            Average Response Time
          </label>
          <div className="relative">
            <Clock className="w-4 h-4 text-slate-500/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={responseTime}
              onChange={(e) => setResponseTime(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-slate-950/70 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500/80 font-medium shadow-inner"
            >
              <option value="Within 1 hour">Within 1 hour</option>
              <option value="Within 24 hours">Within 24 hours</option>
              <option value="1-3 business days">1-3 business days</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="text-[11px] font-semibold text-slate-400/80 uppercase tracking-wider block mb-2">
          Accepted Collaboration Types
        </label>
        <div className="flex flex-wrap gap-2">
          {collabTypeOptions.map((type) => {
            const selected = collabTypes.includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleItem(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selected
                    ? 'bg-pink-600/90 text-white shadow-md border border-pink-400/30 font-semibold'
                    : 'bg-slate-950/60 border border-white/10 text-slate-400/90 hover:text-white hover:border-white/20'
                }`}
              >
                {selected && <Check className="w-3 h-3 inline-block mr-1" />}
                {type}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
