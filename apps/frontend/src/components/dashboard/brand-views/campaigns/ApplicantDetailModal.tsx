'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import {
  X,
  Sparkles,
  ExternalLink,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { CampaignApplicationItem } from '@/services/application.service';

interface ApplicantDetailModalProps {
  application: CampaignApplicationItem | null;
  onClose: () => void;
  onSendOffer: (app: CampaignApplicationItem) => void;
  onShortlist: (appId: string) => void;
  onReject: (appId: string) => void;
}

function PlatformBadge({ platform }: { platform: string }) {
  const p = platform.toLowerCase();

  if (p.includes('youtube')) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-bold shadow-sm">
        <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
        <span>YouTube</span>
      </span>
    );
  }

  if (p.includes('instagram')) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-pink-500/10 border border-pink-500/25 text-pink-400 text-xs font-bold shadow-sm">
        <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
        <span>Instagram</span>
      </span>
    );
  }

  if (p.includes('tiktok')) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-bold shadow-sm">
        <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 1086 4.46V12.9a8.28 8.28 0 0 0 5.73 2.25V11.7a4.84 4.84 0 0 1-3.77-1.57A4.85 4.85 0 0 1 19.59 6.69z"/>
        </svg>
        <span>TikTok</span>
      </span>
    );
  }

  if (p.includes('twitter') || p.includes(' x')) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 border border-white/15 text-slate-200 text-xs font-bold shadow-sm">
        <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        <span>Twitter / X</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-bold shadow-sm">
      <span>{platform}</span>
    </span>
  );
}

