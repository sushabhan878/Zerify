'use client';

import React from 'react';
import Image from 'next/image';
import { CheckCircle2, Sparkles, ChevronRight } from 'lucide-react';

interface BrandProfileCardProps {
  companyName: string;
  industry?: string;
  logoUrl?: string;
  isCollapsed?: boolean;
  completionPercentage?: number;
  onCompleteProfile?: () => void;
}

export default function BrandProfileCard({
  companyName,
  industry = 'Tech & Consumer AI',
  logoUrl,
  isCollapsed = false,
  completionPercentage = 65,
  onCompleteProfile,
}: BrandProfileCardProps) {
  const logoChar = companyName.charAt(0).toUpperCase();
  const showCompletion = completionPercentage < 90;

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center py-1 gap-2">
        <div
          className="relative group shrink-0 cursor-pointer"
          onClick={onCompleteProfile}
          title={`${companyName} • ${industry} ${showCompletion ? `(Profile ${completionPercentage}% Complete)` : ''}`}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600 p-[2px] shadow-md shadow-purple-950/50">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={companyName}
                width={36}
                height={36}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-white font-black text-xs">
                {logoChar}
              </div>
            )}
          </div>
          {showCompletion ? (
            <span className="absolute -bottom-1 -right-1 bg-purple-600 text-white text-[8px] font-black px-1 rounded-full border border-slate-950 shadow-md">
              {completionPercentage}%
            </span>
          ) : (
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-purple-500 border-2 border-slate-950 shadow-sm" />
          )}
        </div>

        {showCompletion && (
          <button
            onClick={onCompleteProfile}
            type="button"
            title={`Complete Profile (${completionPercentage}% complete)`}
            className="w-8 h-8 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/40 text-purple-300 flex items-center justify-center transition-all shadow-sm group relative"
          >
            <Sparkles className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-pink-500 animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-pink-500" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl flex flex-col gap-3 group">
      {/* Header Row: Avatar & Details */}
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600 p-[2px] shadow-md shadow-purple-950/50">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={companyName}
                width={40}
                height={40}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-white font-black text-sm">
                {logoChar}
              </div>
            )}
          </div>
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-purple-500 border-2 border-slate-950 shadow-sm" title="Verified Partner" />
        </div>

        <div className="overflow-hidden min-w-0 flex-1">
          <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-purple-400/90 block truncate">
            {industry}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <h4 className="text-xs font-black text-white truncate tracking-tight">{companyName}</h4>
            <span title="Verified Enterprise" className="inline-flex shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 fill-purple-400/20" />
            </span>
          </div>
        </div>
      </div>

      {/* Completion Progress Bar & Complete Profile Action (Visible ONLY when < 90%) */}
      {showCompletion && (
        <div className="pt-2 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-extrabold">
            <span className="text-slate-400 uppercase tracking-wider">Profile Setup</span>
            <span className="text-purple-300 font-black bg-purple-500/20 px-1.5 py-0.5 rounded-md border border-purple-500/30">
              {completionPercentage}%
            </span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden p-[1px] border border-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 transition-all duration-500 shadow-sm"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          <button
            onClick={onCompleteProfile}
            type="button"
            className="w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/35 hover:to-indigo-600/35 border border-purple-500/40 text-white font-extrabold text-[10.5px] flex items-center justify-center gap-1.5 transition-all group shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
            <span>Complete Profile</span>
            <ChevronRight className="w-3 h-3 text-purple-400 group-hover:translate-x-0.5 transition-transform ml-auto" />
          </button>
        </div>
      )}
    </div>
  );
}
