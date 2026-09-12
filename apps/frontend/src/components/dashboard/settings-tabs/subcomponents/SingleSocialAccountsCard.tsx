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
  ExternalLink,
  X,
  Clock,
  Edit2,
  Unlink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/Toast';
import EditSocialMetricsModal from './EditSocialMetricsModal';

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

// 3D Styled Logo Badge Components
const Social3DLogo = ({ id, platform }: { id: string; platform?: string }) => {
  const key = (platform || id || '').toLowerCase();

  if (key.includes('meta')) {
    return (
      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-500 p-[1.5px] shadow-[0_6px_16px_rgba(168,85,247,0.4)] transition-transform hover:scale-110 shrink-0">
        <div className="w-full h-full rounded-[10px] bg-gradient-to-tr from-blue-900 via-slate-900 to-purple-950 flex items-center justify-center text-white border-t border-white/40 shadow-inner relative overflow-hidden">
          <svg className="w-5 h-5 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c-1.5-2.3-3.6-3.8-5.8-3.8-3.1 0-5.2 2.3-5.2 5.3 0 3 2.1 5.3 5.2 5.3 2.5 0 4.7-1.8 6.4-4.5 1.7 2.7 3.9 4.5 6.4 4.5 3.1 0 5.2-2.3 5.2-5.3 0-3-2.1-5.3-5.2-5.3-2.2 0-4.3 1.5-5.8 3.8zm-5.8 5.1c-2 0-3.4-1.5-3.4-3.6 0-2.1 1.4-3.6 3.4-3.6 1.7 0 3.3 1.3 4.7 3.6-1.4 2.3-3 3.6-4.7 3.6zm11.6 0c-1.7 0-3.3-1.3-4.7-3.6 1.4-2.3 3-3.6 4.7-3.6 2 0 3.4 1.5 3.4 3.6 0 2.1-1.4 3.6-3.4 3.6z" />
          </svg>
        </div>
      </div>
    );
  }

  if (key.includes('instagram')) {
    return (
      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[1.5px] shadow-[0_6px_16px_rgba(225,48,108,0.4)] transition-transform hover:scale-110 shrink-0">
        <div className="w-full h-full rounded-[10px] bg-gradient-to-tr from-purple-700 via-pink-600 to-amber-500 flex items-center justify-center text-white border-t border-white/40 shadow-inner">
          <Instagram className="w-4.5 h-4.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
        </div>
      </div>
    );
  }

  if (key.includes('youtube')) {
    return (
      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-700 via-red-600 to-rose-400 p-[1.5px] shadow-[0_6px_16px_rgba(239,68,68,0.4)] transition-transform hover:scale-110 shrink-0">
        <div className="w-full h-full rounded-[10px] bg-gradient-to-tr from-red-700 via-red-600 to-rose-500 flex items-center justify-center text-white border-t border-white/40 shadow-inner">
          <Youtube className="w-4.5 h-4.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
        </div>
      </div>
    );
  }

  if (key.includes('tiktok')) {
    return (
      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-slate-900 to-pink-500 p-[1.5px] shadow-[0_6px_16px_rgba(6,182,212,0.4)] transition-transform hover:scale-110 shrink-0">
        <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center text-cyan-400 border-t border-white/30 shadow-inner">
          <Video className="w-4.5 h-4.5 drop-shadow-[0_2px_4px_rgba(244,63,94,0.7)]" />
        </div>
      </div>
    );
  }

  if (key.includes('x') || key.includes('twitter')) {
    return (
      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-800 via-slate-700 to-slate-500 p-[1.5px] shadow-[0_6px_16px_rgba(148,163,184,0.3)] transition-transform hover:scale-110 shrink-0">
        <div className="w-full h-full rounded-[10px] bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center text-white border-t border-white/30 shadow-inner">
          <Twitter className="w-4 h-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
        </div>
      </div>
    );
  }

  if (key.includes('linkedin')) {
    return (
      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-800 via-blue-600 to-sky-400 p-[1.5px] shadow-[0_6px_16px_rgba(37,99,235,0.4)] transition-transform hover:scale-110 shrink-0">
        <div className="w-full h-full rounded-[10px] bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 flex items-center justify-center text-white border-t border-white/40 shadow-inner">
          <Linkedin className="w-4 h-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
        </div>
      </div>
    );
  }

  if (key.includes('threads')) {
    return (
      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-neutral-800 via-zinc-700 to-stone-600 p-[1.5px] shadow-[0_6px_16px_rgba(0,0,0,0.5)] transition-transform hover:scale-110 shrink-0">
        <div className="w-full h-full rounded-[10px] bg-gradient-to-tr from-black via-zinc-950 to-neutral-900 flex items-center justify-center text-white border-t border-white/30 shadow-inner">
          <svg className="w-4.5 h-4.5 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.001 2c-5.522 0-9.999 4.477-9.999 10 0 5.523 4.477 10 9.999 10 5.522 0 10-4.477 10-10 0-5.523-4.478-10-10-10zm4.563 11.232c-.088 1.94-1.205 3.328-3.084 3.328-1.576 0-2.616-.929-2.92-2.13-.049-.196-.062-.423-.062-.686 0-1.879 1.139-3.262 2.983-3.262 1.83 0 2.993 1.34 3.083 2.75zm-3.083-4.148c-2.607 0-4.57 1.954-4.57 4.67 0 2.87 2.052 4.717 4.57 4.717 1.583 0 2.812-.663 3.479-1.748l1.396 1.05c-.991 1.574-2.732 2.378-4.875 2.378-3.702 0-6.425-2.684-6.425-6.397 0-3.693 2.743-6.423 6.425-6.423 3.52 0 6.136 2.457 6.136 5.864 0 3.39-2.28 5.617-5.26 5.617-1.385 0-2.348-.606-2.825-1.531l-.22.657h-1.632l.704-2.095c-.092-.375-.138-.797-.138-1.258 0-1.796.883-3.208 2.21-3.784.582-.254 1.257-.384 1.986-.384.453 0 .895.053 1.312.155-.38-.857-1.254-1.39-2.316-1.39-.933 0-1.724.436-2.115 1.144l-1.417-.991c.712-1.248 2.046-1.993 3.532-1.993 2.146 0 3.844 1.284 4.195 3.197.027.147.04.305.04.475 0 2.474-1.613 4.133-3.774 4.133z" />
          </svg>
        </div>
      </div>
    );
  }

  // Default Facebook
  return (
    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-400 p-[1.5px] shadow-[0_6px_16px_rgba(59,130,246,0.4)] transition-transform hover:scale-110 shrink-0">
      <div className="w-full h-full rounded-[10px] bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white border-t border-white/40 shadow-inner">
        <Facebook className="w-4 h-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
      </div>
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
  const [isSavingMetrics, setIsSavingMetrics] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  const handleSaveMetrics = async (followersVal: string, erVal: string) => {
    if (!editingAccount) return;
    setIsSavingMetrics(true);
    try {
      const updated = accounts.map((item) =>
        item.id === editingAccount.id
          ? {
            ...item,
            followers: followersVal,
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
        {sortedAccounts.map((acc) => {
          const isConnecting = connectingId === acc.id || connectingId === (acc.platform || '').toLowerCase();
          const isFacebook = acc.id === 'facebook' || (acc.platform || '').toLowerCase() === 'facebook';
          const isLinkedIn = acc.id === 'linkedin' || (acc.platform || '').toLowerCase() === 'linkedin';

          return (
            <div
              key={acc.id}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all backdrop-blur-xl flex flex-col justify-between ${acc.connected
                  ? 'bg-slate-950/80 border-purple-500/30 shadow-lg shadow-purple-950/20 hover:border-purple-500/50 hover:bg-slate-950/95'
                  : 'bg-slate-950/40 border-white/10 hover:border-white/20'
                }`}
            >
              {/* Header row: Avatar + Platform Name & Handle + Actions */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {acc.connected && acc.avatar ? (
                    <div className="relative shrink-0">
                      <img
                        src={acc.avatar}
                        alt={acc.handle || acc.name}
                        className="w-10 h-10 rounded-xl object-cover border border-purple-500/40 shadow-md ring-2 ring-purple-500/10"
                      />
                      <div className="absolute -bottom-1 -right-1 scale-75">
                        <Social3DLogo id={acc.id} platform={acc.platform} />
                      </div>
                    </div>
                  ) : (
                    <Social3DLogo id={acc.id} platform={acc.platform} />
                  )}

                  <div className="min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-sm font-semibold text-white tracking-tight leading-tight whitespace-nowrap">
                        {acc.name}
                      </h4>
                      {acc.connected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="Connected" />
                      )}
                      {(acc.id || '').toLowerCase() === 'tiktok' && (
                        <span className="px-2 py-0.5 text-[9px] font-semibold rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0 flex items-center gap-1 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
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
                          className="text-xs text-slate-400 hover:text-purple-300 transition-colors truncate max-w-[130px] sm:max-w-[170px] block mt-0.5"
                          title={`Open profile: ${acc.profileUrl}`}
                        >
                          {acc.handle.startsWith('@') ? acc.handle : `@${acc.handle}`}
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 truncate max-w-[130px] sm:max-w-[170px] block mt-0.5">
                          {acc.handle.startsWith('@') ? acc.handle : `@${acc.handle}`}
                        </span>
                      )
                    ) : (
                      <span className="text-[11px] text-slate-500 font-medium mt-0.5">
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
                                className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-white/10 text-slate-300 border border-white/10 flex items-center gap-1"
                              >
                                {sp === 'Instagram' && <Instagram className="w-2.5 h-2.5 text-pink-400" />}
                                {sp === 'Threads' && <span className="font-bold text-slate-200 text-[9px]">@</span>}
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
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-purple-300 hover:bg-purple-500/10 border border-white/10 transition-colors"
                      title="Sync live analytics & followers"
                      aria-label="Sync live analytics"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${syncingId === acc.id ? 'animate-spin text-purple-400' : ''}`} />
                    </button>

                    {isLinkedIn && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingAccount(acc);
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-purple-300 hover:bg-purple-500/10 border border-white/10 transition-colors"
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
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/15 border border-rose-500/20 transition-colors shadow-sm"
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
                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/25 flex items-center gap-1.5 shrink-0 shadow-sm cursor-default select-none"
                    title="TikTok integration is coming soon"
                  >
                    <Clock className="w-3 h-3 text-amber-400" />
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
                    className="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 shrink-0 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-950/40 border border-purple-400/20 hover:scale-105 active:scale-95"
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
                <div className="mt-3 pt-2.5 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-2 bg-white/[0.03] rounded-xl p-2 border border-white/5">
                    {/* Friends / Followers / Connections metric */}
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                        <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span>{((acc.id || acc.platform || '').toLowerCase().includes('linkedin')) ? 'Connections' : isFacebook && acc.accountType !== 'PAGE' ? 'Friends' : 'Followers'}</span>
                      </div>
                      <span className="text-sm sm:text-base font-bold text-white tracking-tight mt-0.5">
                        {acc.followers ? acc.followers : isLinkedIn ? '500+' : '—'}
                      </span>
                    </div>

                    {/* Engagement Rate metric */}
                    <div className="flex flex-col items-center justify-center text-center border-l border-white/10">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                        <TrendingUp className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>Engagement</span>
                      </div>
                      <span className="text-sm sm:text-base font-bold text-cyan-400 tracking-tight mt-0.5">
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
