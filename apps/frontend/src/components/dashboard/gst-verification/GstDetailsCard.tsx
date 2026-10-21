'use client';

import React from 'react';
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
  const isMismatch = registration.internalVerificationStatus === 'MISMATCH';
  const isVerified = registration.internalVerificationStatus === 'VERIFIED';

  return (
    <div className="rounded-2xl bg-slate-900/60 border border-white/10 p-5 backdrop-blur-md shadow-lg space-y-4 hover:border-white/20 transition-all">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold tracking-wider text-white">
                {registration.gstin}
              </span>
              <GstStatusBadge
                status={registration.internalVerificationStatus}
                providerStatus={registration.providerGstStatus}
              />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {registration.legalName || 'Unassigned Legal Name'}
              {registration.tradeName && ` (${registration.tradeName})`}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {isMismatch && onResolveMismatch && (
            <button
              type="button"
              onClick={() => onResolveMismatch(registration)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
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
            title="Verification History"
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

      {/* Grid of registered details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
            <Tag className="w-3 h-3 text-purple-400" />
            Taxpayer Classification
          </span>
          <p className="font-medium text-slate-200">
            {registration.taxpayerType || 'Regular'}
            {registration.businessConstitution && ` • ${registration.businessConstitution}`}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-indigo-400" />
            Registration Date
          </span>
          <p className="font-medium text-slate-200">
            {registration.registrationDate || 'N/A'}
            {registration.lastProviderUpdateDate && ` (Updated: ${registration.lastProviderUpdateDate})`}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-400" />
            Jurisdiction / State
          </span>
          <p className="font-medium text-slate-200">
            {registration.stateJurisdiction || 'All India'}
          </p>
        </div>
      </div>

      {/* Address */}
      {registration.principalPlaceAddress && (
        <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5 flex items-start gap-2.5 text-xs">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Principal Place of Business (Cashfree Verified)
            </span>
            <p className="text-slate-300 leading-relaxed mt-0.5">
              {registration.principalPlaceAddress}
            </p>
          </div>
        </div>
      )}

      {/* Verification Footer */}
      {isVerified && (
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified via Cashfree Verification Suite
          </span>
          {registration.providerReferenceId && (
            <span className="font-mono text-slate-500">Ref: {registration.providerReferenceId}</span>
          )}
        </div>
      )}
    </div>
  );
}
