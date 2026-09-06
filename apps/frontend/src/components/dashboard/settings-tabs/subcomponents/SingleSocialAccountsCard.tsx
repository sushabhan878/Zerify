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
  platformUserId?: string;
  engagementRate?: string;
  avgViews?: string;
  avatar?: string;
  dbId?: string;
  subPlatforms?: string[];
}

interface SingleSocialAccountsCardProps {
  accounts: SocialAccountItem[];
  setAccounts: React.Dispatch<React.SetStateAction<SocialAccountItem[]>>;
  onRefreshAccounts?: () => void;
}

// 3D Styled Logo Badge Components
const Social3DLogo = ({ id }: { id: string }) => {
  switch (id) {
    case 'meta':
      return (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-500 p-[1.5px] shadow-[0_6px_16px_rgba(168,85,247,0.4)] transition-transform hover:scale-110 shrink-0">
          <div className="w-full h-full rounded-[10px] bg-gradient-to-tr from-blue-900 via-slate-900 to-purple-950 flex items-center justify-center text-white border-t border-white/40 shadow-inner relative overflow-hidden">
            <svg className="w-5 h-5 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c-1.5-2.3-3.6-3.8-5.8-3.8-3.1 0-5.2 2.3-5.2 5.3 0 3 2.1 5.3 5.2 5.3 2.5 0 4.7-1.8 6.4-4.5 1.7 2.7 3.9 4.5 6.4 4.5 3.1 0 5.2-2.3 5.2-5.3 0-3-2.1-5.3-5.2-5.3-2.2 0-4.3 1.5-5.8 3.8zm-5.8 5.1c-2 0-3.4-1.5-3.4-3.6 0-2.1 1.4-3.6 3.4-3.6 1.7 0 3.3 1.3 4.7 3.6-1.4 2.3-3 3.6-4.7 3.6zm11.6 0c-1.7 0-3.3-1.3-4.7-3.6 1.4-2.3 3-3.6 4.7-3.6 2 0 3.4 1.5 3.4 3.6 0 2.1-1.4 3.6-3.4 3.6z" />
            </svg>
          </div>
        </div>
      );
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
  onRefreshAccounts,
}: SingleSocialAccountsCardProps) {
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  // Listen to OAuth completion via postMessage, BroadcastChannel, and localStorage storage event
  React.useEffect(() => {
    const processOAuthEvent = (payload: any) => {
      if (payload && payload.type === 'ZERIFY_SOCIAL_CONNECTED') {
        if (payload.status === 'success') {
          if (onRefreshAccounts) onRefreshAccounts();
        } else if (payload.message) {
          setErrorMsg(decodeURIComponent(payload.message));
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
        } catch (e) {}
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
    } catch (e) {}

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('storage', handleStorage);
      if (bc) bc.close();
    };
  }, [onRefreshAccounts]);


  const handleActionClick = async (acc: SocialAccountItem) => {
    setErrorMsg(null);
    const platformId = (acc.id || '').toLowerCase();

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

        // Immediately update local state to disconnected
        setAccounts((prev) =>
          prev.map((item) =>
            (item.id || '').toLowerCase() === platformId ||
            item.dbId === deleteId ||
            (acc.platformUserId && item.platformUserId === acc.platformUserId)
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
        setErrorMsg(err?.message || 'Failed to disconnect account');
      } finally {
        setConnectingId(null);
      }
      return;
    }

    // 2. Connect handling for Supported OAuth Platforms
    const supportedOAuthPlatforms = ['meta', 'instagram', 'facebook', 'youtube', 'linkedin', 'x', 'twitter'];
    if (supportedOAuthPlatforms.includes(platformId)) {
      setConnectingId(acc.id);

      // Open centered popup window synchronously immediately during user click event
      // This prevents modern browser popup blockers from suppressing the window
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
              <head><title>Connecting to ${acc.name}...</title></head>
              <body style="background:#07090E;color:white;font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
                <div style="text-align:center;">
                  <div style="width:36px;height:36px;border:3px solid #3b82f6;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 16px auto;"></div>
                  <p style="font-size:14px;color:#e2e8f0;margin:0;font-weight:600;">Connecting to ${acc.name}...</p>
                  <p style="font-size:12px;color:#64748b;margin:8px 0 0 0;">Please wait while we redirect to authorization...</p>
                </div>
                <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
              </body>
            </html>
          `);
        } catch (e) {}
      }

      try {
        const token = localStorage.getItem('zerify_token');
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        let endpoint = `${apiUrl}/social/meta/login`;
        if (platformId === 'instagram') {
          endpoint = `${apiUrl}/social/instagram/login`;
        } else if (platformId === 'youtube') {
          endpoint = `${apiUrl}/social/youtube/login`;
        } else if (platformId === 'linkedin') {
          endpoint = `${apiUrl}/social/linkedin/login`;
        } else if (platformId === 'x' || platformId === 'twitter') {
          endpoint = `${apiUrl}/social/x/login`;
        }

        const res = await fetch(endpoint, { headers });
        const json = await res.json();

        if (!res.ok || !json.data?.url) {
          if (popup && !popup.closed) popup.close();
          throw new Error(json.message || json.data?.message || `Failed to initialize ${acc.name} OAuth`);
        }

        const authUrl = json.data.url;

        // Redirect popup window to OAuth authorization URL
        if (popup && !popup.closed) {
          popup.location.href = authUrl;

          // Monitor popup close event to refresh accounts
          const timer = setInterval(() => {
            try {
              if (!popup || popup.closed) {
                clearInterval(timer);
                setConnectingId(null);
                if (onRefreshAccounts) onRefreshAccounts();
              }
            } catch (e) {
              // Ignore cross-origin access errors until popup closes
            }
          }, 800);

        } else {
          // If popup was completely blocked by browser, navigate in current window
          window.location.href = authUrl;
        }

      } catch (err: any) {
        console.error(`${acc.name} OAuth launch error:`, err);
        setErrorMsg(err.message || 'Could not launch OAuth window');
        setConnectingId(null);
        if (popup && !popup.closed) {
          popup.close();
        }
      }
    } else {
      setErrorMsg(`${acc.name} OAuth integration is coming soon.`);
    }
  };

  const connectedCount = accounts.filter((a) => a.connected).length;
  // Always display connected accounts first at the top
  const sortedAccounts = [...accounts].sort((a, b) => (b.connected ? 1 : 0) - (a.connected ? 1 : 0));

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

      {/* Error Alert Banner */}
      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center justify-between">
          <span>{errorMsg}</span>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-slate-400 hover:text-white font-bold px-1.5"
          >
            ×
          </button>
        </div>
      )}

      {/* 2. Grid of Small 3D Social Account Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedAccounts.map((acc) => {
          const isConnecting = connectingId === acc.id;

          return (
            <div
              key={acc.id}
              className={`p-4 rounded-xl border transition-all space-y-3.5 backdrop-blur-xl flex flex-col justify-between ${acc.connected
                  ? 'bg-slate-950/70 border-purple-500/30 shadow-lg shadow-purple-950/20'
                  : 'bg-slate-950/40 border-white/10 hover:border-white/20'
                }`}
            >
              {/* Small Card Top Header with 3D Logo */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  {acc.connected && acc.avatar ? (
                    <div className="relative shrink-0">
                      <img
                        src={acc.avatar}
                        alt={acc.handle || acc.name}
                        className="w-9 h-9 rounded-xl object-cover border border-purple-500/40 shadow-md"
                      />
                      <div className="absolute -bottom-1 -right-1 scale-75">
                        <Social3DLogo id={acc.id} />
                      </div>
                    </div>
                  ) : (
                    <Social3DLogo id={acc.id} />
                  )}
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{acc.name}</h4>
                    {acc.subPlatforms && acc.subPlatforms.length > 0 && (
                      <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                        {acc.subPlatforms.map((sp) => (
                          <span
                            key={sp}
                            className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-white/10 text-slate-300 border border-white/10 flex items-center gap-1"
                          >
                            {sp === 'Facebook' && <Facebook className="w-2.5 h-2.5 text-blue-400" />}
                            {sp === 'Instagram' && <Instagram className="w-2.5 h-2.5 text-pink-400" />}
                            {sp === 'Threads' && <span className="font-bold text-slate-200 text-[9px]">@</span>}
                            <span>{sp}</span>
                          </span>
                        ))}
                      </div>
                    )}
                    {acc.connected ? (
                      <div className="flex flex-col gap-1 mt-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shadow-sm w-fit">
                          <CheckCircle2 className="w-3 h-3 shrink-0 text-emerald-400" />
                          <span className="truncate">{acc.handle || 'Connected'}</span>
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400/80 font-medium block mt-0.5">
                        Not Connected
                      </span>
                    )}
                  </div>
                </div>

                {/* Connected status replaces Connect button with Disconnect button */}
                {acc.connected ? (
                  <button
                    type="button"
                    disabled={isConnecting}
                    onClick={() => handleActionClick(acc)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 shrink-0 bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 shadow-sm"
                    title="Disconnect this account"
                  >
                    {isConnecting ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <span>Disconnect</span>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isConnecting}
                    onClick={() => handleActionClick(acc)}
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