export default function ApplicantDetailModal({
  application,
  onClose,
  onSendOffer,
  onShortlist,
  onReject,
}: ApplicantDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!application || !mounted) return null;

  const profile: any = application.profileSnapshot || (application as any).influencerProfile || {};
  const socialAccount: any = (application as any).socialAccount || {};
  const influencerProfile: any = (application as any).influencerProfile || {};
  const user: any = influencerProfile.user || {};
  const match: any = application.matchSnapshot || { score: 100, eligibility: 'ELIGIBLE', reasons: [] };

  const displayName =
    profile.displayName ||
    user.name ||
    influencerProfile.handle?.replace('@', '') ||
    socialAccount.username ||
    'Creator';

  const avatarUrl =
    profile.avatarUrl ||
    influencerProfile.avatarUrl ||
    profile.avatar ||
    socialAccount.avatar ||
    user.image ||
    null;

  const rawFollowers =
    profile.followersCount ??
    profile.followerCount ??
    socialAccount.followerCount ??
    socialAccount.followersCount ??
    null;

  const formatCount = (count: number | null | undefined) => {
    if (count === null || count === undefined || isNaN(Number(count))) return '250K';
    const n = Number(count);
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
  };

  const followersDisplay = formatCount(rawFollowers);

  const mainPlatform = (
    profile.platform ||
    socialAccount.platform ||
    'INSTAGRAM'
  ).toUpperCase();

  const platformsList: string[] =
    influencerProfile.user?.socialAccounts?.map((sa: any) => sa.platform) ||
    (socialAccount.platform ? [socialAccount.platform] : [mainPlatform]);

  const uniquePlatforms = Array.from(new Set(platformsList));

  const niches: string[] =
    influencerProfile.niches && influencerProfile.niches.length > 0
      ? influencerProfile.niches
      : profile.niches && profile.niches.length > 0
      ? profile.niches
      : influencerProfile.primaryNiche
      ? [influencerProfile.primaryNiche]
      : profile.primaryNiche
      ? [profile.primaryNiche]
      : ['Tech & AI', 'Fitness & Health'];

  const modalContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-2xl bg-[#090D16] border border-purple-500/25 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] backdrop-blur-2xl p-6 sm:p-8 space-y-6"
      >
        {/* Top Header: Unified without separate box borders */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 sm:gap-5 min-w-0">
            {/* Larger Profile Picture (84px) */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-[84px] sm:h-[84px] rounded-2xl overflow-hidden border-2 border-purple-500/40 bg-slate-950 flex items-center justify-center text-white font-black shadow-xl shadow-purple-950/50">
                {avatarUrl && !imageError ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600 flex items-center justify-center text-white font-black text-2xl shadow-inner select-none">
                    {displayName ? displayName.charAt(0).toUpperCase() : 'C'}
                  </div>
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center border-2 border-[#090D16] shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 fill-white text-purple-600" />
              </span>
            </div>

            {/* Creator Name, Platforms & Niches */}
            <div className="min-w-0 space-y-2">
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight truncate">
                {displayName}
              </h3>

              {/* Platforms Connected */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {uniquePlatforms.map((p) => (
                  <PlatformBadge key={p} platform={p} />
                ))}
              </div>

              {/* Niches Tags */}
              <div className="flex items-center gap-1.5 flex-nowrap min-w-0 pt-0.5">
                {niches.slice(0, 2).map((n) => (
                  <span
                    key={n}
                    className="inline-block px-2.5 py-0.5 rounded-lg bg-slate-900/90 border border-white/10 text-[11px] font-semibold text-slate-300 shadow-sm shrink-0"
                  >
                    {n}
                  </span>
                ))}
                {niches.length > 2 && (
                  <span
                    className="text-slate-400 text-xs font-black tracking-widest px-0.5 select-none shrink-0"
                    title={niches.slice(2).join(', ')}
                  >
                    ...
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Match Score Badge */}
          <div className="flex items-center shrink-0">
            <div className="px-3.5 py-1.5 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center gap-1.5 text-xs font-black text-purple-300 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>{match.score || 100}% Match</span>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body with Hidden Scrollbar */}
        <div
          className="overflow-y-auto space-y-5 flex-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pr-0.5"
        >
          {/* Application Pitch */}
          <div className="space-y-1">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Application Pitch
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
              {application.applicationMessage || 'No pitch text provided.'}
            </p>
          </div>

          {/* Proposed Content Concept */}
          {application.contentIdea && (
            <div className="space-y-1">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Proposed Content Concept
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed">
                {application.contentIdea}
              </p>
            </div>
          )}

          {/* Proposed Compensation */}
          <div className="flex items-center justify-between py-1">
            <span className="text-xs font-bold text-slate-400">
              Proposed Compensation:
            </span>
            <span className="text-base sm:text-lg font-black text-emerald-400 tracking-tight">
              {application.proposedAmount
                ? `${application.proposedCurrency || 'USD'} $${Number(application.proposedAmount).toLocaleString()}`
                : 'Flexible / Standard Rate'}
            </span>
          </div>

          {/* Relevant Past Work & Portfolio Links */}
          {application.portfolioUrls && application.portfolioUrls.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Relevant Past Work & Portfolio Links
              </h4>
              <div className="space-y-1.5">
                {application.portfolioUrls.map((url: string, idx: number) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1.5 hover:underline transition-all group font-medium"
                  >
                    <span className="truncate">{url}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions: Seamless in same container without dark background or divider line */}
        <div className="flex items-center justify-between pt-2 shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                onReject(application.id);
                onClose();
              }}
              type="button"
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/50 hover:text-rose-400 text-xs font-bold text-slate-400 border border-white/10 hover:border-rose-500/30 transition-all"
            >
              Reject
            </button>
            <button
              onClick={() => {
                onShortlist(application.id);
                onClose();
              }}
              type="button"
              className="px-4 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-xs font-bold text-indigo-300 hover:text-white border border-indigo-500/35 transition-all"
            >
              Shortlist
            </button>
          </div>

          <button
            onClick={() => {
              onSendOffer(application);
              onClose();
            }}
            type="button"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-black text-white flex items-center gap-2 shadow-lg shadow-purple-950/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Collaboration Offer</span>
          </button>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
