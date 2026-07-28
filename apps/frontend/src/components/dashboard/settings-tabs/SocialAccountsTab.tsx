'use client';

import React, { useState } from 'react';
import {
  Instagram,
  Youtube,
  Linkedin,
  Twitter,
  Tv,
  Video,
  Facebook,
  Sparkles,
  Check,
} from 'lucide-react';
import SingleSocialAccountsCard, { SocialAccountItem } from './subcomponents/SingleSocialAccountsCard';

interface SocialAccountsTabProps {
  onSaveSuccess?: () => void;
}

export default function SocialAccountsTab({ onSaveSuccess }: SocialAccountsTabProps) {
  const [accounts, setAccounts] = useState<SocialAccountItem[]>([
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      gradientColor: 'from-pink-500 via-purple-600 to-indigo-600',
      connected: true,
      handle: '@elena_ugc',
      followers: '148,500',
      engagementRate: '5.2%',
      avgViews: '24.1K',
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: Youtube,
      gradientColor: 'from-red-600 to-rose-700',
      connected: true,
      handle: 'youtube.com/@elenaugc',
      followers: '320,000',
      engagementRate: '4.6%',
      avgViews: '45.8K',
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: Video,
      gradientColor: 'from-cyan-500 to-slate-900',
      connected: false,
      handle: '',
      followers: '',
    },
    {
      id: 'x',
      name: 'X (Twitter)',
      icon: Twitter,
      gradientColor: 'from-slate-700 to-slate-900',
      connected: false,
      handle: '',
      followers: '',
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      gradientColor: 'from-blue-700 to-cyan-700',
      connected: false,
      handle: '',
      followers: '',
    },
    {
      id: 'facebook',
      name: 'Facebook Page',
      icon: Facebook,
      gradientColor: 'from-blue-600 to-indigo-700',
      connected: false,
      handle: '',
      followers: '',
    },
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
      <SingleSocialAccountsCard
        accounts={accounts}
        setAccounts={setAccounts}
      />

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

