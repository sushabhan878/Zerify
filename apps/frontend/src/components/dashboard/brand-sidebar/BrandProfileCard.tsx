'use client';

import React from 'react';
import Image from 'next/image';
import { Building2, CheckCircle2, Megaphone, Users, Sparkles } from 'lucide-react';

interface BrandProfileCardProps {
  companyName: string;
  industry?: string;
  logoUrl?: string;
  completionPercentage?: number;
  campaignsCreated?: number;
  creatorsHired?: number;
}

export default function BrandProfileCard({
  companyName,
  industry = 'Tech & Consumer AI',
  logoUrl,
  completionPercentage = 92,
  campaignsCreated = 12,
  creatorsHired = 48,
}: BrandProfileCardProps) {
  const logoChar = companyName.charAt(0).toUpperCase();

  return (
    <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
      {/* Company Header: Logo, Name, Industry, Verified Badge */}
      <div className="flex items-center gap-3">
        <div className="relative group shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600 p-[2px] shadow-lg shadow-purple-950/50">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={companyName}
                width={44}
                height={44}
                className="w-full h-full object-cover rounded-[14px]"
              />
            ) : (
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-white font-black text-base">
                {logoChar}
              </div>
            )}
          </div>
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-purple-500 border-2 border-slate-950 shadow-sm" title="Verified Brand Partner" />
        </div>

        <div className="overflow-hidden flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-bold text-white truncate">{companyName}</h4>
            <span title="Verified Enterprise" className="flex items-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-400 truncate flex items-center gap-1">
            <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
            <span>{industry}</span>
          </p>
        </div>
      </div>

      {/* Brand Stats: Campaigns Created & Creators Hired */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Campaigns</span>
          <div className="text-sm font-black text-white flex items-center gap-1">
            <Megaphone className="w-3.5 h-3.5 text-purple-400" />
            <span>{campaignsCreated}</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Creators Hired</span>
          <div className="text-sm font-black text-white flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-pink-400" />
            <span>{creatorsHired}</span>
          </div>
        </div>
      </div>

      {/* Profile Completion Bar */}
      <div className="pt-2 border-t border-white/5 space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-slate-300">Brand Profile</span>
          <span className="font-black text-purple-400">{completionPercentage}%</span>
        </div>

        <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-white/5 p-[1px]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        <p className="text-[9.5px] text-slate-400">
          Verified brand badge active with priority AI matching
        </p>
      </div>
    </div>
  );
}
