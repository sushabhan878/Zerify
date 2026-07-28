'use client';

import React, { useState } from 'react';
import {
  Instagram,
  Youtube,
  Facebook,
  Linkedin,
  Twitter,
  Tv,
  Video,
  CheckCircle2,
  ExternalLink,
  PlusCircle,
  Sparkles,
  Check,
} from 'lucide-react';

interface SocialAccount {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badgeBg: string;
  connected: boolean;
  handle: string;
  followers: string;
}

interface SocialAccountsTabProps {
  onSaveSuccess?: () => void;
}

export default function SocialAccountsTab({ onSaveSuccess }: SocialAccountsTabProps) {
  const [accounts, setAccounts] = useState<SocialAccount[]>([
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      color: 'from-pink-500 to-purple-600',
      badgeBg: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      connected: true,
      handle: '@sarah_creativ',
      followers: '485,000',
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: Youtube,
      color: 'from-red-600 to-rose-700',
      badgeBg: 'bg-red-500/20 text-red-300 border-red-500/30',
      connected: true,
      handle: 'youtube.com/@sarahjenkins',
      followers: '320,000',
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: Video,
      color: 'from-cyan-500 to-slate-900',
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      connected: true,
      handle: '@sarah_glow',
      followers: '210,000',
    },
    {
      id: 'x',
      name: 'X (Twitter)',
      icon: Twitter,
      color: 'from-slate-700 to-slate-900',
      badgeBg: 'bg-slate-700/40 text-slate-300 border-slate-600/30',
      connected: false,
      handle: '',
      followers: '',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'from-blue-600 to-indigo-700',
      badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      connected: false,
      handle: '',
      followers: '',
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'from-blue-700 to-cyan-700',
      badgeBg: 'bg-blue-600/20 text-blue-300 border-blue-600/30',
      connected: false,
      handle: '',
      followers: '',
    },
    {
      id: 'twitch',
      name: 'Twitch',
      icon: Tv,
      color: 'from-purple-700 to-indigo-800',
      badgeBg: 'bg-purple-600/20 text-purple-300 border-purple-600/30',
      connected: false,
      handle: '',
      followers: '',
    },
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleConnection = (id: string) => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === id
          ? {
              ...acc,
              connected: !acc.connected,
              handle: !acc.connected ? acc.handle || `@user_${id}` : '',
              followers: !acc.connected ? acc.followers || '10,000' : '',
            }
          : acc
      )
    );
  };

  const handleUpdate = (id: string, field: 'handle' | 'followers', value: string) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, [field]: value } : acc))
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      if (onSaveSuccess) onSaveSuccess();
      setTimeout(() => setSaved(false), 2500);
    }, 600);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            <span>Connected Social Media Accounts</span>
          </h3>
          <p className="text-xs text-slate-400">
            Connect your platforms to enable live follower count verification & AI content analysis
          </p>
        </div>
      </div>

      {/* Grid of Social Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map((acc) => {
          const Icon = acc.icon;
          return (
            <div
              key={acc.id}
              className={`p-4 rounded-2xl bg-slate-900/80 border transition-all space-y-3.5 backdrop-blur-xl ${
                acc.connected
                  ? 'border-purple-500/30 shadow-lg shadow-purple-950/20'
                  : 'border-white/10 opacity-80 hover:opacity-100'
              }`}
            >
              {/* Card Header Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${acc.color} text-white shadow-md`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">{acc.name}</h4>
                    <span
                      className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-full border ${
                        acc.connected
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-white/5'
                      }`}
                    >
                      {acc.connected ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleConnection(acc.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                    acc.connected
                      ? 'bg-red-500/15 hover:bg-red-500/30 text-red-300 border border-red-500/30'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-950/40'
                  }`}
                >
                  {acc.connected ? 'Disconnect' : 'Connect Account'}
                </button>
              </div>

              {/* Editable Fields when Connected */}
              {acc.connected ? (
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <label className="text-[10.5px] font-bold text-slate-400 block mb-1">Handle / URL</label>
                    <input
                      type="text"
                      value={acc.handle}
                      onChange={(e) => handleUpdate(acc.id, 'handle', e.target.value)}
                      placeholder="@username"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[10.5px] font-bold text-slate-400 block mb-1">Followers / Audience</label>
                    <input
                      type="text"
                      value={acc.followers}
                      onChange={(e) => handleUpdate(acc.id, 'followers', e.target.value)}
                      placeholder="e.g. 100K"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 font-medium italic pt-1">
                  Connect your {acc.name} profile to showcase reach to prospective brand sponsors.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Save Trigger */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {saved && (
          <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
            <Check className="w-4 h-4" /> Social Accounts Saved!
          </span>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-purple-950/50 transition-all hover:scale-105 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Social Accounts'}</span>
        </button>
      </div>
    </form>
  );
}
