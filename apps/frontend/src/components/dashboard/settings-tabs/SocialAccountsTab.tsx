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
  Sparkles,
  Check,
} from 'lucide-react';
import SocialAccountCard, { SocialAccount } from './subcomponents/SocialAccountCard';

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
      connected: true,
      handle: '@sarah_creativ',
      followers: '485,000',
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: Youtube,
      color: 'from-red-600 to-rose-700',
      connected: true,
      handle: 'youtube.com/@sarahjenkins',
      followers: '320,000',
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: Video,
      color: 'from-cyan-500 to-slate-900',
      connected: true,
      handle: '@sarah_glow',
      followers: '210,000',
    },
    {
      id: 'x',
      name: 'X (Twitter)',
      icon: Twitter,
      color: 'from-slate-700 to-slate-900',
      connected: false,
      handle: '',
      followers: '',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'from-blue-600 to-indigo-700',
      connected: false,
      handle: '',
      followers: '',
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'from-blue-700 to-cyan-700',
      connected: false,
      handle: '',
      followers: '',
    },
    {
      id: 'twitch',
      name: 'Twitch',
      icon: Tv,
      color: 'from-purple-700 to-indigo-800',
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

  const handleUpdateField = (id: string, field: 'handle' | 'followers', value: string) => {
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
    <form onSubmit={handleSave} className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            <span>Connected Social Media Platforms</span>
          </h3>
          <p className="text-xs text-slate-400/80">
            Link your channels for automated follower verification & AI sponsor matching
          </p>
        </div>
      </div>

      {/* Grid of Social Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map((acc) => (
          <SocialAccountCard
            key={acc.id}
            acc={acc}
            onToggleConnection={toggleConnection}
            onUpdateField={handleUpdateField}
          />
        ))}
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {saved && (
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
            <Check className="w-4 h-4" /> Social Accounts Saved!
          </span>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 border border-purple-400/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Social Accounts'}</span>
        </button>
      </div>
    </form>
  );
}
