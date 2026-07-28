'use client';

import React, { useState } from 'react';
import {
  Instagram,
  Youtube,
  Linkedin,
  Twitter,
  Video,
  Facebook,
  Globe,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  Users,
} from 'lucide-react';

export interface SocialAccountItem {
  id: string;
  name: string;
  gradientColor: string;
  icon?: any;
  connected: boolean;
  handle: string;
  followers: string;
  engagementRate?: string;
  avgViews?: string;
}

interface SingleSocialAccountsCardProps {
  accounts: SocialAccountItem[];
  setAccounts: React.Dispatch<React.SetStateAction<SocialAccountItem[]>>;
}

// 3D Styled Logo Badge Components
const Social3DLogo = ({ id }: { id: string }) => {
  switch (id) {
    case 'instagram':
      return (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[1.5px] shadow-[0_6px_16px_rgba(225,48,108,0.4)] transition-transform hover:scale-110 shrink-0">
          <div className="w-full h-full rounded-[10px] bg-gradient-to-tr from-purple-700 via-pink-600 to-amber-500 flex items-center justify-center text-white border-t border-white/40 shadow-inner">
            <Instagram className="w-4.5 h-4.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
          </div>
        </div>
      );
    case 'youtube':
      return (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-700 via-red-600 to-rose-400 p-[1.5px] shadow-[0_6px_16px_rgba(239,68,68,0.4)] transition-transform hover:scale-110 shrink-0">
          <div className="w-full h-full rounded-[10px] bg-gradient-to-tr from-red-700 via-red-600 to-rose-500 flex items-center justify-center text-white border-t border-white/40 shadow-inner">
            <Youtube className="w-4.5 h-4.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
          </div>
        </div>
      );
    case 'tiktok':
      return (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-slate-900 to-pink-500 p-[1.5px] shadow-[0_6px_16px_rgba(6,182,212,0.4)] transition-transform hover:scale-110 shrink-0">
          <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center text-cyan-400 border-t border-white/30 shadow-inner">
            <Video className="w-4.5 h-4.5 drop-shadow-[0_2px_4px_rgba(244,63,94,0.7)]" />
          </div>
        </div>
      );
    case 'x':
      return (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-800 via-slate-700 to-slate-500 p-[1.5px] shadow-[0_6px_16px_rgba(148,163,184,0.3)] transition-transform hover:scale-110 shrink-0">
          <div className="w-full h-full rounded-[10px] bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center text-white border-t border-white/30 shadow-inner">
            <Twitter className="w-4 h-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
          </div>
        </div>
      );
    case 'linkedin':
      return (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-800 via-blue-600 to-sky-400 p-[1.5px] shadow-[0_6px_16px_rgba(37,99,235,0.4)] transition-transform hover:scale-110 shrink-0">
          <div className="w-full h-full rounded-[10px] bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 flex items-center justify-center text-white border-t border-white/40 shadow-inner">
            <Linkedin className="w-4 h-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
          </div>
        </div>
      );
    case 'facebook':
    default:
      return (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-400 p-[1.5px] shadow-[0_6px_16px_rgba(59,130,246,0.4)] transition-transform hover:scale-110 shrink-0">
          <div className="w-full h-full rounded-[10px] bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white border-t border-white/40 shadow-inner">
            <Facebook className="w-4 h-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
          </div>
        </div>
      );
  }
};

export default function SingleSocialAccountsCard({
  accounts,
  setAccounts,
}: SingleSocialAccountsCardProps) {
  const [connectingId, setConnectingId] = useState<string | null>(null);

  // Toggle connection state
  const handleToggleConnection = (id: string) => {
    setConnectingId(id);
    setTimeout(() => {
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === id) {
            const nextConnected = !acc.connected;
            return {
              ...acc,
              connected: nextConnected,
              handle: nextConnected
                ? acc.handle || `@${acc.id}_creator`
                : acc.handle,
              followers: nextConnected
                ? acc.followers || '125,000'
                : acc.followers,
              engagementRate: nextConnected
                ? acc.engagementRate || '4.8%'
                : acc.engagementRate,
              avgViews: nextConnected
                ? acc.avgViews || '18.5K'
                : acc.avgViews,
            };
          }
          return acc;
        })
      );
      setConnectingId(null);
    }, 400);
  };

  const connectedCount = accounts.filter((a) => a.connected).length;

  return (
    <div className="p-5 sm:p-6 rounded-xl bg-slate-950/45 border border-white/10 backdrop-blur-xl space-y-8 shadow-xl">
      {/* 1. Header Section */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 shadow-inner">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Social Media Platform Connections</span>
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            </h3>
            <p className="text-[11px] text-slate-400/80">
              Verified social accounts & authenticated live engagement metrics.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20 shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-bold text-purple-200">
            {connectedCount} of {accounts.length} Connected
          </span>
        </div>
      </div>

      {/* 2. Grid of Small 3D Social Account Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => {
          const isConnecting = connectingId === acc.id;

          return (
            <div
              key={acc.id}
              className={`p-4 rounded-xl border transition-all space-y-3.5 backdrop-blur-xl flex flex-col justify-between ${
                acc.connected
                  ? 'bg-slate-950/70 border-purple-500/30 shadow-lg shadow-purple-950/20'
                  : 'bg-slate-950/40 border-white/10 hover:border-white/20'
              }`}
            >
              {/* Small Card Top Header with 3D Logo */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <Social3DLogo id={acc.id} />
                  <div>
                    <h4 className="text-xs font-bold text-white">{acc.name}</h4>
                    {acc.connected ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Connected
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400/80 font-medium block">
                        Not Connected
                      </span>
                    )}
                  </div>
                </div>

                {/* Connect / Disconnect Action Button */}
                <button
                  type="button"
                  disabled={isConnecting}
                  onClick={() => handleToggleConnection(acc.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 shrink-0 ${
                    acc.connected
                      ? 'bg-red-500/15 hover:bg-red-500/30 text-red-300 border border-red-500/30'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm'
                  }`}
                >
                  {isConnecting ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : acc.connected ? (
                    'Disconnect'
                  ) : (
                    'Connect'
                  )}
                </button>
              </div>

              {/* Read-Only Non-Editable Metrics Display */}
              {acc.connected ? (
                <div className="pt-2.5 border-t border-white/10 space-y-2">
                  {/* Read-only Username Handle Badge */}
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-white/10 shadow-inner">
                    <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
                      Handle
                    </span>
                    <span className="text-xs font-bold text-purple-300 font-mono tracking-tight flex items-center gap-1 truncate">
                      {acc.handle || `@${acc.id}_creator`}
                    </span>
                  </div>

                  {/* Read-only Stat Cards Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Stat 1: Followers */}
                    <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center">
                      <span className="text-[9.5px] font-bold text-purple-300 uppercase tracking-wider block">
                        Followers
                      </span>
                      <span className="text-xs font-black text-white block mt-0.5 tracking-tight">
                        {acc.followers || '125,000'}
                      </span>
                    </div>

                    {/* Stat 2: Engagement */}
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                      <span className="text-[9.5px] font-bold text-emerald-400 uppercase tracking-wider block">
                        Engagement
                      </span>
                      <span className="text-xs font-black text-emerald-300 block mt-0.5 tracking-tight">
                        {acc.engagementRate || '4.8%'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pt-2 text-[10.5px] text-slate-400/80 italic">
                  Link {acc.name} to showcase live verified audience metrics.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
