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
import { useToast } from '@/components/ui/Toast';

interface SocialAccountsTabProps {
  initialData?: any;
  onSaveSuccess?: () => void;
}

const DEFAULT_ACCOUNTS: SocialAccountItem[] = [
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
];

function buildInitialAccountsFromCache(initialData?: any): SocialAccountItem[] {
  let dbAccounts: any[] = [];
  let profileAccounts: any[] = [];

  if (typeof window !== 'undefined') {
    try {
      const socialStored = localStorage.getItem('zerify_social_accounts_cache');
      if (socialStored) dbAccounts = JSON.parse(socialStored);

      const profileStored = initialData || (localStorage.getItem('zerify_influencer_profile_cache') ? JSON.parse(localStorage.getItem('zerify_influencer_profile_cache')!) : null);
      if (profileStored) {
        const userSocials = profileStored.user?.socialAccounts || profileStored.connectedAccounts;
        if (Array.isArray(userSocials)) profileAccounts = userSocials;
      }
    } catch (e) {}
  }

  return DEFAULT_ACCOUNTS.map((acc) => {
    let matched: any = null;
    if (acc.id === 'instagram') {
      matched = dbAccounts.find(
        (item: any) =>
          (item.status ? (item.status || '').toUpperCase() === 'CONNECTED' : true) &&
          ((item.platform || '').toUpperCase() === 'INSTAGRAM' || (item.platform || '').toLowerCase() === 'instagram')
      );
    } else if (acc.id === 'facebook') {
      matched = dbAccounts.find(
        (item: any) =>
          (item.status ? (item.status || '').toUpperCase() === 'CONNECTED' : true) &&
          ['FACEBOOK', 'META'].includes((item.platform || '').toUpperCase())
      );
    } else {
      matched = dbAccounts.find(
        (item: any) =>
          (item.status ? (item.status || '').toUpperCase() === 'CONNECTED' : true) &&
          ((item.platform || '').toLowerCase() === acc.id.toLowerCase() ||
            (item.platform || '').toLowerCase() === acc.name.toLowerCase())
      );
    }

    const profileMatch = profileAccounts.find(
      (dbAcc: any) =>
        (dbAcc.status ? (dbAcc.status || '').toUpperCase() === 'CONNECTED' : true) &&
        ((dbAcc.platform || '').toLowerCase() === acc.name.toLowerCase() ||
          (dbAcc.platform || '').toLowerCase() === acc.id.toLowerCase())
    );

    if (matched || profileMatch) {
      const rawHandle = matched?.handle || matched?.username || profileMatch?.handle || profileMatch?.username;
      const handle = rawHandle
        ? rawHandle.startsWith('@')
          ? rawHandle
          : `@${rawHandle}`
        : `@${acc.id}_user`;

      const platformUserId = matched?.platformUserId || profileMatch?.platformUserId || acc.platformUserId;
      const avatar = matched?.avatar || profileMatch?.avatar || acc.avatar;
      const followers = matched?.followerCount
        ? matched.followerCount.toLocaleString()
        : profileMatch?.followerCount
        ? profileMatch.followerCount.toLocaleString()
        : acc.followers;
      const dbId = matched?.id || profileMatch?.id;

      return {
        ...acc,
        connected: true,
        handle,
        platformUserId,
        avatar,
        followers,
        dbId,
      };
    }

    return acc;
  });
}

export default function SocialAccountsTab({ initialData, onSaveSuccess }: SocialAccountsTabProps) {
  const { toastSuccess, toastError } = useToast();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  const [accounts, setAccounts] = useState<SocialAccountItem[]>(() => buildInitialAccountsFromCache(initialData));
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

      // Fetch both profile and raw social accounts concurrently
      const [profileRes, socialRes] = await Promise.allSettled([
        fetch(`${apiUrl}/influencer/profile`, { headers }),
        fetch(`${apiUrl}/social/accounts`, { headers }),
      ]);

      let dbAccounts: any[] = [];
      let profileAccounts: any[] = [];

      if (socialRes.status === 'fulfilled' && socialRes.value.ok) {
        const socialData = await socialRes.value.json();
        dbAccounts = Array.isArray(socialData.data) ? socialData.data : [];
      }

      if (profileRes.status === 'fulfilled' && profileRes.value.ok) {
        const profileData = await profileRes.value.json();
        const userSocials = profileData.user?.socialAccounts || profileData.connectedAccounts;
        profileAccounts = Array.isArray(userSocials) ? userSocials : [];
      }

      // Perform a single atomic state update to avoid React state race conditions
      setAccounts((prev) =>
        prev.map((acc) => {
          // 1. Check social_accounts DB table match
          let matched: any = null;

          if (acc.id === 'instagram') {
            matched = dbAccounts.find(
              (item: any) =>
                (item.status ? (item.status || '').toUpperCase() === 'CONNECTED' : true) &&
                ((item.platform || '').toUpperCase() === 'INSTAGRAM' ||
                 (item.platform || '').toLowerCase() === 'instagram'),
            );
          } else if (acc.id === 'facebook') {
            matched = dbAccounts.find(
              (item: any) =>
                (item.status ? (item.status || '').toUpperCase() === 'CONNECTED' : true) &&
                ['FACEBOOK', 'META'].includes((item.platform || '').toUpperCase()),
            );
          } else {
            matched = dbAccounts.find(
              (item: any) =>
                (item.status ? (item.status || '').toUpperCase() === 'CONNECTED' : true) &&
                ((item.platform || '').toLowerCase() === acc.id.toLowerCase() ||
                 (item.platform || '').toLowerCase() === acc.name.toLowerCase()),
            );
          }

          // 2. Check profile connectedAccounts fallback match (only connected accounts)
          const profileMatch = profileAccounts.find(
            (dbAcc: any) =>
              (dbAcc.status ? (dbAcc.status || '').toUpperCase() === 'CONNECTED' : true) &&
              ((dbAcc.platform || '').toLowerCase() === acc.name.toLowerCase() ||
               (dbAcc.platform || '').toLowerCase() === acc.id.toLowerCase()),
          );

          if (matched || profileMatch) {
            const rawHandle = matched?.handle || matched?.username || profileMatch?.handle || profileMatch?.username;
            const handle = rawHandle
              ? rawHandle.startsWith('@')
                ? rawHandle
                : `@${rawHandle}`
              : `@${acc.id}_user`;

            const platformUserId = matched?.platformUserId || profileMatch?.platformUserId || acc.platformUserId;
            const avatar = matched?.avatar || profileMatch?.avatar || acc.avatar;
            const followers = matched?.followerCount
              ? matched.followerCount.toLocaleString()
              : profileMatch?.followerCount
              ? profileMatch.followerCount.toLocaleString()
              : acc.followers;
            const dbId = matched?.id || profileMatch?.id;

            return {
              ...acc,
              connected: true,
              handle,
              platformUserId,
              avatar,
              followers,
              dbId,
            };
          }

          return {
            ...acc,
            connected: false,
            handle: '',
            platformUserId: undefined,
            followers: '',
            dbId: undefined,
          };
        }),
      );
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

      const res = await fetch(`${apiUrl}/influencer/social-accounts`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(accounts),
      });

      if (res.ok) {
        const updatedData = await res.json();
        try {
          localStorage.setItem('zerify_influencer_profile_cache', JSON.stringify(updatedData));
          window.dispatchEvent(new Event('zerify_influencer_profile_update'));
        } catch (e) {}
      }

      toastSuccess('Social accounts updated successfully!');
    } catch (err: any) {
      console.warn('API save failed, using client state:', err);
      toastError('Failed to update social accounts.');
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
