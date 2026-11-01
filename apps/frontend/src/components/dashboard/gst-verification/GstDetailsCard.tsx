'use client';

import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Calendar,
  RefreshCw,
  History,
  Trash2,
  Tag,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { GstRegistration } from './types';
import GstStatusBadge from './GstStatusBadge';

interface GstDetailsCardProps {
  registration: GstRegistration;
  onVerify: (regId: string) => void;
  onViewHistory: (regId: string) => void;
  onDelete: (regId: string) => void;
  onResolveMismatch?: (registration: GstRegistration) => void;
  isVerifying?: boolean;
}

export default function GstDetailsCard({
  registration,
  onVerify,
  onViewHistory,
  onDelete,
  onResolveMismatch,
  isVerifying = false,
}: GstDetailsCardProps) {
  const [copied, setCopied] = useState(false);
  const isMismatch = registration.internalVerificationStatus === 'MISMATCH';
  const isVerified = registration.internalVerificationStatus === 'VERIFIED';

  const copyGstin = () => {
    navigator.clipboard.writeText(registration.gstin);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group relative rounded-2xl bg-gradient-to-br from-slate-900/95 via-slate-900/70 to-indigo-950/30 border border-white/10 hover:border-purple-500/40 p-5 backdrop-blur-xl shadow-2xl light:bg-none light:bg-white light:border-slate-200/80 light:shadow-sm light:hover:border-purple-300 transition-all duration-300 space-y-4">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-3 border-b border-white/10 light:border-slate-100">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-slate-800/40 border border-indigo-500/30 text-indigo-300 light:bg-indigo-50 light:border-indigo-200 light:text-indigo-600 shadow-inner shrink-0">
            <Building2 className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            {/* GSTIN Pill & Status */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-950/80 border border-white/10 light:bg-slate-100 light:border-slate-200">
                <span className="font-mono text-xs font-bold tracking-wider text-slate-200 light:text-slate-900">
                  {registration.gstin}
                </span>
                <button
                  type="button"
                  onClick={copyGstin}
                  className="text-slate-400 hover:text-white light:text-slate-500 light:hover:text-slate-900 transition-colors cursor-pointer"
                  title="Copy GSTIN"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 hover:scale-110 transition-transform" />
                  )}
                </button>
              </div>

              <GstStatusBadge
                status={registration.internalVerificationStatus}
                providerStatus={registration.providerGstStatus}
              />
            </div>

            {/* Legal Entity */}
            <div>
              <h4 className="text-sm sm:text-base font-extrabold text-white light:text-slate-900 tracking-tight">
                {registration.legalName || 'Registered Legal Entity'}
              </h4>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {isMismatch && onResolveMismatch && (
            <button
              type="button"
              onClick={() => onResolveMismatch(registration)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500/25 to-amber-600/20 hover:from-amber-500/35 hover:to-amber-600/30 text-amber-200 border border-amber-500/50 shadow-lg shadow-amber-500/10 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-300" />
              <span>Review Mismatch</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onVerify(registration.id)}
            disabled={isVerifying}
            className="p-2.5 rounded-xl bg-slate-950/70 text-slate-400 hover:text-white hover:bg-slate-900 border border-white/5 hover:border-white/20 light:bg-slate-100 light:hover:bg-slate-200 light:text-slate-600 light:hover:text-slate-900 light:border-slate-200 transition-all disabled:opacity-40 cursor-pointer shadow-sm"
            title="Re-verify with Cashfree"
          >
            <RefreshCw className={`w-4 h-4 ${isVerifying ? 'animate-spin text-purple-400' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => onViewHistory(registration.id)}
            className="p-2.5 rounded-xl bg-slate-950/70 text-slate-400 hover:text-white hover:bg-slate-900 border border-white/5 hover:border-white/20 light:bg-slate-100 light:hover:bg-slate-200 light:text-slate-600 light:hover:text-slate-900 light:border-slate-200 transition-all cursor-pointer shadow-sm"
            title="Audit Trail History"
          >
            <History className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(registration.id)}
            className="p-2.5 rounded-xl bg-slate-950/70 text-slate-500 hover:text-rose-300 hover:bg-rose-500/15 border border-white/5 hover:border-rose-500/30 light:bg-slate-100 light:hover:bg-rose-50 light:text-slate-600 light:hover:text-rose-600 light:border-slate-200 transition-all cursor-pointer shadow-sm"
            title="Remove GSTIN"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Middle Specs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 rounded-2xl bg-slate-950/60 border border-white/5 light:bg-slate-50 light:border-slate-200 p-3">
        {/* Taxpayer */}
        <div className="px-3 py-1 space-y-0.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 light:text-slate-500 flex items-center gap-1.5">
            <Tag className="w-3 h-3 text-sky-400 light:text-sky-600" />
            Taxpayer Type
          </span>
          <p className="text-xs font-semibold text-slate-200 light:text-slate-800">
            {registration.taxpayerType || 'Regular'}
            {registration.businessConstitution && (
              <span className="text-slate-400 light:text-slate-500 font-normal"> • {registration.businessConstitution}</span>
            )}
          </p>
        </div>

        {/* Reg Date */}
        <div className="px-3 py-1 space-y-0.5 border-t sm:border-t-0 sm:border-l border-white/5 light:border-slate-200 pt-2 sm:pt-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 light:text-slate-500 flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-indigo-400 light:text-indigo-600" />
            Registered Date
          </span>
          <p className="text-xs font-semibold text-slate-200 light:text-slate-800 font-mono">
            {registration.registrationDate || 'Official GST Record'}
          </p>
        </div>

        {/* State */}
        <div className="px-3 py-1 space-y-0.5 border-t sm:border-t-0 sm:border-l border-white/5 light:border-slate-200 pt-2 sm:pt-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 light:text-slate-500 flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-emerald-400 light:text-emerald-600" />
            Jurisdiction
          </span>
          <p className="text-xs font-semibold text-slate-200 light:text-slate-800">
            {registration.stateJurisdiction || 'National'}
          </p>
        </div>
      </div>

      {/* Principal Address Bar */}
      {registration.principalPlaceAddress && (
        <div className="rounded-xl bg-slate-950/40 border border-white/5 light:bg-slate-50 light:border-slate-200 p-3 flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 light:bg-emerald-50 light:text-emerald-700 shrink-0 mt-0.5">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div className="space-y-0.5 flex-1 min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 light:text-slate-500 block">
              Principal Place of Business (Cashfree Verified)
            </span>
            <p className="text-xs text-slate-300 light:text-slate-700 leading-relaxed font-medium">
              {registration.principalPlaceAddress}
            </p>
          </div>
        </div>
      )}

      {/* Footer Status Hint */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
        {isVerified ? (
          <span className="inline-flex items-center gap-1.5 text-emerald-400 light:text-emerald-700 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified via Cashfree Verification Suite
          </span>
        ) : isMismatch ? (
          <span className="inline-flex items-center gap-1.5 text-amber-300/90 light:text-amber-800 font-medium">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 light:text-amber-600" />
            Government name differs from your Zerify account name. Click &quot;Review Mismatch&quot; to align.
          </span>
        ) : (
          <span className="text-slate-500 light:text-slate-500">
            Status: {registration.internalVerificationStatus}
          </span>
        )}

        {registration.providerReferenceId && (
          <span className="font-mono text-slate-500 light:text-slate-400 text-[10px]">
            Ref: {registration.providerReferenceId}
          </span>
        )}
      </div>
    </div>
  );
}
