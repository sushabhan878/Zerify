'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Star, Award, MapPin, ExternalLink, BadgeCheck } from 'lucide-react';
import { CreatorItem, CreatorSocialAccount } from '../CreatorCard';

interface ProfileMainInfoProps {
  creator: CreatorItem;
}

const SOCIAL_LOGOS: Record<string, string> = {
  youtube: '/social/youtube.png',
  instagram: '/social/instagram.png',
  twitter: '/social/twitter.png',
  x: '/social/twitter.png',
  linkedin: '/social/linkedin.png',
  facebook: '/social/facebook.png',
  threads: '/social/threads.png',
  tiktok: '/social/tik-tok.png',
};

function getSocialLogo(platformName: string): string | null {
  const p = platformName.toLowerCase().trim();
  if (p.includes('youtube')) return SOCIAL_LOGOS.youtube;
  if (p.includes('instagram')) return SOCIAL_LOGOS.instagram;
  if (p.includes('twitter') || p === 'x' || p.includes(' x')) return SOCIAL_LOGOS.twitter;
  if (p.includes('linkedin')) return SOCIAL_LOGOS.linkedin;
  if (p.includes('facebook')) return SOCIAL_LOGOS.facebook;
  if (p.includes('threads')) return SOCIAL_LOGOS.threads;
  if (p.includes('tiktok') || p.includes('tik-tok') || p.includes('tik tok')) return SOCIAL_LOGOS.tiktok;
  return null;
}

function formatSocialCount(count: number | undefined | null): string {
  if (count === undefined || count === null) return '0';
  if (count >= 1_000_000) {
    const val = (count / 1_000_000).toFixed(1).replace(/\.0$/, '');
    return `${val}M`;
  }
  if (count >= 1_000) {
    const val = (count / 1_000).toFixed(1).replace(/\.0$/, '');
    return `${val}K`;
  }
  return count.toLocaleString();
}

interface DisplaySocialItem {
  platform: string;
  count: number;
  handle?: string;
  profileUrl?: string;
  isVerified?: boolean;
}

