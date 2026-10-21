'use client';

import React, { useState } from 'react';
import {
  FileText,
  Building2,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';

const GST_STATE_PREFIXES: Record<string, string> = {
  '01': 'Jammu & Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '19': 'West Bengal',
  '24': 'Gujarat',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '33': 'Tamil Nadu',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '32': 'Kerala',
};

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

interface GstVerificationFormProps {
  onSubmit: (data: { gstin: string; businessName: string }) => Promise<void>;
  isLoading: boolean;
}

export default function GstVerificationForm({
  onSubmit,
  isLoading,
}: GstVerificationFormProps) {
  const [gstin, setGstin] = useState('');
  const [businessName, setBusinessName] = useState('');

  const cleanGstin = gstin.trim().replace(/[\s-]/g, '').toUpperCase();
  const isValidFormat = GST_REGEX.test(cleanGstin);
  const stateCode = cleanGstin.slice(0, 2);
  const detectedState = GST_STATE_PREFIXES[stateCode];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidFormat || !businessName.trim() || isLoading) return;
    await onSubmit({ gstin: cleanGstin, businessName: businessName.trim() });
    setGstin('');
    setBusinessName('');
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-5 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-400" />
          <span>Add & Verify New GSTIN Registration</span>
        </h4>
        <span className="text-[10px] text-slate-400">Cashfree Verification Suite</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* GSTIN Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            15-Digit GSTIN <span className="text-purple-400">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              placeholder="e.g. 29AAICP2912R1ZR"
              maxLength={15}
              className={`w-full font-mono uppercase px-3.5 py-2.5 rounded-xl bg-slate-950/80 border text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                cleanGstin.length === 15
                  ? isValidFormat
                    ? 'border-emerald-500/60 focus:border-emerald-500'
                    : 'border-rose-500/60 focus:border-rose-500'
                  : 'border-white/10 focus:border-purple-500'
              }`}
            />
            {cleanGstin.length === 15 && (
              <div className="absolute right-3 top-2.5">
                {isValidFormat ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                )}
              </div>
            )}
          </div>

          {/* Detected State Tag */}
          <div className="mt-1.5 flex items-center justify-between text-[10px]">
            {detectedState ? (
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <MapPin className="w-3 h-3" />
                Jurisdiction: {detectedState} ({stateCode})
              </span>
            ) : (
              <span className="text-slate-500">2-digit state code + 10-char PAN + 3-char entity</span>
            )}
            <span className="text-slate-500 font-mono">{cleanGstin.length}/15</span>
          </div>
        </div>

        {/* Business Name Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Registered Legal / Business Name <span className="text-purple-400">*</span>
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Ujjivan Small Finance Bank"
              maxLength={200}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="mt-1.5 flex justify-end text-[10px] text-slate-500">
            <span>{businessName.length}/200 characters</span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={!isValidFormat || !businessName.trim() || isLoading}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>Verify GSTIN with Cashfree</span>
        </button>
      </div>
    </form>
  );
}
