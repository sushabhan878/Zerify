'use client';

import React from 'react';

export interface SocialAccount {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  connected: boolean;
  handle: string;
  followers: string;
}

interface SocialAccountCardProps {
  acc: SocialAccount;
  onToggleConnection: (id: string) => void;
  onUpdateField: (id: string, field: 'handle' | 'followers', value: string) => void;
}

export default function SocialAccountCard({
  acc,
  onToggleConnection,
  onUpdateField,
}: SocialAccountCardProps) {
  const Icon = acc.icon;

  return (
    <div
      className={`p-4 rounded-xl bg-slate-900/70 border transition-all space-y-3 backdrop-blur-xl shadow-xl ${
        acc.connected
          ? 'border-purple-500/30 shadow-purple-950/20'
          : 'border-white/10 opacity-75 hover:opacity-100'
      }`}
    >
      {/* Card Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-tr ${acc.color} text-white shadow-md`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">{acc.name}</h4>
            <span
              className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-md border ${
                acc.connected
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-slate-800/60 text-slate-400/80 border-white/5'
              }`}
            >
              {acc.connected ? 'Connected' : 'Not Connected'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onToggleConnection(acc.id)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            acc.connected
              ? 'bg-red-500/15 hover:bg-red-500/30 text-red-300 border border-red-500/30'
              : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md'
          }`}
        >
          {acc.connected ? 'Disconnect' : 'Connect'}
        </button>
      </div>

      {/* Editable Fields when Connected */}
      {acc.connected ? (
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div>
            <label className="text-[10px] font-semibold text-slate-400/80 uppercase tracking-wider block mb-1">
              Handle / URL
            </label>
            <input
              type="text"
              value={acc.handle}
              onChange={(e) => onUpdateField(acc.id, 'handle', e.target.value)}
              placeholder="@username"
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950/70 border border-white/10 text-xs text-white placeholder:text-slate-600/70 focus:outline-none focus:border-purple-500/80 font-medium shadow-inner"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-400/80 uppercase tracking-wider block mb-1">
              Audience Reach
            </label>
            <input
              type="text"
              value={acc.followers}
              onChange={(e) => onUpdateField(acc.id, 'followers', e.target.value)}
              placeholder="e.g. 100K"
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950/70 border border-white/10 text-xs text-white placeholder:text-slate-600/70 focus:outline-none focus:border-purple-500/80 font-medium shadow-inner"
            />
          </div>
        </div>
      ) : (
        <p className="text-[11px] text-slate-500/80 font-normal italic pt-1">
          Connect your {acc.name} channel to highlight audience size to brands.
        </p>
      )}
    </div>
  );
}
