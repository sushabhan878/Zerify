'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Plus, CheckCircle2, Instagram, Youtube, Twitter, Globe } from 'lucide-react';

interface ConnectedPlatform {
  name: string;
  handle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  connected: boolean;
}

interface InfluencerProfileCardProps {
  userName: string;
  userHandle?: string;
  avatarUrl?: string;
  completionPercentage?: number;
  onOpenConnectModal?: () => void;
}

export default function InfluencerProfileCard({
  userName,
  userHandle = '@creator_id',
  avatarUrl,
  completionPercentage = 85,
  onOpenConnectModal,
}: InfluencerProfileCardProps) {
  const avatarChar = userName.charAt(0).toUpperCase();

  const platforms: ConnectedPlatform[] = [
    { name: 'Instagram', handle: '@sarah_creativ', icon: Instagram, color: 'text-pink-400 bg-pink-500/10 border-pink-500/20', connected: true },
    { name: 'YouTube', handle: 'SarahVlogs', icon: Youtube, color: 'text-red-400 bg-red-500/10 border-red-500/20', connected: true },
    { name: 'TikTok', handle: '@sarah_tiktok', icon: Globe, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', connected: true },
    { name: 'X / Twitter', handle: '@sarah_tweets', icon: Twitter, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20', connected: false },
  ];

  const connectedCount = platforms.filter((p) => p.connected).length;

  return (
    <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
      {/* Avatar, Name, Platform ID */}
      <div className="flex items-center gap-3">
        <div className="relative group">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-600 p-[2px] shadow-lg shadow-purple-950/50">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={userName}
                width={44}
                height={44}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-white font-black text-base">
                {avatarChar}
              </div>
            )}
          </div>
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950 shadow-sm" title="Online & Verified" />
        </div>

        <div className="overflow-hidden flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-bold text-white truncate">{userName}</h4>
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          </div>
          <p className="text-[11px] font-medium text-slate-400 truncate">{userHandle.startsWith('@') ? userHandle : `@${userHandle}`}</p>
        </div>
      </div>

      {/* Connected Platforms Bar + Plus Button */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Connected Accounts ({connectedCount})
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {platforms.map((platform, idx) => {
            const Icon = platform.icon;
            if (!platform.connected) return null;
            return (
              <div
                key={idx}
                title={`${platform.name} (${platform.handle})`}
                className={`w-7 h-7 rounded-lg border ${platform.color} flex items-center justify-center transition-transform hover:scale-110 cursor-pointer`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
            );
          })}

          {/* Plus Sign to Connect More Platforms */}
          <button
            onClick={onOpenConnectModal}
            title="Connect platform"
            type="button"
            className="w-7 h-7 rounded-lg border border-dashed border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Profile Completion Bar */}
      <div className="pt-2 border-t border-white/5 space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-slate-300">Profile Completion</span>
          <span className="font-black text-purple-400">{completionPercentage}%</span>
        </div>

        <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-white/5 p-[1px]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        <p className="text-[9.5px] text-slate-400">
          Complete to 100% for priority AI brand matching
        </p>
      </div>
    </div>
  );
}
