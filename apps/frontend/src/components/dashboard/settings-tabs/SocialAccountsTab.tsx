'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Instagram,
  Youtube,
  Linkedin,
  Twitter,
  Video,
  Facebook,
  Sparkles,
  Check,
  Loader2,
} from 'lucide-react';
import SingleSocialAccountsCard, { SocialAccountItem } from './subcomponents/SingleSocialAccountsCard';

interface SocialAccountsTabProps {
  onSaveSuccess?: () => void;
}

export default function SocialAccountsTab({ onSaveSuccess }: SocialAccountsTabProps) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  const [accounts, setAccounts] = useState<SocialAccountItem[]>([
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      gradientColor: 'from-amber-500 via-rose-500 to-purple-600',
      connected: false,
      handle: '',
      followers: '',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      gradientColor: 'from-blue-700 via-indigo-600 to-blue-400',
      connected: false,
      handle: '',
      followers: '',
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: Youtube,
      gradientColor: 'from-red-600 to-rose-700',
      connected: false,
      handle: '',
      followers: '',
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
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Fetch saved connected accounts from DB on mount and after OAuth redirect
  const fetchAccounts = useCallback(async () => {
    try {
      const token = localStorage.getItem('zerify_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch both profile and raw social accounts
      const [profileRes, socialRes] = await Promise.allSettled([
        fetch(`${apiUrl}/influencer/profile`, { headers }),
        fetch(`${apiUrl}/social/accounts`, { headers }),
      ]);

      if (socialRes.status === 'fulfilled' && socialRes.value.ok) {
        const socialData = await socialRes.value.json();
        const dbAccounts = socialData.data || [];

        if (Array.isArray(dbAccounts) && dbAccounts.length > 0) {
          setAccounts((prev) =>
            prev.map((acc) => {
              let matched: any = null;

              if (acc.id === 'instagram') {
                matched = dbAccounts.find(
                  (item: any) => (item.platform || '').toUpperCase() === 'INSTAGRAM',
                );
              } else if (acc.id === 'facebook') {
                matched = dbAccounts.find(
                  (item: any) =>
                    ['FACEBOOK', 'META'].includes((item.platform || '').toUpperCase()),
                );
              } else {
                matched = dbAccounts.find(
                  (item: any) =>
                    (item.platform || '').toLowerCase() === acc.id.toLowerCase() ||
                    (item.platform || '').toLowerCase() === acc.name.toLowerCase(),
                );
              }

              if (matched) {
                const formattedHandle = matched.username
                  ? (matched.username.startsWith('@') ? matched.username : `@${matched.username}`)
                  : (matched.displayName || `@${acc.id}_user`);

                return {
                  ...acc,
                  connected: true,
                  handle: formattedHandle,
                  avatar: matched.avatar || acc.avatar,
                  followers: matched.followerCount ? matched.followerCount.toLocaleString() : '',
                  dbId: matched.id,
                };
              } else {
                return {
                  ...acc,
                  connected: false,
                  handle: '',
                  followers: '',
                  dbId: undefined,
                };
              }
            }),
          );
        }
      }

      if (profileRes.status === 'fulfilled' && profileRes.value.ok) {
        const data = await profileRes.value.json();
        if (Array.isArray(data.connectedAccounts) && data.connectedAccounts.length > 0) {
          setAccounts((prev) =>
            prev.map((acc) => {
              const match = data.connectedAccounts.find(
                (dbAcc: any) =>
                  (dbAcc.platform || '').toLowerCase() === acc.name.toLowerCase() ||
                  (dbAcc.platform || '').toLowerCase() === acc.id.toLowerCase(),
              );
              if (match) {
                return {
                  ...acc,
                  connected: true,
                  handle: match.handle || acc.handle,
                  followers: match.followerCount ? match.followerCount.toLocaleString() : acc.followers,
                  engagementRate: match.engagementRate ? `${match.engagementRate}%` : acc.engagementRate,
                };
              }
              return acc;
            }),
          );
        }
      }
    } catch (err) {
      console.warn('Could not load social accounts from DB:', err);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = localStorage.getItem('zerify_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch(`${apiUrl}/influencer/social-accounts`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(accounts),
      });
    } catch (err) {
      console.warn('API save failed, using client state:', err);
    } finally {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        if (onSaveSuccess) onSaveSuccess();
      }, 700);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <SingleSocialAccountsCard
        accounts={accounts}
        setAccounts={setAccounts}
        onRefreshAccounts={fetchAccounts}
      />

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {saved && (
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
            <Check className="w-4 h-4" /> Social Accounts Saved! Redirecting...
          </span>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 border border-purple-400/20 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Social Accounts...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Save Social Accounts</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
