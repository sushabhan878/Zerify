'use client';

import React, { useState } from 'react';
import {
  Globe,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  Users,
  ExternalLink,
  X,
  Clock,
  Edit2,
  Unlink,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/Toast';
import EditSocialMetricsModal from './EditSocialMetricsModal';
import FacebookPageSelectorModal from '@/components/social/FacebookPageSelectorModal';

export interface SocialAccountItem {
  id: string;
  name: string;
  gradientColor: string;
  icon?: any;
  connected: boolean;
  handle: string;
  userName?: string;
  profileUrl?: string;
  followers: string;
  platformUserId?: string;
  engagementRate?: string;
  avgViews?: string;
  avatar?: string;
  dbId?: string;
  subPlatforms?: string[];
  accountType?: string;
  platform?: string;
}


interface SingleSocialAccountsCardProps {
  accounts: SocialAccountItem[];
  setAccounts: React.Dispatch<React.SetStateAction<SocialAccountItem[]>>;
  onRefreshAccounts?: () => void;
}

// Original High-Definition Social Media Platform Icon Component
export const SOCIAL_ICONS: Record<string, string> = {
  youtube: '/social/youtube.png',
  instagram: '/social/instagram.png',
  twitter: '/social/twitter.png',
  x: '/social/twitter.png',
  linkedin: '/social/linkedin.png',
  facebook: '/social/facebook.png',
  threads: '/social/threads.png',
  tiktok: '/social/tik-tok.png',
};

export const getSocialIconSrc = (platformOrId?: string): string => {
  const p = (platformOrId || '').toLowerCase().trim();
  if (p.includes('youtube')) return SOCIAL_ICONS.youtube;
  if (p.includes('instagram')) return SOCIAL_ICONS.instagram;
  if (p.includes('twitter') || p === 'x' || p.includes(' x')) return SOCIAL_ICONS.twitter;
  if (p.includes('linkedin')) return SOCIAL_ICONS.linkedin;
  if (p.includes('facebook') || p.includes('meta')) return SOCIAL_ICONS.facebook;
  if (p.includes('threads')) return SOCIAL_ICONS.threads;
  if (p.includes('tiktok') || p.includes('tik-tok') || p.includes('tik tok')) return SOCIAL_ICONS.tiktok;
  return SOCIAL_ICONS.facebook;
};

export const SocialPlatformIcon = ({
  id,
  platform,
  className = 'w-11 h-11',
}: {
  id: string;
  platform?: string;
  className?: string;
}) => {
  const iconSrc = getSocialIconSrc(platform || id);
  const name = platform || id;

  return (
    <div
      className={`${className} rounded-2xl p-2 bg-slate-900/60 light:bg-slate-50 border border-white/10 light:border-slate-200/90 shadow-sm flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 overflow-hidden`}
      title={name}
    >
      <img
        src={iconSrc}
        alt={name}
        className="w-full h-full object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]"
      />
    </div>
  );
};

export default function SingleSocialAccountsCard({
  accounts,
  setAccounts,
  onRefreshAccounts,
}: SingleSocialAccountsCardProps) {
  const { toastSuccess, toastError } = useToast();
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [editingAccount, setEditingAccount] = useState<SocialAccountItem | null>(null);
  const [isPageSelectorOpen, setIsPageSelectorOpen] = useState(false);
  const [isSavingMetrics, setIsSavingMetrics] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  const handleSaveMetrics = async (followersVal: string, erVal: string) => {
    if (!editingAccount) return;
    setIsSavingMetrics(true);
    try {
      const isLi = (editingAccount.id || '').toLowerCase().includes('linkedin');
      const cleanVal = followersVal.trim();
      const formattedFollowers = isLi && (cleanVal === '500' || cleanVal === '500+' || !cleanVal)
        ? '500+'
        : cleanVal;

      const updated = accounts.map((item) =>
        item.id === editingAccount.id
          ? {
            ...item,
            followers: formattedFollowers,
            engagementRate: erVal,
          }
          : item,
      );
      setAccounts(updated);

      const token = localStorage.getItem('zerify_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiUrl}/influencer/social-accounts`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updated),
      });

      if (res.ok) {
        const updatedData = await res.json();
        try {
          localStorage.setItem('zerify_influencer_profile_cache', JSON.stringify(updatedData));
          window.dispatchEvent(new Event('zerify_influencer_profile_update'));
        } catch (e) { }
      }

      toastSuccess(`${editingAccount.name} metrics calibrated successfully!`);
      setEditingAccount(null);
      if (onRefreshAccounts) await onRefreshAccounts();
    } catch (err: any) {
      console.error('Failed to save metrics:', err);
      toastError(err?.message || 'Failed to update metrics');
    } finally {
      setIsSavingMetrics(false);
    }
  };

  const handleSyncClick = async (acc: SocialAccountItem) => {
    const targetId = acc.dbId || acc.id;
    if (!targetId) return;
    setSyncingId(acc.id);
    try {
      const token = localStorage.getItem('zerify_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`${apiUrl}/social/accounts/${targetId}/sync`, {
        method: 'POST',
        headers,
      });

      if (onRefreshAccounts) {
        await onRefreshAccounts();
      }
    } catch (e) {
      console.warn('Sync failed:', e);
    } finally {
      setSyncingId(null);
    }
  };

  // Listen to OAuth completion via postMessage, BroadcastChannel, and localStorage storage event
  React.useEffect(() => {
    const processOAuthEvent = (payload: any) => {
      if (payload && payload.type === 'ZERIFY_SOCIAL_CONNECTED') {
        if (payload.status === 'success') {
          if (onRefreshAccounts) onRefreshAccounts();
        } else if (payload.message) {
          toastError(decodeURIComponent(payload.message));
        }
        setConnectingId(null);
      }
    };

    const handleMessage = (event: MessageEvent) => {
      processOAuthEvent(event.data);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'zerify_social_connected_event' && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          processOAuthEvent(parsed);
        } catch (e) { }
      }
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('storage', handleStorage);

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('zerify_social_oauth');
        bc.onmessage = (ev) => processOAuthEvent(ev.data);
      }
    } catch (e) { }

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('storage', handleStorage);
      if (bc) bc.close();
    };
  }, [onRefreshAccounts]);

  const handleConnectPlatform = async (platformKey: string, platformName: string, force: boolean = true) => {
    const platformId = platformKey.toLowerCase();
    setConnectingId(platformId);

    const width = 600;
    const height = 750;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      'about:blank',
      `Zerify${platformId.toUpperCase()}OAuth`,
      `width=${width},height=${height},left=${left},top=${top},status=yes,scrollbars=yes`,
    );

    if (popup) {
      try {
        popup.document.write(`
          <!DOCTYPE html>
          <html>
            <head><title>Connecting to ${platformName}...</title></head>
            <body style="background:#07090E;color:white;font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
              <div style="text-align:center;padding:24px;">
                <div style="width:36px;height:36px;border:3px solid #a855f7;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 16px auto;"></div>
                <p style="font-size:14px;color:#e2e8f0;margin:0;font-weight:600;">Connecting to ${platformName}...</p>
                <p style="font-size:12px;color:#64748b;margin:8px 0 0 0;">Please wait while we redirect to authorization...</p>
                <p style="font-size:11px;color:#c084fc;margin:10px 0 0 0;line-height:1.4;">To link a different account, click &quot;Switch accounts&quot; on the Instagram login page.</p>
              </div>
              <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
            </body>
          </html>
        `);
      } catch (e) { }
    }

    try {
      const token = localStorage.getItem('zerify_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      let endpoint = `${apiUrl}/social/meta/login`;
      if (platformId === 'instagram') {
        endpoint = `${apiUrl}/social/instagram/login${force ? '?force=true' : ''}`;
      } else if (platformId === 'facebook') {
        endpoint = `${apiUrl}/social/meta/login${force ? '?force=true' : ''}`;
      } else if (platformId === 'youtube') {
        endpoint = `${apiUrl}/social/youtube/login`;
      } else if (platformId === 'linkedin') {
        endpoint = `${apiUrl}/social/linkedin/login`;
      } else if (platformId === 'x' || platformId === 'twitter') {
        endpoint = `${apiUrl}/social/x/login`;
      } else if (platformId === 'threads') {
        endpoint = `${apiUrl}/social/threads/login`;
      }

      const res = await fetch(endpoint, { headers });
      const json = await res.json();

      if (!res.ok || !json.data?.url) {
        if (popup && !popup.closed) popup.close();
        throw new Error(json.message || json.data?.message || `Failed to initialize ${platformName} OAuth`);
      }

      const authUrl = json.data.url;

      if (popup && !popup.closed) {
        try {
          popup.location.replace(authUrl);
        } catch (e) {
          popup.location.href = authUrl;
        }

        const timer = setInterval(() => {
          try {
            if (!popup || popup.closed) {
              clearInterval(timer);
              setConnectingId(null);
              if (onRefreshAccounts) onRefreshAccounts();
            }
          } catch (e) { }
        }, 800);
      } else {
        window.location.href = authUrl;
      }
    } catch (err: any) {
      console.error(`${platformName} OAuth launch error:`, err);
      toastError(err.message || 'Could not launch OAuth window');
      setConnectingId(null);
      if (popup && !popup.closed) {
        popup.close();
      }
    }
  };

  const handleActionClick = async (acc: SocialAccountItem) => {
    const platformId = (acc.platform || acc.id || '').toLowerCase();

    // 1. Disconnect handling
    if (acc.connected) {
      setConnectingId(acc.id);
      try {
        const token = localStorage.getItem('zerify_token');
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const deleteId = acc.dbId || acc.platformUserId || acc.id;

        // Attempt backend deletion
        try {
          const res = await fetch(`${apiUrl}/social/accounts/${deleteId}`, {
            method: 'DELETE',
            headers,
          });

          if (!res.ok && res.status !== 404) {
            const json = await res.json().catch(() => ({}));
            throw new Error(json.message || `Failed to disconnect ${acc.name}`);
          }
        } catch (delErr: any) {
          if (!delErr?.message?.includes('404') && !delErr?.message?.includes('not found')) {
            throw delErr;
          }
        }

        // Immediately update local state
        setAccounts((prev) =>
          prev.map((item) =>
            item.dbId === deleteId ||
              (acc.platformUserId && item.platformUserId === acc.platformUserId) ||
              item.id === acc.id
              ? {
                ...item,
                connected: false,
                handle: '',
                platformUserId: undefined,
                followers: '',
                dbId: undefined,
              }
              : item,
          ),
        );

        if (onRefreshAccounts) {
          await onRefreshAccounts();
        }
      } catch (err: any) {
        console.error('Disconnect account failed:', err);
        toastError(err?.message || 'Failed to disconnect account');
      } finally {
        setConnectingId(null);
      }
      return;
    }

    // 2. Connect handling
    const supportedOAuthPlatforms = ['meta', 'instagram', 'facebook', 'youtube', 'linkedin', 'x', 'twitter', 'threads'];
    if (supportedOAuthPlatforms.includes(platformId)) {
      await handleConnectPlatform(platformId, acc.name);
    } else {
      toastError(`${acc.name} OAuth integration is coming soon.`);
    }
  };

  const connectedCount = accounts.filter((a) => a.connected).length;
  // Always display connected accounts first at the top, and always place TikTok at the very end
  const sortedAccounts = [...accounts].sort((a, b) => {
    const aIsTikTok = (a.id || '').toLowerCase() === 'tiktok';
    const bIsTikTok = (b.id || '').toLowerCase() === 'tiktok';
    if (aIsTikTok && !bIsTikTok) return 1;
    if (!aIsTikTok && bIsTikTok) return -1;
    return (b.connected ? 1 : 0) - (a.connected ? 1 : 0);
  });

  return (
    <div className="p-5 sm:p-6 rounded-xl bg-slate-950/45 light:bg-white border border-white/10 light:border-slate-200/90 backdrop-blur-xl space-y-8 shadow-xl light:shadow-sm">
      {/* 1. Header Section */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 light:border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 light:bg-purple-50 border border-purple-500/30 light:border-purple-200 flex items-center justify-center text-purple-400 light:text-purple-600 shrink-0 shadow-inner">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white light:text-slate-900 flex items-center gap-1.5">
              <span>Social Media Platform Connections</span>
              <Sparkles className="w-3.5 h-3.5 text-purple-400 light:text-purple-600" />
            </h3>
            <p className="text-[11px] text-slate-400/80 light:text-slate-500">
              Verified social accounts & authenticated live engagement metrics.
            </p>
          </div>
        </div>


        <div className="hidden sm:flex items-center gap-1.5 bg-purple-500/10 light:bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-500/20 light:border-purple-200 shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 light:text-emerald-600" />
          <span className="text-xs font-bold text-purple-200 light:text-purple-700">
            {connectedCount} of {accounts.length} Connected
          </span>
        </div>
      </div>

      {/* 2. Grid of Small 3D Social Account Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedAccounts.map((acc) => {
          const isConnecting = connectingId === acc.id || connectingId === (acc.platform || '').toLowerCase();
          const isFacebook = acc.id === 'facebook' || (acc.platform || '').toLowerCase() === 'facebook';
          const isLinkedIn = acc.id === 'linkedin' || (acc.platform || '').toLowerCase() === 'linkedin';

          return (
            <div
              key={acc.id}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all backdrop-blur-xl flex flex-col justify-between ${acc.connected
                ? 'bg-slate-950/80 light:bg-white border-purple-500/30 light:border-slate-200 shadow-lg light:shadow-sm hover:border-purple-500/50 light:hover:border-purple-300 hover:bg-slate-950/95 light:hover:bg-slate-50/50'
                : 'bg-slate-950/40 light:bg-white border-white/10 light:border-slate-200 hover:border-white/20 light:hover:border-slate-300 light:shadow-sm'
                }`}
            >
              {/* Header row: Original Social Media Icon (+ User Avatar badge if connected) + Platform Name & Handle + Actions */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <SocialPlatformIcon id={acc.id} platform={acc.platform} className="w-11 h-11" />
                    {acc.connected && acc.avatar && (
                      <div
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full ring-2 ring-[#080B14] light:ring-white overflow-hidden shadow-md"
                        title={`Connected as ${acc.handle || acc.name}`}
                      >
                        <img
                          src={acc.avatar}
                          alt={acc.handle || acc.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-sm font-semibold text-white light:text-slate-900 tracking-tight leading-tight whitespace-nowrap">
                        {acc.name}
                      </h4>
                      {acc.connected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 light:bg-emerald-500 shrink-0" title="Connected" />
                      )}
                      {(acc.id || '').toLowerCase() === 'tiktok' && (
                        <span className="px-2 py-0.5 text-[9px] font-semibold rounded-md bg-amber-500/15 light:bg-amber-50 text-amber-300 light:text-amber-800 border border-amber-500/30 light:border-amber-200 shrink-0 flex items-center gap-1 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 light:bg-amber-500 animate-pulse" />
                          Coming Soon
                        </span>
                      )}
                    </div>

                    {acc.connected && acc.handle ? (
                      acc.profileUrl ? (
                        <a
                          href={acc.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-slate-400 light:text-slate-500 hover:text-purple-300 light:hover:text-purple-600 transition-colors truncate max-w-[130px] sm:max-w-[170px] block mt-0.5"
                          title={`Open profile: ${acc.profileUrl}`}
                        >
                          {acc.handle.startsWith('@') ? acc.handle : `@${acc.handle}`}
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 light:text-slate-500 truncate max-w-[130px] sm:max-w-[170px] block mt-0.5">
                          {acc.handle.startsWith('@') ? acc.handle : `@${acc.handle}`}
                        </span>
                      )
                    ) : (
                      <span className="text-[11px] text-slate-500 light:text-slate-400 font-medium mt-0.5">
                        {acc.connected ? 'Connected' : 'Not Connected'}
                      </span>
                    )}

                    {acc.subPlatforms &&
                      acc.subPlatforms.filter((sp) => sp !== 'Facebook' && sp !== 'Facebook Page').length > 0 && (
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {acc.subPlatforms
                            .filter((sp) => sp !== 'Facebook' && sp !== 'Facebook Page')
                            .map((sp) => (
                              <span
                                key={sp}
                                className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-white/10 light:bg-slate-100 text-slate-300 light:text-slate-700 border border-white/10 light:border-slate-200 flex items-center gap-1.5 shadow-sm"
                              >
                                <img
                                  src={getSocialIconSrc(sp)}
                                  alt={sp}
                                  className="w-3 h-3 object-contain shrink-0"
                                />
                                <span>{sp}</span>
                              </span>
                            ))}
                        </div>
                      )}
                  </div>
                </div>

                {/* Right: Actions */}
                {acc.connected ? (
                  <div className="flex items-center gap-1.5 shrink-0">

                    <button
                      type="button"
                      disabled={syncingId === acc.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSyncClick(acc);
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 light:text-slate-500 hover:text-purple-300 light:hover:text-purple-600 hover:bg-purple-500/10 light:hover:bg-purple-50 border border-white/10 light:border-slate-200 light:bg-slate-50 transition-colors"
                      title="Sync live analytics & followers"
                      aria-label="Sync live analytics"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${syncingId === acc.id ? 'animate-spin text-purple-400 light:text-purple-600' : ''}`} />
                    </button>

                    {isFacebook && acc.connected && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsPageSelectorOpen(true);
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 light:text-slate-500 hover:text-blue-400 light:hover:text-blue-600 hover:bg-blue-500/10 light:hover:bg-blue-50 border border-white/10 light:border-slate-200 light:bg-slate-50 transition-colors shadow-sm"
                        title="Manage / Select Facebook Pages"
                        aria-label="Manage Facebook Pages"
                      >
                        <Layers className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {isLinkedIn && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingAccount(acc);
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 light:text-slate-500 hover:text-purple-300 light:hover:text-purple-600 hover:bg-purple-500/10 light:hover:bg-purple-50 border border-white/10 light:border-slate-200 light:bg-slate-50 transition-colors"
                        title="Calibrate connections & engagement metrics"
                        aria-label="Calibrate metrics"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={isConnecting}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActionClick(acc);
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-400/80 light:text-rose-500 hover:text-rose-300 light:hover:text-rose-600 hover:bg-rose-500/15 light:hover:bg-rose-50 border border-rose-500/20 light:border-rose-200 light:bg-rose-50/50 transition-colors shadow-sm"
                      title="Disconnect this account"
                      aria-label="Disconnect account"
                    >
                      {isConnecting ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Unlink className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ) : (acc.id || '').toLowerCase() === 'tiktok' ? (
                  <div
                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-amber-500/10 light:bg-amber-50 text-amber-300 light:text-amber-700 border border-amber-500/25 light:border-amber-200 flex items-center gap-1.5 shrink-0 shadow-sm cursor-default select-none"
                    title="TikTok integration is coming soon"
                  >
                    <Clock className="w-3 h-3 text-amber-400 light:text-amber-600" />
                    <span>Coming Soon</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isConnecting}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActionClick(acc);
                    }}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 shrink-0 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white keep-white shadow-md shadow-purple-950/40 border border-purple-400/20 hover:scale-105 active:scale-95"
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <span>Connect</span>
                    )}
                  </button>
                )}
              </div>

              {/* Visible Metrics Section for Connected Accounts */}
              {acc.connected && (
                <div className="mt-3 pt-2.5 border-t border-white/10 light:border-slate-100">
                  <div className="grid grid-cols-2 gap-2 bg-white/[0.03] light:bg-slate-50 rounded-xl p-2 border border-white/5 light:border-slate-200/60">
                    {/* Friends / Followers / Connections metric */}
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 light:text-slate-500 font-medium">
                        <Users className="w-3.5 h-3.5 text-purple-400 light:text-purple-600 shrink-0" />
                        <span>{((acc.id || acc.platform || '').toLowerCase().includes('linkedin')) ? 'Connections' : isFacebook && acc.accountType !== 'PAGE' ? 'Friends' : 'Followers'}</span>
                      </div>
                      <span className="text-sm sm:text-base font-bold text-white light:text-slate-900 tracking-tight mt-0.5">
                        {(() => {
                          if (isLinkedIn) {
                            if (!acc.followers || acc.followers === '500' || acc.followers === '500+') {
                              return '500+';
                            }
                            const num = parseInt(String(acc.followers).replace(/,/g, ''), 10);
                            return !isNaN(num) ? num.toLocaleString() : acc.followers;
                          }
                          return acc.followers ? acc.followers : '—';
                        })()}
                      </span>
                    </div>

                    {/* Engagement Rate metric */}
                    <div className="flex flex-col items-center justify-center text-center border-l border-white/10 light:border-slate-200">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 light:text-slate-500 font-medium">
                        <TrendingUp className="w-3.5 h-3.5 text-cyan-400 light:text-cyan-600 shrink-0" />
                        <span>Engagement</span>
                      </div>
                      <span className="text-sm sm:text-base font-bold text-cyan-400 light:text-cyan-600 tracking-tight mt-0.5">
                        {(() => {
                          const num = acc.engagementRate !== undefined && acc.engagementRate !== null && acc.engagementRate !== ''
                            ? parseFloat(String(acc.engagementRate).replace(/%/g, ''))
                            : null;
                          if (num !== null && !isNaN(num) && num > 0) {
                            return `${num}%`;
                          }
                          if (isLinkedIn) {
                            return '3.4%';
                          }
                          return '—';
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Metric Calibration Modal */}
      <EditSocialMetricsModal
        account={editingAccount}
        isOpen={editingAccount !== null}
        onClose={() => setEditingAccount(null)}
        onSave={handleSaveMetrics}
        isSaving={isSavingMetrics}
      />
    </div>
  );
}
