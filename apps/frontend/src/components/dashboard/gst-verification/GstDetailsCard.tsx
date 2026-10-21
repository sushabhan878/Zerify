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
    <div className="group relative rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-purple-950/20 border border-white/10 hover:border-purple-500/30 p-5 backdrop-blur-xl shadow-xl transition-all duration-200 space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/25 text-purple-300 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={copyGstin}
                className="font-mono text-sm font-black tracking-wider text-white hover:text-purple-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Click to copy GSTIN"
              >
                <span>{registration.gstin}</span>
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-500 opacity-60 group-hover:opacity-100" />}
              </button>
              <GstStatusBadge
                status={registration.internalVerificationStatus}
                providerStatus={registration.providerGstStatus}
              />
            </div>
            <p className="text-xs font-semibold text-slate-200 mt-0.5">
              {registration.legalName || 'Registered Legal Entity'}
              {registration.tradeName && (
                <span className="text-slate-400 font-normal"> • Trade: {registration.tradeName}</span>
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {isMismatch && onResolveMismatch && (
            <button
              type="button"
              onClick={() => onResolveMismatch(registration)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Review Mismatch</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onVerify(registration.id)}
            disabled={isVerifying}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/10 transition-colors disabled:opacity-40 cursor-pointer"
            title="Re-verify with Cashfree"
          >
            <RefreshCw className={`w-4 h-4 ${isVerifying ? 'animate-spin text-purple-400' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => onViewHistory(registration.id)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/10 transition-colors cursor-pointer"
            title="Audit Trail History"
          >
            <History className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(registration.id)}
            className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors cursor-pointer"
            title="Remove GSTIN"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/5 space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <Tag className="w-3 h-3 text-purple-400" />
            Taxpayer Type
          </span>
          <p className="font-medium text-slate-200 truncate">
            {registration.taxpayerType || 'Regular'}
            {registration.businessConstitution && ` (${registration.businessConstitution})`}
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/5 space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-indigo-400" />
            Registered Date
          </span>
          <p className="font-medium text-slate-200">
            {registration.registrationDate || 'Official Record'}
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/5 space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-400" />
            Jurisdiction
          </span>
          <p className="font-medium text-slate-200 truncate">
            {registration.stateJurisdiction || 'National'}
          </p>
        </div>
      </div>

      {/* Principal Address */}
      {registration.principalPlaceAddress && (
        <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5 flex items-start gap-2.5 text-xs">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Principal Place of Business
            </span>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {registration.principalPlaceAddress}
            </p>
          </div>
        </div>
      )}

      {/* Footer info */}
      {isVerified && (
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified via Cashfree Verification Suite
          </span>
          {registration.providerReferenceId && (
            <span className="font-mono text-slate-500 text-[10px]">Ref: {registration.providerReferenceId}</span>
          )}
        </div>
      )}
    </div>
  );
}