export default function ProfileMainInfo({ creator }: ProfileMainInfoProps) {
  const defaultAvatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80';

  // Live state of social accounts fetched directly from DB
  const [socialAccounts, setSocialAccounts] = useState<CreatorSocialAccount[]>(
    creator.socialAccounts || []
  );

  // Sync if creator prop already provides them, otherwise query DB
  useEffect(() => {
    if (creator.socialAccounts && creator.socialAccounts.length > 0) {
      setSocialAccounts(creator.socialAccounts);
      return;
    }

    let isMounted = true;
    async function fetchCreatorSocialsFromDb() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('zerify_token') : null;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

        const res = await fetch(`${apiUrl}/influencer/discovery`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && isMounted) {
            const match = list.find(
              (item: any) =>
                item.id === creator.id ||
                item.user?.name?.toLowerCase() === creator.name?.toLowerCase() ||
                item.handle?.toLowerCase() === creator.handle?.toLowerCase()
            );

            if (match && match.user?.socialAccounts) {
              setSocialAccounts(
                match.user.socialAccounts.map((sa: any) => ({
                  platform: sa.platform,
                  handle: sa.handle,
                  followerCount: sa.followerCount,
                  subscribers: sa.followerCount,
                  connections: sa.followerCount,
                  engagementRate: sa.engagementRate,
                  isVerified: sa.isVerified,
                  profileUrl: sa.profileUrl,
                  status: sa.status,
                }))
              );
            }
          }
        }
      } catch (err) {
        console.warn('Could not fetch influencer social accounts from DB:', err);
      }
    }

    fetchCreatorSocialsFromDb();
    return () => {
      isMounted = false;
    };
  }, [creator.id, creator.name, creator.handle, creator.socialAccounts]);

  // Deduplicate and aggregate DB social accounts by platform
  const accountsToDisplay: DisplaySocialItem[] = useMemo(() => {
    if (socialAccounts && socialAccounts.length > 0) {
      const map = new Map<string, DisplaySocialItem>();

      for (const sa of socialAccounts) {
        const canonicalKey = sa.platform.toLowerCase().trim();
        const count = sa.followerCount ?? sa.subscribers ?? sa.connections ?? 0;
        const existing = map.get(canonicalKey);

        if (!existing) {
          map.set(canonicalKey, {
            platform: sa.platform,
            count,
            handle: sa.handle,
            profileUrl: sa.profileUrl,
            isVerified: sa.isVerified,
          });
        } else {
          // If multiple pages for the same platform, pick the highest count account
          if (count > existing.count) {
            map.set(canonicalKey, {
              ...existing,
              count,
              handle: sa.handle || existing.handle,
              profileUrl: sa.profileUrl || existing.profileUrl,
            });
          }
        }
      }

      return Array.from(map.values()).sort((a, b) => b.count - a.count);
    }

    return [];
  }, [socialAccounts]);

  // Determine if creator is verified
  const isVerified =
    Boolean(creator.isVerified) ||
    socialAccounts.some((sa) => sa.isVerified === true);

  return (
    <div className="space-y-7">
      {/* Creator Identity Header */}
      <div className="flex items-start gap-4">
        <img
          src={creator.avatarUrl || defaultAvatar}
          alt={creator.name}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-white/15 shadow-md shrink-0"
        />

        <div className="space-y-1.5 min-w-0">
          {/* Name & Star Rating */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {creator.name}
              </h2>
              {isVerified && (
                <span className="shrink-0 text-purple-400 inline-flex items-center" title="Verified Creator">
                  <BadgeCheck className="w-5 h-5 fill-purple-600 text-[#090C15]" />
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm font-bold text-amber-400">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{Number(creator.rating || 5.0).toFixed(1)}</span>
              <span className="text-slate-400 font-normal">·</span>
              <span className="text-slate-300 font-semibold underline underline-offset-2">
                4 Reviews
              </span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{creator.location || 'United States'}</span>
          </div>

          {/* Linked Social Media Badges: Fetched from DB, ONLY Logo & Number (No words) */}
          {accountsToDisplay.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-1.5">
              {accountsToDisplay.map((acc, idx) => {
                const logo = getSocialLogo(acc.platform);
                const formattedNumber = formatSocialCount(acc.count);

                const Tag = acc.profileUrl ? 'a' : 'div';
                const linkProps = acc.profileUrl
                  ? {
                      href: acc.profileUrl,
                      target: '_blank',
                      rel: 'noopener noreferrer',
                    }
                  : {};

                return (
                  <Tag
                    key={`${acc.platform}_${idx}`}
                    {...linkProps}
                    title={acc.handle ? `${acc.platform}: ${acc.handle}` : acc.platform}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-purple-500/40 text-slate-200 text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] group cursor-pointer"
                  >
                    {logo ? (
                      <img
                        src={logo}
                        alt={acc.platform}
                        className="w-4 h-4 object-contain shrink-0 group-hover:scale-110 transition-transform"
                      />
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-purple-600/30 text-[10px] flex items-center justify-center font-bold text-purple-300 shrink-0">
                        {acc.platform.charAt(0)}
                      </span>
                    )}
                    <span className="font-extrabold text-white tracking-tight">
                      {formattedNumber}
                    </span>
                    {acc.profileUrl && (
                      <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-purple-300 transition-colors ml-0.5 shrink-0" />
                    )}
                  </Tag>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top Creator Rosette Badge */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-900/60 border border-white/10 shadow-sm">
        <div className="p-2 rounded-xl bg-pink-500/15 text-pink-400 border border-pink-500/25 shrink-0 mt-0.5">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white">
            {creator.name} is a Top Creator
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 leading-normal">
            Top creators have completed multiple orders and have a high rating from brands.
          </p>
        </div>
      </div>

      {/* Bio Description */}
      <div className="space-y-2">
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {creator.bio}
        </p>
      </div>
    </div>
  );
}
